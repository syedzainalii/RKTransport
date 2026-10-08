import asyncio
import logging
import smtplib
from email.message import EmailMessage

import httpx

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.booking import Booking
from app.models.inquiry import Inquiry
from app.models.notification_log import NotificationLog
from app.models.settings import SiteSettings

logger = logging.getLogger(__name__)


def _booking_message(booking: Booking) -> tuple[str, str]:
    subject = f"New RK Transport booking {booking.ref}"
    vehicle_rows = booking.vehicles or []
    vehicle_details = [
        ", ".join(
            part
            for part in (
                " ".join(filter(None, (str(vehicle.get("year") or ""), vehicle.get("make"), vehicle.get("model")))),
                vehicle.get("colour"),
                f"plate {vehicle['plate']}" if vehicle.get("plate") else None,
                "does not start" if vehicle.get("runs") is False else None,
            )
            if part
        )
        for vehicle in vehicle_rows
    ]
    vehicle_summary = "; ".join(vehicle_details) or " ".join(
        filter(None, (booking.vehicle_make, booking.vehicle_model))
    ) or "Not provided"
    message = "\n".join(
        (
            f"New {booking.type} booking: {booking.ref}",
            f"Customer: {booking.customer_name}",
            f"Phone: {booking.customer_phone}",
            f"Email: {booking.customer_email or 'Not provided'}",
            f"Pickup: {booking.pickup_address or booking.pickup_location_id or 'Not provided'}",
            f"Drop-off: {booking.dropoff_address or booking.dropoff_location_id or 'Not provided'}",
            f"Vehicle{'' if len(vehicle_details) == 1 else 's'}: {vehicle_summary}",
        )
    )
    return subject, message


def _inquiry_message(inquiry: Inquiry) -> tuple[str, str]:
    subject = f"New RK Transport inquiry: {inquiry.subject or inquiry.name}"
    message = "\n".join(
        (
            f"New contact inquiry from {inquiry.name}",
            f"Phone: {inquiry.phone}",
            f"Email: {inquiry.email or 'Not provided'}",
            f"Subject: {inquiry.subject or 'Not provided'}",
            "",
            inquiry.message,
        )
    )
    return subject, message


async def _send_email(recipient: str, subject: str, body: str) -> None:
    if not settings.EMAIL_FROM:
        raise RuntimeError("EMAIL_FROM is not configured")
    if settings.EMAIL_PROVIDER == "resend":
        if not settings.RESEND_API_KEY:
            raise RuntimeError("RESEND_API_KEY is not configured")
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={"from": settings.EMAIL_FROM, "to": [recipient], "subject": subject, "text": body},
            )
            response.raise_for_status()
        return
    if settings.EMAIL_PROVIDER != "smtp":
        raise RuntimeError(f"Unsupported EMAIL_PROVIDER: {settings.EMAIL_PROVIDER}")
    if not settings.SMTP_HOST:
        raise RuntimeError("SMTP_HOST is not configured")

    def send_smtp() -> None:
        message = EmailMessage()
        message["From"] = settings.EMAIL_FROM
        message["To"] = recipient
        message["Subject"] = subject
        message.set_content(body)
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as smtp:
            if settings.SMTP_STARTTLS:
                smtp.starttls()
            if settings.SMTP_USERNAME:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD or "")
            smtp.send_message(message)

    await asyncio.to_thread(send_smtp)


async def _send_whatsapp(recipient: str, body: str) -> None:
    if settings.WHATSAPP_PROVIDER == "cloud_api":
        if not settings.WHATSAPP_CLOUD_PHONE_NUMBER_ID or not settings.WHATSAPP_CLOUD_ACCESS_TOKEN:
            raise RuntimeError("WhatsApp Cloud API credentials are not configured")
        url = f"https://graph.facebook.com/v21.0/{settings.WHATSAPP_CLOUD_PHONE_NUMBER_ID}/messages"
        headers = {"Authorization": f"Bearer {settings.WHATSAPP_CLOUD_ACCESS_TOKEN}"}
        payload = {
            "messaging_product": "whatsapp",
            "to": recipient.removeprefix("+"),
            "type": "text",
            "text": {"body": body},
        }
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
        return
    if settings.WHATSAPP_PROVIDER == "twilio":
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN or not settings.TWILIO_WHATSAPP_FROM:
            raise RuntimeError("Twilio WhatsApp credentials are not configured")
        url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                url,
                auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
                data={
                    "To": f"whatsapp:{recipient if recipient.startswith('+') else '+' + recipient}",
                    "From": settings.TWILIO_WHATSAPP_FROM,
                    "Body": body,
                },
            )
            response.raise_for_status()
        return
    raise RuntimeError(f"Unsupported WHATSAPP_PROVIDER: {settings.WHATSAPP_PROVIDER}")


async def _deliver(log_id: int) -> None:
    db = SessionLocal()
    try:
        log = db.query(NotificationLog).filter(NotificationLog.id == log_id).first()
        if not log:
            return
        log.status = "pending"
        log.attempts += 1
        db.commit()
        try:
            if log.channel == "email":
                await _send_email(log.recipient, log.payload["subject"], log.payload["body"])
            elif log.channel == "whatsapp":
                await _send_whatsapp(log.recipient, log.payload["body"])
            else:
                raise RuntimeError(f"Unsupported notification channel: {log.channel}")
            log.status = "sent"
            log.last_error = None
        except Exception as error:
            log.status = "failed"
            log.last_error = f"{type(error).__name__}: {error}"[:4000]
        db.commit()
    finally:
        db.close()


def _queue(db, event_type: str, entity_type: str, entity_id: int, channel: str, recipient: str, subject: str, body: str) -> int:
    log = NotificationLog(
        event_type=event_type,
        entity_type=entity_type,
        entity_id=entity_id,
        channel=channel,
        recipient=recipient,
        status="pending",
        attempts=0,
        payload={"subject": subject, "body": body},
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log.id


async def notify_event(event_type: str, entity_type: str, entity_id: int) -> None:
    db = SessionLocal()
    try:
        item = (
            db.query(Booking).filter(Booking.id == entity_id).first()
            if entity_type == "booking"
            else db.query(Inquiry).filter(Inquiry.id == entity_id).first()
        )
        if not item:
            return
        site_settings = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
        if not site_settings:
            return
        subject, body = _booking_message(item) if entity_type == "booking" else _inquiry_message(item)
        deliveries: list[int] = []
        if site_settings.notifications_email_enabled:
            if site_settings.notification_admin_email:
                deliveries.append(_queue(db, event_type, entity_type, entity_id, "email", site_settings.notification_admin_email, subject, body))
            else:
                deliveries.append(_queue(db, event_type, entity_type, entity_id, "email", "(admin recipient not configured)", subject, body))
            customer_email = item.customer_email if entity_type == "booking" else None
            if customer_email:
                customer_message = (
                    f"Thank you, {item.customer_name}. We have received your request and our admin "
                    "will be in contact with you as soon as possible.\n\n"
                    f"Reference: {item.ref}\n{body.splitlines()[-1]}"
                )
                deliveries.append(_queue(db, event_type, entity_type, entity_id, "email", customer_email, f"RK Transport received your request ({item.ref})", customer_message))
        if site_settings.notifications_whatsapp_enabled:
            recipient = site_settings.notification_admin_phone or "(admin recipient not configured)"
            deliveries.append(_queue(db, event_type, entity_type, entity_id, "whatsapp", recipient, subject, body))
    finally:
        db.close()
    results = await asyncio.gather(*(_deliver(log_id) for log_id in deliveries), return_exceptions=True)
    for result in results:
        if isinstance(result, Exception):
            logger.error(
                "Notification task failed before delivery could be recorded: %s",
                result,
                exc_info=(type(result), result, result.__traceback__),
            )


async def retry_notification(log_id: int) -> None:
    await _deliver(log_id)

import logging

import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


async def revalidate_paths(paths: list[str] | None = None) -> dict:
    """Trigger Next.js on-demand revalidation."""
    payload = {"secret": settings.REVALIDATE_SECRET, "paths": paths or ["/"]}
    url = f"{settings.FRONTEND_URL.rstrip('/')}/api/revalidate"
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.post(url, json=payload)
        if res.status_code >= 400:
            logger.error("Frontend revalidation failed (%s): %s", res.status_code, res.text)
            return {"ok": False, "detail": res.text}
        return res.json()
    except (httpx.HTTPError, ValueError):
        logger.exception("Unable to reach frontend revalidation endpoint")
        return {"ok": False, "detail": "Frontend revalidation endpoint is unavailable"}


def schedule_public_revalidation(background_tasks) -> None:
    background_tasks.add_task(revalidate_paths, ["/"])

from datetime import datetime, timezone
import secrets


def booking_ref() -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"RKT-{stamp}-{secrets.token_hex(2).upper()}"

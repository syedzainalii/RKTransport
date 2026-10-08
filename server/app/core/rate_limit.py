"""Simple in-memory rate limiter. Fine for a single instance; serverless is best-effort."""
from collections import defaultdict, deque
from time import time
from fastapi import HTTPException, Request, status

_hits: dict[str, deque[float]] = defaultdict(deque)


def check_rate_limit(request: Request, limit: int, window_seconds: int = 60) -> None:
    ip = request.client.host if request.client else "unknown"
    key = f"{ip}:{request.url.path}"
    now = time()
    bucket = _hits[key]
    while bucket and now - bucket[0] > window_seconds:
        bucket.popleft()
    if len(bucket) >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again shortly.",
        )
    bucket.append(now)

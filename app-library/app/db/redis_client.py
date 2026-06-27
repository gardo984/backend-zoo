import json
from typing import Any, Dict, Optional
import redis
from app.config import settings


class RedisClient:
    """Synchronous Redis client for publishing book update events."""

    def __init__(self) -> None:
        self._client: Optional[redis.Redis] = None
        self.host: str = settings.redis_host or "localhost"
        self.port: int = settings.redis_port or 6379
        self.topic: str = settings.redis_topic or "book_updates"

    def connect(self) -> None:
        if self._client is None:
            self._client = redis.Redis(
                host=self.host,
                port=self.port,
                decode_responses=True,
            )
            # Ping to verify connection
            self._client.ping()

    def publish(self, message: Dict[str, Any]) -> None:
        """Publish a JSON-encoded message to the configured Redis topic."""
        if self._client is None:
            self.connect()
        self._client.publish(self.topic, json.dumps(message))

    def close(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None


# Singleton instance for app-wide use
redis_client = RedisClient()

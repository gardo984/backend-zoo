import pytest
from app.db.redis_client import RedisClient


class TestRedisClient:

    def test_redis_connect_and_publish(self):
        """Verify Redis client can connect and publish a message."""
        client = RedisClient()
        try:
            client.connect()
            client.publish({
                "action": "test",
                "book_id": 0,
                "name": "test_book",
            })
            assert True  # No exception = success
        finally:
            client.close()

    def test_redis_publish_message_format(self):
        """Verify publish accepts the expected message format."""
        client = RedisClient()
        try:
            client.connect()
            message = {
                "action": "create",
                "book_id": 42,
                "name": "The Last Penguin",
            }
            client.publish(message)
            assert True
        finally:
            client.close()

import pytest
from fastapi import status
from typing import List
from faker import Faker
from app.db.models import User
from tests.conftest import user_credentials


class TestUser:

    @pytest.fixture()
    def load_users(self, db_session) -> List[int]:
        fake = Faker()
        items_to_create = [
            User(
                email=fake.email(),
                password=User.get_password_hash("".join(fake.random_letters())),
            )
            for _ in range(10)
        ]
        db_session.add_all(items_to_create)
        db_session.commit()
        for instance in items_to_create:
            db_session.refresh(instance)
        return [x.id for x in items_to_create]

    @pytest.mark.parametrize(
        "payload, status_code",
        [
            (
                dict(email="test1@mail.com", password="12345678"),
                status.HTTP_201_CREATED,
            ),
            (
                dict(email="test2", password="12345678"),
                status.HTTP_422_UNPROCESSABLE_CONTENT,
            ),
            (
                dict(email="", password="12345678"),
                status.HTTP_422_UNPROCESSABLE_CONTENT,
            ),
            (dict(email="", password=""), status.HTTP_422_UNPROCESSABLE_CONTENT),
        ],
    )
    def test_user_create(
        self,
        client,
        payload,
        status_code,
    ):
        client._authenticate()
        response = client.post("/users/", json=payload)
        assert response.status_code == status_code

    def test_user_list(self, client, load_users):
        client._authenticate()
        response = client.get("/users/")
        user_list = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert len(user_list) > 0

    def test_user_list_by_id(self, client, db_session, load_users):
        client._authenticate()
        response = client.get("/users/")
        user_list = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert len(user_list) > 0

        for item in user_list:
            user_id = item.get("id")
            response = client.get(f"/users/{user_id}/")
            assert response.status_code == status.HTTP_200_OK
            assert response.json()["id"] == user_id

    def test_user_list_search_by_email(self, client, db_session, load_users):
        client._authenticate()
        response = client.get("/users/")
        users = response.json()
        first_email = users[0]["email"]
        prefix = first_email[:5]

        response = client.get(f"/users/?search={prefix}")
        matching = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert all(prefix.lower() in u["email"].lower() for u in matching)
        assert len(matching) <= len(users)

    def test_user_list_filter_by_status(self, client, db_session, load_users):
        client._authenticate()
        response = client.get("/users/?status=true")
        disabled = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert all(u["disabled"] is True for u in disabled)

        response = client.get("/users/?status=false")
        active = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert all(u["disabled"] is False for u in active)

    def test_user_list_invalid_sorted_by(self, client, db_session, load_users):
        client._authenticate()
        response = client.get("/users/?sorted_by=invalid_field")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_user_update(self, client, db_session, load_users):
        user_instance = db_session.query(User).where(User.id == load_users[0]).first()
        assert user_instance is not None

        client._authenticate()
        new_email = f"updated.{user_instance.email}"
        payload = dict(
            email=new_email,
            disabled=True,
        )
        response = client.put(
            f"/users/{user_instance.id}/",
            json=payload,
        )

        user_instance = (
            db_session.query(User).where(User.id == user_instance.id).first()
        )
        assert user_instance is not None
        assert response.status_code == status.HTTP_200_OK
        assert user_instance.email == new_email
        assert user_instance.disabled is True

    def test_user_delete(self, client, db_session, load_users):
        user_instance = db_session.query(User).where(User.id == load_users[0]).first()
        assert user_instance is not None

        user_id = user_instance.id
        client._authenticate()
        response = client.delete(f"/users/{user_id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        user_instance = db_session.query(User).where(User.id == user_id).first()
        assert user_instance is None

        response = client.delete(f"/users/{user_id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.parametrize(
        "method,payload,status_code",
        [
            ("post", user_credentials, status.HTTP_200_OK),
            ("patch", user_credentials, status.HTTP_405_METHOD_NOT_ALLOWED),
            ("put", user_credentials, status.HTTP_405_METHOD_NOT_ALLOWED),
            (
                "post",
                dict(email="test2", password="12345678"),
                status.HTTP_422_UNPROCESSABLE_CONTENT,
            ),
            (
                "post",
                dict(email="test2", password="12345678"),
                status.HTTP_422_UNPROCESSABLE_CONTENT,
            ),
        ],
    )
    def test_user_login(
        self,
        client,
        method,
        payload,
        status_code,
    ):
        http_method = getattr(client, method)
        response = http_method("/login/", json=payload)
        assert response.status_code == status_code

        if method == "post" and response.status_code == status.HTTP_200_OK:
            assert "access_token" in response.json()

    # def test_user_update(self, client, db_session, load_users):
    #     user_instance = db_session.query(User).where(
    #         User.id == load_users[0]
    #     ).first()
    #     assert user_instance is not None

    #     client._authenticate()
    #     new_name = f"{user_instance.email}.test"
    #     payload = dict(
    #         email=new_name,
    #         password="12345678",
    #     )
    #     response = client.put(
    #         f"/users/{user_instance.id}/", json=payload,
    #     )

    #     user_instance = db_session.query(User).where(
    #         User.email == user_instance.email
    #     ).first()
    #     assert user_instance is not None
    #     assert response.status_code == status.HTTP_200_OK
    #     assert user_instance.email == new_name

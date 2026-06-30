import pytest
from typing import List
from faker import Faker
from fastapi import status
from app.db.models import Category
from tests.test_main import AppFixtures


class TestCategories(AppFixtures):

    @pytest.mark.parametrize(
        "payload, status_code", [
            (dict(name="Category test", active=True), status.HTTP_201_CREATED),
            (dict(name=None, active=False), status.HTTP_422_UNPROCESSABLE_CONTENT),
        ])
    def test_category_create(
        self, client, db_session, payload, status_code,
    ):
        client._authenticate()
        response = client.post("/categories/", json=payload)
        outcome = response.json()
        assert response.status_code == status_code

    def test_category_list(self, client, db_session, load_categories):
        client._authenticate()
        response = client.get("/categories/")
        categories = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(categories, list)
        assert len(categories) > 0

    def test_category_by_id(self, client, db_session, load_categories):
        client._authenticate()
        response = client.get("/categories/")
        categories = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert len(categories) > 0

        for item in categories:
            category_id = item.get('id')
            response = client.get(f"/categories/{category_id}/")
            assert response.status_code == status.HTTP_200_OK
            assert response.json()["id"] == category_id

    def test_category_update(self, client, db_session, load_categories):
        category = db_session.query(Category).where(
            Category.id == load_categories[0]
        ).first()
        assert category is not None

        client._authenticate()
        new_name = f"{category.name}_test"
        payload = dict(name=new_name, active=(not category.active))
        response = client.put(
            f"/categories/{category.id}/", json=payload,
        )
        outcome = response.json()

        category = db_session.query(Category).where(
            Category.id == category.id
        ).first()
        assert category is not None
        assert response.status_code == status.HTTP_200_OK
        assert category.active is False and category.name == new_name

    def test_category_list_search_by_name(self, client, db_session, load_categories):
        client._authenticate()
        response = client.get("/categories/")
        categories = response.json()
        first_name = categories[0]["name"]
        prefix = first_name[:5]

        response = client.get(f"/categories/?search={prefix}")
        matching = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert all(prefix.lower() in c["name"].lower() for c in matching)
        assert len(matching) <= len(categories)

    def test_category_list_search_by_id(self, client, db_session, load_categories):
        client._authenticate()
        response = client.get("/categories/")
        categories = response.json()
        target_id = str(categories[0]["id"])

        response = client.get(f"/categories/?search={target_id}")
        matching = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert any(c["id"] == int(target_id) for c in matching)

    def test_category_list_filter_by_status(self, client, db_session, load_categories):
        client._authenticate()
        response = client.get("/categories/?status=true")
        active = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert all(c["active"] is True for c in active)

        response = client.get("/categories/?status=false")
        inactive = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert all(c["active"] is False for c in inactive)

    def test_category_list_invalid_sorted_by(self, client, db_session, load_categories):
        client._authenticate()
        response = client.get("/categories/?sorted_by=invalid_field")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_category_delete(self, client, db_session, load_categories):
        category = db_session.query(Category).where(
            Category.id == load_categories[0]
        ).first()
        assert category is not None

        category_id = category.id
        client._authenticate()
        response = client.delete(f"/categories/{category_id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        category = db_session.query(Category).where(
            Category.id == category_id
        ).first()
        assert category is None

        response = client.delete(f"/categories/{category_id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

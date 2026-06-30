import pytest
from fastapi import status
from app.db.models import Author
from tests.test_main import AppFixtures


class TestAuthors(AppFixtures):

    @pytest.mark.parametrize(
        "payload, status_code",
        [
            (
                dict(
                    name="Author test",
                    active=True,
                    age=20,
                    email="test@test.com",
                ),
                status.HTTP_201_CREATED,
            ),
            (dict(name=None, active=False), status.HTTP_422_UNPROCESSABLE_CONTENT),
        ],
    )
    def test_author_create(
        self,
        client,
        db_session,
        payload,
        status_code,
    ):
        client._authenticate()
        response = client.post("/author/", json=payload)
        assert response.status_code == status_code

    def test_author_list(self, client, db_session, load_authors):
        client._authenticate()
        response = client.get("/author/")
        authors = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(authors, list)
        assert len(authors) > 0

    def test_author_by_id(self, client, db_session, load_authors):
        client._authenticate()
        response = client.get("/author/")
        authors = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert len(authors) > 0

        for item in authors:
            author_id = item.get("id")
            response = client.get(f"/author/{author_id}/")
            assert response.status_code == status.HTTP_200_OK
            assert response.json()["id"] == author_id

    def test_author_update(self, client, db_session, load_authors):
        author = db_session.query(Author).where(Author.id == load_authors[0]).first()
        assert author is not None

        client._authenticate()
        new_name = f"{author.name}_test"
        payload = dict(
            name=new_name,
            age=20,
            email="test1@test.com",
            active=(not author.active),
        )
        response = client.put(
            f"/author/{author.id}/",
            json=payload,
        )
        assert response.status_code == status.HTTP_200_OK

        author = db_session.query(Author).where(Author.id == author.id).first()
        assert author is not None
        assert author.active is False and author.name == new_name

    def test_author_list_search_by_name(self, client, db_session, load_authors):
        client._authenticate()
        response = client.get("/author/")
        authors = response.json()
        first_name = authors[0]["name"]
        prefix = first_name[:5]

        response = client.get(f"/author/?search={prefix}")
        matching = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert all(prefix.lower() in a["name"].lower() for a in matching)
        assert len(matching) <= len(authors)

    def test_author_list_search_by_id(self, client, db_session, load_authors):
        client._authenticate()
        response = client.get("/author/")
        authors = response.json()
        target_id = str(authors[0]["id"])

        response = client.get(f"/author/?search={target_id}")
        matching = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert any(a["id"] == int(target_id) for a in matching)

    def test_author_list_filter_by_status(self, client, db_session, load_authors):
        client._authenticate()
        response = client.get("/author/?status=true")
        active = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert all(a["active"] is True for a in active)

        response = client.get("/author/?status=false")
        inactive = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert all(a["active"] is False for a in inactive)

    def test_author_list_pagination(self, client, db_session, load_authors):
        client._authenticate()
        response = client.get("/author/?limit=3&offset=0")
        data = response.json()
        assert response.status_code == status.HTTP_200_OK
        assert len(data) <= 3

    def test_author_delete(self, client, db_session, load_authors):
        author = db_session.query(Author).where(Author.id == load_authors[0]).first()
        assert author is not None

        author_id = author.id
        client._authenticate()
        response = client.delete(f"/author/{author_id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        author = db_session.query(Author).where(Author.id == author_id).first()
        assert author is None

        response = client.delete(f"/author/{author_id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

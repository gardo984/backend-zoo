
# App Library

The following repo will have information about an app oriented to a Library.

Some of the purposes to create the current repo were to promote the knowledge and practice of `FastApi`.

Glossary:

- [Setup](#setup)
	- [Docker](#docker)
	- [Locally](#locally)
		- [Initialize app](#initialize-app)
		- [DB Migrations](#db-migrations)
- [Unit Tests](#unit-tests)
- [Redis CLI](#redis-cli)
- [Git Hooks](#git-hooks)

## Setup

### Docker

- Start the db container:
```sh
docker-compose build --no-cache api
docker-compose up -d api && docker-compose run api migrate && docker-compose logs -f
```
- **[Optional]**, to load dev data:
```sh
docker-compose run api load_dev_data
```
- **[Optional]**, to create superuser:
```sh
docker-compose run api create_superuser
```
- **[Optional]**, to reset DB:
```sh
docker-compose down && \
	docker-compose up -d api && sleep 3 && \
	docker-compose run api migrate && \
	docker-compose run api load_dev_data && \
	docker-compose restart api && \
	docker-compose logs -f
```

### Locally

#### Initialize app

- Start the db container:
```sh
docker-compose up -d db && docker-compose logs --tail=10 -f db
```
- Create a virtualenv and install the app dependencies:
```sh
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
- Start the app:
```sh
uvicorn app.main:app --reload --reload-exclude venv
```
- Open a browser and hit the url: http://localhost:8000/docs
- (**Optional**) To get out of the virtualenv:
```sh
deactivate
```


#### DB Migrations

- Run the app migrations:
```sh
alembic upgrade head
```
- To generate a new revision:
```sh
alembic revision --autogenerate -m "new table"
```
- To check the current revision:
```sh
alembic current
```
- To check if there are pending revisions:
```sh
alembic check
```
- To run a specific revision:
```sh
alembic upgrade <revision-id>
```
- To check all revisions(migrations):
```sh
alembic history
```

## Unit Tests

- To run all unit tests:
```sh
pytest -v tests/
```
![Unit tests Outcome](others/unit-tests.png)

## Redis CLI

- To monitor:
```sh
docker-compose exec redis redis-cli monitor
```
- To publish a msg to a channel (for testing purposes):
```sh
docker-compose exec redis redis-cli publish book_updates '{"msg": "hello world"}'
```
- To get the list of active channels (the ones that have subscribers):
```sh
docker-compose exec redis redis-cli pubsub channels
```
- To subscribe to a channel:
```sh
docker-compose exec redis redis-cli subscribe book_updates
```


## Git Hooks

This project uses [pre-commit](https://pre-commit.com/) to automatically format and lint Python code in `app-library/` on every commit.

### Installation

```sh
# From the repo root
pip install pre-commit
pre-commit install
```

The hooks will now run automatically on `git commit`.

### What the hooks do

1. **Black** — Auto-formats all staged `.py` files inside `app-library/`.
2. **Flake8** — Lints the same files and prevents the commit if issues are found.

### Running manually

```sh
# Run against all files
pre-commit run --all-files

# Run against staged files only
pre-commit run
```

### Bypassing the hook (emergency only)

```sh
git commit --no-verify -m "your message"
```

### Updating hook versions

```sh
pre-commit autoupdate
```
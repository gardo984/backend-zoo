import json
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware

from .router import (
    users,
    authors,
    auth,
    books,
    categories,
)

app = FastAPI()
# fake = Faker()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(authors.router)
app.include_router(auth.router)
app.include_router(books.router)
app.include_router(categories.router)


@app.get("/")
def main():
    return Response(
        status_code=status.HTTP_200_OK,
        content=json.dumps(dict(msg="App Library API Interface")),
        media_type="application/json",
    )

import re
from datetime import datetime
from typing import Optional, Dict
from decimal import Decimal
from pydantic import (
    BaseModel,
    EmailStr,
    ConfigDict,
    field_serializer,
    model_serializer,
    field_validator,
    SerializerFunctionWrapHandler,
    Field,
)


class AuthorBase(BaseModel):
    name: str
    email: EmailStr  # Use EmailStr for email validation
    age: int
    active: Optional[bool] = True


class AuthorDetail(AuthorBase):
    id: int


class AuthorCreate(AuthorBase):
    pass


class AuthorUpdate(AuthorCreate):
    pass


class AuthorResponse(AuthorBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime

    @field_serializer("created_at")
    def date_format(self, value: datetime) -> str:
        return value.strftime("%Y-%m-%d %T")

    @model_serializer(mode="wrap")
    def serialize_model(
        self, handler: SerializerFunctionWrapHandler
    ) -> Dict[str, object]:
        serialized_data = handler(self)
        return serialized_data


class Book(BaseModel):
    name: str
    category: str
    year: int
    published: bool = True
    expired: Optional[bool] = False


# users


class UserBase(BaseModel):
    email: EmailStr  # Use EmailStr for email validation

    @field_validator("email", mode="before")
    @classmethod
    def lowercase(cls, value):
        if isinstance(value, str):
            return value.lower()
        return value


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=100)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8, max_length=100)
    disabled: Optional[bool] = None

    @field_validator("email", mode="before")
    @classmethod
    def lowercase(cls, value):
        if isinstance(value, str):
            return value.lower()
        return value


class UserDetail(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    disabled: bool
    created_at: datetime

    @field_serializer("created_at")
    def date_format(self, value: datetime) -> str:
        return value.strftime("%Y-%m-%d %T")

    @model_serializer(mode="wrap")
    def serialize_model(
        self, handler: SerializerFunctionWrapHandler
    ) -> Dict[str, object]:
        serialized_data = handler(self)
        return serialized_data


class UserResponse(UserDetail):
    created_by: Optional[UserDetail] = None


class LoginCredentials(BaseModel):
    email: EmailStr
    password: str


class TokenData(BaseModel):
    email: EmailStr


class LoginResponse(BaseModel):
    access_token: str
    token_type: str


# category


class CategoryBase(BaseModel):
    name: str
    active: Optional[bool] = True


class CategoryDetail(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CategoryBase):
    pass


class CategoryResponse(CategoryDetail):
    model_config = ConfigDict(from_attributes=True)

    created_at: datetime
    created_by: Optional[UserDetail]

    @field_serializer("created_at")
    def date_format(self, value: datetime) -> str:
        return value.strftime("%Y-%m-%d %T")


# books


class BookBase(BaseModel):
    name: str
    active: bool
    description: Optional[str] = None
    image: Optional[str] = None
    price: Optional[Decimal] = Decimal("0.000")


class BookCreate(BookBase):
    author_id: int
    category_id: int
    active: Optional[bool] = True
    description: Optional[str] = None
    image: Optional[str] = None
    price: Optional[Decimal] = Decimal("0.000")

    @field_validator("image")
    @classmethod
    def validate_image_path(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        pattern = r"^\/?(?:[^\/\0]+\/)*[^\/\0]+\.(png|jpe?g|webp)$"
        if not re.match(pattern, value, re.IGNORECASE):
            raise ValueError(
                "Image must be a valid path with .png, .jpeg, or .webp extension"
            )
        return value


class BookUpdate(BookCreate):
    pass


class BookResponse(BookBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: CategoryDetail
    author: AuthorDetail
    created_at: datetime
    created_by: Optional[UserDetail]

    @field_serializer("created_at")
    def date_format(self, value: datetime) -> str:
        return value.strftime("%Y-%m-%d %T")

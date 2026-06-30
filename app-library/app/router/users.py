from typing import List, Optional, Union
from fastapi import (
    Request,
    status,
    HTTPException,
    Depends,
    APIRouter,
    Query,
)
from sqlalchemy import inspect, or_
from sqlalchemy.orm import Session
from app.schemas import (
    UserCreate,
    UserUpdate,
    UserResponse,
)

from app.db.database import get_db
from app.db.models import (
    User,
)
from app.oauth2 import get_current_active_user

router = APIRouter(tags=["Users"])
# users


@router.post(
    "/users/",
    status_code=status.HTTP_201_CREATED,
    response_model=Union[UserResponse, List[UserResponse]],
)
async def user_create(
    request: Request,
    payload: Union[UserCreate, List[UserCreate]],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    print(f"Url: {request.url}, method: {request.method}")
    if not isinstance(payload, List):
        payload = [payload]

    decoded_data = [item.model_dump() for item in payload]
    print(f"Payload: {decoded_data}")
    user_list = list({x.email.lower() for x in payload})
    user_exists = User.validate_users_existence(db, user_list)
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Users already registered: {','.join(user_exists)}",
        )

    created_users: List[User] = User.create_users(
        db=db,
        users=payload,
        current_user=current_user,
    )
    return created_users


@router.get(
    "/users/",
    status_code=status.HTTP_200_OK,
    response_model=List[UserResponse],
)
async def user_list(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    limit: int = 10,
    offset: int = 0,
    sorted_by: str = "id",
    search: Optional[str] = Query(
        None,
        description="Search by email (partial match) or id (exact match)",
    ),
    status_filter: Optional[bool] = Query(
        None,
        alias="status",
        description="Filter by disabled status: true or false",
    ),
):
    print(f"Url: {request.url}, method: {request.method}")
    print(f"querystring: {dict(request.query_params)}")

    if sorted_by not in inspect(User).columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sorted field: {sorted_by}",
        )

    query = db.query(User)

    if search is not None:
        if search.isdigit():
            query = query.filter(
                or_(User.email.ilike(f"%{search}%"), User.id == int(search))
            )
        else:
            query = query.filter(User.email.ilike(f"%{search}%"))

    if status_filter is not None:
        query = query.filter(User.disabled == status_filter)

    sorted_field = getattr(User, sorted_by)
    users = query.order_by(sorted_field).limit(limit).offset(offset)
    return users


@router.get(
    "/users/{user_id}",
    status_code=status.HTTP_200_OK,
    response_model=UserResponse,
)
async def user_by_id(
    request: Request,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    print(f"Url: {request.url}, method: {request.method}")
    print(f"Path args user_id: {user_id}")
    user = db.query(User).where(User.id == user_id).one_or_none()
    if not user:
        print(f"User does not exist userId={user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not exist",
        )
    return user


@router.put(
    "/users/{user_id}",
    status_code=status.HTTP_200_OK,
    response_model=UserResponse,
)
async def user_update(
    request: Request,
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    print(f"Url: {request.url}, method: {request.method}")
    print(f"Payload: {payload.model_dump()}")

    user = db.query(User).where(User.id == user_id).first()
    if not user:
        print(f"User does not exist userId: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not exist",
        )

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}

    if "password" in update_data:
        update_data["password"] = User.get_password_hash(update_data["password"])

    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    print(f"User successfully updated userId:{user_id}")
    return user


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def user_delete(
    request: Request,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    print(f"Url: {request.url}, method: {request.method}")
    print(f"Path args user_id: {user_id}")

    stmt = db.query(User).where(User.id == user_id)
    if not stmt.first():
        print(f"User does not exist userId:{user_id}")
        raise HTTPException(
            detail="User does not exist",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    user_email = stmt.first().email
    stmt.delete(synchronize_session=False)
    db.commit()
    print(f"User removed successfully userId:{user_id}, email={user_email}")
    return {}

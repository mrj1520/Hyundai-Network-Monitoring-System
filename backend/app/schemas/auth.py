from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional

class LoginRequest(BaseModel):
    username: str # email
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    role: str
    favorite_dashboard: str
    theme: str
    sidebar_collapsed: bool

class LoginResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: UserResponse

class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str
    role: str # Admin or User

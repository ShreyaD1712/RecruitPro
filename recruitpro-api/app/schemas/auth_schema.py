from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterRequest(BaseModel):

    first_name: str
    last_name: str

    email: EmailStr

    password: str

    phone_number: Optional[str] = None

    role_id: int

    company_id: Optional[int] = None

    department_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
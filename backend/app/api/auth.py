from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.database.connection import get_db
from app.core.security import verify_password, create_access_token, get_current_user, get_password_hash, RoleChecker
from app.models.user import User, DashboardPreference
from app.models.lookups import Role
from app.schemas.auth import LoginRequest, UserCreateRequest
from app.services.audit_log import AuditLogService
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Enforce Admin verification for user creations
admin_checker = RoleChecker(allowed_roles=["Admin"])

@router.post("/login")
def login(request_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Authenticates a user, writes an audit log, and issues a JWT token.
    """
    user = db.query(User).filter(User.email == request_data.username, User.is_deleted == False).first()
    ip_addr = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown")

    if not user or not verify_password(request_data.password, user.hashed_password):
        # Log failed login attempt
        AuditLogService.log_action(
            db=db,
            action="LOGIN_ATTEMPT",
            old_value=None,
            new_value={"email": request_data.username},
            ip=ip_addr,
            browser=user_agent,
            result="Failure"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue token
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # Log successful login
    AuditLogService.log_action(
        db=db,
        action="LOGIN",
        user_id=user.id,
        old_value=None,
        new_value={"email": user.email},
        ip=ip_addr,
        browser=user_agent,
        result="Success"
    )

    # Prepare response payload
    user_pref = user.preferences
    return {
        "success": True,
        "message": "Login successful",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "token": access_token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "role": user.role.name,
                "favorite_dashboard": user_pref.favorite_dashboard if user_pref else "CTO",
                "theme": user_pref.theme if user_pref else "dark",
                "sidebar_collapsed": user_pref.sidebar_collapsed if user_pref else False
            }
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns details of the currently authenticated user session.
    """
    user_pref = current_user.preferences
    return {
        "success": True,
        "message": "Session validated successfully",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "id": str(current_user.id),
            "email": current_user.email,
            "role": current_user.role.name,
            "favorite_dashboard": user_pref.favorite_dashboard if user_pref else "CTO",
            "theme": user_pref.theme if user_pref else "dark",
            "sidebar_collapsed": user_pref.sidebar_collapsed if user_pref else False
        }
    }

@router.post("/users")
def create_operator_user(
    payload: UserCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_checker)
):
    """
    Enables Admins to create new operators (Admins or regular Users).
    """
    # Check duplicate email
    existing_user = db.query(User).filter(User.email == payload.email, User.is_deleted == False).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Resolve role lookup
    role = db.query(Role).filter(Role.name == payload.role).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested role '{payload.role}' is invalid."
        )

    # Save user
    new_user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role_id=role.id
    )
    db.add(new_user)
    db.flush()

    # Seed default dashboard preference
    pref = DashboardPreference(
        user_id=new_user.id,
        theme="dark",
        sidebar_collapsed=False,
        default_date_filter="today",
        widget_positions={},
        favorite_dashboard="CTO",
        language="en",
        rows_per_page=10
    )
    db.add(pref)
    db.commit()

    return {
        "success": True,
        "message": f"Successfully created user account for '{payload.email}' with role '{payload.role}'.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "id": str(new_user.id),
            "email": new_user.email,
            "role": role.name
        }
    }

from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.models import UserProfile, UserCreate, UserAccessUpdate
from app.sheets import db
from app.auth import get_current_user, hash_password

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("", response_model=List[UserProfile])
async def list_users(current_user: dict = Depends(get_current_user)):
    caller_role = current_user.get("role", "").upper()
    if caller_role not in ["OWNER", "OWNER_ADMIN", "PA"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Owner or PA can list user accounts")

    records = db.get_records("Users")
    users = []
    for r in records:
        users.append(UserProfile(
            user_id=str(r.get("user_id", "")),
            full_name=str(r.get("full_name", "")),
            username=str(r.get("user_id", "")),
            role=str(r.get("role", "SALESMAN")),
            mobile=str(r.get("mobile", "")),
            email=str(r.get("email", "")),
            active=str(r.get("active", "true")).lower() == "true",
            created_at=str(r.get("created_at", "")),
            notes=str(r.get("notes", "")),
        ))
    return users

@router.post("", response_model=UserProfile)
async def create_user(req: UserCreate, current_user: dict = Depends(get_current_user)):
    caller_role = current_user.get("role", "").upper()
    if caller_role not in ["OWNER", "OWNER_ADMIN", "PA"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Owner or PA can create users")

    requested_role = str(req.role or "SALESMAN").upper()
    if requested_role not in ["OWNER", "PA", "SALESMAN"]:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Role must be OWNER, PA, or SALESMAN")
    if caller_role == "PA" and requested_role != "SALESMAN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PA can create salesman accounts. Only the Owner can create PA or Owner accounts.",
        )

    password = req.password or ""
    if len(password) < 12 or not any(c.isupper() for c in password) or not any(c.islower() for c in password) or not (any(c.isdigit() for c in password) or any(not c.isalnum() for c in password)):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 12 characters and include uppercase, lowercase, and a digit or symbol.",
        )

    user_id = db.generate_id("Users")
    auth_id = db.generate_id("AuthUsers")
    now_iso = datetime.utcnow().isoformat()

    user_record = {
        "user_id": user_id,
        "full_name": req.full_name,
        "role": requested_role,
        "mobile": req.mobile or "",
        "email": req.email or "",
        "active": "true",
        "created_at": now_iso,
        "notes": req.notes or "",
    }
    db.append_record("Users", user_record)

    hashed_pw = hash_password(req.password)
    auth_record = {
        "auth_id": auth_id,
        "user_id": user_id,
        "username": req.username,
        "password_hash": hashed_pw,
        "role": requested_role,
        "active": "true",
        "created_at": now_iso,
        "must_change_password": "false",
    }
    db.append_record("AuthUsers", auth_record)

    db.log_audit(
        actor=current_user.get("user_id"),
        action="CREATE_USER",
        entity_type="Users",
        entity_id=user_id,
        reason=f"Created user {req.username} with role {req.role}"
    )

    return UserProfile(
        user_id=user_id,
        full_name=req.full_name,
        username=req.username,
        role=requested_role,
        mobile=req.mobile or "",
        email=req.email or "",
        active=True,
        created_at=now_iso,
        notes=req.notes or "",
    )


@router.patch("/{user_id}", response_model=UserProfile)
async def update_user_access(user_id: str, req: UserAccessUpdate, current_user: dict = Depends(get_current_user)):
    """Owner-only role and active-flag changes. Passwords are not accepted here."""
    caller_role = current_user.get("role", "").upper()
    if caller_role not in ["OWNER", "OWNER_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the Owner can change roles or deactivate accounts.",
        )

    users = db.get_records("Users")
    existing = next((u for u in users if str(u.get("user_id")) == user_id), None)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    updates = {}
    if req.role is not None:
        new_role = req.role.upper()
        if new_role not in ["OWNER", "PA", "SALESMAN"]:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Role must be OWNER, PA, or SALESMAN")
        updates["role"] = new_role
    if req.active is not None:
        updates["active"] = "true" if req.active else "false"
    if not updates:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No permission changes were provided")

    db.update_record("Users", "user_id", user_id, updates)
    auth_rows = db.get_records("AuthUsers")
    auth_row = next((a for a in auth_rows if str(a.get("user_id")) == user_id), None)
    if auth_row:
        auth_updates = {}
        if "role" in updates:
            auth_updates["role"] = updates["role"]
        if "active" in updates:
            auth_updates["active"] = updates["active"]
        db.update_record("AuthUsers", "user_id", user_id, auth_updates)

    db.log_audit(
        actor=current_user.get("user_id"),
        action="UPDATE_USER_ACCESS",
        entity_type="Users",
        entity_id=user_id,
        reason="Owner updated role or active status",
    )

    merged = {**existing, **updates}
    return UserProfile(
        user_id=user_id,
        full_name=str(merged.get("full_name", "")),
        username=str(auth_row.get("username") if auth_row else user_id),
        role=str(merged.get("role", "SALESMAN")),
        mobile=str(merged.get("mobile", "")),
        email=str(merged.get("email", "")),
        active=str(merged.get("active", "true")).lower() == "true",
        created_at=str(merged.get("created_at", "")),
        notes=str(merged.get("notes", "")),
    )

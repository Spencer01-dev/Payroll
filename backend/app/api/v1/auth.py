from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.models.schema import User, Organization
from app.schemas.models import UserRegister, UserLogin, TokenResponse
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register_organization(payload: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    org = Organization(name=payload.organization_name)
    db.add(org)
    db.commit()
    db.refresh(org)

    user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        plain_password=payload.password,
        full_name=payload.full_name,
        role="Company Owner",
        organization_id=org.id
    )
    db.add(user)
    db.commit()

    token = create_access_token(subject=user.id, org_id=org.id, role=user.role)
    return TokenResponse(
        access_token=token,
        user_email=user.email,
        user_name=user.full_name,
        role=user.role,
        organization_id=org.id,
        organization_name=org.name
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    org_name = org.name if org else "SmartPay Org"

    token = create_access_token(subject=user.id, org_id=user.organization_id, role=user.role)
    return TokenResponse(
        access_token=token,
        user_email=user.email,
        user_name=user.full_name,
        role=user.role,
        organization_id=user.organization_id or "default_org",
        organization_name=org_name
    )

# app/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import Optional
from sqlalchemy.orm import Session

# Important: Import SessionLocal from its definitive location
from .database import SessionLocal
from .schemas import UserSchema  # À adapter selon ton schéma utilisateur

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")  # à adapter si tu as un endpoint token

SECRET_KEY = "ton_secret_key_ici"  # CHANGE-LE en variable d’environnement pour plus de sécurité
ALGORITHM = "HS256"

# ==================== THIS IS THE NEW, CENTRALIZED get_db FUNCTION ====================
def get_db():
    """
    Dependency function to get a database session.
    Ensures the session is always closed after the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# ======================================================================================

def get_current_user(token: str = Depends(oauth2_scheme)) -> UserSchema:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les informations d’authentification",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        # Ici, tu peux récupérer l’utilisateur en base de données via user_id
        # Exemple fictif (à remplacer par ta logique d’accès DB) :
        user = UserSchema(id=user_id, username="dummy_user")  # Remplace par ta vraie récupération
        return user
    except JWTError:
        raise credentials_exception

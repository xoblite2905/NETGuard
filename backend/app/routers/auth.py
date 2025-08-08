from fastapi import APIRouter, HTTPException, status

router = APIRouter()

@router.post("/login")
async def login():
    # Exemple simple, à remplacer par ta logique d'authentification
    return {"message": "Connexion réussie"}

@router.post("/register")
async def register():
    # Exemple simple, à remplacer par ta logique d'inscription
    return {"message": "Inscription réussie"}


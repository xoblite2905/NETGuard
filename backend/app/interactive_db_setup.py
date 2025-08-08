import os
import getpass
from sqlalchemy import create_engine, text
from app.models import Base, NetworkPacket, NetworkPort, User, Vulnerability
from dotenv import set_key, load_dotenv
import urllib.parse
import getpass

# Charger .env
load_dotenv()
env_path = ".env"

# Infos utilisateur final
db_name = input("Nom de la base de données à créer : ").strip()
new_user = input("Nom du nouvel utilisateur PostgreSQL : ").strip()
new_password = getpass.getpass(f"Mot de passe pour {new_user} : ")
super_pass_encoded = urllib.parse.quote_plus(super_pass)

# Connexion superutilisateur
superuser = input("Nom du superutilisateur PostgreSQL (ex: postgres) : ").strip()

super_pass = input("Mot de passe superutilisateur PostgreSQL : ")
db_host = input("Hôte (default: localhost) : ").strip() or "localhost"
db_port = input("Port (default: 5432) : ").strip() or "5432"

# Connexion au superuser pour créer DB + user
super_url = f"postgresql://{superuser}:{super_pass_encoded}@{db_host}:{db_port}/postgres"
super_engine = create_engine(super_url, isolation_level="AUTOCOMMIT")

with super_engine.connect() as conn:
    try:
        # Créer base de données
        conn.execute(text(f"CREATE DATABASE {db_name}"))
        print(f"✅ Base de données '{db_name}' créée.")
    except Exception as e:
        print(f"⚠️ Création DB : {e}")

    try:
        # Créer utilisateur s’il n'existe pas
        conn.execute(text(f"CREATE USER {new_user} WITH PASSWORD :pwd"), {'pwd': new_password})
        print(f"✅ Utilisateur '{new_user}' créé.")
    except Exception as e:
        print(f"⚠️ Création utilisateur : {e}")

    try:
        # Donner tous les privilèges
        conn.execute(text(f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {new_user}"))
        print(f"✅ Privilèges accordés à '{new_user}' sur '{db_name}'.")
    except Exception as e:
        print(f"⚠️ Attribution des droits : {e}")

# Créer les tables en se connectant avec le nouvel utilisateur
database_url = f"postgresql://{new_user}:{new_password}@{db_host}:{db_port}/{db_name}"
user_engine = create_engine(database_url)
Base.metadata.create_all(user_engine)
print("✅ Tables créées avec le nouvel utilisateur.")

# Mise à jour du .env
set_key(env_path, "DATABASE_URL", database_url)
print("✅ .env mis à jour.")

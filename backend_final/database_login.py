import os
import sqlite3
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGIN_DB_PATH = os.path.join(BASE_DIR, "login_details.db")
SQLALCHEMY_LOGIN_DATABASE_URL = f"sqlite:///{LOGIN_DB_PATH}"

login_engine = create_engine(
    SQLALCHEMY_LOGIN_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

LoginSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=login_engine)

LoginBase = declarative_base()

def get_login_db():
    db = LoginSessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_login_db():
    import models_login
    models_login.LoginBase.metadata.create_all(bind=login_engine)
    try:
        conn = sqlite3.connect(LOGIN_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(farmer_login_details)")
        cols = [col[1] for col in cursor.fetchall()]
        if "preferred_language" not in cols:
            cursor.execute("ALTER TABLE farmer_login_details ADD COLUMN preferred_language VARCHAR DEFAULT 'en'")
            conn.commit()
            print("[database_login] Successfully added preferred_language column to farmer_login_details.")
        conn.close()
    except Exception as e:
        print("[database_login] Table column check note:", e)

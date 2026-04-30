from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
from models import Base, Papers, Author, Users, Comment, Writes, Reads, Cites
from api import auth
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="ScholarForum Backend")

origins = ["http://localhost:5174", "http://localhost:5173", "127.0.0.1:50920", "http://127.0.0.1:5173", "http://127.0.0.1:5174"]

frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create tables ONCE at startup time
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
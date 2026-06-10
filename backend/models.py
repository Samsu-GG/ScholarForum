from sqlalchemy import (
    Column, Integer, String, Text, Date, TIMESTAMP,
    ForeignKey, CheckConstraint, Index, Enum, event, UniqueConstraint
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.sql import func
import enum

Base = declarative_base()

# ------------------------------
# ENUM for roles
# ------------------------------
class UserRole(enum.Enum):
    admin = "admin"
    user = "user"
    author = "author"

# ------------------------------
# Papers Table
# ------------------------------
# SQL: CREATE TABLE papers (
#          paper_id SERIAL PRIMARY KEY,
#          publish_date DATE NOT NULL,
#          doi TEXT UNIQUE NOT NULL,
#          abstract TEXT NOT NULL,
#          title TEXT NOT NULL,
#          pdf_link TEXT NOT NULL,
#          search_vector TSVECTOR,
#          CONSTRAINT check_publish_date CHECK (publish_date <= CURRENT_DATE)
#      );
# SQL Index: CREATE INDEX idx_search_vector ON papers USING gin(search_vector);
class Papers(Base):
    __tablename__ = "papers"

    paper_id = Column(Integer, primary_key=True, autoincrement=True)
    publish_date = Column(Date, nullable=False)
    doi = Column(Text, unique=True, nullable=False)
    abstract = Column(Text, nullable=False)
    title = Column(Text, nullable=False)
    pdf_link = Column(Text, nullable=False)

    search_vector = Column(TSVECTOR)

    __table_args__ = (
        CheckConstraint("publish_date <= CURRENT_DATE", name="check_publish_date"),
        Index("idx_search_vector", "search_vector", postgresql_using="gin"),
    )

    comments = relationship("Comment", back_populates="paper", cascade="all, delete")
    writes = relationship("Writes", back_populates="paper", cascade="all, delete")
    reads = relationship("Reads", back_populates="paper", cascade="all, delete")


# ------------------------------
# Author Table
# ------------------------------
# SQL: CREATE TABLE author (
#          auth_id SERIAL PRIMARY KEY,
#          auth_name VARCHAR(255) NOT NULL,
#          affiliation VARCHAR(255) NOT NULL,
#          CONSTRAINT uix_author_affiliation UNIQUE (auth_name, affiliation)
#      );
class Author(Base):
    __tablename__ = "author"

    auth_id = Column(Integer, primary_key=True, autoincrement=True)
    auth_name = Column(String(255), nullable=False)
    affiliation = Column(String(255), nullable=False)
    __table_args__ = (
        UniqueConstraint('auth_name', 'affiliation', name='uix_author_affiliation'),
    )

    writes = relationship("Writes", back_populates="author", cascade="all, delete")


# ------------------------------
# Users Table
# ------------------------------
# SQL: CREATE TABLE users (
#          user_id SERIAL PRIMARY KEY,
#          full_name VARCHAR(100) NOT NULL,
#          user_name VARCHAR(100) NOT NULL,
#          email VARCHAR(255) UNIQUE NOT NULL,
#          password_hash TEXT NOT NULL,
#          role user_role_enum NOT NULL
#      );
class Users(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    user_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)

    role = Column(Enum(UserRole, name="user_role_enum"), nullable=False)

    comments = relationship("Comment", back_populates="user", cascade="all, delete")
    reads = relationship("Reads", back_populates="user", cascade="all, delete")


# ------------------------------
# Comments
# ------------------------------
# SQL: CREATE TABLE comment (
#          comment_id SERIAL PRIMARY KEY,
#          content TEXT NOT NULL,
#          created_at TIMESTAMP DEFAULT now(),
#          paper_id INTEGER REFERENCES papers(paper_id) ON DELETE CASCADE,
#          user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE
#      );
class Comment(Base):
    __tablename__ = "comment"

    comment_id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    paper_id = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))

    paper = relationship("Papers", back_populates="comments")
    user = relationship("Users", back_populates="comments")


# ------------------------------
# Writes
# ------------------------------
# SQL: CREATE TABLE writes (
#          auth_id INTEGER REFERENCES author(auth_id) ON DELETE CASCADE,
#          paper_id INTEGER REFERENCES papers(paper_id) ON DELETE CASCADE,
#          PRIMARY KEY (auth_id, paper_id)
#      );
class Writes(Base):
    __tablename__ = "writes"

    auth_id = Column(Integer, ForeignKey("author.auth_id", ondelete="CASCADE"), primary_key=True)
    paper_id = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), primary_key=True)

    author = relationship("Author", back_populates="writes")
    paper = relationship("Papers", back_populates="writes")


# ------------------------------
# Reads
# ------------------------------
# SQL: CREATE TABLE reads (
#          user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
#          paper_id INTEGER REFERENCES papers(paper_id) ON DELETE CASCADE,
#          PRIMARY KEY (user_id, paper_id)
#      );
class Reads(Base):
    __tablename__ = "reads"

    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    paper_id = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), primary_key=True)

    user = relationship("Users", back_populates="reads")
    paper = relationship("Papers", back_populates="reads")


# ------------------------------
# Cites
# ------------------------------
# SQL: CREATE TABLE cites (
#          citing_paper INTEGER REFERENCES papers(paper_id) ON DELETE CASCADE,
#          cited_paper INTEGER REFERENCES papers(paper_id) ON DELETE CASCADE,
#          PRIMARY KEY (citing_paper, cited_paper),
#          CONSTRAINT check_no_self_cite CHECK (citing_paper <> cited_paper)
#      );
class Cites(Base):
    __tablename__ = "cites"

    citing_paper = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), primary_key=True)
    cited_paper = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), primary_key=True)

    __table_args__ = (
        CheckConstraint("citing_paper <> cited_paper", name="check_no_self_cite"),
    )

class ViewPaperDetails(Base):
    __tablename__ = "view_paper_details"

    paper_id = Column(Integer, primary_key=True)
    title = Column(String)
    publish_date = Column(Date)
    abstract = Column(String)
    pdf_link = Column(String)
    authors = Column(String)

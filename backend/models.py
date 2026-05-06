from sqlalchemy import (
    Column, Integer, String, Text, Date, TIMESTAMP,
    ForeignKey, CheckConstraint, Index, Enum, event,UniqueConstraint
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

class Papers(Base):
    __tablename__ = "papers"

    paper_id = Column(Integer, primary_key=True, autoincrement=True)
    publish_date = Column(Date, nullable=False)
    doi = Column(Text, unique=True, nullable=False)
    abstract = Column(Text, nullable=False)
    title = Column(Text, nullable=False)
    pdf_link = Column(Text, nullable=False)

    # TSVECTOR (manual update)
    search_vector = Column(TSVECTOR)

    __table_args__ = (
        CheckConstraint("publish_date <= CURRENT_DATE", name="check_publish_date"),
        Index("idx_search_vector", "search_vector", postgresql_using="gin"),
    )

    comments = relationship("Comment", back_populates="paper", cascade="all, delete")
    writes = relationship("Writes", back_populates="paper", cascade="all, delete")
    reads = relationship("Reads", back_populates="paper", cascade="all, delete")


# ------------------------------
# Author Table (as persons, but login is via Users)
# ------------------------------

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
# Users Table with Role ENUM
# ------------------------------

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

class Writes(Base):
    __tablename__ = "writes"

    auth_id = Column(Integer, ForeignKey("author.auth_id", ondelete="CASCADE"), primary_key=True)
    paper_id = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), primary_key=True)

    author = relationship("Author", back_populates="writes")
    paper = relationship("Papers", back_populates="writes")


# ------------------------------
# Reads
# ------------------------------

class Reads(Base):
    __tablename__ = "reads"

    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    paper_id = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), primary_key=True)

    user = relationship("Users", back_populates="reads")
    paper = relationship("Papers", back_populates="reads")


# ------------------------------
# Cites
# ------------------------------

class Cites(Base):
    __tablename__ = "cites"

    citing_paper = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), primary_key=True)
    cited_paper = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), primary_key=True)

    __table_args__ = (
        CheckConstraint("citing_paper <> cited_paper", name="check_no_self_cite"),
    )


# ------------------------------
# SQLAlchemy event listener to update TSVECTOR manually
# ------------------------------

# @event.listens_for(Papers, "before_insert")
# @event.listens_for(Papers, "before_update")
# def update_search_vector(mapper, connection, target):
#     text_to_index = f"{target.title} {target.abstract}"
#     connection.execute(
#         Papers.__table__.update()
#         .where(Papers.paper_id == target.paper_id)
#         .values(search_vector=func.to_tsvector("english", text_to_index))
#     )

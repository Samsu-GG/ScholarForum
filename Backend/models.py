from sqlalchemy import create_engine, Column, Integer, String, Text, Date, TIMESTAMP, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.sql import func

Base = declarative_base()

DATABASE_URL = "postgresql+psycopg2://postgres:117437@localhost:5432/scholarforum"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

print("=== Starting table creation ===")
print("Trying to connect to database...")


class Papers(Base):
    __tablename__ = "papers"

    paper_id = Column(Integer, primary_key=True, autoincrement=True)
    publish_date = Column(Date, nullable=False)
    doi = Column(Text, unique=True)
    abstract = Column(Text)
    title = Column(Text, nullable=False)
    pdf_link = Column(Text)
    search_vector = Column(TSVECTOR)

    __table_args__ = (
        CheckConstraint("publish_date <= CURRENT_DATE", name="check_publish_date"),
    )

    comments = relationship("Comment", back_populates="paper", cascade="all, delete")
    writes = relationship("Writes", back_populates="paper", cascade="all, delete")
    reads = relationship("Reads", back_populates="paper", cascade="all, delete")


Index('idx_search_vector', Papers.search_vector, postgresql_using='gin')


class Author(Base):
    __tablename__ = "author"

    auth_id = Column(Integer, primary_key=True, autoincrement=True)
    auth_name = Column(String(255), nullable=False)
    affiliation = Column(String(255))

    __table_args__ = (
        CheckConstraint("char_length(auth_name) >= 2", name="check_author_name_length"),
    )

    writes = relationship("Writes", back_populates="author", cascade="all, delete")


class Users(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    user_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)

    __table_args__ = (
        CheckConstraint("char_length(user_name) >= 3", name="check_username_length"),
    )

    comments = relationship("Comment", back_populates="user", cascade="all, delete")
    reads = relationship("Reads", back_populates="user", cascade="all, delete")


class Comment(Base):
    __tablename__ = "comment"

    comment_id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    paper_id = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))

    __table_args__ = (
        CheckConstraint("char_length(content) > 0", name="check_comment_not_empty"),
    )

    paper = relationship("Papers", back_populates="comments")
    user = relationship("Users", back_populates="comments")


class Writes(Base):
    __tablename__ = "writes"

    auth_id = Column(Integer, ForeignKey("author.auth_id", ondelete="CASCADE"), primary_key=True)
    paper_id = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), primary_key=True)

    author = relationship("Author", back_populates="writes")
    paper = relationship("Papers", back_populates="writes")


class Reads(Base):
    __tablename__ = "reads"

    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    paper_id = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), primary_key=True)

    user = relationship("Users", back_populates="reads")
    paper = relationship("Papers", back_populates="reads")


class Cites(Base):
    __tablename__ = "cites"

    citing_paper = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), primary_key=True)
    cited_paper = Column(Integer, ForeignKey("papers.paper_id", ondelete="CASCADE"), primary_key=True)

    __table_args__ = (
        CheckConstraint("citing_paper <> cited_paper", name="check_no_self_cite"),
    )


try:
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully")
except Exception as e:
    print("ERROR:")
    print(e)
finally:
    print("=== Process finished ===")
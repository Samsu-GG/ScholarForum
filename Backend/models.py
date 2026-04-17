from sqlalchemy import create_engine, Column, Integer, String, Text, Date, TIMESTAMP, ForeignKey
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

Base = declarative_base()

DATABASE_URL = "postgresql+psycopg2://postgres:117437@localhost:5432/scholarforum"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

print("=== Starting table creation ===")
print("Trying to connect to database...")

class Papers(Base):
    __tablename__ = "papers"
    paper_id = Column(Integer, primary_key=True, autoincrement=True)
    publish_date = Column(Date)
    doi = Column(Text)
    abstract = Column(Text)
    title = Column(Text)
    pdf_link = Column(Text)
    search_vector = Column(Text)


class Author(Base):
    __tablename__ = "author"
    auth_id = Column(Integer, primary_key=True, autoincrement=True)
    auth_name = Column(String(255))
    affiliation = Column(String(255))


class Users(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    user_name = Column(String(100))
    email = Column(String(255), unique=True)
    password_hash = Column(Text)


class Comment(Base):
    __tablename__ = "comment"
    comment_id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text)
    created_at = Column(TIMESTAMP)
    paper_id = Column(Integer, ForeignKey("papers.paper_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    auth_id = Column(Integer, ForeignKey("author.auth_id"), nullable=True)

    paper = relationship("Papers")
    user = relationship("Users")


class Writes(Base):
    __tablename__ = "writes"
    auth_id = Column(Integer, ForeignKey("author.auth_id"), primary_key=True)
    paper_id = Column(Integer, ForeignKey("papers.paper_id"), primary_key=True)


class Reads(Base):
    __tablename__ = "reads"
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    paper_id = Column(Integer, ForeignKey("papers.paper_id"), primary_key=True)


class Cites(Base):
    __tablename__ = "cites"
    citing_paper = Column(Integer, ForeignKey("papers.paper_id"), primary_key=True)
    cited_paper = Column(Integer, ForeignKey("papers.paper_id"), primary_key=True)


try:
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully")
except Exception as e:
    print("ERROR:")
    print(e)
finally:
    print("=== Process finished ===")
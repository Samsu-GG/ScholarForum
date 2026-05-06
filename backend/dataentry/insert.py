import pandas as pd
from datetime import datetime
from sqlalchemy.orm import sessionmaker

from database import engine
from models import Papers

# create session
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

df = pd.read_csv("final_data.csv")

for _, row in df.iterrows():
    paper = Papers(
        publish_date = datetime.strptime(row["published_date"], "%m/%d/%y").date(),
        doi=row["id"],          # make sure this is unique!
        abstract=row["summary"],
        title=row["title"],
        pdf_link=row["pdf_link"]
    )
    session.add(paper)

session.commit()
session.close()
"""create_view_paper_details

Revision ID: 37b9bcfedc12
Revises: 679e6bb7fe8f
Create Date: 2026-06-11 01:01:42.221544

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '37b9bcfedc12'
down_revision: Union[str, Sequence[str], None] = '679e6bb7fe8f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


view_definition = """
CREATE VIEW view_paper_details AS
SELECT 
    p.paper_id,
    p.title,
    p.publish_date,
    p.abstract,
    p.pdf_link,
    COALESCE(string_agg(a.auth_name, ', '), 'Unknown Author') AS authors
FROM papers p
LEFT JOIN writes w ON p.paper_id = w.paper_id
LEFT JOIN author a ON w.auth_id = a.auth_id
GROUP BY p.paper_id;
"""

def upgrade() -> None:
    # Execute raw SQL to create the view
    op.execute(view_definition)


def downgrade() -> None:
    # Execute raw SQL to drop the view if we roll back
    op.execute("DROP VIEW IF EXISTS view_paper_details;")

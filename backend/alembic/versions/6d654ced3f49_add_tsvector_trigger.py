"""add tsvector trigger

Revision ID: 6d654ced3f49
Revises: 0705a679015e
Create Date: 2026-05-04 20:44:28.442104

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6d654ced3f49'
down_revision: Union[str, Sequence[str], None] = '0705a679015e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the trigger function
    op.execute("""
    CREATE FUNCTION papers_search_trigger() RETURNS trigger AS $$
    BEGIN
        NEW.search_vector :=
            to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.abstract, ''));
        RETURN NEW;
    END
    $$ LANGUAGE plpgsql;
    """)

    # Create trigger
    op.execute("""
    CREATE TRIGGER update_papers_search_vector
    BEFORE INSERT OR UPDATE ON papers
    FOR EACH ROW EXECUTE FUNCTION papers_search_trigger();
    """)

    # Backfill existing rows
    op.execute("""
    UPDATE papers
    SET search_vector = to_tsvector('english', title || ' ' || abstract);
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS update_papers_search_vector ON papers;")
    op.execute("DROP FUNCTION IF EXISTS papers_search_trigger();")

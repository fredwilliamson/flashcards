"""add_cascade_delete_for_cards

Revision ID: 6cc1522c1c52
Revises: 517001ff779d
Create Date: 2026-01-06 21:08:47.552565

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6cc1522c1c52'
down_revision: Union[str, None] = '517001ff779d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add CASCADE delete to card_id foreign key in card_attempts
    op.drop_constraint('card_attempts_card_id_fkey', 'card_attempts', schema='flashcard', type_='foreignkey')
    op.create_foreign_key(
        'card_attempts_card_id_fkey', 
        'card_attempts', 'cards',
        ['card_id'], ['id'],
        source_schema='flashcard', referent_schema='flashcard',
        ondelete='CASCADE'
    )
    
    # Add CASCADE delete to card_id foreign key in user_progress
    op.drop_constraint('user_progress_card_id_fkey', 'user_progress', schema='flashcard', type_='foreignkey')
    op.create_foreign_key(
        'user_progress_card_id_fkey',
        'user_progress', 'cards',
        ['card_id'], ['id'],
        source_schema='flashcard', referent_schema='flashcard',
        ondelete='CASCADE'
    )


def downgrade() -> None:
    # Revert card_attempts foreign key to no cascade
    op.drop_constraint('card_attempts_card_id_fkey', 'card_attempts', schema='flashcard', type_='foreignkey')
    op.create_foreign_key(
        'card_attempts_card_id_fkey',
        'card_attempts', 'cards',
        ['card_id'], ['id'],
        source_schema='flashcard', referent_schema='flashcard'
    )
    
    # Revert user_progress foreign key to no cascade
    op.drop_constraint('user_progress_card_id_fkey', 'user_progress', schema='flashcard', type_='foreignkey')
    op.create_foreign_key(
        'user_progress_card_id_fkey',
        'user_progress', 'cards',
        ['card_id'], ['id'],
        source_schema='flashcard', referent_schema='flashcard'
    )





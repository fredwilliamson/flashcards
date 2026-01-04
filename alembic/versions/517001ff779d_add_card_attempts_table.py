"""add_card_attempts_table

Revision ID: 517001ff779d
Revises: 1974e6bd878b
Create Date: 2025-12-27 18:34:37.322827

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '517001ff779d'
down_revision: Union[str, None] = '1974e6bd878b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'card_attempts',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('session_id', sa.BigInteger(), nullable=False),
        sa.Column('card_id', sa.BigInteger(), nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False),
        sa.Column('response_time_seconds', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('creator_id', sa.BigInteger(), nullable=True),
        sa.Column('modifier_id', sa.BigInteger(), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['flashcard.game_sessions.id'], ),
        sa.ForeignKeyConstraint(['card_id'], ['flashcard.cards.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['flashcard.users.id'], ),
        sa.ForeignKeyConstraint(['creator_id'], ['flashcard.users.id'], ),
        sa.ForeignKeyConstraint(['modifier_id'], ['flashcard.users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        schema='flashcard'
    )
    op.create_index(op.f('ix_flashcard_card_attempts_session_id'), 'card_attempts', ['session_id'], unique=False, schema='flashcard')
    op.create_index(op.f('ix_flashcard_card_attempts_card_id'), 'card_attempts', ['card_id'], unique=False, schema='flashcard')
    op.create_index(op.f('ix_flashcard_card_attempts_user_id'), 'card_attempts', ['user_id'], unique=False, schema='flashcard')


def downgrade() -> None:
    op.drop_index(op.f('ix_flashcard_card_attempts_user_id'), table_name='card_attempts', schema='flashcard')
    op.drop_index(op.f('ix_flashcard_card_attempts_card_id'), table_name='card_attempts', schema='flashcard')
    op.drop_index(op.f('ix_flashcard_card_attempts_session_id'), table_name='card_attempts', schema='flashcard')
    op.drop_table('card_attempts', schema='flashcard')



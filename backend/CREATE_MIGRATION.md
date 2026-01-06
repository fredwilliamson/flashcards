# Créer la migration pour GameSession

## Option 1 : Génération automatique (recommandé)

```bash
cd backend
alembic revision --autogenerate -m "Add game_sessions table"
```

Cela va créer un fichier dans `backend/alembic/versions/` avec le code de migration.

## Option 2 : Migration manuelle

Si l'autogenerate ne fonctionne pas, crée manuellement :

```bash
cd backend
alembic revision -m "Add game_sessions table"
```

Puis édite le fichier généré et ajoute :

```python
def upgrade():
    op.create_table(
        'game_sessions',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('creator_id', sa.BigInteger(), nullable=True),
        sa.Column('modifier_id', sa.BigInteger(), nullable=True),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('deck_id', sa.BigInteger(), nullable=False),
        sa.Column('status', sa.Enum('ACTIVE', 'COMPLETED', 'ABANDONED', name='gamesessionstatus'), nullable=False),
        sa.Column('remaining_cards', sa.JSON(), nullable=False),
        sa.Column('success_cards', sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(['creator_id'], ['flashcard.users.id'], ),
        sa.ForeignKeyConstraint(['deck_id'], ['flashcard.decks.id'], ),
        sa.ForeignKeyConstraint(['modifier_id'], ['flashcard.users.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['flashcard.users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        schema='flashcard'
    )
    op.create_index(op.f('ix_flashcard_game_sessions_id'), 'game_sessions', ['id'], unique=False, schema='flashcard')

def downgrade():
    op.drop_index(op.f('ix_flashcard_game_sessions_id'), table_name='game_sessions', schema='flashcard')
    op.drop_table('game_sessions', schema='flashcard')
    op.execute('DROP TYPE gamesessionstatus')
```

## Maintenant

**Les migrations s'exécutent automatiquement au démarrage du serveur !**

Redémarre simplement le serveur :
```bash
cd backend
./start.sh
```

Tu verras :
```
🚀 Running database migrations...
✅ Database migrations completed successfully
```





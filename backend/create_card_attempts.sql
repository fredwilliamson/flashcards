-- Create card_attempts table
CREATE TABLE IF NOT EXISTS flashcard.card_attempts (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    card_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_seconds FLOAT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    creator_id BIGINT,
    modifier_id BIGINT,
    FOREIGN KEY (session_id) REFERENCES flashcard.game_sessions(id),
    FOREIGN KEY (card_id) REFERENCES flashcard.cards(id),
    FOREIGN KEY (user_id) REFERENCES flashcard.users(id),
    FOREIGN KEY (creator_id) REFERENCES flashcard.users(id),
    FOREIGN KEY (modifier_id) REFERENCES flashcard.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ix_flashcard_card_attempts_session_id ON flashcard.card_attempts(session_id);
CREATE INDEX IF NOT EXISTS ix_flashcard_card_attempts_card_id ON flashcard.card_attempts(card_id);
CREATE INDEX IF NOT EXISTS ix_flashcard_card_attempts_user_id ON flashcard.card_attempts(user_id);



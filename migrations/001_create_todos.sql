-- +migrate Up
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    number TEXT NOT NULL,
    -- 手順番号 (例: 1.1)
    category TEXT,
    -- 大項目 (例: DB)
    content TEXT NOT NULL,
    -- 作業内容
    env TEXT,
    -- 実行環境 (例: Staging)
    expected TEXT,
    -- 期待値
    is_completed BOOLEAN NOT NULL DEFAULT false,
    -- 完了フラグ
    completed_at TIMESTAMP WITH TIME ZONE,
    -- 完了時刻 (証跡)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 1,
    CHECK (
        (
            is_completed = false
            AND completed_at IS NULL
        )
        OR (
            is_completed = true
            AND completed_at IS NOT NULL
        )
    )
);

CREATE INDEX idx_todos_is_completed ON todos(is_completed);

-- +migrate Down
DROP TABLE todos;
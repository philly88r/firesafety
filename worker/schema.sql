-- D1 Database Schema for Fire Safety Client Review Tool
CREATE TABLE IF NOT EXISTS annotations (
    id TEXT PRIMARY KEY,
    x REAL NOT NULL,
    y REAL NOT NULL,
    sentiment TEXT NOT NULL CHECK(sentiment IN ('like', 'dislike', 'neutral')),
    comment TEXT DEFAULT '',
    page_url TEXT DEFAULT '',
    page_title TEXT DEFAULT '',
    screenshot_url TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_annotations_sentiment ON annotations(sentiment);
CREATE INDEX IF NOT EXISTS idx_annotations_created ON annotations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_annotations_page ON annotations(page_url);

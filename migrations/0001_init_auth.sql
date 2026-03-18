-- Better Auth core schema for Cloudflare D1 (SQLite)
-- Tables: user, session, account, verification

CREATE TABLE IF NOT EXISTS "user" (
    "id"            TEXT PRIMARY KEY NOT NULL,
    "name"          TEXT NOT NULL,
    "email"         TEXT NOT NULL UNIQUE,
    "emailVerified" INTEGER NOT NULL DEFAULT 0,
    "image"         TEXT,
    "createdAt"     INTEGER NOT NULL,
    "updatedAt"     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
    "id"        TEXT PRIMARY KEY NOT NULL,
    "expiresAt" INTEGER NOT NULL,
    "token"     TEXT NOT NULL UNIQUE,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId"    TEXT NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "updatedAt" INTEGER NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "accountId"             TEXT NOT NULL,
    "providerId"            TEXT NOT NULL,
    "userId"                TEXT NOT NULL,
    "accessToken"           TEXT,
    "refreshToken"          TEXT,
    "idToken"               TEXT,
    "accessTokenExpiresAt"  INTEGER,
    "refreshTokenExpiresAt" INTEGER,
    "scope"                 TEXT,
    "password"              TEXT,
    "createdAt"             INTEGER NOT NULL,
    "updatedAt"             INTEGER NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "verification" (
    "id"         TEXT PRIMARY KEY NOT NULL,
    "identifier" TEXT NOT NULL,
    "value"      TEXT NOT NULL,
    "expiresAt"  INTEGER NOT NULL,
    "createdAt"  INTEGER,
    "updatedAt"  INTEGER
);

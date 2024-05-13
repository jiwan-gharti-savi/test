DROP EXTENSION IF EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA project;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA prompt;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA auth;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA reports;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;

-- Create user_file table if it does not exist
CREATE TABLE IF NOT EXISTS project.user_file (
    user_file_uuid UUID DEFAULT project.uuid_generate_v4() PRIMARY KEY,
    sysuser_id INTEGER NOT NULL REFERENCES auth.sysusers(sysuser_id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS user_file_pkey ON project.user_file USING BTREE (user_file_uuid);


-- Create file_detail table if it does not exist
CREATE TABLE IF NOT EXISTS project.file_detail (
    file_detail_uuid UUID DEFAULT project.uuid_generate_v4() PRIMARY KEY,
    sysuser_id INTEGER NOT NULL REFERENCES auth.sysusers(sysuser_id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_name VARCHAR(10000) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(10000),
    file_path VARCHAR(10000),
    file_url VARCHAR(10000),
    user_file_uuid UUID NOT NULL REFERENCES project.user_file(user_file_uuid)
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS file_detail_pkey ON project.file_detail USING BTREE (file_detail_uuid);


ALTER TABLE "project"."user_file" ADD COLUMN "problem_statement" jsonb;


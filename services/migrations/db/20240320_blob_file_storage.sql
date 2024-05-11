
CREATE SCHEMA IF NOT EXISTS storage;


CREATE TABLE IF NOT EXISTS storage.file_storage (
    id SERIAL PRIMARY KEY,
    user_id INT,
    project_id varchar,
    version int,
    storage_provider VARCHAR,
    file_name varchar,
    location VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_constraint_name UNIQUE (user_id, project_id, version, file_name)


--     FOREIGN KEY (project_id) REFERENCES project.project(project_id)
);

CREATE INDEX IF NOT EXISTS idx_project_id ON storage.file_storage (project_id);

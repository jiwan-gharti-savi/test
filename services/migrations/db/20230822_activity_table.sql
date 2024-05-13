CREATE SCHEMA IF NOT EXISTS reports;

CREATE TABLE IF NOT EXISTS reports.activity
(
    activity_id serial,
    sysuser_id bigint,
    project_id bigint,
    domain character varying(255) COLLATE pg_catalog."default",
    activity character varying(5000) COLLATE pg_catalog."default",
    section_type character varying(50) COLLATE pg_catalog."default",
    section_history_id bigint,
    api_error_message text COLLATE pg_catalog."default",
    api_status character varying(50) COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    modified_at timestamp with time zone DEFAULT now(),
    CONSTRAINT "reports.activity_pkey" PRIMARY KEY (activity_id)
);


ALTER TABLE reports.activity
ADD COLUMN user_behaviors boolean;

CREATE TABLE IF NOT EXISTS reports.openai_activity
(
    activity_id serial,
    section_type character varying(64) COLLATE pg_catalog."default",
    gpt_model character varying(64) COLLATE pg_catalog."default",
    total_tokens bigint,
    api_status character varying(64) COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    modified_at timestamp with time zone DEFAULT now(),
    project_id bigint ,
    completion_tokens bigint,
    prompt_tokens bigint,
    total_time double precision,
    short_message character varying(128) COLLATE pg_catalog."default",
    long_message character varying(1024) COLLATE pg_catalog."default",
    CONSTRAINT "openAI_activity_pkey" PRIMARY KEY (activity_id)
);

ALTER TABLE reports.openai_activity ADD COLUMN step bigint DEFAULT 1;
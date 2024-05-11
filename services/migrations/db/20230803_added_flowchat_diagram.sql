CREATE TABLE IF NOT EXISTS project.figures_section_history
(
    section_history_id serial PRIMARY KEY,
    section_id bigint,
    project_id bigint,
    section_type character varying(50) COLLATE pg_catalog."default",
    text text COLLATE pg_catalog."default",
    prompt text COLLATE pg_catalog."default",
    messages jsonb,
    action_type character varying(50) COLLATE pg_catalog."default",
    is_deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    modified_at timestamp with time zone DEFAULT now(),
    version bigint DEFAULT 1,
    is_error character varying COLLATE pg_catalog."default",
    message text COLLATE pg_catalog."default",
    message_long text COLLATE pg_catalog."default",
    is_selected boolean DEFAULT false,
    prev_section_history_id bigint,
    claim_section_history_id bigint,
    project_history_id bigint,
    prompt_step1 jsonb,
    response_step1 text COLLATE pg_catalog."default",
    prompt_step2 jsonb,
    response_step2 text COLLATE pg_catalog."default",
    prompt_step3 jsonb,
    step_completed bigint,
    is_redraft boolean DEFAULT false,
    diagram_available boolean DEFAULT false,
    completion_tokens bigint,
    prompt_tokens bigint,
    total_tokens bigint
);

-- Assuming project.section_history already exists
ALTER TABLE project.section_history
ADD COLUMN completion_tokens bigint;

ALTER TABLE project.section_history
ADD COLUMN prompt_tokens bigint;

ALTER TABLE project.section_history
ADD COLUMN total_tokens bigint;

ALTER TABLE project.section_history
ADD COLUMN figures_section_history_id bigint;

ALTER TABLE project.figures_section_history
ADD COLUMN list_of_figures text;

ALTER TABLE project.figures_section_history
ADD COLUMN detailed_description_figures text;
CREATE TABLE IF NOT EXISTS project.entity (
    entity_id serial PRIMARY KEY,
    project_id bigint,
    claim_section_history_id bigint,
    entity_name text,
    entity_action text,
    generalized_entities text,
    alternative_entity_name text[]
);

CREATE TABLE IF NOT EXISTS project.entity_alternative (
    entity_alternative_id serial PRIMARY KEY,
    project_id bigint,
    claim_section_history_id bigint,
    regenerate_claim_section_history_id bigint,
    entity_name text,
    alternate_entity_name text
);


ALTER TABLE project.project
ADD COLUMN novelty text;

ALTER TABLE project.project_history
ADD COLUMN novelty text;

ALTER TABLE project.sections
ADD COLUMN entity_name text;

ALTER TABLE project.sections
ADD COLUMN entity_action text;

ALTER TABLE project.sections
ADD COLUMN generalized_entities text;

ALTER TABLE project.sections
ADD COLUMN alternative_entity_name text;

ALTER TABLE project.section_history
ADD COLUMN entity_name text;

ALTER TABLE project.section_history
ADD COLUMN entity_action text;

ALTER TABLE project.section_history
ADD COLUMN necessary_features text;


ALTER TABLE project.section_history
ADD COLUMN optional_features text;


ALTER TABLE project.sections
ADD COLUMN necessary_features text;


ALTER TABLE project.sections
ADD COLUMN optional_features text;

ALTER TABLE project.section_history
ADD COLUMN generalized_entities text;

ALTER TABLE project.section_history
ADD COLUMN alternative_entity_name text;

ALTER TABLE project.figures_section_history
ADD COLUMN response_step3 text;
ALTER TABLE project.project
ALTER COLUMN prior_art TYPE jsonb
USING prior_art::jsonb;


ALTER TABLE project.project
ALTER COLUMN prior_art_analysis TYPE jsonb
USING prior_art_analysis::jsonb;


ALTER TABLE project.project_history
ALTER COLUMN prior_art TYPE jsonb
USING prior_art::jsonb;


ALTER TABLE project.project_history
ALTER COLUMN prior_art_analysis TYPE jsonb
USING prior_art_analysis::jsonb;


ALTER TABLE project.sections
ALTER COLUMN prompt TYPE jsonb
USING prompt::jsonb;

ALTER TABLE project.section_history
ALTER COLUMN messages TYPE jsonb
USING messages::jsonb;


ALTER TABLE project.project
ADD COLUMN project_type character varying;

ALTER TABLE project.section_history
ADD COLUMN prompt_step1 jsonb;


ALTER TABLE project.section_history
ADD COLUMN response_step1 text;


ALTER TABLE project.section_history
ADD COLUMN prompt_step2 jsonb;


ALTER TABLE project.section_history
ADD COLUMN response_step2 text;


ALTER TABLE project.section_history
ADD COLUMN prompt_step3 jsonb;

ALTER TABLE project.section_history
ADD COLUMN step_completed bigint;

ALTER TABLE project.section_history
ADD COLUMN is_redraft boolean DEFAULT False;

UPDATE project.section_history
SET step_completed = 3
WHERE is_error = 'Success' AND section_type = 'Claims';
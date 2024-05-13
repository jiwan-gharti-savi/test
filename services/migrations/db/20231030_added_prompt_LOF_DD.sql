
ALTER TABLE project.sections
ADD COLUMN section_history_id bigint;

ALTER TABLE project.sections
ADD COLUMN claim_section_history_id bigint;

ALTER TABLE project.sections
ADD COLUMN regenerate_claim_section_history_id bigint;
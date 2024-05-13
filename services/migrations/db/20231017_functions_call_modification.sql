ALTER TABLE project.section_history
ADD COLUMN method_claims_nos bigint[];

ALTER TABLE project.section_history
ADD COLUMN system_claims_nos bigint[];

ALTER TABLE project.section_history
ADD COLUMN parsed_json jsonb;

ALTER TABLE project.embodiments_figures_section_history
ADD COLUMN parsed_json jsonb;

ALTER TABLE project.figures_section_history
ADD COLUMN parsed_json jsonb;
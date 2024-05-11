CREATE SCHEMA auth;

CREATE TABLE auth.privilege (
    id serial,
    name character varying(255),
    modified_at date DEFAULT now(),
    created_at date DEFAULT now()
);
ALTER TABLE ONLY auth.privilege ADD CONSTRAINT privilege_pkey PRIMARY KEY (id);

CREATE TABLE auth.sysrole (
    id serial,
    name character varying(255),
    modified_at date DEFAULT now(),
    created_at date DEFAULT now()
);
ALTER TABLE ONLY auth.sysrole ADD CONSTRAINT sysrole_pkey PRIMARY KEY (id);

CREATE TABLE auth.role_privilege (
    role_id integer,
    privilege_id integer,
    is_enabled boolean,
    modified_at date DEFAULT now(),
    created_at date DEFAULT now()
);
ALTER TABLE ONLY auth.role_privilege ADD CONSTRAINT role_privilege_pkey PRIMARY KEY (role_id, privilege_id);

ALTER TABLE patent_draft_gpt.sysusers SET SCHEMA auth;
ALTER TABLE auth.sysusers ADD COLUMN role_id bigint;


INSERT INTO auth.privilege(name) values ('patent_draft'), ('prior_art');
INSERT INTO auth.sysrole(name) VALUES ('basic_user'), ('pro_user');
INSERT INTO auth.role_privilege(role_id, privilege_id) VALUES (1,1), (2,1), (2,2);

ALTER TABLE ONLY patent_draft_gpt.project ADD COLUMN prior_art json;
ALTER TABLE ONLY patent_draft_gpt.project ADD COLUMN prior_art_analysis json;
ALTER TABLE ONLY patent_draft_gpt.project_history ADD COLUMN prior_art json;
ALTER TABLE ONLY patent_draft_gpt.project_history ADD COLUMN prior_art_analysis json;
ALTER TABLE ONLY patent_draft_gpt.project_history ADD COLUMN prior_art_query_inputs json;
ALTER TABLE ONLY patent_draft_gpt.project_history ADD COLUMN is_selected boolean DEFAULT false;
ALTER TABLE ONLY patent_draft_gpt.project_history ADD COLUMN action_type character varying(100);
ALTER TABLE ONLY patent_draft_gpt.sections ADD COLUMN project_history_id bigint;
ALTER TABLE ONLY patent_draft_gpt.section_history ADD COLUMN claim_section_history_id bigint;
ALTER TABLE ONLY patent_draft_gpt.section_history ADD COLUMN project_history_id bigint;

ALTER SCHEMA patent_draft_gpt RENAME TO project;

UPDATE auth.sysusers SET role_id = 2;

ALTER TABLE ONLY project.project_history DROP CONSTRAINT sysusers_unique_project_history_id_project_id;

INSERT INTO project.project_history(project_id, invention_title, is_deleted, is_selected, created_at, modified_at, is_error, action_type) (SELECT DISTINCT project_id, invention_title, FALSE as is_deleted, TRUE as is_selected, created_at, modified_at, 'Success' as is_error, 'manual' as action_type FROM project.project);

UPDATE project.section_history SET project_history_id = t.project_history_id FROM (SELECT max(project_history_id) AS project_history_id, project_id FROM project.project_history GROUP BY project_id) AS t WHERE t.project_id = project.section_history.project_id;

UPDATE project.project_history SET prior_art = NULL, prior_art_analysis = NULL;
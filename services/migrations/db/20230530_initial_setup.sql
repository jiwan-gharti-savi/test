--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3 (Ubuntu 15.3-1.pgdg22.04+1)
-- Dumped by pg_dump version 15.3 (Ubuntu 15.3-1.pgdg22.04+1)

-- Started on 2023-05-18 19:18:16 IST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 16390)
-- Name: patent_draft_gpt; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA patent_draft_gpt;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16477)
-- Name: project; Type: TABLE; Schema: patent_draft_gpt; Owner: -
--

CREATE TABLE patent_draft_gpt.project (
    project_id integer NOT NULL,
    invention_title text,
    sysuser_id bigint,
    is_updated boolean DEFAULT false,
    is_inserted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    modified_at timestamp with time zone DEFAULT now(),
    is_error character varying DEFAULT 'Error'::character varying
);


--
-- TOC entry 220 (class 1259 OID 16469)
-- Name: project_history; Type: TABLE; Schema: patent_draft_gpt; Owner: -
--

CREATE TABLE patent_draft_gpt.project_history (
    project_history_id integer NOT NULL,
    project_id bigint,
    invention_title text,
    "time" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    modified_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    is_error character varying DEFAULT 'Error'::character varying
);


--
-- TOC entry 219 (class 1259 OID 16468)
-- Name: project_history_project_history_id_seq; Type: SEQUENCE; Schema: patent_draft_gpt; Owner: -
--

CREATE SEQUENCE patent_draft_gpt.project_history_project_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3428 (class 0 OID 0)
-- Dependencies: 219
-- Name: project_history_project_history_id_seq; Type: SEQUENCE OWNED BY; Schema: patent_draft_gpt; Owner: -
--

ALTER SEQUENCE patent_draft_gpt.project_history_project_history_id_seq OWNED BY patent_draft_gpt.project_history.project_history_id;


--
-- TOC entry 221 (class 1259 OID 16476)
-- Name: project_project_id_seq; Type: SEQUENCE; Schema: patent_draft_gpt; Owner: -
--

CREATE SEQUENCE patent_draft_gpt.project_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3429 (class 0 OID 0)
-- Dependencies: 221
-- Name: project_project_id_seq; Type: SEQUENCE OWNED BY; Schema: patent_draft_gpt; Owner: -
--

ALTER SEQUENCE patent_draft_gpt.project_project_id_seq OWNED BY patent_draft_gpt.project.project_id;


--
-- TOC entry 218 (class 1259 OID 16458)
-- Name: section_history; Type: TABLE; Schema: patent_draft_gpt; Owner: -
--

CREATE TABLE patent_draft_gpt.section_history (
    section_history_id integer NOT NULL,
    section_id bigint,
    project_id bigint,
    section_type character varying(50),
    text text,
    prompt text,
    messages json,
    action_type character varying(50),
    is_deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    modified_at timestamp with time zone DEFAULT now(),
    version bigint DEFAULT 1,
    is_error character varying,
    message text,
    message_long text,
    is_selected boolean DEFAULT false
);


--
-- TOC entry 217 (class 1259 OID 16457)
-- Name: section_history_section_history_id_seq; Type: SEQUENCE; Schema: patent_draft_gpt; Owner: -
--

CREATE SEQUENCE patent_draft_gpt.section_history_section_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3430 (class 0 OID 0)
-- Dependencies: 217
-- Name: section_history_section_history_id_seq; Type: SEQUENCE OWNED BY; Schema: patent_draft_gpt; Owner: -
--

ALTER SEQUENCE patent_draft_gpt.section_history_section_history_id_seq OWNED BY patent_draft_gpt.section_history.section_history_id;

--
-- TOC entry 216 (class 1259 OID 16447)
-- Name: sections; Type: TABLE; Schema: patent_draft_gpt; Owner: -
--

CREATE TABLE patent_draft_gpt.sections (
    section_id integer NOT NULL,
    project_id bigint,
    section_type character varying(50),
    text text,
    prompt json,
    action_type character varying(50),
    is_updated boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    modified_at timestamp with time zone DEFAULT now(),
    is_error character varying DEFAULT 'Error'::character varying
);


--
-- TOC entry 215 (class 1259 OID 16446)
-- Name: sections_section_id_seq; Type: SEQUENCE; Schema: patent_draft_gpt; Owner: -
--

CREATE SEQUENCE patent_draft_gpt.sections_section_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3431 (class 0 OID 0)
-- Dependencies: 215
-- Name: sections_section_id_seq; Type: SEQUENCE OWNED BY; Schema: patent_draft_gpt; Owner: -
--

ALTER SEQUENCE patent_draft_gpt.sections_section_id_seq OWNED BY patent_draft_gpt.sections.section_id;


--
-- TOC entry 224 (class 1259 OID 16582)
-- Name: sysusers; Type: TABLE; Schema: patent_draft_gpt; Owner: -
--

CREATE TABLE patent_draft_gpt.sysusers (
    sysuser_id integer NOT NULL,
    first_name character varying(256),
    last_name character varying(256),
    company character varying(256),
    email character varying(256),
    password character varying(512),
    created_at timestamp with time zone DEFAULT now(),
    modified_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 223 (class 1259 OID 16581)
-- Name: userdata_user_id_seq; Type: SEQUENCE; Schema: patent_draft_gpt; Owner: -
--

CREATE SEQUENCE patent_draft_gpt.userdata_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3432 (class 0 OID 0)
-- Dependencies: 223
-- Name: userdata_user_id_seq; Type: SEQUENCE OWNED BY; Schema: patent_draft_gpt; Owner: -
--

ALTER SEQUENCE patent_draft_gpt.userdata_user_id_seq OWNED BY patent_draft_gpt.sysusers.sysuser_id;


--
-- TOC entry 3252 (class 2604 OID 16480)
-- Name: project project_id; Type: DEFAULT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.project ALTER COLUMN project_id SET DEFAULT nextval('patent_draft_gpt.project_project_id_seq'::regclass);


--
-- TOC entry 3246 (class 2604 OID 16472)
-- Name: project_history project_history_id; Type: DEFAULT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.project_history ALTER COLUMN project_history_id SET DEFAULT nextval('patent_draft_gpt.project_history_project_history_id_seq'::regclass);


--
-- TOC entry 3240 (class 2604 OID 16461)
-- Name: section_history section_history_id; Type: DEFAULT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.section_history ALTER COLUMN section_history_id SET DEFAULT nextval('patent_draft_gpt.section_history_section_history_id_seq'::regclass);


--
-- TOC entry 3235 (class 2604 OID 16450)
-- Name: sections section_id; Type: DEFAULT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.sections ALTER COLUMN section_id SET DEFAULT nextval('patent_draft_gpt.sections_section_id_seq'::regclass);


--
-- TOC entry 3258 (class 2604 OID 16585)
-- Name: sysusers sysuser_id; Type: DEFAULT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.sysusers ALTER COLUMN sysuser_id SET DEFAULT nextval('patent_draft_gpt.userdata_user_id_seq'::regclass);


--
-- TOC entry 3278 (class 2606 OID 20303)
-- Name: sysusers email_unique; Type: CONSTRAINT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.sysusers
    ADD CONSTRAINT email_unique UNIQUE (email);


--
-- TOC entry 3270 (class 2606 OID 16496)
-- Name: project_history project_history_pkey; Type: CONSTRAINT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.project_history
    ADD CONSTRAINT project_history_pkey PRIMARY KEY (project_history_id);


--
-- TOC entry 3274 (class 2606 OID 20409)
-- Name: project project_pkey; Type: CONSTRAINT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (project_id);


--
-- TOC entry 3266 (class 2606 OID 16467)
-- Name: section_history section_history_pkey; Type: CONSTRAINT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.section_history
    ADD CONSTRAINT section_history_pkey PRIMARY KEY (section_history_id);


--
-- TOC entry 3262 (class 2606 OID 16455)
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (section_id);


--
-- TOC entry 3264 (class 2606 OID 20309)
-- Name: sections sections_project_id_section_type_unique; Type: CONSTRAINT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.sections
    ADD CONSTRAINT sections_project_id_section_type_unique UNIQUE (project_id, section_type);


--
-- TOC entry 3280 (class 2606 OID 20411)
-- Name: sysusers sysusers_pkey; Type: CONSTRAINT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.sysusers
    ADD CONSTRAINT sysusers_pkey PRIMARY KEY (sysuser_id);


--
-- TOC entry 3272 (class 2606 OID 20413)
-- Name: project_history sysusers_unique_project_history_id_project_id; Type: CONSTRAINT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.project_history
    ADD CONSTRAINT sysusers_unique_project_history_id_project_id UNIQUE (project_id);


--
-- TOC entry 3268 (class 2606 OID 20870)
-- Name: section_history sysusers_unique_section_history_id_section_id_project_id; Type: CONSTRAINT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.section_history
    ADD CONSTRAINT section_history_uniq UNIQUE (section_history_id);


--
-- TOC entry 3276 (class 2606 OID 20340)
-- Name: project sysusers_unique_sysuser_id_project; Type: CONSTRAINT; Schema: patent_draft_gpt; Owner: -
--

ALTER TABLE ONLY patent_draft_gpt.project
    ADD CONSTRAINT sysusers_unique_sysuser_id_project UNIQUE (project_id);


-- Completed on 2023-05-18 19:18:16 IST

--
-- PostgreSQL database dump complete
--

ALTER TABLE ONLY patent_draft_gpt.section_history ADD COLUMN prev_section_history_id bigint;

--
-- PostgreSQL database dump
--

\restrict OmhNXhfufiqAi7bq7SP5lQv27wBb9j6eJlaDQ3fUnfVa9JChELZm355jHfkczTE

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg12+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg12+1)

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
-- Name: prevent_aqlvoy_dish_delete(); Type: FUNCTION; Schema: public; Owner: raqamli_mtt
--

CREATE FUNCTION public.prevent_aqlvoy_dish_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN
          RAISE EXCEPTION 'Aqlvoy oshpaz taomlar bazasi doimiy saqlanadi va ochirib yuborilmaydi';
        END;
        $$;


ALTER FUNCTION public.prevent_aqlvoy_dish_delete() OWNER TO raqamli_mtt;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_ai_insight_cache; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.admin_ai_insight_cache (
    cache_key text NOT NULL,
    date text NOT NULL,
    provider text NOT NULL,
    model text,
    analysis_json text NOT NULL,
    snapshot_json text NOT NULL,
    generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.admin_ai_insight_cache OWNER TO raqamli_mtt;

--
-- Name: admin_alert_events; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.admin_alert_events (
    id text NOT NULL,
    event_type text NOT NULL,
    category text NOT NULL,
    status text NOT NULL,
    title text NOT NULL,
    context text,
    actor text,
    entity_type text,
    entity_id text,
    action_url text,
    details_json text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_alert_events OWNER TO raqamli_mtt;

--
-- Name: admin_warehouse_purchases; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.admin_warehouse_purchases (
    id text NOT NULL,
    date text NOT NULL,
    district text NOT NULL,
    product_name text NOT NULL,
    unit text DEFAULT 'kg'::text,
    quantity double precision DEFAULT 0,
    price_per_unit double precision DEFAULT 0,
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_warehouse_purchases OWNER TO raqamli_mtt;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.attendance (
    id text NOT NULL,
    kindergarten_id integer,
    child_id text NOT NULL,
    date text NOT NULL,
    status text NOT NULL,
    reason text,
    arrival_time text
);


ALTER TABLE public.attendance OWNER TO raqamli_mtt;

--
-- Name: audits; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.audits (
    id text NOT NULL,
    kindergarten_id integer,
    inspection_id text,
    inspection_type text,
    overall_result text,
    severity text,
    notes text,
    created_by text,
    status text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audits OWNER TO raqamli_mtt;

--
-- Name: chef_sanitary_checks; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.chef_sanitary_checks (
    id text NOT NULL,
    kindergarten_id integer,
    chef_id text,
    date text,
    passed integer DEFAULT 0,
    answers text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    period_start text,
    period_end text,
    status text DEFAULT 'PENDING_NURSE'::text,
    submitted_at text,
    nurse_approved integer DEFAULT 0,
    nurse_approved_at text,
    nurse_id text,
    nurse_notes text
);


ALTER TABLE public.chef_sanitary_checks OWNER TO raqamli_mtt;

--
-- Name: children; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.children (
    id text NOT NULL,
    kindergarten_id integer,
    first_name text NOT NULL,
    last_name text NOT NULL,
    birth_date text,
    gender text,
    group_id text,
    parent_account_id text,
    father_id text,
    mother_id text,
    address text,
    photo_url text,
    passport_info text,
    birth_certificate_number text,
    weight double precision,
    height double precision,
    is_allergic integer DEFAULT 0,
    allergies text,
    medical_notes text,
    status text DEFAULT 'ACTIVE'::text,
    age_category text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.children OWNER TO raqamli_mtt;

--
-- Name: daily_district_expenses; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.daily_district_expenses (
    id text NOT NULL,
    date text NOT NULL,
    district text NOT NULL,
    cost_per_child double precision DEFAULT 0,
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.daily_district_expenses OWNER TO raqamli_mtt;

--
-- Name: daily_meal_portions; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.daily_meal_portions (
    id text NOT NULL,
    kindergarten_id integer,
    group_id text NOT NULL,
    date text NOT NULL,
    total_children integer DEFAULT 0,
    early_count integer DEFAULT 0,
    late_count integer DEFAULT 0,
    absent_count integer DEFAULT 0,
    meal_portions integer DEFAULT 0,
    entry_mode text DEFAULT 'COUNT'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.daily_meal_portions OWNER TO raqamli_mtt;

--
-- Name: dishes; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.dishes (
    id text NOT NULL,
    kindergarten_id integer,
    name text NOT NULL,
    image text,
    kcal double precision,
    iron double precision,
    carbs double precision,
    vitamins text,
    category text,
    cook_time text,
    cook_temperature text,
    output_1_3 text,
    output_3_7 text,
    kcal_1_3 text,
    kcal_3_7 text,
    ingredients text,
    technology text,
    quality_requirements text,
    image_2 text
);


ALTER TABLE public.dishes OWNER TO raqamli_mtt;

--
-- Name: finance_transactions; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.finance_transactions (
    id text NOT NULL,
    kindergarten_id integer,
    date text,
    category text,
    item text,
    amount double precision,
    quantity double precision,
    price_per_unit double precision,
    type text
);


ALTER TABLE public.finance_transactions OWNER TO raqamli_mtt;

--
-- Name: groups; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.groups (
    id text NOT NULL,
    kindergarten_id integer,
    name text NOT NULL,
    teacher_name text,
    age_category text,
    age_limit text,
    capacity integer,
    teacher_id text
);


ALTER TABLE public.groups OWNER TO raqamli_mtt;

--
-- Name: health_checks; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.health_checks (
    id text NOT NULL,
    kindergarten_id integer,
    child_id text,
    date text,
    weight double precision,
    height double precision,
    temperature double precision,
    allergy text,
    is_sick integer,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    chest_circumference double precision,
    weight_status text DEFAULT 'NOT_CHECKED'::text,
    height_status text DEFAULT 'NOT_CHECKED'::text,
    temperature_status text DEFAULT 'NOT_CHECKED'::text,
    chest_circumference_status text DEFAULT 'NOT_CHECKED'::text
);


ALTER TABLE public.health_checks OWNER TO raqamli_mtt;

--
-- Name: inventory_batches; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.inventory_batches (
    id text NOT NULL,
    kindergarten_id integer,
    product_id text,
    batch_number text,
    invoice_number text,
    quantity double precision,
    price_per_unit double precision,
    total_price double precision,
    received_date text,
    expiry_date text,
    supplier text,
    storage_location text,
    storage_temp text,
    notes text
);


ALTER TABLE public.inventory_batches OWNER TO raqamli_mtt;

--
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.inventory_transactions (
    id text NOT NULL,
    kindergarten_id integer,
    product_id text,
    type text NOT NULL,
    quantity double precision NOT NULL,
    unit text,
    date text,
    reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.inventory_transactions OWNER TO raqamli_mtt;

--
-- Name: kindergarten_settings; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.kindergarten_settings (
    kindergarten_id integer NOT NULL,
    kg_name text,
    kg_logo text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.kindergarten_settings OWNER TO raqamli_mtt;

--
-- Name: kindergartens; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.kindergartens (
    id integer NOT NULL,
    system_id text,
    name text NOT NULL,
    type text,
    region text,
    district text,
    licensefile text,
    directorname text,
    directorbirthyear integer,
    directorphoto text,
    phone text,
    address text,
    email text,
    "position" text,
    capacity integer,
    currentchildren integer,
    groups integer,
    age13 integer,
    age37 integer,
    educators integer,
    cooks integer,
    techstaff integer,
    hasnurse integer DEFAULT 0,
    mealtype text,
    sanitation text,
    water text,
    kitcheneq text,
    haskitchen integer DEFAULT 1,
    hasallergymenu integer DEFAULT 0,
    hasdietmenu integer DEFAULT 0,
    haswarehouse integer DEFAULT 0,
    warehousemanager text,
    avgconsumption double precision,
    financetype text,
    budget double precision DEFAULT 0,
    lat double precision,
    lng double precision,
    username text,
    password text,
    status text DEFAULT 'Active'::text,
    rating integer DEFAULT 100,
    aimonitoring integer DEFAULT 1,
    threshold integer DEFAULT 75,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nursecount integer DEFAULT 0,
    workhours double precision DEFAULT 9,
    commissionorder text,
    commissionapproveddate text,
    commissionvaliduntil text,
    brokeragedocumentfile text
);


ALTER TABLE public.kindergartens OWNER TO raqamli_mtt;

--
-- Name: kindergartens_id_seq; Type: SEQUENCE; Schema: public; Owner: raqamli_mtt
--

CREATE SEQUENCE public.kindergartens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kindergartens_id_seq OWNER TO raqamli_mtt;

--
-- Name: kindergartens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raqamli_mtt
--

ALTER SEQUENCE public.kindergartens_id_seq OWNED BY public.kindergartens.id;


--
-- Name: kitchen_tasks; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.kitchen_tasks (
    id text NOT NULL,
    kindergarten_id integer,
    menu_id text,
    status text,
    temperature double precision,
    start_time text,
    end_time text,
    served_time text,
    ready_for_nurse_at text,
    nurse_quality_status text DEFAULT 'PENDING'::text,
    nurse_quality_comment text,
    nurse_quality_checked_at text,
    nurse_quality_checked_by text
);


ALTER TABLE public.kitchen_tasks OWNER TO raqamli_mtt;

--
-- Name: lab_samples; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.lab_samples (
    sample_id text NOT NULL,
    kindergarten_id integer,
    dish_id text,
    dish_name text,
    batch_reference text,
    date text,
    storage_location text,
    storage_duration double precision,
    status text,
    lab_result text,
    risk_level text,
    notes text,
    created_by text,
    "timestamp" text,
    nutrition text,
    test_results text,
    storage_temp_history text
);


ALTER TABLE public.lab_samples OWNER TO raqamli_mtt;

--
-- Name: medical_inventory_items; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.medical_inventory_items (
    id text NOT NULL,
    kindergarten_id integer,
    name text NOT NULL,
    form text,
    unit text,
    required_per_100 double precision DEFAULT 0,
    required_label text,
    is_default integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.medical_inventory_items OWNER TO raqamli_mtt;

--
-- Name: medical_inventory_movements; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.medical_inventory_movements (
    id text NOT NULL,
    kindergarten_id integer,
    item_id text NOT NULL,
    type text NOT NULL,
    quantity double precision NOT NULL,
    movement_date text NOT NULL,
    expiry_date text,
    batch_number text,
    source text,
    reason text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    group_id text,
    child_id text,
    usage_time text,
    diagnosis text,
    evidence_photo_url text
);


ALTER TABLE public.medical_inventory_movements OWNER TO raqamli_mtt;

--
-- Name: menus; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.menus (
    id text NOT NULL,
    kindergarten_id integer,
    date text NOT NULL,
    meal_name text,
    meal_type text,
    age_group text,
    diet_type text,
    iron double precision,
    carbohydrates double precision,
    vitamins text,
    composition text,
    products text,
    protein double precision,
    fat double precision,
    calories double precision,
    image_url text,
    is_approved integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menus OWNER TO raqamli_mtt;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.messages (
    id text NOT NULL,
    kindergarten_id integer,
    sender_id text NOT NULL,
    receiver_id text NOT NULL,
    text text NOT NULL,
    sender_role text,
    status text DEFAULT 'sent'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    message_type text DEFAULT 'text'::text,
    file_url text,
    file_name text,
    mime_type text,
    edited_at text,
    deleted_at text,
    is_deleted integer DEFAULT 0
);


ALTER TABLE public.messages OWNER TO raqamli_mtt;

--
-- Name: operations_log; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.operations_log (
    id text NOT NULL,
    operation_type text,
    entity_type text,
    entity_name text,
    description text,
    category text DEFAULT 'OTHER'::text,
    kindergarten_id integer,
    is_archived integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.operations_log OWNER TO raqamli_mtt;

--
-- Name: parent_accounts; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.parent_accounts (
    id text NOT NULL,
    login text NOT NULL,
    password_hash text NOT NULL,
    kindergarten_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.parent_accounts OWNER TO raqamli_mtt;

--
-- Name: parent_documents; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.parent_documents (
    id text NOT NULL,
    kindergarten_id integer,
    child_id text NOT NULL,
    title text NOT NULL,
    type text,
    file_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.parent_documents OWNER TO raqamli_mtt;

--
-- Name: parents; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.parents (
    id text NOT NULL,
    full_name text NOT NULL,
    workplace text,
    phone text,
    passport_no text,
    role text,
    kindergarten_id integer,
    password text,
    child_id text
);


ALTER TABLE public.parents OWNER TO raqamli_mtt;

--
-- Name: pickup_people; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.pickup_people (
    id text NOT NULL,
    kindergarten_id integer,
    child_id text NOT NULL,
    full_name text NOT NULL,
    relation text,
    phone text,
    photo_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pickup_people OWNER TO raqamli_mtt;

--
-- Name: products; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.products (
    id text NOT NULL,
    kindergarten_id integer,
    name text NOT NULL,
    category text,
    unit text,
    brand text,
    min_stock double precision
);


ALTER TABLE public.products OWNER TO raqamli_mtt;

--
-- Name: role_accounts; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.role_accounts (
    id text NOT NULL,
    kindergarten_id integer NOT NULL,
    role text NOT NULL,
    full_name text,
    login text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.role_accounts OWNER TO raqamli_mtt;

--
-- Name: role_notifications; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.role_notifications (
    id text NOT NULL,
    kindergarten_id integer,
    target_role text,
    target_user_id text,
    source_role text,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text,
    entity_type text,
    entity_id text,
    is_read integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.role_notifications OWNER TO raqamli_mtt;

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.schema_migrations (
    id text NOT NULL,
    name text NOT NULL,
    applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.schema_migrations OWNER TO raqamli_mtt;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.staff (
    id text NOT NULL,
    kindergarten_id integer,
    full_name text NOT NULL,
    "position" text NOT NULL,
    phone text,
    email text,
    passport_no text,
    birth_date text,
    education text,
    experience_years text,
    group_id text,
    user_id text,
    salary double precision,
    hire_date text,
    status text DEFAULT 'ACTIVE'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.staff OWNER TO raqamli_mtt;

--
-- Name: staff_health_checks; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.staff_health_checks (
    id text NOT NULL,
    kindergarten_id integer,
    staff_id text NOT NULL,
    date text NOT NULL,
    temperature double precision,
    blood_pressure text,
    conclusion text,
    is_fit integer DEFAULT 1,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    weight double precision,
    height double precision,
    chest_circumference double precision,
    weight_status text DEFAULT 'NOT_CHECKED'::text,
    height_status text DEFAULT 'NOT_CHECKED'::text,
    temperature_status text DEFAULT 'NOT_CHECKED'::text,
    chest_circumference_status text DEFAULT 'NOT_CHECKED'::text
);


ALTER TABLE public.staff_health_checks OWNER TO raqamli_mtt;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.suppliers (
    id text NOT NULL,
    kindergarten_id integer,
    first_name text,
    last_name text,
    name text,
    brand text,
    phone text,
    contact_user text,
    telegram_link text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.suppliers OWNER TO raqamli_mtt;

--
-- Name: supply_plans; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.supply_plans (
    id text NOT NULL,
    kindergarten_id integer,
    title text,
    month text,
    status text,
    total_amount double precision DEFAULT 0,
    items text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.supply_plans OWNER TO raqamli_mtt;

--
-- Name: supply_required_products; Type: TABLE; Schema: public; Owner: raqamli_mtt
--

CREATE TABLE public.supply_required_products (
    id text NOT NULL,
    kindergarten_id integer,
    name text NOT NULL,
    price double precision DEFAULT 0,
    quantity double precision DEFAULT 0,
    unit text,
    brand text,
    category text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.supply_required_products OWNER TO raqamli_mtt;

--
-- Name: kindergartens id; Type: DEFAULT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.kindergartens ALTER COLUMN id SET DEFAULT nextval('public.kindergartens_id_seq'::regclass);


--
-- Data for Name: admin_ai_insight_cache; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.admin_ai_insight_cache (cache_key, date, provider, model, analysis_json, snapshot_json, generated_at, expires_at) FROM stdin;
\.


--
-- Data for Name: admin_alert_events; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.admin_alert_events (id, event_type, category, status, title, context, actor, entity_type, entity_id, action_url, details_json, created_at) FROM stdin;
\.


--
-- Data for Name: admin_warehouse_purchases; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.admin_warehouse_purchases (id, date, district, product_name, unit, quantity, price_per_unit, note, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.attendance (id, kindergarten_id, child_id, date, status, reason, arrival_time) FROM stdin;
\.


--
-- Data for Name: audits; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.audits (id, kindergarten_id, inspection_id, inspection_type, overall_result, severity, notes, created_by, status, created_at) FROM stdin;
\.


--
-- Data for Name: chef_sanitary_checks; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.chef_sanitary_checks (id, kindergarten_id, chef_id, date, passed, answers, created_at, period_start, period_end, status, submitted_at, nurse_approved, nurse_approved_at, nurse_id, nurse_notes) FROM stdin;
\.


--
-- Data for Name: children; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.children (id, kindergarten_id, first_name, last_name, birth_date, gender, group_id, parent_account_id, father_id, mother_id, address, photo_url, passport_info, birth_certificate_number, weight, height, is_allergic, allergies, medical_notes, status, age_category, created_at) FROM stdin;
\.


--
-- Data for Name: daily_district_expenses; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.daily_district_expenses (id, date, district, cost_per_child, note, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: daily_meal_portions; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.daily_meal_portions (id, kindergarten_id, group_id, date, total_children, early_count, late_count, absent_count, meal_portions, entry_mode, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dishes; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.dishes (id, kindergarten_id, name, image, kcal, iron, carbs, vitamins, category, cook_time, cook_temperature, output_1_3, output_3_7, kcal_1_3, kcal_3_7, ingredients, technology, quality_requirements, image_2) FROM stdin;
ea587070-1a2c-409f-b908-2b2bf2b47651	\N	Bodringli tetiklashtiruvchi ichimlik	/uploads/1781102637323-enhanced_image_2.jpg	0	0	0	Tabiiy tetiklashtiruvchi ichimlik.\nBir bolaga mo'ljallangan tayyor ichimlik miqdori: 150 g.	Qaynoq va yaxna ichimliklar	15-20 daqiqa	+20°C	150	150	\N	\N	Bodring — 25 g (20 g sof og'irligi)\nFiltrlangan suv — 130 g\nyoki qaynatib sovutilgan suv — 130 g	Bodring yuviladi, ikki cheti kesib tashlanadi va uzunasiga yupqa (2 mm) qilib kesiladi.\n\nSo'ngra kesilgan bodringni 15-20 daqiqa davomida filtrdan o'tkazilgan yoki qaynatib sovitilgan suvga solib qo'yiladi.\n\nTayyor ichimlik stakan yoki piyolada dasturxonga tortiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +20°C.	Tashqi ko'rinishi: bodring bo'laklari qo'shilgan shaffof suv.\n\nRangi: rangsiz.\n\nTa'mi: bodring ta'miga xos.\n\nHidi: bodring hidi.\n\nTarkibi: suyuq.	\N
dbae6321-2be9-488e-a29d-aa248ae0cd92	\N	Banan va olmali smuzi	/uploads/1781102631319-enhanced_image_2.jpg	0	0	0	Vitaminlar / Izoh:\nKaliy, C vitamini, probiotiklar va tabiiy meva tolalariga boy.	aynoq va yaxna ichimliklar	10 daqiqa	sovutilgan holda	130ml	150ml	\N	\N	1-3 yosh uchun:\n\nKefir — 100 g\nBanan — 16,5 g (10 g netto)\nOlma — 14 g (10 g netto)\nShakar — 10 g\n\n3-7 yosh uchun:\n\nKefir — 116 g\nBanan — 19 g (11,5 g netto)\nOlma — 16 g (11,5 g netto)\nShakar — 11 g	Tayyorlash texnologiyasi:\nBanan po‘stidan tozalanib bo‘laklanadi va blenderda maydalanadi. Olma po‘sti archilib, urug‘lari olinadi va blenderda maydalanadi. Banan va olma aralashtirilib, kefir va shakar qo‘shiladi. Bir xil massa hosil bo‘lguncha aralashtiriladi va 5–10 daqiqa tindiriladi.	Sifatiga qo‘yiladigan talablar:\n\nKonsistensiyasi bir xil bo‘lishi.\nTa’mi yoqimli va muvozanatli bo‘lishi.\nBegona hid bo‘lmasligi.	\N
18f60d18-e5c5-4e31-a799-5198c777d80f	\N	Yangi siqilgan olma sharbati	/uploads/1781102608264-enhanced_image_2.jpg	0	0	0	Vitaminlar / Izoh:\nOlma tarkibida C vitamini, kaliy, antioksidantlar mavjud.	Qaynoq va yaxna ichimliklar	10 minut	20°C	150 ml	150 ml	\N	\N	Olma — 330 gramm\nOlma — 264 gramm	Tayyorlash texnologiyasi:\nOlma saralab olinadi, po‘sti archiladi, urug‘lari olib tashlanadi va yaxshilab yuviladi. So‘ng sharbat siqqichdan o‘tkaziladi. Tayyor sharbat stakan yoki piyolada dasturxonga tortiladi.\nDasturxonga tortish uchun eng maqbul harorat  20°C.	Sifatiga qo‘yiladigan talablar:\n\nTashqi ko‘rinishi: bir xil suyuqlik.\nRangi: qo‘llanilayotgan mahsulotga xos.\nTa’mi: nordon-shirin.\nHidi: qo‘llanilayotgan mahsulotga xos.\nTarkibi: suyuq.	\N
e6ed2be7-bd8a-4171-bdf6-c3321101b652	\N	Povidlo, shinni yoki murabbodan kisel	\N	0	0	0	\N	\N	20-25 daqiqa	+20°C	130gr 	150gr	\N	\N	1-3 yosh uchun:\n\nPovidlo, shinni yoki murabbo — 22 g\nShakar — 5.2 g\nKartoshka kraxmali — 5 g\nSuv — 101 g\n\n3-7 yosh uchun:\n\nPovidlo, shinni yoki murabbo — 25 g\nShakar — 6 g\nKartoshka kraxmali — 6 g\nSuv — 117 g	Tayyorlash texnologiyasi\n\nPovidlo, shinni yoki murabbo issiq suv qo‘shib suyultirilib qaynatiladi va suzib olinadi.\n\nSo‘ngra qaynatmaga shakar qo‘shilib qaynash darajasiga yetkaziladi.\n\nSovuq suvda suyultirilgan va suzib olingan kartoshka kraxmali ingichka naycha orqali asta-sekin solinadi hamda quyuq holga kelgunicha qaynatiladi.\n\nTayyor bo‘lgan kisel xona haroratida sovitilib stakan yoki piyolada dasturxonga tortiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +20°C.	Sifatiga qo'yiladigan talablar\nTashqi ko‘rinishi: bir xil, shaffof massa, sirtida turli plyonkalarsiz.\nRangi: sariqdan to‘q sariqqacha.\nTa'mi: nordon-shirin.\nHidi: qo‘llanilayotgan mahsulotga xos.\nTarkibi: bir xil, o‘rtacha quyuqlikda, jelesifat.	\N
118bd3b9-f9f1-40b5-a008-ed5d7280d5fe	\N	Olma sharbatidan kisel	/uploads/1781102703337-enhanced_image_2.jpg	0	0	0	\N	Qaynoq va yaxna ichimliklar	\N	+20°C	130 g	150g	\N	\N	1-3 yosh:\n\nOlma sharbati — 39 g\nShakar — 7 g\nKartoshka kraxmali — 5 g\nVanilin — 0.021 g\nSuv — 95 g\n\n3-7 yosh:\n\nOlma sharbati — 45 g\nShakar — 8 g\nKartoshka kraxmali — 6 g\nVanilin — 0.024 g\nSuv — 110 g	yyorlash texnologiyasi\n\nKartoshka kraxmali 1:5 nisbatda (belgilangan me’yorga ko‘ra) sovuq suvda suyultiriladi va suziladi. Qolgan suvga shakar hamda olma sharbatining yarmi qo‘shilib qaynatiladi. Qaynab turgan siropga ingichka naycha yordamida eritilgan kraxmal va vanilin qo‘shilib, tezlik bilan aralashtiriladi hamda qaynash darajasiga yetkaziladi. So‘ngra olma sharbatining qolgan qismi qo‘shilib, yana bir bor qaynatiladi. Tayyor bo‘lgan kisel xona haroratida sovitiladi va stakan yoki piyolada dasturxonga tortiladi. Dasturxonga tortish uchun eng maqbul harorat +20°C\n\nDasturxonga tortish uchun eng maqbul harorat +20°C.	Tashqi ko‘rinishi: bir xil, yarim shaffof massa, sirtida turli plyonkalarsiz.\n\nRangi: sharbatga xos.\n\nTa’mi: nordon-shirin, sharbatga xos.\n\nHidi: nordon-shirin, sharbatga xos.\n\nTarkibi: yopishqoq, cho‘ziluvchan.	\N
30a3131d-aacd-46d1-bba9-86cdffa58bf3	\N	Reza va ho‘l meva konsentratidan kisel	/uploads/1781102743477-enhanced_image_2.jpg	0	0	0	Vitaminlar / Izoh\n\nBir bolaga mo‘ljallangan tayyor ichimlik miqdori:\n\n1-3 yosh: 130 g\n3-7 yosh: 150 g	Qaynoq va yaxna ichimliklar	15-20 daqiqa	+20°C	130	150	\N	\N	1-3 yosh uchun:\n\nPovidlo, shinni yoki murabbo — 22 g\nShakar — 5.2 g\nKartoshka kraxmali — 5 g\nSuv — 101 g\n\n3-7 yosh uchun:\n\nPovidlo, shinni yoki murabbo — 25 g\nShakar — 6 g\nKartoshka kraxmali — 6 g\nSuv — 117 g	Tayyorlash texnologiyasi\n\nKonsentrat yaxshilab maydalanadi va qaynatib sovitilgan suvga bir xil miqdorda solinadi.\n\nHosil bo‘lgan aralashma qaynayotgan suvga qo‘shilib, shakar solinadi va muttasil aralashtirib qaynatiladi.\n\nTayyor bo‘lgan kisel xona haroratida sovitilib stakan yoki piyolada dasturxonga tortiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +20°C.	Sifatiga qo'yiladigan talablar\nTashqi ko‘rinishi: bir xilda shaffof massa.\nRangi: qo‘llanilayotgan mahsulotga xos.\nTa'mi: nordon-shirin.\nHidi: qo‘llanilayotgan mahsulotga xos.\nTarkibi: o‘rtacha quyuqlikda, qaynatilgan kraxmal quyuqmalarisiz.\nVitaminlar / Izoh	\N
1246f2ed-b410-42be-8ff0-3d4653a3ed47	\N	Limonli kompot	/uploads/1781102668538-enhanced_image_2.jpg	0	0	0	\N	Qaynoq va yaxna ichimliklar	\N	+20°C	130 g	150 g	\N	\N	1-3 yosh:\n\nLimon — 10 g\nPo‘sti archilgan limon — 7.5 g\nShakar — 7 g\nSuv — 139 g\n\n3-7 yosh:\n\nLimon — 12.1 g\nPo‘sti archilgan limon — 7.5 g\nShakar — 8 g\nSuv — 160.5 g	Tayyorlash texnologiyasi\n\nLimon po‘stlog‘i mayda to‘g‘ralib, qaynagan suvga solinadi va 5 daqiqa davomida qaynatiladi.\n\nSo‘ngra 3–4 soat davomida tindirib qo‘yiladi va suzib olinadi.\n\nQaynatmaga shakar va limon bo‘laklari qo‘shilib yana qaynatiladi.\n\nQaynab chiqqandan so‘ng xona haroratida sovitiladi.\n\nPorsiyalarga bo‘lish uchun limon bo‘laklari har bir idishga teng taqsimlanadi.\n\nDasturxonga tortish uchun eng maqbul harorat +20°C.	Tashqi ko‘rinishi:\nLimon po‘stlog‘i tozalangan, teng bo‘laklarga bo‘lingan va shaffof siropga bo‘ktirilgan.\n\nRangi:\nOch sariqdan turli intensivlikdagi sariqqacha.\n\nTa’mi:\nNordon-shirin, limon ta’mi yaqqol seziladi.\n\nHidi:\nQaynatilgan va siropga solingan limonga xos.\n\nTarkibi:\nSuyuq, mevalari yumshoq.	\N
207d2e06-bc46-427d-a3de-71c2dd0de869	\N	Quruq mevalar aralashmasidan kompot	/uploads/1781102758469-enhanced_image_2.jpg	0	0	0	\N	Qaynoq va yaxna ichimliklar	\N	+20°C	130 g	135 g	\N	\N	1-3 yosh:\n\nQuritilgan olma — 3 g\nDanaksiz olxo‘ri qoqi — 3 g\nMayiz — 3 g\nQuritilgan nok — 3 g\nShakar — 7 g\nSuv — 130 g\n\n3-7 yosh:\n\nQuritilgan olma — 3.8 g\nDanaksiz olxo‘ri qoqi — 3.8 g\nMayiz — 3.8 g\nQuritilgan nok — 3.8 g\nShakar — 8 g\nSuv — 150 g	Tayyorlash texnologiyasi\n\nQuruq meva va rezavorlar saralanib, begona aralashmalardan tozalanadi. Issiq suvni bir necha marta almashtirib yaxshilab yuviladi.\n\nTayyorlangan quruq mevalar ko‘rinishiga qarab alohida ajratiladi.\n\nNok qaynayotgan suvga solinib qaynatish boshlanadi. So‘ngra olma solinadi va shakar qo‘shib yumshaguncha qaynatiladi.\n\nKeyin tartib bilan qolgan quruq mevalar qo‘shilib, tayyor bo‘lgunicha qaynatiladi.\n\nQuritilgan nok hajmi va qattiqligiga qarab 1–2 soat qaynatiladi.\n\nOlma 20–30 daqiqa, olxo‘ri qoqi 10–20 daqiqa, mayiz esa 5–10 daqiqa davomida qaynatiladi.\n\nTayyor kompot xona haroratida sovitiladi. Porsiyalarga bo‘lish uchun quruq mevalar va sirop har bir idishga teng taqsimlanadi.\n\nDasturxonga tortish uchun eng maqbul harorat +20°C.	Tashqi ko‘rinishi:\nQaynatilgan, shaklini saqlab qolgan quruq mevalar shaffof qaynatma ichida bo‘lishi kerak. Mahsulotni xiralashtirmaydigan suzib yurgan ozgina zarrachalar bo‘lishi mumkin.\n\nRangi:\nSarg‘ishdan to‘q jigarranggacha.\n\nTa’mi:\nNordon-shirin, qaynatilgan meva va rezavorlarning yaxshi ifodalangan ta’mi.\n\nHidi:\nQaynatilgan meva va rezavorlarga xos.\n\nTarkibi:\nSuyuq, mevalari yumshoq.	\N
1f08760d-bf99-43da-a7b0-b6784cd0b8d5	\N	Sabzi va olma sharbatidan kisel	/uploads/1781102767880-enhanced_image_2.jpg	0	0	0	Bir bolaga mo‘ljallangan tayyor ichimlik miqdori:\n\n1-3 yosh — 130 g\n3-7 yosh — 150 g	Qaynoq va yaxna ichimliklar	+20°C.	\N	130 g	150 g	\N	\N	1-3 yosh:\n\nSabzi — 48.8 g (39 g sof og‘irligi)\nOlma — 39.3 g (27.7 g sof og‘irligi)\nTayyor sabzi sharbati — 19 g\nTayyor olma sharbati — 19 g\nShakar — 6 g\nKartoshka kraxmali — 5 g\nSuv — 101 g\n\n3-7 yosh:\n\nSabzi — 56.3 g (45 g sof og‘irligi)\nOlma — 45.3 g (32 g sof og‘irligi)\nTayyor sabzi sharbati — 22 g\nTayyor olma sharbati — 22 g\nShakar — 7 g\nKartoshka kraxmali — 6 g\nSuv — 117 g	Tayyorlash texnologiyasi\n\nSabzi va olma yaxshilab yuvilib, tozalanadi, po‘sti archiladi va oqar suvda qaytadan yuviladi.\n\nQirg‘ichdan o‘tkazilib, sharbati siqib olinadi.\n\nTayyor bo‘lgan sabzi va olma sharbati ustiga qaynagan suv quyilib, 7–10 daqiqa davomida qaynatiladi va suzib olinadi.\n\nQaynatmaga shakar qo‘shilib, qaynash darajasiga yetkaziladi va unga sovuq suvda suyultirilib, suzib olingan kartoshka kraxmali ingichka naycha orqali asta-sekin solinadi hamda quyuq holga kelgunicha qaynatiladi.\n\nTayyor bo‘lgan kisel xona haroratida sovitilib, stakan yoki piyolada dasturxonga tortiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +20°C.	Tashqi ko‘rinishi: bir xil, yarim shaffof massa, sirtida turli plyonkalarsiz.\n\nRangi: sariqdan to‘q sariqqacha.\n\nTa’mi va hidi: sabzi va olmaga xos, nordon-shirin.\n\nTarkibi: yopishqoq, cho‘ziluvchan.	\N
c7fc9201-329e-4428-b0b4-c891ecb3aa12	\N	Qaynoq sut	/uploads/1781102710042-enhanced_image_2.jpg	0	0	0	Bir bolaga mo‘ljallangan tayyor ichimlik miqdori:\n\n1-3 yosh — 130 g\n3-7 yosh — 150 g	Qaynoq va yaxna ichimliklar	\N	+20°C	130 g	150 g	\N	\N	1-3 yosh:\n\nSut — 137.2 g\n\n3-7 yosh:\n\nSut — 158.3 g	Tayyorlash texnologiyasi\n\nSut maxsus idishda 2–3 daqiqa davomida qaynatiladi.\n\nQaynab chiqqan sut biroz sovitiladi.\n\nTayyor mahsulot stakan yoki piyolada dasturxonga tortiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +20°C.	Tashqi ko‘rinishi:\nYuzasida qaymoq qatlami mavjud bo‘lgan xira suyuqlik.\n\nRangi:\nSut mahsulotiga xos.\n\nTa’mi:\nSut mahsulotiga xos.\n\nHidi:\nSut mahsulotiga xos.\n\nNormativ talablarga to‘liq mos bo‘lishi kerak.	\N
ddfd6dc6-1aaf-4c9f-abdb-f1a162db45a9	\N	Quyultirilgan sutli kakao	/uploads/1781102725750-enhanced_image_2.jpg	0	0	0	\N	Qaynoq va yaxna ichimliklar	\N	+50°C	130 g	150 g	\N	\N	1-3 yosh:\n\nKakao kukuni — 1.7 g\nQuyultirilgan sut (shakar bilan) — 24.7 g\nSuv — 114 g\nShakar — 2 g\n\n3-7 yosh:\n\nKakao kukuni — 2 g\nQuyultirilgan sut (shakar bilan) — 28.5 g\nSuv — 132 g\nShakar — 2.3 g	Tayyorlash texnologiyasi\n\nQuyultirilgan shakarli sut qaynagan suvda eritiladi va qaynatiladi.\n\nKakao kukuni hamda shakar aralashtirilib, oz miqdordagi qaynagan suv bilan bir xil massa hosil bo‘lgunicha eritiladi.\n\nSo‘ngra tayyor eritmaga uzluksiz ravishda quyultirilgan sut qo‘shilib, qaynatiladi.\n\nTayyor ichimlik stakan yoki finjonda dasturxonga tortiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +50°C.	Tashqi ko‘rinishi:\nStakan yoki finjonga tartibli solingan kakao.\n\nTarkibi:\nBir xil ko‘rinishdagi suyuqlik.\n\nRangi:\nPushti tusli och jigarrang.\n\nTa’mi:\nShirin, sutning qo‘shimcha ta’mi seziladi.\n\nHidi:\nKakaoga xos yoqimli hid.	\N
f3ff893c-aec8-4fd7-ad85-65dcf565cbb3	\N	Quyultirilgan sutli choy	/uploads/1781102751211-enhanced_image_2.jpg	0	0	0	\N	Qaynoq va yaxna ichimliklar	\N	+50°C	130g	150g	\N	\N	1-3 yosh:\n\nQora bayxali quruq choy — 0.17 g\nQuyultirilgan sut — 26 g\nSuv — 108 g\n\n3-7 yosh:\n\nQora bayxali quruq choy — 0.2 g\nQuyultirilgan sut — 30 g\nSuv — 125 g	Tayyorlash texnologiyasi\n\nChoynak qaynagan suv bilan 2–3 marta yaxshilab chayiladi.\n\nSo‘ngra quruq choy solinib, choynakning 1/3 qismigacha qaynagan suv quyiladi.\n\nUsti yopilib, 5–10 daqiqa davomida tindiriladi.\n\nDamlangan choyga qaynagan suv me’yoriga yetkazib quyiladi.\n\nSo‘ngra quyultirilgan sut qo‘shilib, yaxshilab aralashtiriladi.\n\nDasturxonga tortish uchun eng maqbul harorat +50°C.	Tashqi ko‘rinishi:\nQuyqasiz xira suyuqlik.\n\nRangi:\nIshlatilgan choy turiga qarab och sariq.\n\nTa’mi:\nQuruq choy ta’mi bilan quyultirilgan sut ta’mi uyg‘unlashgan.\n\nHidi:\nQuruq choy va quyultirilgan sutga xos yoqimli hid.\n\nTarkibi:\nBir xil ko‘rinishdagi suyuqlik.	\N
a5aaa62e-8855-4df9-a772-b169bf57db09	\N	Sersuv mevalardan kompot	/uploads/1781102782960-enhanced_image_2.jpg	0	0	0	Bir bolaga mo‘ljallangan tayyor ichimlik miqdori:\n\n1-3 yosh — 130 g\n3-7 yosh — 150 g	Qaynoq va yaxna ichimliklar	\N	+20°C	130 g	150g	\N	\N	1-3 yosh:\n\nOlma yoki Behi — 37 g (26 g sof og‘irligi)\nyoki Nok — 36 g (26 g sof og‘irligi)\n\nSuv — 112 g\nShakar — 7 g\n\n3-7 yosh:\n\nOlma yoki Behi — 42.9 g (30 g sof og‘irligi)\nyoki Nok — 41.1 g (30 g sof og‘irligi)\n\nSuv — 129 g\nShakar — 8 g	Tayyorlash texnologiyasi\n\nOlma, behi yoki nok saralanadi, yuviladi, po‘stlog‘i tozalanadi va urug‘lari olib tashlanadi.\n\nMayda bo‘laklarga bo‘linadi.\n\nShakar issiq suvda eritilib, 10–12 daqiqa davomida qaynatiladi.\n\nQaynab turgan siropga mevalar solinib, past olovda 6–8 daqiqa qaynatiladi.\n\nSo‘ngra usti yopilib xona haroratida sovitiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +20°C.	Tashqi ko‘rinishi:\nPo‘stlog‘i tozalangan, urug‘lari olib tashlangan va bir tekisda kesilgan olma, behi yoki nok bo‘laklari shaffof sirop ichida bo‘lishi kerak. Mahsulotni xiralashtirmaydigan mayda zarrachalar bo‘lishi mumkin.\n\nRangi:\nSariqdan turli intensivlikdagi jigarranggacha.\n\nTa’mi:\nNordon-shirin, siropdagi mevalarning yaxshi ifodalangan ta’mi.\n\nHidi:\nQaynatilgan va siropga solingan mevalarga xos.\n\nTarkibi:\nSuyuq, mevalari yumshoq.	\N
f99d7a60-11ef-453b-8778-23f2ce6ce47d	\N	Shakar bilan na’matak damlamasi	/uploads/1781102791815-enhanced_image_2.jpg	0	0	0	\N	Qaynoq va yaxna ichimliklar	5-10 daqiqa qaynatiladi	+15°C	130 g	150 g	\N	\N	1-3 yosh:\n\nNa’matak (quruq) — 13 g\nSuv — 130 g\nShakar — 7 g\n\n3-7 yosh:\n\nNa’matak (quruq) — 15 g\nSuv — 150 g\nShakar — 8 g	Tayyorlash texnologiyasi\n\nNa’matak mevalari oqar suvda yaxshilab yuviladi.\n\nUstiga qaynagan suv quyiladi va yopiq idishda past olovda 5–10 daqiqa davomida qaynatiladi.\n\nSo‘ngra shakar qo‘shilib, qaynatish jarayoni oxiriga yetkaziladi.\n\nDamlamaning qopqog‘i yopiq holda xona haroratida sovitiladi va keyin suzib olinadi.\n\nTayyor damlama stakan yoki finjonda dasturxonga tortiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +15°C.	Tashqi ko‘rinishi:\nShaffof suyuqlik.\n\nRangi:\nJigarrang tusli sarg‘ish.\n\nTa’mi:\nNordon-shirin.\n\nHidi:\nNa’matak mevalariga xos.	\N
5dec6784-3864-4650-96c9-b0b1ac2cc364	\N	Sutli kakao	/uploads/1781102615161-enhanced_image_2.jpg	0	0	0.1	\N	Qaynoq va yaxna ichimliklar	\N	+50°C	130 g	150 g	\N	\N	1-3 yosh:\n\nKakao kukuni — 1.7 g\nSut — 65 g\nSuv — 72 g\nShakar — 6 g\n\n3-7 yosh:\n\nKakao kukuni — 2 g\nSut — 75 g\nSuv — 84 g\nShakar — 7 g	Tayyorlash texnologiyasi\n\nKakao kukuni shakar bilan aralashtiriladi.\n\nOz miqdordagi qaynagan suv qo‘shilib, bir xil massa hosil bo‘lguncha aralashtiriladi.\n\nSo‘ngra uzluksiz aralashtirib turilgan holda issiq sut va qolgan qaynagan suv qo‘shiladi.\n\nAralashma qaynatiladi.\n\nTayyor ichimlik stakan yoki finjonda dasturxonga tortiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +50°C.	Bir bolaga mo‘ljallangan tayyor ichimlik miqdori:\n\n1-3 yosh — 130 g\n3-7 yosh — 150 g\n\nTavsiya etilgan tortish harorati: +50°C.	\N
2288e031-0ceb-467f-b2ed-8ef01306dadd	\N	Damlama choy	/uploads/1781102642498-enhanced_image_2.jpg	0	0	0	\N	Qaynoq va yaxna ichimliklar	\N	+50°C	35 g (damlama)	41 g (damlama)	\N	\N	1-3 yosh:\n\nQora bayxa quruq choyi — 0.10 g\nyoki Ko‘k choy — 0.19 g\nSuv — 38.8 g\n\nTayyor damlama choy miqdori — 35 g\n\n3-7 yosh:\n\nQora bayxa quruq choyi — 0.11 g\nyoki Ko‘k choy — 0.21 g\nSuv — 44.8 g\n\nTayyor damlama choy miqdori — 41 g	Tayyorlash texnologiyasi\n\nChoynak qaynagan suv bilan yaxshilab chayiladi.\n\nQuruq choy solinadi va choynakning 1/3 qismigacha qaynagan suv quyiladi.\n\nUsti salfetka bilan yopilib, 5–10 daqiqa tindiriladi.\n\nSo‘ngra qaynagan suv bilan me’yoriga yetkaziladi.\n\nDamlama choy tayyorlashda shakar, murabbo, asal, sut, limon va boshqa qo‘shimchalardan foydalanish mumkin.	Tashqi ko‘rinishi:\nShaffof suyuqlik.\n\nRangi:\nIshlatilgan choy naviga xos.\n\nTa’mi:\nYaxshi damlangan choyga xos, o‘ziga xos yoqimli ta’m.\n\nHidi:\nChoy naviga xos yoqimli hid.\n\nTarkibi:\nBir xil, shaffof suyuqlik.	\N
e5af6799-7f9a-4c6d-accb-dcc7e065b04e	\N	Sutli choy	/uploads/1781102687668-enhanced_image_2.jpg	0	0	0	Bir bolaga mo‘ljallangan tayyor ichimlik miqdori:\n\n1-3 yosh — 130 g\n3-7 yosh — 150 g\n\nTavsiya etilgan tortish harorati: +50°C.	Qaynoq va yaxna ichimliklar	\N	+50°C	130 g	150 g	\N	\N	1-3 yosh:\n\nQora bayxali quruq choy — 0.17 g\nChoy damlash uchun suv — 36.2 g\nTayyor quruq choy damlamasi — 33 g\n\nSut — 87 g\nSuv — 13 g\nShakar — 5 g\n\n3-7 yosh:\n\nQora bayxali quruq choy — 0.2 g\nChoy damlash uchun suv — 41.8 g\nTayyor quruq choy damlamasi — 38 g\n\nSut — 100 g\nSuv — 15 g\nShakar — 6 g	Tayyorlash texnologiyasi\n\nChoynak qaynagan suv bilan 2–3 marta yaxshilab chayiladi.\n\nSo‘ngra quruq choy solinib, choynakning 1/3 qismigacha qaynagan suv quyiladi.\n\nUsti yopilib, 5–10 daqiqa davomida tindiriladi va qaynagan suv bilan me’yoriga yetkaziladi.\n\nTayyorlangan choy damlamasidan 30 daqiqa davomida foydalanish mumkin.\n\nSut qaynatiladi.\n\nQaynatilgan sutga shakar va qaynagan suv qo‘shiladi.\n\nHosil bo‘lgan aralashma stakanga quyilgan choy damlamasi bilan aralashtiriladi.\n\nDasturxonga tortish uchun eng maqbul harorat +50°C.	Tashqi ko‘rinishi:\nXira suyuqlik, quyqasiz.\n\nRangi:\nOch jigarrangdan och sariqqacha, ishlatilgan choy turiga bog‘liq.\n\nTa’mi:\nSut qo‘shilgan shirin choy ta’mi.\n\nHidi:\nQuruq choy va sutga xos yoqimli hid.\n\nTarkibi:\nBir xil ko‘rinishdagi suyuqlik.	\N
d27f27ea-620d-40a2-9872-1add889eb892	\N	Mevali smuzi	/uploads/1781102695479-enhanced_image_2.jpg	0	0	0	Vitaminlar / Izoh:\nKaliy, C vitamini, B guruhi vitaminlari, probiotiklar manbai.	Qaynoq va yaxna ichimliklar	10 daqiqa 	Sovutilgan holatda	130	150	\N	\N	1-3 yosh uchun:\n\nKefir — 100 g\nBanan — 33 g (20 g netto)\nOlma — 28 g (20 g netto)\nShakar — 10 g\n\n3-7 yosh uchun:\n\nKefir — 116 g\nBanan — 38 g (23 g netto)\nOlma — 32 g (23 g netto)\nShakar — 11 g	Tayyorlash texnologiyasi:\nBanan po‘stidan tozalanib bo‘laklanadi va blenderda maydalanadi. Olma po‘sti archilib, urug‘lari olinadi va blenderda maydalanadi. So‘ng kefir va shakar qo‘shilib bir xil massa hosil bo‘lguncha aralashtiriladi. 5–10 daqiqa tindiriladi.	Sifatiga qo‘yiladigan talablar:\n\nBir xil massa bo‘lishi.\nBegona hid va ta’m bo‘lmasligi.\nMevalar yaxshi maydalangan bo‘lishi.	\N
66bba098-d72d-4d0d-a352-cb0da8f3c9ef	\N	Shakar choy	/uploads/1781102734587-enhanced_image_2.jpg	0	0	0	Bir bolaga mo‘ljallangan tayyor ichimlik miqdori:\n\n1-3 yosh — 130 g\n3-7 yosh — 150 g\n\nShakar o‘rniga qora smorodina shinnisi, qulupnay murabbosi yoki asal ishlatilishi mumkin.	Qaynoq va yaxna ichimliklar	\N	+50°C	130 g	150 g	\N	\N	1-3 yosh:\n\nQora bayxa quruq choyi — 0.19 g\nSuv (damlama uchun) — 38.8 g\nTayyor damlama choy — 35 g\n\nSuv — 100 g\n\nVariantlar:\nShakar — 5 g\nyoki Qora smorodina shinnisi — 9 g\nyoki Qulupnay murabbosi — 9 g\nyoki Asal — 9 g\n\n3-7 yosh:\n\nQora bayxa quruq choyi — 0.21 g\nSuv (damlama uchun) — 44.8 g\nTayyor damlama choy — 41 g\n\nSuv — 115 g\n\nVariantlar:\nShakar — 6 g\nyoki Qora smorodina shinnisi — 11 g\nyoki Qulupnay murabbosi — 11 g\nyoki Asal — 11 g	Tayyorlash texnologiyasi\n\nChoynak qaynagan suv bilan yaxshilab chayiladi.\n\nQuruq choy solinib, choynakning 1/3 qismigacha qaynagan suv quyiladi.\n\nUsti yopilib 5–10 daqiqa tindiriladi va qaynagan suv bilan me’yoriga yetkaziladi.\n\nSuv shakar, murabbo yoki shinni bilan birga qaynatiladi.\n\nStakan yoki finjonga quyilgan choy damlamasi ustidan shakarli (yoki murabboli, shinnili) qaynatilgan suv quyiladi.\n\nAsal ishlatilganda uni taxminan 60°C gacha sovigan choyga qo‘shish tavsiya etiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +50°C.	Tashqi ko‘rinishi:\nShaffof suyuqlik. Shinni, murabbo yoki asal qo‘shilganda oz miqdorda quyqa bo‘lishi mumkin.\n\nRangi:\nIshlatilgan choy naviga mos.\n\nTa’mi:\nShirin choy, qo‘shilgan shakar, murabbo, shinni yoki asalning qo‘shimcha ta’mi seziladi.\n\nHidi:\nChoy naviga xos yoqimli hid.\n\nTarkibi:\nBir xil, shaffof suyuqlik.	\N
d1e63654-cd82-4aa8-8ac2-9d871d1c4ab3	\N	Limon choy	/uploads/1781102662306-enhanced_image_2.jpg	0	0	0	\N	Qaynoq va yaxna ichimliklar	\N	+50°C	130 g	150 g	\N	\N	1-3 yosh:\n\nQora bayxali quruq choy — 0.19 g\nChoy damlash uchun suv — 38.8 g\nTayyor quruq choy damlamasi — 35 g\n\nSuv — 100 g\nShakar — 7 g\nLimon — 5.1 g (4.6 g sof og‘irligi)\n\n3-7 yosh:\n\nQora bayxali quruq choy — 0.21 g\nChoy damlash uchun suv — 44.8 g\nTayyor quruq choy damlamasi — 41 g\n\nSuv — 115 g\nShakar — 8 g\nLimon — 5.9 g (5.4 g sof og‘irligi)	Tayyorlash texnologiyasi\n\nChoynak qaynagan suv bilan 2–3 marta yaxshilab chayiladi.\n\nSo‘ngra quruq choy solinib, choynakning 1/3 qismigacha qaynagan suv quyiladi.\n\nUsti yopilib, 5–10 daqiqa davomida tindiriladi va qaynagan suv bilan me’yoriga yetkaziladi.\n\nTayyorlangan choy damlamasidan 30 daqiqa davomida foydalanish mumkin.\n\nSuvga shakar qo‘shilib qaynatiladi.\n\nStakanga quyilgan choy damlamasi ustiga shakarli qaynatilgan suv quyiladi.\n\nLimon yaxshilab yuvilib, qaynagan suvga botiriladi va ingichka dumaloq shaklda kesiladi.\n\nLimon bo‘laklari choy bilan birga stakanga solinadi.\n\nDasturxonga tortish uchun eng maqbul harorat +50°C.	Tayyorlash texnologiyasi\n\nChoynak qaynagan suv bilan 2–3 marta yaxshilab chayiladi.\n\nSo‘ngra quruq choy solinib, choynakning 1/3 qismigacha qaynagan suv quyiladi.\n\nUsti yopilib, 5–10 daqiqa davomida tindiriladi va qaynagan suv bilan me’yoriga yetkaziladi.\n\nTayyorlangan choy damlamasidan 30 daqiqa davomida foydalanish mumkin.\n\nSuvga shakar qo‘shilib qaynatiladi.\n\nStakanga quyilgan choy damlamasi ustiga shakarli qaynatilgan suv quyiladi.\n\nLimon yaxshilab yuvilib, qaynagan suvga botiriladi va ingichka dumaloq shaklda kesiladi.\n\nLimon bo‘laklari choy bilan birga stakanga solinadi.\n\nDasturxonga tortish uchun eng maqbul harorat +50°C.	\N
727108ca-1851-4c5c-977d-eafc7a8a2d7a	\N	Yangi siqilgan sabzi sharbati	/uploads/1781102596130-enhanced_image_2.jpg	0	0	0	Sabzi tarkibida beta-karotin (A vitamini manbai) mavjud.\n\nBir bolaga mo'ljallangan tayyor ichimlik miqdori: 150 g.	Qaynoq va yaxna ichimliklar	10-15 daqiqa	+20°C	150 g	150 g	\N	\N	Sabzi — 330 g (264 g sof og'irligi)	Sabzi saralanadi, po'sti archib, yaxshilab yuviladi.\n\nSo'ngra sharbat siqqichdan o'tkaziladi.\n\nTayyor sharbat stakan yoki piyolada dasturxonga tortiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +20°C.	Tashqi ko'rinishi: bir xil massa.\n\nRangi: qo'llanilayotgan mahsulotga xos.\n\nTa'mi: nordon-shirin.\n\nHidi: qo'llanilayotgan mahsulotga xos.\n\nTarkibi: suyuq.	\N
f9a2091c-e817-4c93-b5eb-85bbb0d59dbe	\N	Apelsin kompoti	/uploads/1781102624742-enhanced_image_2.jpg	0	0	0	Bir bolaga mo‘ljallangan tayyor ichimlik miqdori:\n\n1-3 yosh — 130 g\n3-7 yosh — 150 g	Qaynoq va yaxna ichimliklar	5 daqiqa	+20°C.	\N	\N	\N	\N	1-3 yosh:\n\nApelsin — 14 g\nPo‘sti archilgan apelsin — 11 g\nShakar — 7 g\nSuv — 137 g\n\n3-7 yosh:\n\nApelsin — 16.5 g\nPo‘sti archilgan apelsin — 11 g\nShakar — 8 g\nSuv — 157.5 g	Tayyorlash texnologiyasi\n\nApelsin po‘stlog‘i mayda to‘g‘ralib, qaynagan suvga solinadi va 5 daqiqa davomida qaynatiladi.\n\nSo‘ngra 3–4 soat davomida tindirib qo‘yiladi va suzib olinadi.\n\nQaynatmaga shakar va apelsin bo‘laklari qo‘shilib, yana qaynatiladi.\n\nQaynab chiqqandan so‘ng xona haroratida sovitiladi.\n\nPorsiyalarga bo‘lishda apelsin bo‘laklari har bir idishga teng taqsimlanadi.\n\nDasturxonga tortish uchun eng maqbul harorat +20°C.	Tashqi ko‘rinishi:\nApelsin po‘stlog‘i tozalangan, teng bo‘laklarga bo‘lingan va shaffof siropga bo‘ktirilgan.\n\nRangi:\nSariqdan turli intensivlikdagi to‘q sariqqacha.\n\nTa’mi:\nNordon-shirin, apelsin ta’mi yaqqol seziladi.\n\nHidi:\nQaynatilgan va siropga solingan apelsinga xos.\n\nTarkibi:\nSuyuq, mevalari yumshoq.	\N
4351b0ce-db98-4125-9ba3-ac37c51b6cd9	\N	Ho‘l mevalar qoqisidan kompot	/uploads/1781102655453-enhanced_image_2.jpg	0	0	0	Bir bolaga mo‘ljallangan tayyor ichimlik miqdori:\n\n1-3 yosh — 130 g\n3-7 yosh — 150 g\n\nKompot tayyorlashda olma qoqi, nok qoqi, bargak, olxo‘ri qoqi, o‘rik qoqi yoki mayizdan foydalanish mumkin.	Qaynoq va yaxna ichimliklar	\N	+20°C	130 g	150 g	\N	\N	1-3 yosh:\n\nOlma qoqi — 10 g (36 g tayyor mahsulot)\nyoki Nok qoqi — 20 g (29 g tayyor mahsulot)\nyoki Bargak — 13 g (24 g tayyor mahsulot)\nyoki Olxo‘ri qoqi — 16 g (24 g tayyor mahsulot)\nyoki O‘rik qoqi — 16 g (30 g tayyor mahsulot)\nyoki Mayiz — 13 g (20 g tayyor mahsulot)\n\nShakar — 7 g\nSuv — 132 g\n\n3-7 yosh:\n\nOlma qoqi — 11 g (42 g tayyor mahsulot)\nyoki Nok qoqi — 23 g (34 g tayyor mahsulot)\nyoki Bargak — 15 g (28 g tayyor mahsulot)\nyoki Olxo‘ri qoqi — 19 g (28 g tayyor mahsulot)\nyoki O‘rik qoqi — 19 g (35 g tayyor mahsulot)\nyoki Mayiz — 15 g (24 g tayyor mahsulot)\n\nShakar — 8 g\nSuv — 152 g	Tayyorlash texnologiyasi\n\nTayyorlab qo‘yilgan quritilgan meva yoki rezavorlar qaynayotgan suvga solinadi va qaynatiladi.\n\nQaynatish jarayonida shakar qo‘shilib, mahsulot tayyor holga kelguncha pishiriladi.\n\nMeva yoki quritilgan rezavorlarning turiga qarab pishirish vaqti farq qiladi:\n\nOlma — 20–30 daqiqa\nQora o‘rik (bargak) — 10–20 daqiqa\nO‘rik qoqi — 10–20 daqiqa\nMayiz — 5 daqiqa\n\nKompot tiniq bo‘lishi uchun rezavorlar alohida tayyorlanishi tavsiya etiladi.\n\nTayyor kompot stakan yoki piyolada dasturxonga tortiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +20°C.	Tashqi ko‘rinishi:\nQaynatilgan, shaklini saqlab qolgan quruq mevalar shaffof qaynatma ichida bo‘lishi kerak. Mahsulotni xiralashtirmaydigan mayda zarrachalar bo‘lishi mumkin.\n\nRangi:\nSarg‘ishdan to‘q jigarranggacha.\n\nTa’mi:\nNordon-shirin, qaynatilgan meva va rezavorlarning yaxshi ifodalangan ta’mi.\n\nHidi:\nQaynatilgan meva va rezavorlarga xos.\n\nTarkibi:\nSuyuq, mevalari yumshoq.	\N
88d74423-34a2-417d-bb35-b504883461b0	\N	Mavsumiy mevalardan kisel	/uploads/1781102674516-enhanced_image_2.jpg	0	0	0	Bir bolaga mo‘ljallangan tayyor ichimlik miqdori:\n\n1-3 yosh — 130 g\n3-7 yosh — 150 g\n\nMavsumga qarab olma, nok, olcha, tog‘olcha, olxo‘ri, apelsin yoki mandarin ishlatilishi mumkin.	Qaynoq va yaxna ichimliklar	\N	+20°C	130 g	150 g	\N	\N	1-3 yosh:\n\nOlma — 41.9 g (29.3 g sof og‘irligi)\nyoki Nok — 40.1 g (29.3 g sof og‘irligi)\nyoki Olcha — 18.3 g (15.6 g sof og‘irligi)\nyoki Tog‘olcha — 16.8 g (15.6 g sof og‘irligi)\nyoki Olxo‘ri — 17.3 g (15.6 g sof og‘irligi)\nyoki Apelsin — 48.5 g (32.5 g sof og‘irligi)\nyoki Mandarin — 43.9 g (32.5 g sof og‘irligi)\n\nShakar — 6 g\nKartoshka kraxmali — 5 g\nSuv — 124 g\n\n3-7 yosh:\n\nOlma — 48.3 g (33.8 g sof og‘irligi)\nyoki Nok — 46.3 g (33.8 g sof og‘irligi)\nyoki Olcha — 21.2 g (18 g sof og‘irligi)\nyoki Tog‘olcha — 19.4 g (18 g sof og‘irligi)\nyoki Olxo‘ri — 20 g (18 g sof og‘irligi)\nyoki Apelsin — 56 g (37.5 g sof og‘irligi)\nyoki Mandarin — 50.7 g (37.5 g sof og‘irligi)\n\nShakar — 7 g\nKartoshka kraxmali — 6 g\nSuv — 143 g	Tayyorlash texnologiyasi\n\nOlma va nok saralanadi, oqar suvda yaxshilab yuviladi, po‘stlog‘i archiladi va urug‘lari olib tashlanadi. Mayda bo‘laklarga kesilib, sharbati siqib olinadi.\n\nTayyorlangan sharbat qaynayotgan suvga solinib 7–10 daqiqa davomida qaynatiladi va suzib olinadi.\n\nQaynatmaga shakar qo‘shilib qaynatiladi. Sovuq suvda suyultirilgan va suzilgan kartoshka kraxmali qo‘shilib, quyuqlashguncha qaynatiladi.\n\nOlcha, tog‘olcha va olxo‘ri oz miqdordagi suvda 7–10 daqiqa qaynatilib, meva eziladi va pyure holiga keltiriladi.\n\nQaynatmaga shakar va meva pyuresi qo‘shilib yana qaynatiladi. So‘ngra kraxmal qo‘shilib qayta qaynatiladi.\n\nApelsin yoki mandarin yuviladi, po‘stlog‘i archiladi va urug‘lari olib tashlanadi. Sharbat siqib olinadi.\n\nPo‘stlog‘i va sharbati olingan qismi meva qaynatmasi tayyorlash uchun ishlatiladi. Qaynatmaga shakar, pyure va tayyorlangan kraxmal qo‘shilib qaynatiladi.\n\nTayyor kisel xona haroratida sovitiladi va stakan yoki piyolada dasturxonga tortiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +20°C	Tashqi ko‘rinishi:\nBir xil, yarim shaffof massa. Sirtida turli plyonkalar bo‘lmasligi kerak.\n\nRangi:\nYashil tusli och kulrang.\n\nTa’mi:\nNordon-shirin, ishlatilgan mevalarga xos.\n\nHidi:\nIshlatilgan mevalarga xos.\n\nTarkibi:\nYopishqoq, cho‘ziluvchan.	\N
fefc2364-75f3-4e57-99de-f37c0f363376	\N	Qaynoq va yaxna ichimliklar	/uploads/1781102716166-enhanced_image_2.jpg	0	0	0	QAYNOQ VA YAXNA ICHIMLIKLAR\n\nBolajonlarning idishiga xushbo‘y issiq va sovuq ichimliklarni quyishdan oldin nimani hisobga olish kerak?\n\nIchimliklar issiq va sovuq ichimliklarga bo‘linadi. Issiq ichimliklarga choy, qahvaning ayrim turlari hamda kakao kiradi. Sovuq ichimliklarga esa sut-qatiq, salqinlashtiruvchi meva-rezavor sharbatlari kiradi. Ularni nonushta, tushlik va kechki ovqatda ham iste’mol qilish mumkin.\n\nIchimliklar bolalarning suvga bo‘lgan ehtiyojini qondirish bilan birga, organizmni vitaminlar, mineral moddalar va boshqa biologik faol moddalar bilan boyitadi.\n\nSuv, sut va sut mahsulotlari (quyultirilgan sut bundan mustasno), shuningdek sharbatlarga ishlatiladigan suv miqdori retseptlarda millilitrda, qolgan mahsulotlar esa grammda ko‘rsatiladi.\n\nDasturxonga tortishda issiq ichimliklarning harorati +60–65°C dan yuqori bo‘lmasligi, sovuq ichimliklarning harorati esa +15°C dan past bo‘lmasligi kerak.\n\nBirinchi yosh guruhi uchun ichimlik me’yori 130 g, ikkinchi yosh guruhi uchun esa 150 g etib belgilangan.\n\nChoy tayyorlash haqida\n\nChoy odatda yangi qaynagan suvdan foydalanib, chinni yoki metall choynaklarda damlanadi.\n\nDamlangan choyni qaynatish yoki plita ustida uzoq vaqt ushlab turish tavsiya etilmaydi.\n\nChoyni stakanga quyishda avval me’yoridagi shakar solinadi. So‘ng oz miqdorda damlangan choy quyilib, qolgan qismi qaynagan suv bilan to‘ldiriladi.\n\nKisel tayyorlash haqida\n\nKisel kichik yoshdagi bolalar taomnomasida keng qo‘llaniladi.\n\nU sarxil yoki konservalangan meva va rezavorlar, sharbat, pyure, sut, murabbo va boshqa mahsulotlardan tayyorlanadi.\n\nKiselning jelesimon tuzilishini hosil qilish uchun kartoshka yoki jo‘xori kraxmalidan foydalaniladi.\n\nBolalar uchun asosan soussimon quyuqlikdagi yoki yarim quyuq holatdagi kisellar tavsiya etiladi.\n\nMeva-rezavorli kisellarda kartoshka kraxmalidan, sutli kisellarda esa jo‘xori kraxmalidan foydalanish maqsadga muvofiq hisoblanadi.\n\nQuyuq va o‘rtacha quyuqlikdagi kisellar alohida taom sifatida ham berilishi mumkin.\n\nQuyuq kisel tayyor bo‘lgach, qaynagan suv bilan namlangan va shakar sepilgan idishga quyiladi hamda sovitiladi.\n\nDasturxonga tortishda kisel bilan birga murabbo, shinni yoki konfet qo‘shib berilishi mumkin. Shuningdek, qaynatilgan sut ham qo‘shilishi mumkin (bir porsiya uchun 50–100 g).\n\nO‘rtacha quyuqlikdagi kisel sovitilib, dasturxonga tortishdan oldin stakanlarga 130–150 g miqdorda quyiladi.\n\nKisel odatda +14–16°C haroratda dasturxonga tortiladi.\n\nKompot tayyorlash haqida\n\nKompotlar sarxil, quruq meva va rezavorlardan tayyorlanadi.\n\nQuruq mevalardan kompot tayyorlash uchun meva va rezavorlar saralanadi, begona aralashmalardan tozalanadi va issiq suvda yaxshilab yuviladi.\n\nSo‘ng retsept bo‘yicha tayyorlanadi.\n\nQuruq mevalardan tayyorlangan kompotlarning mazasi yanada yaxshi bo‘lishi uchun tayyor bo‘lgach 4–5 soat tindirib qo‘yish tavsiya etiladi.\n\nTindirish jarayonida meva va rezavorlarga shakar yaxshiroq singadi, ularning xushbo‘y hidi va tarkibidagi oziqaviy moddalar (organik kislotalar, mineral tuzlar, shakar va boshqalar) ichimlikka o‘tadi va kompotning ta’mini yanada boyitadi.\n\nKompotlar har bir porsiyada 130–150 g miqdorda, +15°C gacha sovitilgan holda dasturxonga tortiladi.	\N	\N	\N	\N	\N	\N	\N	QAYNOQ VA YAXNA ICHIMLIKLAR\n\nBolajonlarning idishiga xushbo‘y issiq va sovuq ichimliklarni quyishdan oldin nimani hisobga olish kerak?\n\nIchimliklar issiq va sovuq ichimliklarga bo‘linadi. Issiq ichimliklarga choy, qahvaning ayrim turlari hamda kakao kiradi. Sovuq ichimliklarga esa sut-qatiq, salqinlashtiruvchi meva-rezavor sharbatlari kiradi. Ularni nonushta, tushlik va kechki ovqatda ham iste’mol qilish mumkin.\n\nIchimliklar bolalarning suvga bo‘lgan ehtiyojini qondirish bilan birga, organizmni vitaminlar, mineral moddalar va boshqa biologik faol moddalar bilan boyitadi.\n\nSuv, sut va sut mahsulotlari (quyultirilgan sut bundan mustasno), shuningdek sharbatlarga ishlatiladigan suv miqdori retseptlarda millilitrda, qolgan mahsulotlar esa grammda ko‘rsatiladi.\n\nDasturxonga tortishda issiq ichimliklarning harorati +60–65°C dan yuqori bo‘lmasligi, sovuq ichimliklarning harorati esa +15°C dan past bo‘lmasligi kerak.\n\nBirinchi yosh guruhi uchun ichimlik me’yori 130 g, ikkinchi yosh guruhi uchun esa 150 g etib belgilangan.\n\nChoy tayyorlash haqida\n\nChoy odatda yangi qaynagan suvdan foydalanib, chinni yoki metall choynaklarda damlanadi.\n\nDamlangan choyni qaynatish yoki plita ustida uzoq vaqt ushlab turish tavsiya etilmaydi.\n\nChoyni stakanga quyishda avval me’yoridagi shakar solinadi. So‘ng oz miqdorda damlangan choy quyilib, qolgan qismi qaynagan suv bilan to‘ldiriladi.\n\nKisel tayyorlash haqida\n\nKisel kichik yoshdagi bolalar taomnomasida keng qo‘llaniladi.\n\nU sarxil yoki konservalangan meva va rezavorlar, sharbat, pyure, sut, murabbo va boshqa mahsulotlardan tayyorlanadi.\n\nKiselning jelesimon tuzilishini hosil qilish uchun kartoshka yoki jo‘xori kraxmalidan foydalaniladi.\n\nBolalar uchun asosan soussimon quyuqlikdagi yoki yarim quyuq holatdagi kisellar tavsiya etiladi.\n\nMeva-rezavorli kisellarda kartoshka kraxmalidan, sutli kisellarda esa jo‘xori kraxmalidan foydalanish maqsadga muvofiq hisoblanadi.\n\nQuyuq va o‘rtacha quyuqlikdagi kisellar alohida taom sifatida ham berilishi mumkin.\n\nQuyuq kisel tayyor bo‘lgach, qaynagan suv bilan namlangan va shakar sepilgan idishga quyiladi hamda sovitiladi.\n\nDasturxonga tortishda kisel bilan birga murabbo, shinni yoki konfet qo‘shib berilishi mumkin. Shuningdek, qaynatilgan sut ham qo‘shilishi mumkin (bir porsiya uchun 50–100 g).\n\nO‘rtacha quyuqlikdagi kisel sovitilib, dasturxonga tortishdan oldin stakanlarga 130–150 g miqdorda quyiladi.\n\nKisel odatda +14–16°C haroratda dasturxonga tortiladi.\n\nKompot tayyorlash haqida\n\nKompotlar sarxil, quruq meva va rezavorlardan tayyorlanadi.\n\nQuruq mevalardan kompot tayyorlash uchun meva va rezavorlar saralanadi, begona aralashmalardan tozalanadi va issiq suvda yaxshilab yuviladi.\n\nSo‘ng retsept bo‘yicha tayyorlanadi.\n\nQuruq mevalardan tayyorlangan kompotlarning mazasi yanada yaxshi bo‘lishi uchun tayyor bo‘lgach 4–5 soat tindirib qo‘yish tavsiya etiladi.\n\nTindirish jarayonida meva va rezavorlarga shakar yaxshiroq singadi, ularning xushbo‘y hidi va tarkibidagi oziqaviy moddalar (organik kislotalar, mineral tuzlar, shakar va boshqalar) ichimlikka o‘tadi va kompotning ta’mini yanada boyitadi.\n\nKompotlar har bir porsiyada 130–150 g miqdorda, +15°C gacha sovitilgan holda dasturxonga tortiladi.	Qaynoq va yaxna ichimliklar haqida malumot	\N	\N
133b8454-7fff-4256-a718-d81de3ddd79e	\N	Sersuv ho‘l mevalardan kompot	/uploads/1781102775491-enhanced_image_2.jpg	0	0	0	\N	Qaynoq va yaxna ichimliklar	\N	+20°C	130 g	150 g	\N	\N	1-3 yosh:\n\nGilos yoki olcha — 28 g (26 g sof og‘irligi)\nyoki Olxo‘ri — 29 g (26 g sof og‘irligi)\nyoki Shaftoli — 29 g (26 g sof og‘irligi)\nyoki O‘rik — 30 g (26 g sof og‘irligi)\n\nShakar — 7 g\nSuv — 106 g\n\n3-7 yosh:\n\nGilos yoki olcha — 32 g (30 g sof og‘irligi)\nyoki Olxo‘ri — 33 g (30 g sof og‘irligi)\nyoki Shaftoli — 33 g (30 g sof og‘irligi)\nyoki O‘rik — 35 g (30 g sof og‘irligi)\n\nShakar — 8 g\nSuv — 122 g	Tayyorlash texnologiyasi\n\nGilos, olcha, olxo‘ri, shaftoli yoki o‘rik saralanadi va oqar suvda yaxshilab yuviladi.\n\nMevalar shakarli qaynagan siropga solinadi va qaynatiladi.\n\nKompot qopqog‘i yopilgan holda xona haroratida sovitiladi hamda suzgichdan o‘tkaziladi.\n\nTayyor bo‘lgan kompot stakan yoki piyolada dasturxonga tortiladi.\n\nDasturxonga tortish uchun eng maqbul harorat +20°C.	Tashqi ko‘rinishi:\nMahsulotni xiralashtirmaydigan mayda zarrachalar mavjud bo‘lgan shaffof sirop ichida mevalar bo‘lishi kerak.\n\nRangi:\nSariqdan turli intensivlikdagi to‘q sariqqacha.\n\nTa’mi:\nNordon-shirin, siropdagi mevalarning yaxshi ifodalangan ta’mi.\n\nHidi:\nQaynatilgan va siropga solingan mevalarga xos.\n\nTarkibi:\nSuyuq, mevalari yumshoq.	\N
\.


--
-- Data for Name: finance_transactions; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.finance_transactions (id, kindergarten_id, date, category, item, amount, quantity, price_per_unit, type) FROM stdin;
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.groups (id, kindergarten_id, name, teacher_name, age_category, age_limit, capacity, teacher_id) FROM stdin;
\.


--
-- Data for Name: health_checks; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.health_checks (id, kindergarten_id, child_id, date, weight, height, temperature, allergy, is_sick, notes, created_at, chest_circumference, weight_status, height_status, temperature_status, chest_circumference_status) FROM stdin;
\.


--
-- Data for Name: inventory_batches; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.inventory_batches (id, kindergarten_id, product_id, batch_number, invoice_number, quantity, price_per_unit, total_price, received_date, expiry_date, supplier, storage_location, storage_temp, notes) FROM stdin;
\.


--
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.inventory_transactions (id, kindergarten_id, product_id, type, quantity, unit, date, reason, created_at) FROM stdin;
\.


--
-- Data for Name: kindergarten_settings; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.kindergarten_settings (kindergarten_id, kg_name, kg_logo, updated_at) FROM stdin;
\.


--
-- Data for Name: kindergartens; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.kindergartens (id, system_id, name, type, region, district, licensefile, directorname, directorbirthyear, directorphoto, phone, address, email, "position", capacity, currentchildren, groups, age13, age37, educators, cooks, techstaff, hasnurse, mealtype, sanitation, water, kitcheneq, haskitchen, hasallergymenu, hasdietmenu, haswarehouse, warehousemanager, avgconsumption, financetype, budget, lat, lng, username, password, status, rating, aimonitoring, threshold, created_at, nursecount, workhours, commissionorder, commissionapproveddate, commissionvaliduntil, brokeragedocumentfile) FROM stdin;
\.


--
-- Data for Name: kitchen_tasks; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.kitchen_tasks (id, kindergarten_id, menu_id, status, temperature, start_time, end_time, served_time, ready_for_nurse_at, nurse_quality_status, nurse_quality_comment, nurse_quality_checked_at, nurse_quality_checked_by) FROM stdin;
\.


--
-- Data for Name: lab_samples; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.lab_samples (sample_id, kindergarten_id, dish_id, dish_name, batch_reference, date, storage_location, storage_duration, status, lab_result, risk_level, notes, created_by, "timestamp", nutrition, test_results, storage_temp_history) FROM stdin;
\.


--
-- Data for Name: medical_inventory_items; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.medical_inventory_items (id, kindergarten_id, name, form, unit, required_per_100, required_label, is_default, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: medical_inventory_movements; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.medical_inventory_movements (id, kindergarten_id, item_id, type, quantity, movement_date, expiry_date, batch_number, source, reason, notes, created_at, updated_at, group_id, child_id, usage_time, diagnosis, evidence_photo_url) FROM stdin;
\.


--
-- Data for Name: menus; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.menus (id, kindergarten_id, date, meal_name, meal_type, age_group, diet_type, iron, carbohydrates, vitamins, composition, products, protein, fat, calories, image_url, is_approved, created_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.messages (id, kindergarten_id, sender_id, receiver_id, text, sender_role, status, created_at, message_type, file_url, file_name, mime_type, edited_at, deleted_at, is_deleted) FROM stdin;
\.


--
-- Data for Name: operations_log; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.operations_log (id, operation_type, entity_type, entity_name, description, category, kindergarten_id, is_archived, created_at) FROM stdin;
\.


--
-- Data for Name: parent_accounts; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.parent_accounts (id, login, password_hash, kindergarten_id, created_at) FROM stdin;
\.


--
-- Data for Name: parent_documents; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.parent_documents (id, kindergarten_id, child_id, title, type, file_url, created_at) FROM stdin;
\.


--
-- Data for Name: parents; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.parents (id, full_name, workplace, phone, passport_no, role, kindergarten_id, password, child_id) FROM stdin;
\.


--
-- Data for Name: pickup_people; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.pickup_people (id, kindergarten_id, child_id, full_name, relation, phone, photo_url, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.products (id, kindergarten_id, name, category, unit, brand, min_stock) FROM stdin;
\.


--
-- Data for Name: role_accounts; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.role_accounts (id, kindergarten_id, role, full_name, login, password_hash, created_at, updated_at) FROM stdin;
899913a5-cae1-4626-88fb-54f8e5f82869	8	TEACHER	Tarbiyachi	ewrewfwerwe	$2b$10$i.TC7TGhIyJ6mAPp5JXOZuFRgjozR.hp/swO8jYRONhTehSkKu0d.	2026-05-23 04:20:44	2026-06-01 04:13:47.165337
\.


--
-- Data for Name: role_notifications; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.role_notifications (id, kindergarten_id, target_role, target_user_id, source_role, title, message, type, entity_type, entity_id, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.schema_migrations (id, name, applied_at) FROM stdin;
001_schema_migrations	001_schema_migrations.sql	2026-06-01 04:52:02.501902
002_runtime_schema_baseline	002_runtime_schema_baseline.sql	2026-06-01 04:52:02.506392
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.staff (id, kindergarten_id, full_name, "position", phone, email, passport_no, birth_date, education, experience_years, group_id, user_id, salary, hire_date, status, created_at) FROM stdin;
\.


--
-- Data for Name: staff_health_checks; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.staff_health_checks (id, kindergarten_id, staff_id, date, temperature, blood_pressure, conclusion, is_fit, notes, created_at, updated_at, weight, height, chest_circumference, weight_status, height_status, temperature_status, chest_circumference_status) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.suppliers (id, kindergarten_id, first_name, last_name, name, brand, phone, contact_user, telegram_link, created_at) FROM stdin;
\.


--
-- Data for Name: supply_plans; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.supply_plans (id, kindergarten_id, title, month, status, total_amount, items, created_at) FROM stdin;
\.


--
-- Data for Name: supply_required_products; Type: TABLE DATA; Schema: public; Owner: raqamli_mtt
--

COPY public.supply_required_products (id, kindergarten_id, name, price, quantity, unit, brand, category, created_at) FROM stdin;
\.


--
-- Name: kindergartens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raqamli_mtt
--

SELECT pg_catalog.setval('public.kindergartens_id_seq', 344, true);


--
-- Name: admin_ai_insight_cache admin_ai_insight_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.admin_ai_insight_cache
    ADD CONSTRAINT admin_ai_insight_cache_pkey PRIMARY KEY (cache_key);


--
-- Name: admin_alert_events admin_alert_events_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.admin_alert_events
    ADD CONSTRAINT admin_alert_events_pkey PRIMARY KEY (id);


--
-- Name: admin_warehouse_purchases admin_warehouse_purchases_date_district_product_name_key; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.admin_warehouse_purchases
    ADD CONSTRAINT admin_warehouse_purchases_date_district_product_name_key UNIQUE (date, district, product_name);


--
-- Name: admin_warehouse_purchases admin_warehouse_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.admin_warehouse_purchases
    ADD CONSTRAINT admin_warehouse_purchases_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: audits audits_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.audits
    ADD CONSTRAINT audits_pkey PRIMARY KEY (id);


--
-- Name: chef_sanitary_checks chef_sanitary_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.chef_sanitary_checks
    ADD CONSTRAINT chef_sanitary_checks_pkey PRIMARY KEY (id);


--
-- Name: children children_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT children_pkey PRIMARY KEY (id);


--
-- Name: daily_district_expenses daily_district_expenses_date_district_key; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.daily_district_expenses
    ADD CONSTRAINT daily_district_expenses_date_district_key UNIQUE (date, district);


--
-- Name: daily_district_expenses daily_district_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.daily_district_expenses
    ADD CONSTRAINT daily_district_expenses_pkey PRIMARY KEY (id);


--
-- Name: daily_meal_portions daily_meal_portions_kindergarten_id_group_id_date_key; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.daily_meal_portions
    ADD CONSTRAINT daily_meal_portions_kindergarten_id_group_id_date_key UNIQUE (kindergarten_id, group_id, date);


--
-- Name: daily_meal_portions daily_meal_portions_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.daily_meal_portions
    ADD CONSTRAINT daily_meal_portions_pkey PRIMARY KEY (id);


--
-- Name: dishes dishes_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.dishes
    ADD CONSTRAINT dishes_pkey PRIMARY KEY (id);


--
-- Name: finance_transactions finance_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.finance_transactions
    ADD CONSTRAINT finance_transactions_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: health_checks health_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.health_checks
    ADD CONSTRAINT health_checks_pkey PRIMARY KEY (id);


--
-- Name: inventory_batches inventory_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.inventory_batches
    ADD CONSTRAINT inventory_batches_pkey PRIMARY KEY (id);


--
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- Name: kindergarten_settings kindergarten_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.kindergarten_settings
    ADD CONSTRAINT kindergarten_settings_pkey PRIMARY KEY (kindergarten_id);


--
-- Name: kindergartens kindergartens_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.kindergartens
    ADD CONSTRAINT kindergartens_pkey PRIMARY KEY (id);


--
-- Name: kitchen_tasks kitchen_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.kitchen_tasks
    ADD CONSTRAINT kitchen_tasks_pkey PRIMARY KEY (id);


--
-- Name: lab_samples lab_samples_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.lab_samples
    ADD CONSTRAINT lab_samples_pkey PRIMARY KEY (sample_id);


--
-- Name: medical_inventory_items medical_inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.medical_inventory_items
    ADD CONSTRAINT medical_inventory_items_pkey PRIMARY KEY (id);


--
-- Name: medical_inventory_movements medical_inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.medical_inventory_movements
    ADD CONSTRAINT medical_inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: operations_log operations_log_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.operations_log
    ADD CONSTRAINT operations_log_pkey PRIMARY KEY (id);


--
-- Name: parent_accounts parent_accounts_login_key; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.parent_accounts
    ADD CONSTRAINT parent_accounts_login_key UNIQUE (login);


--
-- Name: parent_accounts parent_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.parent_accounts
    ADD CONSTRAINT parent_accounts_pkey PRIMARY KEY (id);


--
-- Name: parent_documents parent_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.parent_documents
    ADD CONSTRAINT parent_documents_pkey PRIMARY KEY (id);


--
-- Name: parents parents_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT parents_pkey PRIMARY KEY (id);


--
-- Name: pickup_people pickup_people_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.pickup_people
    ADD CONSTRAINT pickup_people_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: role_accounts role_accounts_kindergarten_id_role_key; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.role_accounts
    ADD CONSTRAINT role_accounts_kindergarten_id_role_key UNIQUE (kindergarten_id, role);


--
-- Name: role_accounts role_accounts_login_key; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.role_accounts
    ADD CONSTRAINT role_accounts_login_key UNIQUE (login);


--
-- Name: role_accounts role_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.role_accounts
    ADD CONSTRAINT role_accounts_pkey PRIMARY KEY (id);


--
-- Name: role_notifications role_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.role_notifications
    ADD CONSTRAINT role_notifications_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (id);


--
-- Name: staff_health_checks staff_health_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.staff_health_checks
    ADD CONSTRAINT staff_health_checks_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: supply_plans supply_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.supply_plans
    ADD CONSTRAINT supply_plans_pkey PRIMARY KEY (id);


--
-- Name: supply_required_products supply_required_products_pkey; Type: CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.supply_required_products
    ADD CONSTRAINT supply_required_products_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_ai_insight_cache_expires; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_admin_ai_insight_cache_expires ON public.admin_ai_insight_cache USING btree (expires_at);


--
-- Name: idx_admin_alert_events_created; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_admin_alert_events_created ON public.admin_alert_events USING btree (created_at DESC);


--
-- Name: idx_admin_alert_events_entity; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_admin_alert_events_entity ON public.admin_alert_events USING btree (entity_type, entity_id, event_type);


--
-- Name: idx_admin_warehouse_purchases_date; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_admin_warehouse_purchases_date ON public.admin_warehouse_purchases USING btree (date);


--
-- Name: idx_admin_warehouse_purchases_district; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_admin_warehouse_purchases_district ON public.admin_warehouse_purchases USING btree (date, district);


--
-- Name: idx_attendance_child_date; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_attendance_child_date ON public.attendance USING btree (child_id, date);


--
-- Name: idx_attendance_kindergarten_date; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_attendance_kindergarten_date ON public.attendance USING btree (kindergarten_id, date);


--
-- Name: idx_children_group_kindergarten; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_children_group_kindergarten ON public.children USING btree (group_id, kindergarten_id);


--
-- Name: idx_children_kindergarten_id; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_children_kindergarten_id ON public.children USING btree (kindergarten_id);


--
-- Name: idx_daily_district_expenses_date; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_daily_district_expenses_date ON public.daily_district_expenses USING btree (date);


--
-- Name: idx_daily_meal_portions_kindergarten_date; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_daily_meal_portions_kindergarten_date ON public.daily_meal_portions USING btree (kindergarten_id, date);


--
-- Name: idx_groups_kindergarten_id; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_groups_kindergarten_id ON public.groups USING btree (kindergarten_id);


--
-- Name: idx_inventory_batches_expiry; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_inventory_batches_expiry ON public.inventory_batches USING btree (expiry_date);


--
-- Name: idx_inventory_batches_kindergarten_product; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_inventory_batches_kindergarten_product ON public.inventory_batches USING btree (kindergarten_id, product_id);


--
-- Name: idx_inventory_transactions_kindergarten_product; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_inventory_transactions_kindergarten_product ON public.inventory_transactions USING btree (kindergarten_id, product_id);


--
-- Name: idx_kindergartens_system_id; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE UNIQUE INDEX idx_kindergartens_system_id ON public.kindergartens USING btree (system_id) WHERE ((system_id IS NOT NULL) AND (TRIM(BOTH FROM system_id) <> ''::text));


--
-- Name: idx_kindergartens_username_nocase; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE UNIQUE INDEX idx_kindergartens_username_nocase ON public.kindergartens USING btree (lower(TRIM(BOTH FROM username))) WHERE ((username IS NOT NULL) AND (TRIM(BOTH FROM username) <> ''::text));


--
-- Name: idx_kitchen_tasks_kindergarten_menu; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_kitchen_tasks_kindergarten_menu ON public.kitchen_tasks USING btree (kindergarten_id, menu_id);


--
-- Name: idx_medical_inventory_items_kindergarten_id; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_medical_inventory_items_kindergarten_id ON public.medical_inventory_items USING btree (kindergarten_id);


--
-- Name: idx_medical_inventory_movements_child; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_medical_inventory_movements_child ON public.medical_inventory_movements USING btree (kindergarten_id, child_id);


--
-- Name: idx_medical_inventory_movements_expiry; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_medical_inventory_movements_expiry ON public.medical_inventory_movements USING btree (expiry_date);


--
-- Name: idx_medical_inventory_movements_kindergarten_item; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_medical_inventory_movements_kindergarten_item ON public.medical_inventory_movements USING btree (kindergarten_id, item_id);


--
-- Name: idx_menus_kindergarten_date; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_menus_kindergarten_date ON public.menus USING btree (kindergarten_id, date);


--
-- Name: idx_messages_kindergarten_receiver; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_messages_kindergarten_receiver ON public.messages USING btree (kindergarten_id, receiver_id, status);


--
-- Name: idx_operations_kindergarten_archived; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_operations_kindergarten_archived ON public.operations_log USING btree (kindergarten_id, is_archived, created_at);


--
-- Name: idx_parent_accounts_kindergarten_id; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_parent_accounts_kindergarten_id ON public.parent_accounts USING btree (kindergarten_id);


--
-- Name: idx_parent_accounts_login_nocase; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE UNIQUE INDEX idx_parent_accounts_login_nocase ON public.parent_accounts USING btree (lower(TRIM(BOTH FROM login))) WHERE ((login IS NOT NULL) AND (TRIM(BOTH FROM login) <> ''::text));


--
-- Name: idx_parents_kindergarten_id; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_parents_kindergarten_id ON public.parents USING btree (kindergarten_id);


--
-- Name: idx_role_notifications_target; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_role_notifications_target ON public.role_notifications USING btree (kindergarten_id, target_role, target_user_id, is_read, created_at);


--
-- Name: idx_staff_health_checks_date; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_staff_health_checks_date ON public.staff_health_checks USING btree (date);


--
-- Name: idx_staff_health_checks_kindergarten_staff; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_staff_health_checks_kindergarten_staff ON public.staff_health_checks USING btree (kindergarten_id, staff_id);


--
-- Name: idx_staff_kindergarten_id; Type: INDEX; Schema: public; Owner: raqamli_mtt
--

CREATE INDEX idx_staff_kindergarten_id ON public.staff USING btree (kindergarten_id);


--
-- Name: dishes protect_aqlvoy_dishes; Type: TRIGGER; Schema: public; Owner: raqamli_mtt
--

CREATE TRIGGER protect_aqlvoy_dishes BEFORE DELETE ON public.dishes FOR EACH ROW EXECUTE FUNCTION public.prevent_aqlvoy_dish_delete();


--
-- Name: attendance attendance_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: attendance attendance_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: audits audits_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.audits
    ADD CONSTRAINT audits_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: children children_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT children_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: daily_meal_portions daily_meal_portions_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.daily_meal_portions
    ADD CONSTRAINT daily_meal_portions_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: daily_meal_portions daily_meal_portions_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.daily_meal_portions
    ADD CONSTRAINT daily_meal_portions_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: dishes dishes_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.dishes
    ADD CONSTRAINT dishes_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE SET NULL;


--
-- Name: finance_transactions finance_transactions_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.finance_transactions
    ADD CONSTRAINT finance_transactions_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id);


--
-- Name: groups groups_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: health_checks health_checks_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.health_checks
    ADD CONSTRAINT health_checks_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: health_checks health_checks_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.health_checks
    ADD CONSTRAINT health_checks_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: inventory_batches inventory_batches_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.inventory_batches
    ADD CONSTRAINT inventory_batches_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: inventory_batches inventory_batches_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.inventory_batches
    ADD CONSTRAINT inventory_batches_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: kindergarten_settings kindergarten_settings_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.kindergarten_settings
    ADD CONSTRAINT kindergarten_settings_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: kitchen_tasks kitchen_tasks_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.kitchen_tasks
    ADD CONSTRAINT kitchen_tasks_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: kitchen_tasks kitchen_tasks_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.kitchen_tasks
    ADD CONSTRAINT kitchen_tasks_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE;


--
-- Name: medical_inventory_items medical_inventory_items_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.medical_inventory_items
    ADD CONSTRAINT medical_inventory_items_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: medical_inventory_movements medical_inventory_movements_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.medical_inventory_movements
    ADD CONSTRAINT medical_inventory_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.medical_inventory_items(id) ON DELETE CASCADE;


--
-- Name: medical_inventory_movements medical_inventory_movements_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.medical_inventory_movements
    ADD CONSTRAINT medical_inventory_movements_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: menus menus_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: messages messages_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: operations_log operations_log_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.operations_log
    ADD CONSTRAINT operations_log_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: parent_accounts parent_accounts_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.parent_accounts
    ADD CONSTRAINT parent_accounts_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: parent_documents parent_documents_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.parent_documents
    ADD CONSTRAINT parent_documents_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: parent_documents parent_documents_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.parent_documents
    ADD CONSTRAINT parent_documents_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: parents parents_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT parents_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: pickup_people pickup_people_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.pickup_people
    ADD CONSTRAINT pickup_people_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: pickup_people pickup_people_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.pickup_people
    ADD CONSTRAINT pickup_people_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: products products_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: role_notifications role_notifications_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.role_notifications
    ADD CONSTRAINT role_notifications_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: staff_health_checks staff_health_checks_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.staff_health_checks
    ADD CONSTRAINT staff_health_checks_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- Name: staff_health_checks staff_health_checks_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.staff_health_checks
    ADD CONSTRAINT staff_health_checks_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: staff staff_kindergarten_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: raqamli_mtt
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_kindergarten_id_fkey FOREIGN KEY (kindergarten_id) REFERENCES public.kindergartens(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict OmhNXhfufiqAi7bq7SP5lQv27wBb9j6eJlaDQ3fUnfVa9JChELZm355jHfkczTE


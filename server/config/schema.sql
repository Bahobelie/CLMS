
-- Table: public.system_constants
CREATE TABLE IF NOT EXISTS public.system_constants
(
    id SERIAL,
    code character varying COLLATE pg_catalog."default" NOT NULL,
    name character varying COLLATE pg_catalog."default",
    type character varying COLLATE pg_catalog."default" NOT NULL,
    description character varying COLLATE pg_catalog."default" NOT NULL,
    index integer DEFAULT 0,
    "parentId" integer,
    referencerange character varying COLLATE pg_catalog."default",
    "isActive" boolean DEFAULT true,
    amount double precision DEFAULT 0,
    remark character varying COLLATE pg_catalog."default",
    status character varying COLLATE pg_catalog."default",
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT system_constants_pkey PRIMARY KEY (id),
    CONSTRAINT system_constants_code_key UNIQUE (code),
    CONSTRAINT "system_constants_parentId_fkey" FOREIGN KEY ("parentId")
        REFERENCES public.system_constants (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);

-- Table: public.employee
CREATE TABLE IF NOT EXISTS public.employee
(
    id SERIAL,
    firstname character varying(50) COLLATE pg_catalog."default" NOT NULL,
    lastname character varying(50) COLLATE pg_catalog."default" NOT NULL,
    type integer NOT NULL,
    specialization character varying(100) COLLATE pg_catalog."default" NOT NULL,
    phonenumber character varying(20) COLLATE pg_catalog."default",
    email character varying(100) COLLATE pg_catalog."default",
    gender character varying(10) COLLATE pg_catalog."default",
    dateofbirth date,
    yearsofexperience integer,
    availabilitydays text[] COLLATE pg_catalog."default",
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    code character varying(50) COLLATE pg_catalog."default" NOT NULL,
    status character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'Available'::character varying,
    CONSTRAINT employee_pkey PRIMARY KEY (id),
    CONSTRAINT employee_code_key UNIQUE (code),
    CONSTRAINT fk_employee_type FOREIGN KEY (type)
        REFERENCES public.system_constants (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- Table: public.administrators
CREATE TABLE IF NOT EXISTS public.administrators
(
    id SERIAL,
    code character varying COLLATE pg_catalog."default",
    name character varying COLLATE pg_catalog."default" NOT NULL,
    email character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    "phoneNumber" character varying COLLATE pg_catalog."default" NOT NULL,
    role integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT administrators_pkey PRIMARY KEY (id),
    CONSTRAINT administrators_email_key UNIQUE (email),
    CONSTRAINT administrators_phonenumber_key UNIQUE ("phoneNumber"),
    CONSTRAINT code UNIQUE (code),
    CONSTRAINT fk_role FOREIGN KEY (role)
        REFERENCES public.system_constants (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

-- Table: public.patients
CREATE TABLE IF NOT EXISTS public.patients
(
    id SERIAL,
    code character varying COLLATE pg_catalog."default" NOT NULL,
    first_name character varying COLLATE pg_catalog."default" NOT NULL,
    middle_name character varying COLLATE pg_catalog."default",
    last_name character varying COLLATE pg_catalog."default" NOT NULL,
    gender character varying COLLATE pg_catalog."default" NOT NULL,
    date_of_birth date,
    age character varying COLLATE pg_catalog."default" NOT NULL,
    phone_number character varying(14) COLLATE pg_catalog."default",
    bmi character varying COLLATE pg_catalog."default",
    bp character varying COLLATE pg_catalog."default",
    blood_group character varying COLLATE pg_catalog."default",
    country character varying COLLATE pg_catalog."default" DEFAULT 'Ethiopia'::character varying,
    referenceCode character varying COLLATE pg_catalog."default",
    kebele character varying COLLATE pg_catalog."default",
    woreda character varying COLLATE pg_catalog."default",
    city character varying COLLATE pg_catalog."default",
    sub_city character varying COLLATE pg_catalog."default",
    identification_number character varying COLLATE pg_catalog."default",
    application_fee_amount character varying COLLATE pg_catalog."default",
    district_state character varying COLLATE pg_catalog."default",
    application_fee character varying COLLATE pg_catalog."default" DEFAULT 'Expired'::character varying,
    remark character varying COLLATE pg_catalog."default" DEFAULT 'Remark'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT patients_pkey PRIMARY KEY (id),
    CONSTRAINT patients_application_fee_check CHECK ((application_fee::text = ANY (ARRAY['Active'::character varying, 'Expired'::character varying]::text[])) OR application_fee IS NULL),
    CONSTRAINT patients_blood_group_check CHECK (blood_group::text = ANY (ARRAY['Unknown'::character varying, 'To Test'::character varying, 'A+'::character varying, 'A-'::character varying, 'B+'::character varying, 'B-'::character varying, 'AB+'::character varying, 'AB-'::character varying, 'O+'::character varying, 'O-'::character varying]::text[])),
    CONSTRAINT patients_bmi_check CHECK (bmi::text = ANY (ARRAY['No'::character varying, 'Weight'::character varying, 'Height'::character varying, 'Both Height and Weight'::character varying]::text[])),
    CONSTRAINT patients_bp_check CHECK (bp::text = ANY (ARRAY['Yes'::character varying, 'No'::character varying]::text[])),
    CONSTRAINT patients_district_state_check CHECK (district_state::text = ANY (ARRAY['Addis Ababa'::character varying, 'Afar'::character varying, 'Amhara'::character varying, 'Benishangul-Gumuz'::character varying, 'Dire Dawa'::character varying, 'Gambela'::character varying, 'Harari'::character varying, 'Oromiya'::character varying, 'Somali'::character varying, 'SNNPR'::character varying, 'Tigray'::character varying]::text[])),
    CONSTRAINT patients_gender_check CHECK (gender::text = ANY (ARRAY['Male'::character varying, 'Female'::character varying]::text[]))
);

-- Table: public.patient_histories
CREATE TABLE IF NOT EXISTS public.patient_histories
(
    id SERIAL,
    code character varying COLLATE pg_catalog."default" NOT NULL,
    chief_complaint_symptoms character varying COLLATE pg_catalog."default",
    chief_complaint_duration character varying COLLATE pg_catalog."default",
    chief_complaint_severity character varying COLLATE pg_catalog."default",
    "patientId" integer NOT NULL,
    medical_history_conditions character varying COLLATE pg_catalog."default",
    medical_history_medications character varying COLLATE pg_catalog."default",
    medical_history_surgeries character varying COLLATE pg_catalog."default",
    medical_history_hospitalizations character varying COLLATE pg_catalog."default",
    allergies character varying COLLATE pg_catalog."default",
    family_history_chronic_diseases character varying COLLATE pg_catalog."default",
    family_history_genetic_conditions character varying COLLATE pg_catalog."default",
    lifestyle_smoking boolean,
    lifestyle_alcohol boolean,
    lifestyle_drugs boolean,
    lifestyle_diet character varying COLLATE pg_catalog."default",
    assessment character varying COLLATE pg_catalog."default",
    lifestyle_exercise character varying COLLATE pg_catalog."default",
    current_symptoms_pain_location character varying COLLATE pg_catalog."default",
    current_symptoms_pain_severity integer,
    current_symptoms_other_symptoms character varying COLLATE pg_catalog."default",
    previous_treatments_previous_doctors character varying COLLATE pg_catalog."default",
    previous_treatments_medications_taken character varying COLLATE pg_catalog."default",
    current_treatments_current_doctor character varying COLLATE pg_catalog."default",
    current_treatments_current_medications character varying COLLATE pg_catalog."default",
    immunizations_up_to_date boolean DEFAULT true,
    immunizations_recent_vaccines character varying COLLATE pg_catalog."default",
    patient_current_info_bp character varying COLLATE pg_catalog."default",
    patient_current_info_pr character varying COLLATE pg_catalog."default",
    patient_current_info_rr character varying COLLATE pg_catalog."default",
    patient_current_info_oxygen_saturation character varying COLLATE pg_catalog."default",
    patient_current_info_temp character varying COLLATE pg_catalog."default",
    patient_current_info_weight character varying COLLATE pg_catalog."default",
    patient_current_info_height character varying COLLATE pg_catalog."default",
    patient_current_info_heent character varying COLLATE pg_catalog."default",
    patient_current_info_lgs character varying COLLATE pg_catalog."default",
    patient_current_info_rs character varying COLLATE pg_catalog."default",
    patient_current_info_cvs character varying COLLATE pg_catalog."default",
    patient_current_info_gis character varying COLLATE pg_catalog."default",
    patient_current_info_gus character varying COLLATE pg_catalog."default",
    patient_current_info_is character varying COLLATE pg_catalog."default",
    patient_current_info_mss character varying COLLATE pg_catalog."default",
    patient_current_info_cns character varying COLLATE pg_catalog."default",
    description character varying COLLATE pg_catalog."default",
    remark character varying COLLATE pg_catalog."default",
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT patient_histories_pkey PRIMARY KEY (id),
    CONSTRAINT fk_patient_code FOREIGN KEY ("patientId")
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);


-- Table: public.appointments
CREATE TABLE IF NOT EXISTS public.appointments
(
    id SERIAL,
    "patientId" integer NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'pending'::character varying,
    notes text COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    code character(20) COLLATE pg_catalog."default",
    doctorid integer,
    CONSTRAINT appointments_pkey PRIMARY KEY (id),
    CONSTRAINT unique_appointment_code UNIQUE (code),
    CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctorid)
        REFERENCES public.employee (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_patientid FOREIGN KEY ("patientId")
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

-- Table: public.clinic_info
CREATE TABLE IF NOT EXISTS public.clinic_info
(
    id SERIAL,
    code character varying(255) COLLATE pg_catalog."default" NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    address text COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    website character varying(255) COLLATE pg_catalog."default",
    logo_url text COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    isactive boolean DEFAULT false,
    CONSTRAINT clinic_info_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_info_code_key UNIQUE (code)
);

-- Table: public.clinicinvoice
CREATE TABLE IF NOT EXISTS public.clinicinvoice
(
    id SERIAL,
    patientid integer NOT NULL,
    serviceid integer NOT NULL,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    totalamount numeric(10,2) GENERATED ALWAYS AS ((price * (quantity)::numeric)) STORED,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    createdby character varying(100) COLLATE pg_catalog."default",
    code character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT clinicinvoice_pkey PRIMARY KEY (id),
    CONSTRAINT fk_patient FOREIGN KEY (patientid)
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_service FOREIGN KEY (serviceid)
        REFERENCES public.system_constants (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);



-- Table: public.lab_tests
CREATE TABLE IF NOT EXISTS public.lab_tests
(
    id SERIAL,
    code character varying COLLATE pg_catalog."default" NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    description character varying COLLATE pg_catalog."default",
    price numeric NOT NULL,
    isactive boolean DEFAULT true,
    result character varying COLLATE pg_catalog."default",
    referencerange character varying COLLATE pg_catalog."default",
    status character varying COLLATE pg_catalog."default",
    remark character varying COLLATE pg_catalog."default",
    patientid integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    patienthistoryid integer NOT NULL,
    paymntstatus character varying(10) COLLATE pg_catalog."default",
    CONSTRAINT lab_tests_pkey PRIMARY KEY (id),
    CONSTRAINT lab_tests_code_key UNIQUE (code),
    CONSTRAINT fk_patient_id FOREIGN KEY (patientid)
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_patienthistoryid FOREIGN KEY (patienthistoryid)
        REFERENCES public.patient_histories (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT chk_status CHECK (status::text = ANY (ARRAY['pending'::character varying, 'complete'::character varying, 'canceled'::character varying]::text[]))
);

-- Table: public.patient_emergency_health_info
CREATE TABLE IF NOT EXISTS public.patient_emergency_health_info
(
    id SERIAL,
    code character varying(255) COLLATE pg_catalog."default" NOT NULL,
    patientid integer NOT NULL,
    blood_pressure character varying(10) COLLATE pg_catalog."default",
    pulse_rate integer,
    respiratory_rate integer,
    oxygen_saturation numeric(5,2),
    temperature numeric(4,1),
    weight numeric(5,2),
    height numeric(5,2),
    createdat timestamp with time zone,
    updatedat timestamp with time zone,
    CONSTRAINT patient_emergency_health_info_pkey PRIMARY KEY (id),
    CONSTRAINT patient_emergency_health_info_code_key UNIQUE (code),
    CONSTRAINT patient_emergency_health_info_patientid_fkey FOREIGN KEY (patientid)
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);


-- Table: public.prescription
CREATE TABLE IF NOT EXISTS public.prescription
(
    id SERIAL,
    code character varying COLLATE pg_catalog."default",
    patientid integer NOT NULL,
    doctorid integer NOT NULL,
    medicines jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    notes character varying COLLATE pg_catalog."default",
    CONSTRAINT prescription_pkey PRIMARY KEY (id),
    CONSTRAINT fk_doctor FOREIGN KEY (doctorid)
        REFERENCES public.employee (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_patient FOREIGN KEY (patientid)
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Table: public.rolepermission
CREATE TABLE IF NOT EXISTS public.rolepermission
(
    id SERIAL,
    menu character varying(255) COLLATE pg_catalog."default" NOT NULL,
    role character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    code character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT rolepermission_pkey PRIMARY KEY (id),
    CONSTRAINT unique_code UNIQUE (code)
);

-- Table: public.ultrasounds
CREATE TABLE IF NOT EXISTS public.ultrasounds
(
    id SERIAL,
    code character varying COLLATE pg_catalog."default" NOT NULL,
    "patientId" integer NOT NULL,
    "imageUrl" character varying COLLATE pg_catalog."default",
    description character varying COLLATE pg_catalog."default",
    remark character varying COLLATE pg_catalog."default",
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    name character(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT ultrasounds_pkey PRIMARY KEY (id),
    CONSTRAINT ultrasounds_code_key UNIQUE (code),
    CONSTRAINT fk_patient_id FOREIGN KEY ("patientId")
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);


CREATE TABLE IF NOT EXISTS public.medicines
(
    id SERIAL,
    code character varying COLLATE pg_catalog."default" NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    brand character varying COLLATE pg_catalog."default",
    quantity integer DEFAULT 0,
    expiry_date timestamp without time zone NOT NULL,
    start_date timestamp without time zone,
    unitprice numeric,
    batchnumber character varying COLLATE pg_catalog."default",
     remark character varying COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    createdAt timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT medicines_pkey PRIMARY KEY (id),
    CONSTRAINT medicines_code_key UNIQUE (code)
);
-- Set table owners
-- ALTER TABLE public.administrators OWNER TO postgres;
-- ALTER TABLE public.patients OWNER TO postgres;
-- ALTER TABLE public.system_constants OWNER TO postgres;
-- ALTER TABLE public.appointments OWNER TO postgres;
-- ALTER TABLE public.clinic_info OWNER TO admin;
-- ALTER TABLE public.clinicinvoice OWNER TO postgres;
-- ALTER TABLE public.employee OWNER TO postgres;
-- ALTER TABLE public.lab_tests OWNER TO postgres;
-- ALTER TABLE public.patient_emergency_health_info OWNER TO admin;
-- ALTER TABLE public.patient_histories OWNER TO postgres;
-- ALTER TABLE public.prescription OWNER TO postgres;
-- ALTER TABLE public.rolepermission OWNER TO admin;
-- ALTER TABLE public.ultrasounds OWNER TO postgres;


INSERT INTO public.rolepermission(
  id, menu, role, created_at, updated_at, code)
  VALUES (DEFAULT, 'Setting', 'admin', NOW(), NOW(), 'some_unique_code')
  ON CONFLICT (code) DO NOTHING;



  INSERT INTO public.system_constants ( code, name, type, description, index, "parentId", referencerange, "isActive", amount, remark, status, "createdAt", "updatedAt") VALUES
  ( 'SYC-000004', 'Doctor', 'Role', 'Doctor', 4, NULL, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.064', '2025-04-08 05:10:35.064'),
  ( 'SYC-000005', 'Emergency', 'Role', 'emergency', 5, NULL, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.064', '2025-04-08 05:10:35.064'),
  ( 'SYC-000006', 'Receptionist', 'Role', 'Receptionist', 6, NULL, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.064', '2025-04-08 05:10:35.064'),
  ( 'SYC-000007', 'LabTechnician', 'Role', 'LabTechnician', 7, NULL, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.064', '2025-04-08 05:10:35.064'),
  ( 'SYC-000008', 'InjectionRoomStaff', 'Role', 'InjectionRoomStaff', 8, NULL, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.064', '2025-04-08 05:10:35.064'),
  ( 'SYC-000009', 'Sonographer', 'Role', 'Sonographer', 9, NULL, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.064', '2025-04-08 05:10:35.064'),
  ( 'SYC-000010', 'Hematology', 'LabTest', 'Hematology', 10, NULL, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.087', '2025-04-24 08:50:13.628'),
  ( 'SYC-000011', 'CBC', 'LabTest', 'CBC', 11, 10, NULL, true, 10, NULL, NULL, '2025-04-08 05:10:35.095', '2025-04-24 08:51:51.993'),
  ( 'SYC-000012', 'WBC', 'LabTest', 'White Blood Cell Count (WBC)', 12, 11, '4,000 - 11,000 /µL', true, 0, NULL, NULL, '2025-04-08 05:10:35.099', '2025-04-24 08:53:19.789'),
  ( 'SYC-000013', 'HGB', 'LabTest', 'Hemoglobin (HGB)', 13, 11, 'Male: 13.8 - 17.2 g/dL, Female: 12.1 - 15.1 g/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.102', '2025-04-24 08:56:27.92'),
  ( 'SYC-000014', 'HCT', 'LabTest', 'Hematocrit (HCT)', 14, 11, 'Male: 40.7 - 50.3%, Female: 36.1 - 44.3%', true, 0, NULL, NULL, '2025-04-08 05:10:35.104', '2025-04-24 08:56:45.34'),
  ( 'SYC-000015', 'RBC', 'LabTest', 'Red Blood Cell Count (RBC)', 15, 11, 'Male: 4.7 - 6.1 million/µL, Female: 4.2 - 5.4 million/µL', true, 0, NULL, NULL, '2025-04-08 05:10:35.106', '2025-04-24 08:57:00.06'),
  ( 'SYC-000016', 'MCV', 'LabTest', 'Mean Corpuscular Volume (MCV)', 16, 11, '80 - 100 fL', true, 0, NULL, NULL, '2025-04-08 05:10:35.114', '2025-04-25 19:28:57.224'),
  ( 'SYC-000017', 'MCH', 'LabTest', 'Mean Corpuscular Hemoglobin (MCH)', 17, 11, '27 - 33 pg', true, 0, NULL, NULL, '2025-04-08 05:10:35.116', '2025-04-08 05:10:35.116'),
  ( 'SYC-000018', 'MCHC', 'LabTest', 'Mean Corpuscular Hemoglobin Concentration (MCHC)', 18, 11, '32 - 36 g/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.12', '2025-04-08 05:10:35.12'),
  ( 'SYC-000019', 'RDW', 'LabTest', 'Red Cell Distribution Width (RDW)', 19, 11, '11.5 - 14.5%', true, 0, NULL, NULL, '2025-04-08 05:10:35.123', '2025-04-08 05:10:35.123'),
  ( 'SYC-000020', 'PLT', 'LabTest', 'Platelet Count (PLT)', 20, 11, '150,000 - 450,000 /µL', true, 0, NULL, NULL, '2025-04-08 05:10:35.129', '2025-04-08 05:10:35.129'),
  ('SYC-000021', 'MPV', 'LabTest', 'Mean Platelet Volume (MPV)', 21, 11, '7.5 - 11.5 fL', true, 0, NULL, NULL, '2025-04-08 05:10:35.132', '2025-04-08 05:10:35.132'),
  ( 'SYC-000022', 'PCT', 'LabTest', 'Plateletcrit (PCT)', 22, 11, '0.22 - 0.24%', true, 0, NULL, NULL, '2025-04-08 05:10:35.134', '2025-04-08 05:10:35.134'),
  ( 'SYC-000023', 'PDW', 'LabTest', 'Platelet Distribution Width (PDW)', 23, 11, '10 - 18%', true, 0, NULL, NULL, '2025-04-08 05:10:35.136', '2025-04-08 05:10:35.136'),
  ( 'SYC-000024', 'PLCR', 'LabTest', 'Platelet Large Cell Ratio (PLCR)', 24, 11, '15 - 35%', true, 0, NULL, NULL, '2025-04-08 05:10:35.138', '2025-04-08 05:10:35.138'),
  ( 'SYC-000025', 'ESR', 'LabTest', 'Erythrocyte Sedimentation Rate (ESR)', 25, 10, 'Male: 0 - 15 mm/hr, Female: 0 - 20 mm/hr', true, 230, NULL, NULL, '2025-04-08 05:10:35.144', '2025-04-24 08:51:00.4'),
  ( 'SYC-000026', 'ReticulocyteCount', 'LabTest', 'Reticulocyte Count', 26, 10, '0.5 - 2.5%', true, 0, NULL, NULL, '2025-04-08 05:10:35.146', '2025-04-08 05:10:35.146'),
  ( 'SYC-000027', 'BloodGroup', 'LabTest', 'Blood Group', 27, 10, 'A, B, AB, O (+/-)', true, 0, NULL, NULL, '2025-04-08 05:10:35.149', '2025-04-08 05:10:35.149'),
  ( 'SYC-000028', 'PeripheralBloodSmear', 'LabTest', 'Peripheral Blood Smear', 28, 10, 'Normal morphology', true, 0, NULL, NULL, '2025-04-08 05:10:35.151', '2025-04-08 05:10:35.151'),
  ( 'SYC-000029', 'Chemistry', 'LabTest', 'Chemistry', 29, NULL, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.153', '2025-04-08 05:10:35.153'),
  ( 'SYC-000030', 'RFT', 'LabTest', 'RFT', 30, 29, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.155', '2025-04-08 05:10:35.155'),
  ( 'SYC-000031', 'UREA', 'LabTest', 'Urea', 31, 30, '10 - 50 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.157', '2025-04-08 05:10:35.157'),
  ( 'SYC-000032', 'CREATININE', 'LabTest', 'Creatinine', 32, 30, 'Male: 0.7 - 1.3 mg/dL, Female: 0.6 - 1.1 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.161', '2025-04-08 05:10:35.161'),
  ( 'SYC-000033', 'BUN', 'LabTest', 'Blood Urea Nitrogen (BUN)', 33, 30, '7 - 20 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.163', '2025-04-08 05:10:35.163'),
  ( 'SYC-000034', 'LFT', 'LabTest', 'LFT', 34, 29, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.17', '2025-04-08 05:10:35.17'),
  ( 'SYC-000035', 'ALP', 'LabTest', 'Alkaline Phosphatase (ALP)', 35, 34, '30 - 120 U/L', true, 0, NULL, NULL, '2025-04-08 05:10:35.172', '2025-04-08 05:10:35.172'),
  ( 'SYC-000036', 'AST', 'LabTest', 'Aspartate Aminotransferase (AST)', 36, 34, '10 - 40 U/L', true, 0, NULL, NULL, '2025-04-08 05:10:35.177', '2025-04-08 05:10:35.177'),
  ( 'SYC-000037', 'ALT', 'LabTest', 'Alanine Aminotransferase (ALT)', 37, 34, '7 - 56 U/L', true, 0, NULL, NULL, '2025-04-08 05:10:35.181', '2025-04-08 05:10:35.181'),
  ( 'SYC-000038', 'BilirubinT', 'LabTest', 'Bilirubin (Total)', 38, 34, '0.1 - 1.2 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.185', '2025-04-08 05:10:35.185'),
  ( 'SYC-000039', 'BilirubinD', 'LabTest', 'Bilirubin (Direct)', 39, 34, '0.0 - 0.3 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.187', '2025-04-08 05:10:35.187'),
  ( 'SYC-000040', 'Albumin', 'LabTest', 'Albumin', 40, 34, '3.5 - 5.0 g/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.188', '2025-04-08 05:10:35.188'),
  ( 'SYC-000041', 'GGT', 'LabTest', 'Gamma-Glutamyl Transferase (GGT)', 41, 34, '8 - 61 U/L', true, 0, NULL, NULL, '2025-04-08 05:10:35.19', '2025-04-08 05:10:35.19'),
  ( 'SYC-000042', 'LipidProfile', 'LabTest', 'LipidProfile', 42, 29, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.195', '2025-04-08 05:10:35.195'),
  ( 'SYC-000043', 'TotalCholesterol', 'LabTest', 'Total Cholesterol', 43, 42, '< 200 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.2', '2025-04-08 05:10:35.2'),
  ('SYC-000044', 'Triglycerides', 'LabTest', 'Triglycerides', 44, 42, '< 150 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.202', '2025-04-08 05:10:35.202'),
  ( 'SYC-000045', 'HDLC', 'LabTest', 'High-Density Lipoprotein Cholesterol (HDL-C)', 45, 42, 'Male: > 40 mg/dL, Female: > 50 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.204', '2025-04-08 05:10:35.204'),
  ( 'SYC-000046', 'LDLC', 'LabTest', 'Low-Density Lipoprotein Cholesterol (LDL-C)', 46, 42, '< 100 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.206', '2025-04-08 05:10:35.206'),
  ( 'SYC-000047', 'VLDL', 'LabTest', 'Very-Low-Density Lipoprotein (VLDL)', 47, 42, '5 - 40 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.208', '2025-04-08 05:10:35.208'),
  ( 'SYC-000048', 'FBS', 'LabTest', 'Fasting Blood Sugar', 48, 29, '70 - 99 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.212', '2025-04-08 05:10:35.212'),
  ( 'SYC-000049', 'RBS', 'LabTest', 'Random Blood Sugar', 49, 29, '< 140 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.214', '2025-04-08 05:10:35.214'),
  ( 'SYC-000050', 'URICACID', 'LabTest', 'Uric Acid', 50, 29, 'Male: 3.4 - 7.0 mg/dL, Female: 2.4 - 6.0 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.216', '2025-04-08 05:10:35.216'),
  ( 'SYC-000051', 'Calcium', 'LabTest', 'Calcium', 51, 29, '8.5 - 10.2 mg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.234', '2025-04-08 05:10:35.234'),
  ( 'SYC-000052', 'Potassium', 'LabTest', 'Potassium', 52, 29, '3.5 - 5.1 mmol/L', true, 0, NULL, NULL, '2025-04-08 05:10:35.236', '2025-04-08 05:10:35.236'),
  ( 'SYC-000053', 'Sodium', 'LabTest', 'Sodium', 53, 29, '135 - 145 mmol/L', true, 0, NULL, NULL, '2025-04-08 05:10:35.239', '2025-04-08 05:10:35.239'),
  ( 'SYC-000054', 'Coag_Profile', 'LabTest', 'Coag_Profile', 54, NULL, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.242', '2025-04-08 05:10:35.242'),
  ( 'SYC-000055', 'PT', 'LabTest', 'Prothrombin Time (PT)', 55, 54, '11 - 13.5 seconds', true, 0, NULL, NULL, '2025-04-08 05:10:35.246', '2025-04-08 05:10:35.246'),
  ( 'SYC-000056', 'INR', 'LabTest', 'International Normalized Ratio (INR)', 56, 54, '0.8 - 1.1', true, 0, NULL, NULL, '2025-04-08 05:10:35.249', '2025-04-08 05:10:35.249'),
  ( 'SYC-000057', 'APTT', 'LabTest', 'Activated Partial Thromboplastin Time (APTT)', 57, 54, '30 - 40 seconds', true, 0, NULL, NULL, '2025-04-08 05:10:35.251', '2025-04-08 05:10:35.251'),
  ( 'SYC-000058', 'D_dimer', 'LabTest', 'D-dimer', 58, 54, '< 500 ng/mL', true, 0, NULL, NULL, '2025-04-08 05:10:35.253', '2025-04-08 05:10:35.253'),
  ( 'SYC-000059', 'Immunoassay', 'LabTest', 'Immunoassay', 59, NULL, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.255', '2025-04-08 05:10:35.255'),
  ( 'SYC-000060', 'TFT', 'LabTest', 'TFT', 60, 59, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.265', '2025-04-08 05:10:35.265'),
  ( 'SYC-000061', 'TSH', 'LabTest', 'Thyroid-Stimulating Hormone (TSH)', 61, 60, '0.4 - 4.0 µIU/mL', true, 0, NULL, NULL, '2025-04-08 05:10:35.269', '2025-04-08 05:10:35.269'),
  ( 'SYC-000062', 'T3', 'LabTest', 'Triiodothyronine (T3)', 62, 60, '80 - 200 ng/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.271', '2025-04-08 05:10:35.271'),
  ( 'SYC-000063', 'T4', 'LabTest', 'Thyroxine (T4)', 63, 60, '4.5 - 11.2 µg/dL', true, 0, NULL, NULL, '2025-04-08 05:10:35.275', '2025-04-08 05:10:35.275'),
  ( 'SYC-000064', 'CardiacMarkers', 'LabTest', 'CardiacMarkers', 64, 59, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.278', '2025-04-08 05:10:35.278'),
  ('SYC-000065', 'CK_MB', 'LabTest', 'Creatine Kinase-MB (CK-MB)', 65, 64, '< 6.3 ng/mL', true, 0, NULL, NULL, '2025-04-08 05:10:35.28', '2025-04-08 05:10:35.28'),
  ('SYC-000066', 'TroponinI', 'LabTest', 'Troponin I', 66, 64, '< 0.04 ng/mL', true, 0, NULL, NULL, '2025-04-08 05:10:35.283', '2025-04-08 05:10:35.283'),
  ('SYC-000067', 'BNP', 'LabTest', 'B-type Natriuretic Peptide (BNP)', 67, 64, '< 100 pg/mL', true, 0, NULL, NULL, '2025-04-08 05:10:35.285', '2025-04-08 05:10:35.285'),
  ('SYC-000068', 'Urinalysis', 'LabTest', 'Urinalysis', 68, NULL, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.287', '2025-04-08 05:10:35.287'),
  ('SYC-000069', 'UrineChemical', 'LabTest', 'UrineChemical', 69, 68, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.288', '2025-04-08 05:10:35.288'),
  ( 'SYC-000070', 'PROTEIN', 'LabTest', 'Protein', 70, 69, 'Negative', true, 0, NULL, NULL, '2025-04-08 05:10:35.29', '2025-04-08 05:10:35.29'),
  ('SYC-000071', 'GLUCOSE', 'LabTest', 'Glucose', 71, 69, 'Negative', true, 0, NULL, NULL, '2025-04-08 05:10:35.296', '2025-04-08 05:10:35.296'),
  ('SYC-000072', 'KETONE', 'LabTest', 'Ketones', 72, 69, 'Negative', true, 0, NULL, NULL, '2025-04-08 05:10:35.299', '2025-04-08 05:10:35.299'),
  ('SYC-000073', 'BILIRUBIN', 'LabTest', 'Bilirubin', 73, 69, 'Negative', true, 0, NULL, NULL, '2025-04-08 05:10:35.3', '2025-04-08 05:10:35.3'),
  ('SYC-000074', 'PH', 'LabTest', 'pH', 74, 69, '4.5 - 8.0', true, 0, NULL, NULL, '2025-04-08 05:10:35.302', '2025-04-08 05:10:35.302'),
  ( 'SYC-000075', 'BLOOD', 'LabTest', 'Blood', 75, 69, 'Negative', true, 0, NULL, NULL, '2025-04-08 05:10:35.304', '2025-04-08 05:10:35.304'),
  ('SYC-000076', 'LEUKOCYTE', 'LabTest', 'Leukocytes', 76, 69, 'Negative', true, 0, NULL, NULL, '2025-04-08 05:10:35.305', '2025-04-08 05:10:35.305'),
  ( 'SYC-000077', 'SG', 'LabTest', 'Specific Gravity', 77, 69, '1.005 - 1.030', true, 0, NULL, NULL, '2025-04-08 05:10:35.307', '2025-04-08 05:10:35.307'),
  ( 'SYC-000091', 'Doctor', 'Employee', 'Doctor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-19 06:49:42.748', '2025-04-19 06:49:42.748'),
  ('SYC-000092', 'Injection', 'Employee', 'Injection', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-19 06:50:16.414', '2025-04-19 06:50:16.414'),
  ('SYC-000093', 'Reception', 'Employee', 'Reception', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-19 06:50:36.846', '2025-04-19 06:50:36.846'),
  ('SYC-000094', 'EmergencyStuff', 'Employee', 'EmergencyStuff', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-19 06:50:54.24', '2025-04-19 06:50:54.24'),
  ('SYC-000095', 'SenoGrapher', 'Employee', 'SeniorPharmacist', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-19 06:51:15.108', '2025-04-19 06:51:15.108'),
  ('SYC-000096', 'Labratory', 'Employee', 'Labratory', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-19 13:48:09.619', '2025-04-19 13:48:09.619'),
  ('SYC-000003', 'Admin', 'Role', 'Admin', 3, NULL, NULL, true, 0, NULL, NULL, '2025-04-08 05:10:35.064', '2025-04-08 05:10:35.064'),
  ('SYC-000001', 'Injection', 'Service', 'Injection', 1, NULL, NULL, true, 0, NULL, 'false', '2025-04-08 05:10:35.064', '2025-04-24 08:45:34.647'),
  ('SYC-000002', 'UltraSound', 'Service', 'UltraSound', 2, NULL, NULL, true, 1033, 'new service', 'false', '2025-04-08 05:10:35.064', '2025-04-24 06:47:52.046'),
  ('SYC-000080', 'LabTest', 'Service', 'UltraSound', 2, NULL, NULL, true, 120, NULL, 'true', '2025-04-08 08:10:35.064', '2025-04-24 06:47:35.301'),
  ('SYC-00098', 'Test 2', 'LabTest', 'dfgdfsdfgsfdgsfgdfsgdfgsfdgsf', NULL, 11, '0.5 - 2.5%', true, 1990, 'iiiiiiiii', NULL, '2025-04-24 08:14:04.916', '2025-04-24 08:14:04.916')
  ON CONFLICT (code) DO NOTHING;
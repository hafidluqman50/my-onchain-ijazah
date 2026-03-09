-- PostgreSQL schema for my-onchain-ijazah backend
-- Generated from current GORM models (admins, students, cohorts, certificates, access_logs)

CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(160) NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ NULL,
  last_login_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_admins_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_students_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS cohorts (
  id BIGSERIAL PRIMARY KEY,
  label VARCHAR(120) NOT NULL,
  label_key VARCHAR(160) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_cohorts_label_key UNIQUE (label_key)
);

CREATE TABLE IF NOT EXISTS certificates (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL,
  cohort_id BIGINT NOT NULL,
  document_hash VARCHAR(120) NOT NULL,
  encrypted_cid VARCHAR(200) NOT NULL,
  encrypted_key VARCHAR(400) NOT NULL,
  token_id VARCHAR(80) NOT NULL DEFAULT '',
  contract_address VARCHAR(80) NOT NULL DEFAULT '',
  issuer_did VARCHAR(120) NOT NULL DEFAULT '',
  verification_code VARCHAR(16) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  issued_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_certificates_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_certificates_cohort FOREIGN KEY (cohort_id) REFERENCES cohorts(id),
  CONSTRAINT uq_certificates_verification_code UNIQUE (verification_code)
);

CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_cohort_id ON certificates(cohort_id);
CREATE INDEX IF NOT EXISTS idx_certificates_token_id ON certificates(token_id);
CREATE INDEX IF NOT EXISTS idx_certificates_contract_address ON certificates(contract_address);

CREATE TABLE IF NOT EXISTS access_logs (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL,
  certificate_id BIGINT NOT NULL,
  action VARCHAR(40) NOT NULL,
  ip_address VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_access_logs_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_access_logs_certificate FOREIGN KEY (certificate_id) REFERENCES certificates(id)
);

CREATE INDEX IF NOT EXISTS idx_access_logs_student_id ON access_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_certificate_id ON access_logs(certificate_id);

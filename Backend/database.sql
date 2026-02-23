-- USER ROLES
CREATE TYPE user_roles_enum AS ENUM ('recruiter', 'candidate');

-- JOB STATUS
CREATE TYPE job_status_enum AS ENUM ('draft', 'published', 'closed');

-- APPLICATION STATUS
CREATE TYPE application_status_enum AS ENUM (
  'applied',
  'review',
  'interview',
  'offer',
  'rejected',
  'hired'
);

-- JOB TYPE
CREATE TYPE job_type_enum AS ENUM (
  'full_time',
  'part_time',
  'contract',
  'intern',
  'remote'
);

-- WORKFLOW STEP
CREATE TYPE workflow_step_enum AS ENUM (
  'screening',
  'interview',
  'assessment',
  'references',
  'decision',
  'job_offer',
  'shortlist'
);

-- NOTIFICATION TYPES
CREATE TYPE notification_types_enum AS ENUM (
  'application_status_changed',
  'interview_scheduled',
  'interview_updated',
  'job_published',
  'job_closed',
  'new_message'
);

CREATE TABLE "Users" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  "firstName" VARCHAR NOT NULL,
  "lastName" VARCHAR NOT NULL,
  "phoneNumber" VARCHAR,
  "profilePicture" VARCHAR,
  "coverImage" VARCHAR,
  "profilePicturePublicId" VARCHAR,
  "coverImagePublicId" VARCHAR,
  role user_roles_enum DEFAULT 'candidate',
  bio TEXT,
  location VARCHAR,
  "isVerified" BOOLEAN DEFAULT FALSE,
  "isActive" BOOLEAN DEFAULT TRUE,
  "lastLogin" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Profiles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  bio TEXT,
  "avatarUrl" VARCHAR,
  headline VARCHAR,
  about TEXT,
  experience INTEGER,
  "websiteUrl" VARCHAR,
  github VARCHAR,
  linkedin VARCHAR,
  twitter VARCHAR,
  views INTEGER DEFAULT 0,
  role user_roles_enum DEFAULT 'candidate',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Candidates" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  profile_id UUID UNIQUE NOT NULL REFERENCES "Profiles"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "resumeUrl" VARCHAR,
  education JSONB,
  experience JSONB,
  summary TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Recruiters" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES "Profiles"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  department VARCHAR,
  "positionTitle" VARCHAR,
  "workEmail" VARCHAR,
  "phoneExtension" VARCHAR,
  notes TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "JobPostings" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "postedBy" UUID NOT NULL REFERENCES "Users"(id),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB,
  responsibility TEXT,
  department VARCHAR,
  location VARCHAR,
  "jobType" job_type_enum,
  salary JSONB,
  status job_status_enum DEFAULT 'draft',
  "coverImage" VARCHAR,
  "coverImagePublicId" VARCHAR,
  "applicantsCount" INTEGER DEFAULT 0,
  "applicationDeadline" TIMESTAMP,
  "publishedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "JobApplications" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES "JobPostings"(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  resume VARCHAR NOT NULL,
  cover_letter VARCHAR,
  extracted_text TEXT,
  cover_letter_text TEXT,
  ai_analysis JSONB,
  cover_letter_score FLOAT,
  missing_skills JSONB,
  status application_status_enum DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT NOW(),
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  interview_id UUID,
  score FLOAT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE (job_id, user_id)
);

CREATE INDEX idx_job_applications_status ON "JobApplications"(status);

CREATE TABLE "ApplicationStatusHistories" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES "JobApplications"(id) ON DELETE CASCADE,
  old_status application_status_enum,
  new_status application_status_enum,
  changed_by UUID NOT NULL REFERENCES "Recruiters"(id) ON DELETE CASCADE,
  changed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE "ApplicationWorkflows" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES "JobApplications"(id) ON DELETE CASCADE,
  step workflow_step_enum NOT NULL,
  performed_by UUID REFERENCES "Recruiters"(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE "InterviewSchedules" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES "JobApplications"(id) ON DELETE CASCADE,
  scheduled_by UUID NOT NULL REFERENCES "Recruiters"(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP,
  location VARCHAR,
  interview_type VARCHAR,
  title VARCHAR,
  description TEXT,
  duration INTEGER,
  meeting_link VARCHAR,
  notes TEXT,
  status notification_types_enum DEFAULT 'interview_scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "InterviewFeedbacks" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES "InterviewSchedules"(id) ON DELETE CASCADE,
  given_by UUID NOT NULL REFERENCES "Recruiters"(id) ON DELETE CASCADE,
  comments TEXT,
  rating INTEGER,
  recommendation TEXT,
  shared_with_candidate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Categories" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Skills" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  category_id UUID REFERENCES "Categories"(id),
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE "UserSkills" (
  user_id UUID REFERENCES "Users"(id),
  skill_id UUID REFERENCES "Skills"(id),
  PRIMARY KEY (user_id, skill_id)
);


CREATE TABLE "ScoreAttributes" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "MatrixScores" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES "JobApplications"(id) ON DELETE CASCADE,
  stage_name VARCHAR NOT NULL,
  attribute_id UUID NOT NULL REFERENCES "ScoreAttributes"(id) ON DELETE CASCADE,
  score INTEGER,
  interview_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE "Notifications" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES "Users"(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  related_application_id UUID REFERENCES "JobApplications"(id),
  message_type VARCHAR,
  content VARCHAR,
  is_read BOOLEAN DEFAULT FALSE,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- show all  tables
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;




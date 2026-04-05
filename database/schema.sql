-- ============================================================
--  Hostel Management System — Database Schema
--  Run: mysql -u root -p hostel_db < database/schema.sql
-- ============================================================

USE hostel_db;

-- ── 1. USERS ────────────────────────────────────────────────
-- Stores login accounts. Separate from student profile data.
-- role controls what pages/actions this user can access.
CREATE TABLE IF NOT EXISTS users (
  id                INT          AUTO_INCREMENT PRIMARY KEY,
  username          VARCHAR(50)  UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  role              ENUM('Admin','Warden','Student') NOT NULL DEFAULT 'Student',
  linked_student_id INT          DEFAULT NULL,  -- filled in after student is created
  created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── 2. ROOMS ─────────────────────────────────────────────────
-- Created before students because students have a room_id FK.
CREATE TABLE IF NOT EXISTS rooms (
  id                INT            AUTO_INCREMENT PRIMARY KEY,
  room_number       VARCHAR(10)    UNIQUE NOT NULL,           -- e.g. "A-101"
  room_type         ENUM('Single','Double','Triple') NOT NULL,
  capacity          INT            NOT NULL DEFAULT 1,
  current_occupancy INT            NOT NULL DEFAULT 0,
  price_per_month   DECIMAL(10,2)  NOT NULL,
  status            ENUM('Available','Full','Maintenance') NOT NULL DEFAULT 'Available',
  floor             VARCHAR(10)    DEFAULT NULL,              -- "Ground", "1st", etc.
  created_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── 3. STUDENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id              INT          AUTO_INCREMENT PRIMARY KEY,
  student_id      VARCHAR(20)  UNIQUE NOT NULL,   -- e.g. HMS-2024-001
  full_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(100) UNIQUE NOT NULL,
  phone           VARCHAR(15)  DEFAULT NULL,
  guardian_name   VARCHAR(100) DEFAULT NULL,
  guardian_phone  VARCHAR(15)  DEFAULT NULL,
  photo_url       VARCHAR(255) DEFAULT NULL,      -- path like "uploads/abc.jpg"
  room_id         INT          DEFAULT NULL,
  admission_date  DATE         DEFAULT NULL,
  status          ENUM('Active','Inactive','Graduated') NOT NULL DEFAULT 'Active',
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- Now that students table exists, add the FK from users to students
ALTER TABLE users
  ADD CONSTRAINT fk_user_student
  FOREIGN KEY (linked_student_id) REFERENCES students(id) ON DELETE SET NULL;

-- ── 4. FEES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fees (
  id              INT           AUTO_INCREMENT PRIMARY KEY,
  student_id      INT           NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  fee_type        ENUM('Room','Mess','Security Deposit','Other') NOT NULL DEFAULT 'Room',
  due_date        DATE          NOT NULL,
  paid_date       DATE          DEFAULT NULL,    -- NULL = not yet paid
  status          ENUM('Pending','Paid','Overdue') NOT NULL DEFAULT 'Pending',
  receipt_number  VARCHAR(50)   UNIQUE DEFAULT NULL,
  payment_method  VARCHAR(50)   DEFAULT NULL,    -- "Cash", "UPI", "Bank Transfer"
  notes           TEXT          DEFAULT NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ── 5. ATTENDANCE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id               INT         AUTO_INCREMENT PRIMARY KEY,
  student_id       INT         NOT NULL,
  attendance_date  DATE        NOT NULL,
  check_in         TIME        DEFAULT NULL,
  check_out        TIME        DEFAULT NULL,
  type             ENUM('In','Out','Leave') NOT NULL DEFAULT 'In',
  remarks          VARCHAR(255) DEFAULT NULL,
  created_at       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ── 6. VISITORS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitors (
  id               INT         AUTO_INCREMENT PRIMARY KEY,
  student_id       INT         NOT NULL,         -- the student being visited
  visitor_name     VARCHAR(100) NOT NULL,
  visitor_phone    VARCHAR(15)  DEFAULT NULL,
  purpose          VARCHAR(255) DEFAULT NULL,
  in_time          DATETIME    NOT NULL,
  out_time         DATETIME    DEFAULT NULL,      -- NULL = still inside
  gate_pass_number VARCHAR(20)  UNIQUE DEFAULT NULL,
  created_at       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ── 7. COMPLAINTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
  id           INT         AUTO_INCREMENT PRIMARY KEY,
  student_id   INT         NOT NULL,
  assigned_to  INT         DEFAULT NULL,         -- FK to users (staff member)
  title        VARCHAR(150) NOT NULL,
  description  TEXT        DEFAULT NULL,
  category     ENUM('Electrical','Plumbing','Housekeeping','Security','Internet','Other')
               NOT NULL DEFAULT 'Other',
  status       ENUM('Open','In-Progress','Resolved','Closed')
               NOT NULL DEFAULT 'Open',
  priority     ENUM('Low','Medium','High') NOT NULL DEFAULT 'Medium',
  created_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at  TIMESTAMP   DEFAULT NULL,
  FOREIGN KEY (student_id)  REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- ── 8. MESS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mess (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  student_id  INT           NOT NULL,
  meal_plan   ENUM('Full','Lunch Only','Dinner Only') NOT NULL DEFAULT 'Full',
  opted_in    BOOLEAN       NOT NULL DEFAULT TRUE,
  month_year  DATE          NOT NULL,            -- store as first day: 2024-06-01
  mess_fee    DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_paid     BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_month (student_id, month_year),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ── 9. NOTICES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id               INT         AUTO_INCREMENT PRIMARY KEY,
  posted_by        INT         NOT NULL,         -- FK to users
  title            VARCHAR(200) NOT NULL,
  content          TEXT        NOT NULL,
  target_audience  ENUM('All','Students','Wardens') NOT NULL DEFAULT 'All',
  posted_at        TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  expiry_date      DATE        DEFAULT NULL,      -- NULL = never expires
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ── CONFIRMATION ─────────────────────────────────────────────
SELECT 'Schema created successfully!' AS message;
SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'hostel_db'
  ORDER BY table_name;

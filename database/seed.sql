-- ============================================================
--  Hostel Management System — Seed Data
--  Run AFTER schema.sql:
--  mysql -u root -p hostel_db < database/seed.sql
-- ============================================================

USE hostel_db;

-- ── ROOMS ────────────────────────────────────────────────────
INSERT INTO rooms (room_number, room_type, capacity, price_per_month, floor) VALUES
  ('A-101', 'Single', 1, 5000.00, 'Ground'),
  ('A-102', 'Double', 2, 4000.00, 'Ground'),
  ('A-103', 'Double', 2, 4000.00, 'Ground'),
  ('B-201', 'Triple', 3, 3000.00, '1st'),
  ('B-202', 'Triple', 3, 3000.00, '1st'),
  ('B-203', 'Single', 1, 5500.00, '1st'),
  ('C-301', 'Double', 2, 4500.00, '2nd'),
  ('C-302', 'Single', 1, 6000.00, '2nd');

-- ── ADMIN USER ───────────────────────────────────────────────
-- Password is "admin123" hashed with bcrypt (rounds=10)
-- In real use, create users through the API — never insert plain passwords
INSERT INTO users (username, password_hash, role) VALUES
  ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin'),
  ('warden1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Warden');
-- Note: password hash above = "password" from Laravel's default — replace in production!
-- To generate a real hash: node -e "const b=require('bcryptjs');b.hash('admin123',10).then(console.log)"

-- ── STUDENTS ─────────────────────────────────────────────────
INSERT INTO students (student_id, full_name, email, phone, guardian_name, guardian_phone, room_id, admission_date) VALUES
  ('HMS-2024-001', 'Ravi Kumar',     'ravi.kumar@example.com',   '9876543210', 'Suresh Kumar',  '9876543200', 1, '2024-06-01'),
  ('HMS-2024-002', 'Priya Sharma',   'priya.sharma@example.com', '9876543211', 'Ramesh Sharma', '9876543201', 2, '2024-06-01'),
  ('HMS-2024-003', 'Amit Patel',     'amit.patel@example.com',   '9876543212', 'Dinesh Patel',  '9876543202', 2, '2024-07-01'),
  ('HMS-2024-004', 'Sunita Verma',   'sunita.verma@example.com', '9876543213', 'Mohan Verma',   '9876543203', 4, '2024-07-15'),
  ('HMS-2024-005', 'Rahul Singh',    'rahul.singh@example.com',  '9876543214', 'Vijay Singh',   '9876543204', 4, '2024-08-01');

-- Update room occupancy counts
UPDATE rooms SET current_occupancy = 1, status = 'Full'      WHERE id = 1;
UPDATE rooms SET current_occupancy = 2, status = 'Full'      WHERE id = 2;
UPDATE rooms SET current_occupancy = 1, status = 'Available' WHERE id = 4;

-- ── FEES ─────────────────────────────────────────────────────
INSERT INTO fees (student_id, amount, fee_type, due_date, paid_date, status, receipt_number, payment_method) VALUES
  (1, 5000.00, 'Room', '2024-07-05', '2024-07-03', 'Paid',    'RCP-2024-0001', 'UPI'),
  (1, 5000.00, 'Room', '2024-08-05', NULL,          'Pending', NULL,             NULL),
  (2, 4000.00, 'Room', '2024-07-05', '2024-07-01', 'Paid',    'RCP-2024-0002', 'Cash'),
  (3, 4000.00, 'Room', '2024-08-05', NULL,          'Overdue', NULL,             NULL),
  (4, 3000.00, 'Room', '2024-08-05', NULL,          'Pending', NULL,             NULL);

-- ── NOTICES ──────────────────────────────────────────────────
INSERT INTO notices (posted_by, title, content, target_audience) VALUES
  (1, 'Welcome to HMS!',
   'Welcome to the Hostel Management System. Please ensure your room allotment details are correct.',
   'All'),
  (2, 'Mess Menu Updated',
   'The mess menu for August has been updated. Please check the Mess section for details.',
   'Students'),
  (1, 'Maintenance Notice',
   'Water supply will be interrupted on 15th August from 10am to 2pm for pipeline maintenance.',
   'All');

-- ── SAMPLE COMPLAINTS ────────────────────────────────────────
INSERT INTO complaints (student_id, title, description, category, status, priority) VALUES
  (1, 'Fan not working in room A-101', 'The ceiling fan stopped working yesterday. Room is very hot.', 'Electrical', 'Open', 'High'),
  (2, 'Water leakage in bathroom',     'Tap is dripping constantly and there is a puddle on the floor.',  'Plumbing',   'In-Progress', 'Medium'),
  (3, 'Wi-Fi not working',             'Internet has been down since this morning.',                       'Internet',   'Open', 'Low');

SELECT 'Seed data inserted successfully!' AS message;
SELECT COUNT(*) AS total_students FROM students;
SELECT COUNT(*) AS total_rooms    FROM rooms;

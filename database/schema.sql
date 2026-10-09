-- database/schema.sql

-- Drop existing tables if re-running
DROP TABLE IF EXISTS attendance_logs;
DROP TABLE IF EXISTS students;

-- Create Students Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    rfid_tag VARCHAR(50) UNIQUE NOT NULL,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) DEFAULT 'General',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Attendance Logs Table
CREATE TABLE attendance_logs (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PRESENT'
);

-- Sample Seed Data
INSERT INTO students (rfid_tag, student_id, first_name, last_name, email, department) VALUES
('TAG_1001', 'STU001', 'Alex', 'Morgan', 'alex.m@example.com', 'Computer Science'),
('TAG_1002', 'STU002', 'Sarah', 'Jenkins', 'sarah.j@example.com', 'Electrical Engineering'),
('TAG_1003', 'STU003', 'David', 'Kip', 'david.k@example.com', 'Business Information Systems');
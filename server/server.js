import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Student from './models/Student.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'backups');
const backupPath = path.join(backupDir, 'backup.json');

// Ensure backups directory exists
if (!process.env.VERCEL && !fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Database connection caching for Serverless environments
let cachedConnection = null;

const connectToDatabase = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // If connection is connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    return mongoose.connection.asPromise();
  }

  console.log('Connecting to MongoDB Atlas...');
  cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000 // Fail fast if IP is blocked (5s instead of hanging)
  });
  console.log('✅ MongoDB connected successfully');
  return cachedConnection;
};

// Database Connection Middleware
app.use(async (req, res, next) => {
  // Skip DB connection for root and status routes to keep checks responsive
  if (req.path === '/' || req.path === '/api/status') {
    return next();
  }
  
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('❌ Database connection error:', error);
    res.status(500).json({ 
      message: 'Failed to connect to database. Make sure your MongoDB Atlas IP Access List allows access from anywhere (0.0.0.0/0).', 
      error: error.message 
    });
  }
});

// --- API Endpoints ---

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SRMS Pro API Server', status: 'running' });
});

// 1. Get all students (with optional search)
app.get('/api/students', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      // Check if search query is a number (for matching Student ID)
      const searchNum = Number(search);
      if (!isNaN(searchNum)) {
        query = {
          $or: [
            { id: searchNum },
            { name: { $regex: search, $options: 'i' } },
            { course: { $regex: search, $options: 'i' } }
          ]
        };
      } else {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { course: { $regex: search, $options: 'i' } },
            { contact: { $regex: search, $options: 'i' } }
          ]
        };
      }
    }

    const students = await Student.find(query).sort({ id: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving students', error: error.message });
  }
});

// 2. Add Student
app.post('/api/students', async (req, res) => {
  try {
    const { id, name, age, contact, admissionDate, course } = req.body;

    if (!id || !name || !age || !contact || !admissionDate || !course) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if student with ID already exists
    const existing = await Student.findOne({ id: Number(id) });
    if (existing) {
      return res.status(400).json({ message: `Student with ID ${id} already exists.` });
    }

    const newStudent = new Student({
      id: Number(id),
      name,
      age: Number(age),
      contact,
      admissionDate,
      course,
      grades: 0.0,
      attendance: 0
    });

    const saved = await newStudent.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error adding student', error: error.message });
  }
});

// 3. Edit Student Details
app.put('/api/students/:id', async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const { name, age, contact, admissionDate, course, grades, attendance } = req.body;

    if (!name || !age || !contact || !admissionDate || !course) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const updateFields = { 
      name, 
      age: Number(age), 
      contact, 
      admissionDate, 
      course 
    };

    if (grades !== undefined && !isNaN(Number(grades))) {
      updateFields.grades = Number(grades);
    }
    if (attendance !== undefined && !isNaN(Number(attendance))) {
      updateFields.attendance = Math.max(0, Number(attendance));
    }

    const updated = await Student.findOneAndUpdate(
      { id: studentId },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
});

// 4. Delete Student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const deleted = await Student.findOneAndDelete({ id: studentId });

    if (!deleted) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    res.json({ message: 'Student deleted successfully.', student: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
});

// 5. Manage Grade (Update Grade)
app.patch('/api/students/:id/grade', async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const { grades } = req.body;

    if (grades === undefined || isNaN(Number(grades))) {
      return res.status(400).json({ message: 'Valid grade is required.' });
    }

    const updated = await Student.findOneAndUpdate(
      { id: studentId },
      { grades: Number(grades) },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating grade', error: error.message });
  }
});

// 6. Manage Attendance (Update or Increment Attendance days)
app.patch('/api/students/:id/attendance', async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const { days, attendance } = req.body;

    const student = await Student.findOne({ id: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (attendance !== undefined && !isNaN(Number(attendance))) {
      student.attendance = Math.max(0, Number(attendance));
    } else if (days !== undefined && !isNaN(Number(days))) {
      student.attendance = Math.max(0, student.attendance + Number(days));
    } else {
      return res.status(400).json({ message: 'Valid attendance or days value is required.' });
    }

    const updated = await student.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating attendance', error: error.message });
  }
});

// 7. Backup Data to local JSON
app.post('/api/backup', async (req, res) => {
  try {
    const students = await Student.find({});
    fs.writeFileSync(backupPath, JSON.stringify(students, null, 2), 'utf-8');
    res.json({ message: 'Data backup completed successfully.', count: students.length });
  } catch (error) {
    res.status(500).json({ message: 'Backup failed', error: error.message });
  }
});

// 8. Recover Data from local JSON
app.post('/api/recover', async (req, res) => {
  try {
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ message: 'No backup file found to recover.' });
    }

    const rawData = fs.readFileSync(backupPath, 'utf-8');
    const backupData = JSON.parse(rawData);

    if (!Array.isArray(backupData)) {
      return res.status(400).json({ message: 'Backup data format is invalid.' });
    }

    // Clear active students collection
    await Student.deleteMany({});

    // Map backup data and exclude mongoose specific system metadata if needed, 
    // but mongoose will generate new _id if we strip them or insert as-is.
    // Stripping _id is safer to avoid ID conflicts, but let's keep details clean:
    const sanitizedData = backupData.map(item => ({
      id: item.id,
      name: item.name,
      age: item.age,
      contact: item.contact,
      admissionDate: item.admissionDate,
      course: item.course,
      grades: item.grades || 0.0,
      attendance: item.attendance || 0
    }));

    await Student.insertMany(sanitizedData);

    res.json({ message: 'Data recovery completed successfully.', count: sanitizedData.length });
  } catch (error) {
    res.status(500).json({ message: 'Recovery failed', error: error.message });
  }
});

// Global Status Route
app.get('/api/status', (req, res) => {
  res.json({ status: 'running', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;

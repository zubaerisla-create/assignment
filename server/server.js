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
const backupDir = path.join(__dirname, 'backups');
const backupPath = path.join(backupDir, 'backup.json');

// Ensure backups directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });

// --- API Endpoints ---

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
    const { name, age, contact, admissionDate, course } = req.body;

    if (!name || !age || !contact || !admissionDate || !course) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const updated = await Student.findOneAndUpdate(
      { id: studentId },
      { name, age: Number(age), contact, admissionDate, course },
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

// 6. Manage Attendance (Increment Attendance days)
app.patch('/api/students/:id/attendance', async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const { days } = req.body;

    if (!days || isNaN(Number(days))) {
      return res.status(400).json({ message: 'Valid days parameter is required.' });
    }

    const student = await Student.findOne({ id: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    student.attendance += Number(days);
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

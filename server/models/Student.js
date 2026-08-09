import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  admissionDate: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  grades: {
    type: Number,
    default: 0.0
  },
  attendance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

export default Student;

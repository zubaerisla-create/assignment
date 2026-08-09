import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import GradeAttendanceModal from './components/GradeAttendanceModal';
import Reports from './components/Reports';
import BackupRecovery from './components/BackupRecovery';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeAttendanceModalOpen, setGradeAttendanceModalOpen] = useState(false);
  const [gradeAttendanceMode, setGradeAttendanceMode] = useState('grade');

  // Fetch all student records
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      triggerToast('error', 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Notification Helper
  const triggerToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 1. Trigger Add Modal
  const handleAddClick = () => {
    setSelectedStudent(null);
    setFormModalOpen(true);
  };

  // 2. Trigger Edit Modal
  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setFormModalOpen(true);
  };

  // 3. Trigger Grade Modal
  const handleGradeClick = (student) => {
    setSelectedStudent(student);
    setGradeAttendanceMode('grade');
    setGradeAttendanceModalOpen(true);
  };

  // 4. Trigger Attendance Modal
  const handleAttendanceClick = (student) => {
    setSelectedStudent(student);
    setGradeAttendanceMode('attendance');
    setGradeAttendanceModalOpen(true);
  };

  // 5. Submit Add/Edit Student
  const handleStudentFormSubmit = async (formData) => {
    try {
      if (selectedStudent) {
        // Edit Mode
        const response = await axios.put(`${API_BASE}/students/${formData.id}`, formData);
        triggerToast('success', `Student '${formData.name}' updated successfully.`);
      } else {
        // Add Mode
        const response = await axios.post(`${API_BASE}/students`, formData);
        triggerToast('success', `Student '${formData.name}' enrolled successfully.`);
      }
      setFormModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error('Form submission error:', error);
      const msg = error.response?.data?.message || 'Error occurred during save operation.';
      triggerToast('error', msg);
    }
  };

  // 6. Delete Student Record
  const handleDeleteClick = async (id) => {
    if (window.confirm(`Are you sure you want to permanently delete student ID: ${id}?`)) {
      try {
        await axios.delete(`${API_BASE}/students/${id}`);
        triggerToast('success', `Student ID ${id} deleted successfully.`);
        fetchStudents();
      } catch (error) {
        console.error('Delete error:', error);
        triggerToast('error', 'Failed to delete student.');
      }
    }
  };

  // 7. Submit Grade or Attendance Update
  const handleGradeAttendanceSubmit = async (id, payload) => {
    try {
      if (gradeAttendanceMode === 'grade') {
        await axios.patch(`${API_BASE}/students/${id}/grade`, payload);
        triggerToast('success', `Grade updated successfully.`);
      } else {
        await axios.patch(`${API_BASE}/students/${id}/attendance`, payload);
        triggerToast('success', `Attendance logged successfully.`);
      }
      setGradeAttendanceModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error('Update error:', error);
      const msg = error.response?.data?.message || 'Failed to submit update.';
      triggerToast('error', msg);
    }
  };

  // 8. Execute Database Backup
  const handleDatabaseBackup = async () => {
    try {
      const response = await axios.post(`${API_BASE}/backup`);
      triggerToast('success', `Backup successful. Saved ${response.data.count} records.`);
      return response.data;
    } catch (error) {
      console.error('Backup error:', error);
      triggerToast('error', 'Database backup failed.');
      throw error;
    }
  };

  // 9. Execute Database Recovery
  const handleDatabaseRecover = async () => {
    try {
      const response = await axios.post(`${API_BASE}/recover`);
      triggerToast('success', `Recovery successful. Restored ${response.data.count} records.`);
      fetchStudents();
      return response.data;
    } catch (error) {
      console.error('Recovery error:', error);
      triggerToast('error', 'Database recovery failed.');
      throw error;
    }
  };

  // Render Page Content based on Active Tab
  const renderTabContent = () => {
    if (loading && students.length === 0) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Connecting to database. Please wait...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            students={students} 
            setActiveTab={setActiveTab} 
            onAddClick={handleAddClick} 
          />
        );
      case 'students':
        return (
          <StudentList 
            students={students}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onGradeClick={handleGradeClick}
            onAttendanceClick={handleAttendanceClick}
            onAddClick={handleAddClick}
          />
        );
      case 'reports':
        return <Reports students={students} />;
      case 'backup':
        return (
          <BackupRecovery 
            onBackup={handleDatabaseBackup} 
            onRecover={handleDatabaseRecover} 
          />
        );
      default:
        return <div>Tab not found.</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>SRMS Pro</span>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            Dashboard
          </button>

          <button 
            className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Manage Students
          </button>

          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            Academic Reports
          </button>

          <button 
            className={`nav-item ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Backup & Recovery
          </button>
        </nav>
      </aside>

      {/* Main View Area */}
      <main className="main-content">
        {/* Dynamic header title */}
        <header className="main-header">
          <div className="header-title">
            <h1>
              {activeTab === 'dashboard' && 'Academic Dashboard'}
              {activeTab === 'students' && 'Student Records Directory'}
              {activeTab === 'reports' && 'Academic Performance & Analytics'}
              {activeTab === 'backup' && 'System Maintenance & Backups'}
            </h1>
            <p>
              {activeTab === 'dashboard' && 'Overview of enrollment metrics and classroom statistics.'}
              {activeTab === 'students' && 'Create, view, update, and search active student profiles.'}
              {activeTab === 'reports' && 'Review grade distributions and evaluate course attendance trends.'}
              {activeTab === 'backup' && 'Execute local database snapshots or recover files from system storage.'}
            </p>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            System Status: <span style={{ color: 'var(--success)' }}>● Active</span>
          </div>
        </header>

        {/* Render active content tab */}
        {renderTabContent()}
      </main>

      {/* Enroll / Modify Student Form Modal */}
      <StudentForm
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleStudentFormSubmit}
        student={selectedStudent}
      />

      {/* Manage Grade / Log Attendance Modal */}
      <GradeAttendanceModal
        isOpen={gradeAttendanceModalOpen}
        onClose={() => setGradeAttendanceModalOpen(false)}
        onSubmit={handleGradeAttendanceSubmit}
        student={selectedStudent}
        mode={gradeAttendanceMode}
      />

      {/* Toast Notification HUD */}
      {toast && (
        <div className={`notification-toast ${toast.type}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {toast.type === 'success' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            )}
          </svg>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;

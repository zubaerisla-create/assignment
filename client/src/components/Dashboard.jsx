import React from 'react';

function Dashboard({ students, setActiveTab, onAddClick }) {
  // Statistics Calculations
  const totalStudents = students.length;
  
  const avgGrade = totalStudents > 0 
    ? (students.reduce((sum, s) => sum + (s.grades || 0), 0) / totalStudents).toFixed(2)
    : '0.00';
    
  const avgAttendance = totalStudents > 0 
    ? (students.reduce((sum, s) => sum + (s.attendance || 0), 0) / totalStudents).toFixed(1)
    : '0.0';
    
  const uniqueCourses = new Set(students.map(s => s.course?.trim()).filter(Boolean)).size;

  // Last 5 recently enrolled students
  const recentStudents = [...students]
    .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
    .slice(0, 5);

  return (
    <div>
      {/* Stats Widgets */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper total">
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Enrolled</span>
            <span className="stat-value">{totalStudents}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper grade">
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Class Avg Grade</span>
            <span className="stat-value">{avgGrade}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper attendance">
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Avg Attendance</span>
            <span className="stat-value">{avgAttendance} Days</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper courses">
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Courses</span>
            <span className="stat-value">{uniqueCourses}</span>
          </div>
        </div>
      </div>

      <div className="reports-layout" style={{ marginTop: '2rem' }}>
        {/* Left Side: Recent Enrollments */}
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--info)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Enrollments
          </h3>
          {recentStudents.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <h4>No Students Registered Yet</h4>
              <p style={{ fontSize: '0.85rem' }}>Add student records to see them displayed here.</p>
            </div>
          ) : (
            <div className="table-container" style={{ margin: 0, boxShadow: 'none', border: 'none' }}>
              <table className="student-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Admission Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((student) => (
                    <tr key={student.id}>
                      <td><span className="student-id">{student.id}</span></td>
                      <td className="student-name-cell">{student.name}</td>
                      <td>{student.course}</td>
                      <td>{student.admissionDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Quick Links */}
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={onAddClick} style={{ justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Student
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('students')} style={{ justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Student Database
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('reports')} style={{ justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Academic Reports
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('backup')} style={{ justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Backup & Recovery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

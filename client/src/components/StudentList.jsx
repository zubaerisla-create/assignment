import React, { useState } from 'react';

function StudentList({ 
  students, 
  onEditClick, 
  onDeleteClick, 
  onGradeClick, 
  onAttendanceClick, 
  onAddClick 
}) {
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [sortBy, setSortBy] = useState('id-asc');

  // Helper: Get grade classification for badge styling
  const getGradeClass = (grade) => {
    if (grade >= 4.0) return { label: 'Excellent', className: 'excellent' };
    if (grade >= 3.0) return { label: 'Good', className: 'good' };
    if (grade >= 2.0) return { label: 'Pass', className: 'pass' };
    return { label: 'Fail', className: 'fail' };
  };

  // Extract unique courses for filter dropdown
  const uniqueCourses = Array.from(new Set(students.map(s => s.course?.trim()).filter(Boolean)));

  // Filter & Sort Student List
  const filteredStudents = students
    .filter(student => {
      const matchSearch = 
        student.name?.toLowerCase().includes(search.toLowerCase()) ||
        student.id?.toString().includes(search) ||
        student.course?.toLowerCase().includes(search.toLowerCase());
      
      const matchCourse = courseFilter === '' || student.course === courseFilter;
      
      return matchSearch && matchCourse;
    })
    .sort((a, b) => {
      const [field, direction] = sortBy.split('-');
      const modifier = direction === 'asc' ? 1 : -1;
      
      if (field === 'id') return (a.id - b.id) * modifier;
      if (field === 'name') return a.name.localeCompare(b.name) * modifier;
      if (field === 'grade') return (a.grades - b.grades) * modifier;
      if (field === 'attendance') return (a.attendance - b.attendance) * modifier;
      
      return 0;
    });

  // Capping attendance progress visualization at 50 days (academic term target)
  const maxTermAttendance = 50;

  return (
    <div>
      {/* Control Panel */}
      <div className="control-panel">
        <div className="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search by ID, Name, or Course..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="action-buttons">
          <select 
            className="form-input" 
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="">All Courses</option>
            {uniqueCourses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>

          <select 
            className="form-input" 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="id-asc">Sort: ID (Low to High)</option>
            <option value="id-desc">Sort: ID (High to Low)</option>
            <option value="name-asc">Sort: Name (A-Z)</option>
            <option value="name-desc">Sort: Name (Z-A)</option>
            <option value="grade-desc">Sort: Grade (High to Low)</option>
            <option value="grade-asc">Sort: Grade (Low to High)</option>
            <option value="attendance-desc">Sort: Attendance (High to Low)</option>
          </select>

          <button className="btn btn-primary" onClick={onAddClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </button>
        </div>
      </div>

      {/* Main Student Database Grid */}
      <div className="table-container">
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4>No Records Found</h4>
            <p>We couldn't find any student matches. Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <table className="student-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Course</th>
                <th>Grade</th>
                <th>Attendance</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const gradeBadge = getGradeClass(student.grades);
                const attendancePct = Math.min(100, Math.round((student.attendance / maxTermAttendance) * 100));
                
                return (
                  <tr key={student.id}>
                    <td><span className="student-id">{student.id}</span></td>
                    <td className="student-name-cell">{student.name}</td>
                    <td>{student.age}</td>
                    <td>{student.course}</td>
                    <td>
                      <span className={`grade-badge ${gradeBadge.className}`}>
                        {student.grades?.toFixed(2)} ({gradeBadge.label})
                      </span>
                    </td>
                    <td>
                      <div className="attendance-progress-container">
                        <div className="attendance-progress-bar">
                          <div 
                            className="attendance-progress-fill" 
                            style={{ width: `${attendancePct}%` }}
                          />
                        </div>
                        <span className="attendance-text">{student.attendance}d</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        {/* Manage Attendance */}
                        <button 
                          className="action-btn attendance" 
                          title="Log Attendance"
                          onClick={() => onAttendanceClick(student)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="action-btn-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>

                        {/* Manage Grade */}
                        <button 
                          className="action-btn grade" 
                          title="Manage Grade"
                          onClick={() => onGradeClick(student)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="action-btn-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </button>

                        {/* Edit Student Info */}
                        <button 
                          className="action-btn edit" 
                          title="Edit Details"
                          onClick={() => onEditClick(student)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="action-btn-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {/* Delete Student */}
                        <button 
                          className="action-btn delete" 
                          title="Delete Student"
                          onClick={() => onDeleteClick(student.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="action-btn-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StudentList;

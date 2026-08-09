import React from 'react';

function Reports({ students }) {
  const total = students.length;

  // 1. Grade Distribution calculations
  const grades = students.map(s => s.grades || 0);
  const excellentCount = grades.filter(g => g >= 3.8).length; // e.g. A-/A/A+
  const goodCount = grades.filter(g => g >= 3.0 && g < 3.8).length; // e.g. B range
  const passCount = grades.filter(g => g >= 2.0 && g < 3.0).length; // e.g. C range
  const failCount = grades.filter(g => g < 2.0).length; // struggling

  const getPercentage = (count) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const excellentPct = getPercentage(excellentCount);
  const goodPct = getPercentage(goodCount);
  const passPct = getPercentage(passCount);
  const failPct = getPercentage(failCount);

  // 2. Average Attendance and grade by Course
  const courseDataMap = {};
  students.forEach(student => {
    const course = student.course || 'Unknown';
    if (!courseDataMap[course]) {
      courseDataMap[course] = { totalAttendance: 0, totalGrades: 0, count: 0 };
    }
    courseDataMap[course].totalAttendance += student.attendance || 0;
    courseDataMap[course].totalGrades += student.grades || 0;
    courseDataMap[course].count += 1;
  });

  const courseAnalytics = Object.keys(courseDataMap).map(courseName => {
    const data = courseDataMap[courseName];
    return {
      name: courseName,
      avgAttendance: (data.totalAttendance / data.count).toFixed(1),
      avgGrade: (data.totalGrades / data.count).toFixed(2),
      count: data.count
    };
  });

  // 3. Risk / Warning Lists
  const academicRiskStudents = students.filter(s => (s.grades || 0) < 2.0);
  const attendanceRiskStudents = students.filter(s => (s.attendance || 0) < 15);

  return (
    <div>
      <div className="reports-layout">
        
        {/* Left Side: Visual Graphics */}
        <div>
          {/* Grade Distribution Bar Chart */}
          <div className="panel-card">
            <h3>Grade Distribution (% of Total Class)</h3>
            {total === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <h4>No Data Available</h4>
                <p>Register student profiles with grade information to populate the analytics.</p>
              </div>
            ) : (
              <div className="chart-container">
                <div className="chart-bar-wrapper">
                  <div className="chart-bar emerald" style={{ height: `${excellentPct}%` }}>
                    <span className="chart-tooltip">Excellent: {excellentCount} students ({excellentPct}%)</span>
                  </div>
                  <span className="chart-label">
                    <span className="full-label">Excellent (3.80 - 4.00)</span>
                    <span className="short-label">Excellent</span>
                  </span>
                </div>
                
                <div className="chart-bar-wrapper">
                  <div className="chart-bar cyan" style={{ height: `${goodPct}%` }}>
                    <span className="chart-tooltip">Good: {goodCount} students ({goodPct}%)</span>
                  </div>
                  <span className="chart-label">
                    <span className="full-label">Good (3.00 - 3.79)</span>
                    <span className="short-label">Good</span>
                  </span>
                </div>
                
                <div className="chart-bar-wrapper">
                  <div className="chart-bar amber" style={{ height: `${passPct}%` }}>
                    <span className="chart-tooltip">Pass: {passCount} students ({passPct}%)</span>
                  </div>
                  <span className="chart-label">
                    <span className="full-label">Pass (2.00 - 2.99)</span>
                    <span className="short-label">Pass</span>
                  </span>
                </div>
                
                <div className="chart-bar-wrapper">
                  <div className="chart-bar rose" style={{ height: `${failPct}%` }}>
                    <span className="chart-tooltip">Struggling: {failCount} students ({failPct}%)</span>
                  </div>
                  <span className="chart-label">
                    <span className="full-label">Struggling (&lt; 2.00)</span>
                    <span className="short-label">Struggling</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Attendance by Course list */}
          <div className="panel-card">
            <h3>Course Metrics Breakdown</h3>
            {courseAnalytics.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <h4>No Course Data Available</h4>
              </div>
            ) : (
              <div className="horizontal-bars">
                {courseAnalytics.map(course => {
                  // Percentage of target attendance (50 days is standard class calendar target)
                  const attPct = Math.min(100, Math.round((Number(course.avgAttendance) / 50) * 100));
                  
                  return (
                    <div className="bar-row" key={course.name}>
                      <div className="bar-header">
                        <span className="bar-title">
                          <strong>{course.name}</strong> ({course.count} Students)
                        </span>
                        <span className="bar-value">
                          Avg: {course.avgAttendance} Days | CGPA: {course.avgGrade}
                        </span>
                      </div>
                      <div className="bar-bg">
                        <div className="bar-fill" style={{ width: `${attPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Alerts & Risk Analysis */}
        <div>
          <div className="panel-card" style={{ height: '100%' }}>
            <h3>Academic Risk Alert</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Students under 2.00 GPA requiring immediate academic guidance.
            </p>
            
            <div className="alerts-list" style={{ marginBottom: '2rem' }}>
              {academicRiskStudents.length === 0 ? (
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No students in academic risk.
                </div>
              ) : (
                academicRiskStudents.map(student => (
                  <div key={student.id} className="alert-item danger">
                    <svg xmlns="http://www.w3.org/2000/svg" className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <strong>{student.name}</strong> ({student.id})
                      <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '0.15rem' }}>
                        CGPA: {student.grades?.toFixed(2)} | Course: {student.course}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <h3>Low Attendance Tracker</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Students with attendance less than 15 days in the current term.
            </p>

            <div className="alerts-list">
              {attendanceRiskStudents.length === 0 ? (
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  All students meet attendance targets.
                </div>
              ) : (
                attendanceRiskStudents.map(student => (
                  <div key={student.id} className="alert-item warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <strong>{student.name}</strong> ({student.id})
                      <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '0.15rem' }}>
                        Attendance: {student.attendance} Days | Course: {student.course}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Reports;

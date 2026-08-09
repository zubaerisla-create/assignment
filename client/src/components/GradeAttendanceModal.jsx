import React, { useState, useEffect } from 'react';

function GradeAttendanceModal({ isOpen, onClose, onSubmit, student, mode }) {
  const [value, setValue] = useState('');
  const [updateType, setUpdateType] = useState('set'); // 'set' or 'add'

  useEffect(() => {
    if (student) {
      if (mode === 'grade') {
        setValue(student.grades !== undefined ? student.grades.toString() : '0.00');
      } else {
        setValue(student.attendance !== undefined ? student.attendance.toString() : '0');
        setUpdateType('set');
      }
    }
  }, [student, mode, isOpen]);

  if (!isOpen || !student) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      alert('Please enter a valid number.');
      return;
    }

    if (mode === 'grade') {
      if (numValue < 0 || numValue > 4) {
        alert('Grade GPA must be between 0.00 and 4.00.');
        return;
      }
      onSubmit(student.id, { grades: numValue });
    } else {
      if (numValue < 0) {
        alert('Attendance days cannot be negative.');
        return;
      }
      if (updateType === 'set') {
        onSubmit(student.id, { attendance: numValue });
      } else {
        onSubmit(student.id, { days: numValue });
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'grade' ? 'Update Grade Record' : 'Log / Edit Attendance'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Student profile</span>
          <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
            {student.name} <span className="student-id" style={{ marginLeft: '0.5rem' }}>{student.id}</span>
          </h4>
        </div>

        <form onSubmit={handleFormSubmit}>
          {mode === 'grade' ? (
            <div className="form-group">
              <label className="form-label">New CGPA / Grade (0.00 - 4.00)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0.00" 
                max="4.00" 
                className="form-input" 
                placeholder="e.g. 3.75"
                value={value} 
                onChange={(e) => setValue(e.target.value)}
                required
                autoFocus
              />
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Current Attendance:</span>
                <span style={{ fontWeight: '600', color: 'var(--success)' }}>{student.attendance || 0} Days</span>
              </div>

              {/* Mode Toggle Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button 
                  type="button" 
                  className={`btn ${updateType === 'set' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.85rem', justifyContent: 'center' }}
                  onClick={() => {
                    setUpdateType('set');
                    setValue(student.attendance !== undefined ? student.attendance.toString() : '0');
                  }}
                >
                  Set Total Days
                </button>
                <button 
                  type="button" 
                  className={`btn ${updateType === 'add' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.85rem', justifyContent: 'center' }}
                  onClick={() => {
                    setUpdateType('add');
                    setValue('1');
                  }}
                >
                  Add Days (+X)
                </button>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  {updateType === 'set' ? 'Set Total Days Attended' : 'Additional Days to Add'}
                </label>
                <input 
                  type="number" 
                  min="0" 
                  className="form-input" 
                  placeholder={updateType === 'set' ? 'e.g. 45' : 'e.g. 1'}
                  value={value} 
                  onChange={(e) => setValue(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {mode === 'grade' ? 'Update Grade' : (updateType === 'set' ? 'Save Attendance' : 'Add Days')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GradeAttendanceModal;

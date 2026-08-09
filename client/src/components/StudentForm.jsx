import React, { useState, useEffect } from 'react';

function StudentForm({ isOpen, onClose, onSubmit, student }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    age: '',
    contact: '',
    admissionDate: '',
    course: ''
  });

  const isEditMode = !!student;

  useEffect(() => {
    if (student) {
      setFormData({
        id: student.id,
        name: student.name || '',
        age: student.age || '',
        contact: student.contact || '',
        admissionDate: student.admissionDate || '',
        course: student.course || ''
      });
    } else {
      // Set default admission date to today (YYYY-MM-DD format)
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        id: '',
        name: '',
        age: '',
        contact: '',
        admissionDate: today,
        course: ''
      });
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.id || !formData.name || !formData.age || !formData.contact || !formData.admissionDate || !formData.course) {
      alert('Please fill out all fields.');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Modify Student Record' : 'Enroll New Student'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input 
                type="number" 
                name="id" 
                className="form-input" 
                placeholder="e.g. 24135029"
                value={formData.id} 
                onChange={handleChange}
                disabled={isEditMode}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Age</label>
              <input 
                type="number" 
                name="age" 
                className="form-input" 
                placeholder="e.g. 20"
                value={formData.age} 
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="name" 
              className="form-input" 
              placeholder="e.g. Mahbub Zaman"
              value={formData.name} 
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input 
              type="text" 
              name="contact" 
              className="form-input" 
              placeholder="e.g. +88017XXXXXXXX"
              value={formData.contact} 
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Course / Program</label>
              <input 
                type="text" 
                name="course" 
                className="form-input" 
                placeholder="e.g. CSE 111"
                value={formData.course} 
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admission Date</label>
              <input 
                type="date" 
                name="admissionDate" 
                className="form-input" 
                value={formData.admissionDate} 
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? 'Save Changes' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentForm;

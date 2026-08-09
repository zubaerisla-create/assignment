import React, { useState } from 'react';

function BackupRecovery({ onBackup, onRecover }) {
  const [backupLoading, setBackupLoading] = useState(false);
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [backupStats, setBackupStats] = useState(null);
  const [recoverStats, setRecoverStats] = useState(null);

  const handleBackup = async () => {
    setBackupLoading(true);
    setBackupStats(null);
    try {
      const stats = await onBackup();
      setBackupStats({
        success: true,
        count: stats.count,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
      });
    } catch (err) {
      setBackupStats({
        success: false,
        message: err.message || 'Error occurred during backup operations.'
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRecover = async () => {
    if (!window.confirm('WARNING: Recovering data will overwrite the current live database. Are you sure you want to proceed?')) {
      return;
    }
    setRecoverLoading(true);
    setRecoverStats(null);
    try {
      const stats = await onRecover();
      setRecoverStats({
        success: true,
        count: stats.count,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
      });
    } catch (err) {
      setRecoverStats({
        success: false,
        message: err.message || 'No backup snapshot was found or the file is corrupt.'
      });
    } finally {
      setRecoverLoading(false);
    }
  };

  return (
    <div>
      <div className="backup-grid">
        {/* Backup Panel */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--success)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Database Backup Engine
            </h3>
            <p className="backup-details">
              Export all active student records, including metadata profiles, grades, and attendance days, into a structured JSON backup snapshot file stored securely on the local server.
            </p>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              <strong>Storage Location:</strong> <code style={{ fontSize: '0.8rem' }}>server/backups/backup.json</code>
            </div>
            
            {backupStats && (
              <div className={`alert-item ${backupStats.success ? 'warning' : 'danger'}`} style={{ backgroundColor: backupStats.success ? 'var(--success-glow)' : 'var(--danger-glow)', borderColor: backupStats.success ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 23, 68, 0.2)', color: backupStats.success ? '#b9f6ca' : '#ff8a80', marginBottom: '1.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {backupStats.success ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <div>
                  {backupStats.success ? (
                    <>
                      <strong>Backup Completed:</strong> {backupStats.count} student profiles saved successfully at {backupStats.time} on {backupStats.date}.
                    </>
                  ) : (
                    <>
                      <strong>Backup Failed:</strong> {backupStats.message}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button 
            className="btn btn-primary" 
            onClick={handleBackup} 
            disabled={backupLoading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
          >
            {backupLoading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', marginRight: '0.5rem' }} />
                Executing Database Backup...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Generate Database Backup
              </>
            )}
          </button>
        </div>

        {/* Recover Panel */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--warning)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
              </svg>
              Database Recovery Engine
            </h3>
            <p className="backup-details">
              Restore the entire student record directory from the latest saved server-side snapshot. This operation replaces the live MongoDB database collection.
            </p>
            <div className="alert-item danger" style={{ marginBottom: '1.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <strong>CRITICAL WARNING:</strong> Recovery wipes all changes made since the last backup. This cannot be undone.
              </div>
            </div>

            {recoverStats && (
              <div className={`alert-item ${recoverStats.success ? 'warning' : 'danger'}`} style={{ backgroundColor: recoverStats.success ? 'var(--success-glow)' : 'var(--danger-glow)', borderColor: recoverStats.success ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 23, 68, 0.2)', color: recoverStats.success ? '#b9f6ca' : '#ff8a80', marginBottom: '1.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {recoverStats.success ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <div>
                  {recoverStats.success ? (
                    <>
                      <strong>Recovery Successful:</strong> Restored {recoverStats.count} student profiles to active storage at {recoverStats.time} on {recoverStats.date}.
                    </>
                  ) : (
                    <>
                      <strong>Recovery Failed:</strong> {recoverStats.message}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            className="btn btn-danger" 
            onClick={handleRecover} 
            disabled={recoverLoading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
          >
            {recoverLoading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', marginRight: '0.5rem', borderTopColor: '#fff' }} />
                Restoring Live Database...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                </svg>
                Recover Database from Backup
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BackupRecovery;

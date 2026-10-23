import React, { createContext, useContext, useState, useCallback } from 'react';
import { MdInfoOutline, MdWarningAmber, MdCheckCircle } from 'react-icons/md';

const ModalContext = createContext(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'alert', // 'alert' or 'confirm'
    message: '',
    resolve: null,
  });

  const showAlert = useCallback((message) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'alert',
        message,
        resolve,
      });
    });
  }, []);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'confirm',
        message,
        resolve,
      });
    });
  }, []);

  const handleClose = (result) => {
    if (modalState.resolve) {
      modalState.resolve(result);
    }
    setModalState({ ...modalState, isOpen: false });
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modalState.isOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.header}>
              {modalState.type === 'confirm' ? (
                <MdWarningAmber style={{ color: '#f39c12', fontSize: '32px' }} />
              ) : (
                <MdInfoOutline style={{ color: '#3498db', fontSize: '32px' }} />
              )}
              <h3 style={styles.title}>
                {modalState.type === 'confirm' ? 'Confirmation' : 'Notification'}
              </h3>
            </div>
            
            <div style={styles.body}>
              <p style={styles.message}>{modalState.message}</p>
            </div>
            
            <div style={styles.actions}>
              {modalState.type === 'confirm' && (
                <button 
                  style={{ ...styles.btn, ...styles.btnCancel }} 
                  onClick={() => handleClose(false)}
                >
                  Cancel
                </button>
              )}
              <button 
                style={{ ...styles.btn, ...styles.btnOk }} 
                onClick={() => handleClose(true)}
              >
                {modalState.type === 'confirm' ? 'Confirm' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: 'var(--bg-primary, #1e1e2d)',
    borderRadius: '16px',
    padding: '24px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.05)',
    animation: 'modalSlideIn 0.3s ease-out forwards',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    color: 'var(--text-primary, #ffffff)',
    fontWeight: '600',
  },
  body: {
    marginBottom: '24px',
  },
  message: {
    margin: 0,
    color: 'var(--text-secondary, #b5b5c3)',
    fontSize: '1rem',
    lineHeight: '1.5',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  btn: {
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
  },
  btnCancel: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'var(--text-primary, #ffffff)',
  },
  btnOk: {
    backgroundColor: '#3498db',
    color: '#ffffff',
  }
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes modalSlideIn {
      from { opacity: 0; transform: translateY(-20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);
}

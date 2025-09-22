import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-3xl relative flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 rounded-2xl">
          <h2 className="text-xl font-semibold px-6 py-5">{title}</h2>
          <div className="border-b-[3px] border-[#4F06C4]" />
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="overflow-y-auto p-6 modal-scroll" style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

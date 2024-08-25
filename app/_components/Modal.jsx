// components/Modal.js
import React from 'react';
import { Dialog } from '@headlessui/react';

const Modal = ({ isOpen, onClose, children }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">

        <div className="bg-white rounded-lg p-4 max-w-md w-full">{children}</div>
      </div>
    </Dialog>
  );
};

export default Modal;

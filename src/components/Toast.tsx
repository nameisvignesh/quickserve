import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="toast show" style={{ zIndex: 120 }}>
      <span>
        <Check size={12} />
      </span>
      <span>{message}</span>
    </div>
  );
};

import React, { useEffect } from 'react';

type AlertProps = {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  className?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  timeout?: number;
};

const Alert = ({ variant = 'primary', className = '', children, onDismiss, timeout }: AlertProps) => {
  const variantClass = `alert-${variant}`;
  const fullClass = ['alert', variantClass, className].filter(Boolean).join(' ');

  useEffect(() => {
    if (timeout && onDismiss) {
      const timer = setTimeout(onDismiss, timeout);
      return () => clearTimeout(timer);
    }
  }, [timeout, onDismiss]);

  return (
    <div className={`${fullClass} flex items-center`}>
      <div className="flex-grow">{children}</div>
      {onDismiss && (
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={onDismiss}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;

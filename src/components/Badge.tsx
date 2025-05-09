import React from 'react';

type BadgeProps = {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  className?: string;
  children: React.ReactNode;
};

const Badge = ({ variant = 'primary', className = '', children }: BadgeProps) => {
  const variantClass = `badge-${variant}`;
  const fullClass = ['badge', variantClass, className].filter(Boolean).join(' ');

  return <span className={fullClass}>{children}</span>;
};

export default Badge;

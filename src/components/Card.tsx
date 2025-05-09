import React, { ReactNode } from 'react';

type CardProps = {
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
};

type CardHeaderProps = CardProps & {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'light' | 'dark';
};
type CardFooterProps = CardProps & {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'light' | 'dark';
};

const Card = ({ className = '', style, children }: CardProps) => (
  <div className={`rounded-lg shadow-md bg-white ${className}`} style={style}>
    {children}
  </div>
);

const CardHeader = ({ className = '', style, children, variant = 'dark' }: CardHeaderProps) => (
  <div
    className={`p-4 rounded-t-lg border-b bg-${variant}-50 ${className}`}
    style={style}
  >
    {children}
  </div>
);

const CardBody = ({ className = '', style, children }: CardProps) => (
  <div className={`p-4 ${className}`} style={style}>
    {children}
  </div>
);

const CardFooter = ({ className = '', style, variant = 'dark', children }: CardProps) => (
  <div className={`p-4 border-t bg-${variant}-50 ${className}`} style={style}>
    {children}
  </div>
);

const CardTitle = ({ className = '', style, children }: CardProps) => (
  <h3 className={`text-lg font-bold ${className}`} style={style}>
    {children}
  </h3>
);

const CardText = ({ className = '', style, children }: CardProps) => (
  <p className={`text-sm text-gray-600 ${className}`} style={style}>
    {children}
  </p>
);

const CardOverlay = ({ className = '', style, children }: CardProps) => (
  <div className={`absolute inset-0 bg-black bg-opacity-50 ${className}`} style={style}>
    {children}
  </div>
);

CardOverlay.Title = CardTitle;
CardOverlay.Text = CardText;
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
import React from "react";

type ButtonGroupProps = {
  children: React.ReactNode;
  className?: string;
};

const ButtonGroup = ({ children, className = "" }: ButtonGroupProps) => {
  const groupClass = ["btn-group", className].filter(Boolean).join(" ");

  return <div className={groupClass} style={{ display: 'flex', gap: '0', borderRadius: '0' }}>{children}</div>;
};

export default ButtonGroup;

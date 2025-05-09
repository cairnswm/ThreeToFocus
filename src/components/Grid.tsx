import React from "react";

interface GridProps {
  children: React.ReactNode;
  className?: string;
}

function Grid({ children, className = "" }: GridProps) {
  return <div className={`flex flex-wrap ${className}`}>{children}</div>;
}

export default Grid;

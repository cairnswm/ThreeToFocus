import React from "react";

interface ColProps {
  children: React.ReactNode;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  className?: string;
}

function Col({ children, xs, sm, md, lg, xl, className = "" }: ColProps) {
  const getColSpanClass = (size?: number, prefix: string = "") =>
    size ? `${prefix}col-span-${size}` : "";

  const classes = [
    "flex",
    "flex-col",
    getColSpanClass(xs),
    getColSpanClass(sm, "sm:"),
    getColSpanClass(md, "md:"),
    getColSpanClass(lg, "lg:"),
    getColSpanClass(xl, "xl:"),
    "p-2",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}

export default Col;

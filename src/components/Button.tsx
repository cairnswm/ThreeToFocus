import React, { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

type ButtonProps = {
  variant?: string;
  size?: "sm" | "lg";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  href?: string;
  to?: string;
};

const Button = ({
  variant = "primary",
  size,
  type = "button",
  disabled = false,
  className = "",
  style = {},
  children,
  onClick,
  href,
  to,
}: ButtonProps) => {
  const navigate = useNavigate();
  const variantClass = `btn-${variant}`;
  const sizeClass = size ? `btn-${size}` : "";
  const disabledClass = disabled ? "btn-disabled" : "";

  const fullClass = ["btn", variantClass, sizeClass, disabledClass, className]
    .filter(Boolean)
    .join(" ");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (disabled) return;
    if (href) {
      navigate(href);
    } else if (to) {
      navigate(to);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={fullClass}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;

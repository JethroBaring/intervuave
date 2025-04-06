import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  ref?: any;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  desc = "",
  ref,
}) => {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
      ref={ref}
    >
      {children}
    </div>
  );
};

export default Card;

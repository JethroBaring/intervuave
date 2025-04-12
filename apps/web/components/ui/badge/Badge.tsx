import React from "react";

type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark"
  | "draft"
  | "pending"
  | "submitted"
  | "processing"
  | "evaluated"
  | "aiApproved"
  | "aiRejected"
  | "finalApproved"
  | "finalRejected"
  | "expired";

interface BadgeProps {
  variant?: BadgeVariant; // Light or solid variant
  size?: BadgeSize; // Badge size
  color?: BadgeColor; // Badge color
  startIcon?: React.ReactNode; // Icon at the start
  endIcon?: React.ReactNode; // Icon at the end
  children: React.ReactNode; // Badge content
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium";

  const sizeStyles = {
    sm: "text-theme-xs",
    md: "text-sm",
  };

  const variants = {
    light: {
      primary: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
      success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
      error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
      warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
      info: "bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500",
      light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
      dark: "bg-gray-500 text-white dark:bg-white/5 dark:text-white",
      draft: "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white/80",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300",
      submitted: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
      processing: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
      evaluated: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
      aiApproved: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
      aiRejected: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
      finalApproved: "bg-green-200 text-green-800 dark:bg-green-500/30 dark:text-green-300",
      finalRejected: "bg-rose-200 text-rose-800 dark:bg-rose-500/30 dark:text-rose-300",
      expired: "bg-amber-200 text-amber-800 dark:bg-amber-500/30 dark:text-amber-300",
    },
    solid: {
      primary: "bg-brand-500 text-white dark:text-white",
      success: "bg-success-500 text-white dark:text-white",
      error: "bg-error-500 text-white dark:text-white",
      warning: "bg-warning-500 text-white dark:text-white",
      info: "bg-blue-light-500 text-white dark:text-white",
      light: "bg-gray-400 dark:bg-white/5 text-white dark:text-white/80",
      dark: "bg-gray-700 text-white dark:text-white",
      draft: "bg-gray-700 text-white",
      pending: "bg-yellow-500 text-white",
      submitted: "bg-blue-500 text-white",
      processing: "bg-purple-500 text-white",
      evaluated: "bg-green-500 text-white",
      aiApproved: "bg-teal-500 text-white",
      aiRejected: "bg-red-500 text-white",
      finalApproved: "bg-green-600 text-white",
      finalRejected: "bg-rose-600 text-white",
      expired: "bg-amber-600 text-white",
    },
  };

  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;

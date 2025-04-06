"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface FloatingDropdownProps {
  anchorRef: React.RefObject<HTMLElement>;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const FloatingDropdown: React.FC<FloatingDropdownProps> = ({
  anchorRef,
  isOpen,
  onClose,
  children,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        top: rect.bottom + window.scrollY + 8, // 8px space
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen, anchorRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !anchorRef.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="z-50 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-xl"
      style={{
        position: "absolute",
        top: style.top,
        left: style.left,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export default FloatingDropdown;

"use client";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../dropdown/DropdownItem";
import React, { useState } from "react";
import { Dropdown } from "../dropdown/Dropdown";

interface CardWithActionsProps {
  title: string;
  children: React.ReactNode;
  onClick: any;
  onEdit: any;
  onDelete: any;
}

const CardWithActions: React.FC<CardWithActionsProps> = ({
  title,
  children,
  onClick,
  onEdit,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div
      onClick={onClick}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 flex flex-col cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <div className="relative inline-block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown();
            }}
            className="dropdown-toggle"
          >
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              tag="button"
              onItemClick={() => {
                closeDropdown();
                onEdit();
              }}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Edit
            </DropdownItem>
            <DropdownItem
              tag="button"
              onItemClick={() => {
                closeDropdown();
                onDelete();
              }}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      {children}
    </div>
  );
};

export default CardWithActions;

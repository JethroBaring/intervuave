"use client";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../dropdown/DropdownItem";
import React, { useState } from "react";

interface CardWithActionsProps {
  id: string;
  title: string;
  view: any;
  edit: any;
  deleteQuestion: any;
  isView?: boolean;
}

const QuestionCard: React.FC<CardWithActionsProps> = ({
  id,
  title,
  view,
  edit,
  deleteQuestion,
  isView = false,
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
      className="overflow-visible rounded-xl border border-gray-200 bg-white px-6 p-3 dark:border-gray-800 dark:bg-white/[0.03] flex flex-col cursor-pointer"
      onClick={view}
      key={id}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
        </div>
        <div className="relative flex items-center justify-center">
          {!isView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown();
              }}
              className="dropdown-toggle"
            >
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
          )}
          {isOpen && (
            <div
              className="absolute right-0 top-full mt-2 z-50 w-40 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownItem
                onItemClick={() => {
                  edit(id);
                  closeDropdown();
                }}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Edit
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  deleteQuestion(id);
                  closeDropdown();
                }}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Delete
              </DropdownItem>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;

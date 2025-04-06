"use client";

import React, { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import CardWithActions from "../common/CardWithActions";
import { Percent, PuzzleIcon } from "lucide-react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";

interface TemplatesProps {}

const Templates: React.FC<TemplatesProps> = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const header = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Manage Templates
      </h3>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative">
          <button className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                fill="currentColor"
              ></path>
            </svg>
          </button>
          <input
            placeholder="Search..."
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-3.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
            type="text"
          />
        </div>
        <button
          onClick={openModal}
          className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 sm:w-auto"
        >
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.2502 4.99951C9.2502 4.5853 9.58599 4.24951 10.0002 4.24951C10.4144 4.24951 10.7502 4.5853 10.7502 4.99951V9.24971H15.0006C15.4148 9.24971 15.7506 9.5855 15.7506 9.99971C15.7506 10.4139 15.4148 10.7497 15.0006 10.7497H10.7502V15.0001C10.7502 15.4143 10.4144 15.7501 10.0002 15.7501C9.58599 15.7501 9.2502 15.4143 9.2502 15.0001V10.7497H5C4.58579 10.7497 4.25 10.4139 4.25 9.99971C4.25 9.5855 4.58579 9.24971 5 9.24971H9.2502V4.99951Z"
              fill=""
            ></path>
          </svg>
          New Interview Template
        </button>
      </div>
    </div>
  );
  return (
    <>
      <ComponentCard header={header}>
        <div className="grid grid-cols-4 gap-6">
          <CardWithActions title="Culture Fit Template">
            <div className="flex flex-col mt-1 gap-2">
              <div className="flex gap-2 items-center">
                <PuzzleIcon className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm"> Culture Fit Template</h4>
              </div>
              <h4 className="text-sm">Metrics used: Default</h4>
              <h4 className="text-sm">Questions: 12</h4>
              <h4 className="text-sm">Used in: 2 roles</h4>
            </div>
          </CardWithActions>
        </div>
      </ComponentCard>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create interview template
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create a question set with customizable metrics to evaluate
              candidates based on your culture and values. You can reuse this
              across multiple roles.
            </p>
          </div>
          <div className="h-[650px] no-scrollbar flex-auto overflow-scroll">
            <form className="flex flex-col gap-6">
              <div className="px-2 overflow-y-auto custom-scrollbar">
                <div>
                  <Label>Name</Label>
                  <Input value="Hello world" />
                </div>
              </div>
              <div className="px-2 flex flex-col gap-3">
                <div>
                  <Label className="text-base">Metric Weights</Label>
                  <Label>
                    Adjust the importance of each metric. Total should equal
                    100%.
                  </Label>
                </div>
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label className="m-0">Speech Clarity</Label>
                    <div className="relative w-[70px]">
                      <Input
                        className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        min="10"
                        max="50"
                      />
                      <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    className="accent-brand-500"
                  />
                </div>
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label className="m-0">Speech Clarity</Label>
                    <div className="relative w-[70px]">
                      <Input
                        className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        min="10"
                        max="50"
                      />
                      <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    className="accent-brand-500"
                  />
                </div>
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label className="m-0">Speech Clarity</Label>
                    <div className="relative w-[70px]">
                      <Input
                        className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        min="10"
                        max="50"
                      />
                      <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    className="accent-brand-500"
                  />
                </div>
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label className="m-0">Speech Clarity</Label>
                    <div className="relative w-[70px]">
                      <Input
                        className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        min="10"
                        max="50"
                      />
                      <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    className="accent-brand-500"
                  />
                </div>
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label className="m-0">Speech Clarity</Label>
                    <div className="relative w-[70px]">
                      <Input
                        className="pr-8 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        min="10"
                        max="50"
                      />
                      <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    className="accent-brand-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => {}}>
                  Create template
                </Button>
              </div>
              <div className="flex items-center gap-3 px-2 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => {}}>
                  Create template
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Templates;

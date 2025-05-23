"use client";
import ComponentCard from "../ui/common/ComponentCard";
import RoleCard from "./RoleCard";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks-test/useModal";
import Label from "../ui/form/Label";
import Input from "../ui/form/input/InputField";
import Button from "../ui/button/Button";
import Select from "../ui/form/Select";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { usePagesDataStore } from "@/stores-test/pagesDataStore";
import { useShallow } from "zustand/shallow";
import { useToastStore } from "@/stores-test/toastStore";
import { useRoleForm } from "@/hooks-test/useRoleForm";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { useRoleStore } from "@/stores/useRoleStore";

interface RolesProps {}

const Roles: React.FC<RolesProps> = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const { roles, templates } = useCompanyStore(
    useShallow((state) => ({
      roles: state.roles,
      templates: state.templates,
    }))
  );

  const {
    selectedRole,

    addRole,
    editRole,
    deleteRole,

    setSelectedRole,

    // UI
    isNewRoleModalOpen,
    openNewRoleModal,

    isViewRoleModalOpen,
    openViewRoleModal,

    isEditRoleModalOpen,
    openEditRoleModal,
    closeRoleModal,

    isWarningModalOpen,
    openWarningModal,
    closeWarningModal,
    reset,
  } = useRoleStore();

  const { role, setRole, resetForm } = useRoleForm(selectedRole);

  const header = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Manage Roles
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
          New Role
        </button>
      </div>
    </div>
  );

  return (
    <ComponentCard header={header}>
      <div className="grid grid-cols-4 gap-6">
        {roles.map((role) => (
          <RoleCard
            role={role}
            key={role.id}
            onClick={() => {
              setSelectedRole(role);
              openViewRoleModal();
            }}
            onEdit={() => {
              setSelectedRole(role);
              openEditRoleModal();
            }}
            onDelete={() => {
              openWarningModal();
              setSelectedRole(role);
            }}
          />
        ))}
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create Role
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Define the job position you're hiring for and link it to an
              interview template. You can also specify the preferred voice for
              your AI interviewer.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div>
                <Label>Name</Label>
                <Input
                  value={role.title}
                  onChange={(e) =>
                    setRole((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div>
                <Label>Interview Template</Label>
                <div className="relative">
                  <Select
                    className="pr-8"
                    options={templates
                      .filter((template) => template.id !== undefined)
                      .map((template) => ({
                        value: template.id as string,
                        label: template.name,
                      }))}
                    onChange={(value) =>
                      setRole((prev) => ({
                        ...prev,
                        interviewTemplateId: value,
                      }))
                    }
                  />
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div>
                <Label>Interviewer Voice</Label>
                <div className="relative">
                  <Select
                    className="pr-8"
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                    ]}
                    onChange={() => {}}
                    // onChange={(value) =>
                    //   setDraftSelectedInterviewerVoice(value)
                    // }
                  />
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  addRole({ ...role, companyId: "cm8l7il910007vgi8ano9wwz1" });
                  resetForm();
                  closeModal();
                }}
                disabled={!role.title || !role.interviewTemplateId}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isViewRoleModalOpen || isEditRoleModalOpen}
        onClose={closeRoleModal}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {isViewRoleModalOpen ? "View" : "Edit"} Role
            </h4>
          </div>
          <div className="flex flex-col gap-6">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div>
                <Label>Name</Label>
                <Input
                  value={role.title}
                  onChange={(e) =>
                    setRole((prev) => ({ ...prev, title: e.target.value }))
                  }
                  disabled={isViewRoleModalOpen}
                />
              </div>
            </div>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div>
                <Label>Interview Template</Label>
                <div className="relative">
                  <Select
                    className="pr-8"
                    options={templates
                      .filter((template) => template.id !== undefined)
                      .map((template) => ({
                        value: template.id as string,
                        label: template.name,
                      }))}
                    onChange={(value) =>
                      setRole((prev) => ({
                        ...prev,
                        interviewTemplateId: value,
                      }))
                    }
                    defaultValue={selectedRole?.interviewTemplateId}
                    disabled={isViewRoleModalOpen}
                  />
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div>
                <Label>Interviewer Voice</Label>
                <div className="relative">
                  <Select
                    className="pr-8"
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                    ]}
                    onChange={() => {}}
                    // onChange={(value) =>
                    //   setDraftSelectedInterviewerVoice(value)
                    // }
                    disabled={isViewRoleModalOpen}
                  />
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeRoleModal}>
                Close
              </Button>
              {isEditRoleModalOpen && (
                <Button
                  size="sm"
                  onClick={() => {
                    editRole({title: role.title, interviewTemplateId: role.interviewTemplateId});
                    resetForm();
                    closeModal();
                  }}
                  disabled={!role.title || !role.interviewTemplateId}
                >
                  Update
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isWarningModalOpen}
        onClose={closeWarningModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <div className="relative flex items-center justify-center z-1 mb-7">
            <svg
              className="fill-error-50 dark:fill-error-500/15"
              width="90"
              height="90"
              viewBox="0 0 90 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
                fill=""
                fillOpacity=""
              />
            </svg>

            <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <svg
                className="fill-error-600 dark:fill-error-500"
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.62684 11.7496C9.04105 11.1638 9.04105 10.2141 9.62684 9.6283C10.2126 9.04252 11.1624 9.04252 11.7482 9.6283L18.9985 16.8786L26.2485 9.62851C26.8343 9.04273 27.7841 9.04273 28.3699 9.62851C28.9556 10.2143 28.9556 11.164 28.3699 11.7498L21.1198 18.9999L28.3699 26.25C28.9556 26.8358 28.9556 27.7855 28.3699 28.3713C27.7841 28.9571 26.8343 28.9571 26.2485 28.3713L18.9985 21.1212L11.7482 28.3715C11.1624 28.9573 10.2126 28.9573 9.62684 28.3715C9.04105 27.7857 9.04105 26.836 9.62684 26.2502L16.8771 18.9999L9.62684 11.7496Z"
                  fill=""
                />
              </svg>
            </span>
          </div>

          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
            Danger Alert!
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            This action will permanently delete the role and all interviews with
            it. This cannot be undone.
          </p>

          <div className="flex items-center justify-center w-full gap-3 mt-7">
            <button
              type="button"
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
              onClick={deleteRole}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </ComponentCard>
  );
};

export default Roles;

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Pencil, Trash2 } from "lucide-react";
import { useToastStore } from "@/stores/useToastStore";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/lib/axios";
import { endpoints } from "@/lib/endpoint";
import { useCompanyStore } from "@/stores/useCompanyStore";
import PageBreadcrumb from "@/components/ui/common/PageBreadCrumb";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/ui/form/input/InputField";
import Label from "@/components/ui/form/Label";
import ComponentCard from "@/components/ui/common/ComponentCard";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const Candidates = () => {
  const companyId = useAuthStore((state) => state.user?.companyId);
  const showToast = useToastStore((state) => state.showToast);
  const candidates = useCompanyStore((state) => state.candidates) as Candidate[];
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState<Candidate | null>(null);
  const [editedCandidate, setEditedCandidate] = useState<Partial<Candidate>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState<Partial<Candidate>>({
    firstName: "",
    lastName: "",
    email: "",
  });

  const filteredCandidates = candidates.filter((candidate) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      candidate.firstName.toLowerCase().includes(searchLower) ||
      candidate.lastName.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (candidateId: string) => {
    try {
      await api.delete(endpoints.candidates.delete(companyId!, candidateId));
      useCompanyStore.setState((state) => ({
        ...state,
        candidates: state.candidates.filter((c) => c.id !== candidateId),
      }));
      useCompanyStore.setState((state) => ({
        ...state,
        interviews: state.interviews.filter((i) => i.candidateId !== candidateId),
      }));
      showToast({
        title: "Candidate Deleted",
        message: "The new candidate was successfully deleted.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to delete candidate:", error);
      showToast({
        title: "Error deleting candidate",
        message: "There's an error deleting the candidate. Please try again.",
        type: "error",
      });
    }
  };

  const handleEdit = (candidate: Candidate) => {
    setCandidateToEdit(candidate);
    setEditedCandidate({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await api.patch(
        endpoints.candidates.update(companyId!, candidateToEdit!.id),
        editedCandidate
      );
      useCompanyStore.setState((state) => ({
        ...state,
        candidates: state.candidates.map((c) => c.id === candidateToEdit!.id ? { ...c, ...editedCandidate } : c),
      }));
      useCompanyStore.setState((state) => ({
        ...state,
        interviews: state.interviews.map((i) => i.candidateId === candidateToEdit!.id ? { ...i, candidate: { ...i.candidate, ...editedCandidate } } : i),
      }))
      showToast({
        title: "Candidate Updated",
        message: "The candidate has been successfuly updated.",
        type: "success",
      });
      setIsEditModalOpen(false);
    } catch (error) {
      showToast({
        title: "Error updating candidate",
        message: "There's an error updating the candidate. Please try again.",
        type: "error",
      });
    }
  };

  const handleAdd = () => {
    setIsAddModalOpen(true);
    setNewCandidate({
      firstName: "",
      lastName: "",
      email: "",
    });
  };

  const handleAddSubmit = async () => {
    try {
      // The actual API call will be implemented by you
      const response = await api.post(
        endpoints.candidates.create(companyId),
        newCandidate
      );
      
      // Assuming the API returns the created candidate with an ID
      const createdCandidate = response.data;
      
      useCompanyStore.setState((state) => ({
        ...state,
        candidates: [...state.candidates, createdCandidate],
      }));
      
      setIsAddModalOpen(false);
      showToast({
        title: "Candidate Created",
        message: "The new candidate has been successfully created.",
        type: "success",
      });
    } catch (error) {
      showToast({
        title: "Error creating candidate",
        message: "There's an error creating the candidate. Please try again.",
        type: "error",
      });
    }
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dark:bg-dark-900 h-11 w-full rounded-xl border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-3.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
            type="text"
          />
        </div>
        <button
          // onClick={openn}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium text-white rounded-xl bg-brand-500 shadow-theme-xs hover:bg-brand-600 sm:w-auto"
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
          New Candidate
        </button>
      </div>
    </div>
  );

  return (
    <div className="text-gray-500 dark:text-gray-400">
      <PageBreadcrumb pageTitle="Candidates" />
      <ComponentCard header={header}>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            {filteredCandidates.length === 0 ? (
              candidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-6">
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 120 120"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-gray-300 dark:text-gray-600"
                    >
                      <path
                        d="M60 0C26.8629 0 0 26.8629 0 60C0 93.1371 26.8629 120 60 120C93.1371 120 120 93.1371 120 60C120 26.8629 93.1371 0 60 0ZM60 110C32.3862 110 10 87.6138 10 60C10 32.3862 32.3862 10 60 10C87.6138 10 110 32.3862 110 60C110 87.6138 87.6138 110 60 110Z"
                        fill="currentColor"
                      />
                      <path
                        d="M60 20C38.9543 20 22 36.9543 22 58C22 79.0457 38.9543 96 60 96C81.0457 96 98 79.0457 98 58C98 36.9543 81.0457 20 60 20ZM60 86C43.4315 86 30 72.5685 30 56C30 39.4315 43.4315 26 60 26C76.5685 26 90 39.4315 90 56C90 72.5685 76.5685 86 60 86Z"
                        fill="currentColor"
                      />
                      <path
                        d="M60 40C47.8497 40 38 49.8497 38 62C38 74.1503 47.8497 84 60 84C72.1503 84 82 74.1503 82 62C82 49.8497 72.1503 40 60 40ZM60 74C53.3726 74 48 68.6274 48 62C48 55.3726 53.3726 50 60 50C66.6274 50 72 55.3726 72 62C72 68.6274 66.6274 74 60 74Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                    No candidates yet
                  </h3>
                  <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                    Start building your candidate pool by adding candidates to evaluate for your open positions.
                  </p>
                  <button
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-xl bg-brand-500 shadow-theme-xs hover:bg-brand-600"
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
                      />
                    </svg>
                    Add New Candidate
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-6">
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 120 120"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-gray-300 dark:text-gray-600"
                    >
                      <path
                        d="M113.1 99.2L93.6 79.6C99.9 71.2 103.5 60.5 103.5 48.9C103.5 22.3 82 0.7 55.4 0.7C28.8 0.7 7.3 22.3 7.3 48.9C7.3 75.5 28.8 97.1 55.4 97.1C67 97.1 77.7 93.5 86.1 87.2L105.6 106.8C106.8 108 108.3 108.6 109.9 108.6C111.5 108.6 113 108 114.2 106.8C116.6 104.3 116.6 101 113.1 99.2Z"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                      />
                      <path
                        d="M55.4 18.2C38.6 18.2 24.8 32 24.8 48.8C24.8 65.6 38.6 79.4 55.4 79.4C72.2 79.4 86 65.6 86 48.8C86 32 72.3 18.2 55.4 18.2Z"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                    No matches found
                  </h3>
                  <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                    No candidates match your search query "{searchQuery}". Try different keywords or clear your search.
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-xl bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="fill-current"
                    >
                      <path
                        d="M9.2502 4.99951C9.2502 4.5853 9.58599 4.24951 10.0002 4.24951C10.4144 4.24951 10.7502 4.5853 10.7502 4.99951V9.24971H15.0006C15.4148 9.24971 15.7506 9.5855 15.7506 9.99971C15.7506 10.4139 15.4148 10.7497 15.0006 10.7497H10.7502V15.0001C10.7502 15.4143 10.4144 15.7501 10.0002 15.7501C9.58599 15.7501 9.2502 15.4143 9.2502 15.0001V10.7497H5C4.58579 10.7497 4.25 10.4139 4.25 9.99971C4.25 9.5855 4.58579 9.24971 5 9.24971H9.2502V4.99951Z"
                        fill=""
                        transform="rotate(45 10 10)"
                      />
                    </svg>
                    Clear Search
                  </button>
                </div>
              )
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Email
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Created At
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {candidate.firstName} {candidate.lastName}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {candidate.email}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={candidate.deletedAt === null ? "success" : "error"}
                        >
                          {candidate.deletedAt === null ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(candidate)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => {
                              setIsDeleteModalOpen(true);
                              setCandidateToDelete(candidate);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
      </ComponentCard>

      {isDeleteModalOpen && candidateToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
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
              This action will permanently delete {candidateToDelete.firstName} {candidateToDelete.lastName} and all associated data. This cannot be undone.
            </p>

            <div className="flex items-center justify-center w-full gap-3 mt-7">
              <button
                type="button"
                className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
                onClick={() => {
                  handleDelete(candidateToDelete.id);
                  setIsDeleteModalOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
      {isEditModalOpen && candidateToEdit && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          className="max-w-[700px] m-4"
        >
          <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Edit Candidate
              </h4>
            </div>
            <div className="flex flex-col gap-6">
              <div className="px-2 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={editedCandidate.firstName}
                      onChange={(e) =>
                        setEditedCandidate((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={editedCandidate.lastName}
                      onChange={(e) =>
                        setEditedCandidate((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Email</Label>
                    <Input
                      value={editedCandidate.email}
                      onChange={(e) =>
                        setEditedCandidate((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 lg:justify-end">
                <Button size="sm" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Close
                </Button>
                <Button size="sm" onClick={handleUpdate}>
                  Update
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          className="max-w-[700px] m-4"
        >
          <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Add New Candidate
              </h4>
            </div>
            <div className="flex flex-col gap-6">
              <div className="px-2 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={newCandidate.firstName}
                      onChange={(e) =>
                        setNewCandidate((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={newCandidate.lastName}
                      onChange={(e) =>
                        setNewCandidate((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Email</Label>
                    <Input
                      value={newCandidate.email}
                      onChange={(e) =>
                        setNewCandidate((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 lg:justify-end">
                <Button size="sm" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Close
                </Button>
                <Button size="sm" onClick={handleAddSubmit}>
                  Add Candidate
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Candidates;

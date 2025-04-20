"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks-test/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../ui/form/input/InputField";
import Label from "../ui/form/Label";
import Image from "next/image";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCompanyProfileStore } from "@/stores/useCompanyProfileStore";
import { useToastStore } from "@/stores/useToastStore";
import { generateColorFromName } from "@/lib/avatar-color";

export default function IdentityCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const companyName = useCompanyStore((state) => state.name);
  const [draftCompanyName, setDraftCompanyName] = useState(companyName);
  const email = useAuthStore((state) => state.user?.email);
  const updateToBackend = useCompanyProfileStore(
    (state) => state.updateToBackend
  );
  const companyId = useCompanyStore((state) => state.companyId);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    if (isOpen) {
      setDraftCompanyName(companyName);
    }
  }, [isOpen, companyName]);

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div
              className={`w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center text-3xl font-bold ${generateColorFromName(
                companyName
              )}`}
            >
              {companyName
                .split(" ")
                .map((data) => data.charAt(0).toUpperCase())
                .join("")}
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {companyName}
              </h4>
              <h4 className="text-center text-gray-800 dark:text-white/50 xl:text-left">
                {email}
              </h4>
              {/* <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Team Manager
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Arizona, United States
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Company Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="custom-scrollbar overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2">
                  <Label>Company Name</Label>
                  <Input
                    type="text"
                    value={draftCompanyName}
                    onChange={(e) => setDraftCompanyName(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  await updateToBackend(companyId, { name: draftCompanyName });
                  showToast({
                    type: "success",
                    message: "Culture updated successfully",
                    title: "Success",
                  });
                  closeModal();
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

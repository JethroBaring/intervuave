import { Role } from "@/lib/types";
import { create } from "zustand";
import { usePagesDataStore } from "./pagesDataStore";
import api from "@/lib/axios";
import { useToastStore } from "./toastStore";
import { endpoints } from "@/lib/endpoint";
import { useAuthStore } from "./authStore";

interface RoleStore {
  selectedRole: Role | null;

  addRole: (data: Role) => Promise<void>;
  editRole: (data: Role) => Promise<void>;
  deleteRole: () => Promise<void>;

  setSelectedRole: (role: Role | null) => void;

  // UI
  isNewRoleModalOpen: boolean;
  openNewRoleModal: () => void;

  isViewRoleModalOpen: boolean;
  openViewRoleModal: () => void;

  isEditRoleModalOpen: boolean;
  openEditRoleModal: () => void;
  closeRoleModal: () => void;

  isWarningModalOpen: boolean;
  openWarningModal: () => void;
  closeWarningModal: () => void;
  reset: () => void;
}

export const useRoleStore = create<RoleStore>((set, get) => ({
  selectedRole: null,

  setSelectedRole: (role) => set({ selectedRole: role }),

  addRole: async (data) => {
    const companyId = useAuthStore.getState().user.companyId;
    try {
      const res = await api.post(`${endpoints.roles.create(companyId)}`, data);
      console.log("Role created:", res.data);
      set({ isNewRoleModalOpen: false });
      usePagesDataStore.setState((state) => ({
        roles: [...state.roles, res.data],
      }));
      useToastStore.getState().showToast({
        title: "Role Created",
        message: "The new interview Role was successfully created.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to create Role", error);
    }
  },

  editRole: async (data) => {
    const role = get().selectedRole;
    if (!role) return;
    try {
      const companyId = useAuthStore.getState().user.companyId;
      const res = await api.patch(
        `${endpoints.roles.update(companyId, role.id!)}`,
        data
      );
      console.log("Role updated:", res.data);
      set({ selectedRole: res.data });
      usePagesDataStore.setState((state) => ({
        roles: state.roles.map((role) =>
          role.id === res.data.id ? res.data : role
        ),
      }));
      set({ isEditRoleModalOpen: false, selectedRole: null });
      useToastStore.getState().showToast({
        title: "Role Updated",
        message: "The interview Role has been successfully updated.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update Role", error);
    }
  },

  deleteRole: async () => {
    const role = get().selectedRole;
    console.log(role?.id)
    if (!role) return;
    try {
      const companyId = useAuthStore.getState().user.companyId;
      await api.delete(`${endpoints.roles.delete(companyId, role.id!)}`);
      console.log("Role deleted");
      set({ selectedRole: null, isWarningModalOpen: false });
      usePagesDataStore.setState((state) => ({
        roles: state.roles.filter((data) => data.id !== role.id),
      }));
      useToastStore.getState().showToast({
        title: "Role Deleted",
        message: "The new interview Role was successfully created.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to delete Role", error);
    }
  },

  // UI state
  isNewRoleModalOpen: false,
  openNewRoleModal: () => set({ isNewRoleModalOpen: true }),

  isViewRoleModalOpen: false,
  openViewRoleModal: () => set({ isViewRoleModalOpen: true }),

  isEditRoleModalOpen: false,
  openEditRoleModal: () => set({ isEditRoleModalOpen: true }),

  closeRoleModal: () =>
    set({
      isNewRoleModalOpen: false,
      isViewRoleModalOpen: false,
      isEditRoleModalOpen: false,
    }),

  isWarningModalOpen: false,
  openWarningModal: () => set({ isWarningModalOpen: true }),
  closeWarningModal: () => set({ isWarningModalOpen: false }),
  reset: () => {},
}));

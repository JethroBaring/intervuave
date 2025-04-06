import { create } from "zustand";

export type KanbanStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "processing"
  | "evaluated"
  | "expired";

export interface CandidateCard {
  id: string;
  fullName: string;
  role: string;
  status: KanbanStatus;
  cultureFit?: number;
  aiDecision?: "approved" | "rejected";
  finalDecision?: "approved" | "rejected";
}

interface KanbanColumn {
  key: KanbanStatus;
  label: string;
  systemLocked?: boolean;
}

interface KanbanState {
  columns: KanbanColumn[];
  items: Record<KanbanStatus, CandidateCard[]>;
  setItems: (status: KanbanStatus, items: CandidateCard[]) => void;
  moveItem: (id: string, from: KanbanStatus, to: KanbanStatus) => void;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  columns: [
    { key: "pending", label: "Pending" },
    { key: "in_progress", label: "In Progress", systemLocked: true },
    { key: "completed", label: "Completed", systemLocked: true },
    { key: "processing", label: "Processing", systemLocked: true },
    { key: "evaluated", label: "Evaluated" },
    { key: "expired", label: "Expired" },
  ],
  items: {
    pending: [],
    in_progress: [],
    completed: [],
    processing: [],
    evaluated: [],
    expired: [],
  },
  setItems: (status, items) => {
    set((state) => ({
      items: {
        ...state.items,
        [status]: items,
      },
    }));
  },
  moveItem: (id, from, to) => {
    const state = get();
    const item = state.items[from].find((i) => i.id === id);
    if (!item) return;

    set({
      items: {
        ...state.items,
        [from]: state.items[from].filter((i) => i.id !== id),
        [to]: [...state.items[to], { ...item, status: to }],
      },
    });
  },
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, TaskStatus } from "@/lib/types/task";

interface TaskStats {
  pending: number;
  inProgress: number;
  completed: number;
  rejected: number;
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByUser: (userId: string) => Task[];
  getTasksByRole: (role: string) => Task[];
  approveTask: (id: string, userId: string, userName: string, comment?: string) => void;
  rejectTask: (id: string, userId: string, userName: string, comment?: string) => void;
  reassignTask: (id: string, newUserId: string, newUserName: string, newUserEmail: string, comment?: string) => void;
  getStats: () => TaskStats;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task]
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id)
        })),

      getTask: (id) => {
        return get().tasks.find((t) => t.id === id);
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter((t) => t.status === status);
      },

      getTasksByUser: (userId) => {
        return get().tasks.filter((t) => t.assignedUserId === userId);
      },

      getTasksByRole: (role) => {
        return get().tasks.filter((t) => t.requiredRole === role);
      },

      approveTask: (id, userId, userName, comment) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "COMPLETED" as TaskStatus,
                  completedAt: new Date().toISOString(),
                  completedByUserId: userId,
                  completedByUserName: userName,
                  metadata: {
                    ...t.metadata,
                    comment,
                    action: "APPROVED"
                  }
                }
              : t
          )
        })),

      rejectTask: (id, userId, userName, comment) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "REJECTED" as TaskStatus,
                  completedAt: new Date().toISOString(),
                  completedByUserId: userId,
                  completedByUserName: userName,
                  metadata: {
                    ...t.metadata,
                    comment,
                    action: "REJECTED"
                  }
                }
              : t
          )
        })),

      reassignTask: (id, newUserId, newUserName, newUserEmail, comment) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  assignedUserId: newUserId,
                  assignedUserName: newUserName,
                  assignedUserEmail: newUserEmail,
                  status: "PENDING" as TaskStatus,
                  updatedAt: new Date().toISOString(),
                  metadata: {
                    ...t.metadata,
                    reassignmentComment: comment,
                    previousAssignee: t.assignedUserName
                  }
                }
              : t
          )
        })),

      getStats: () => {
        const tasks = get().tasks;
        return {
          pending: tasks.filter((t) => t.status === "PENDING").length,
          inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
          completed: tasks.filter((t) => t.status === "COMPLETED").length,
          rejected: tasks.filter((t) => t.status === "REJECTED").length
        };
      },

      clearTasks: () => set({ tasks: [] })
    }),
    {
      name: "task-storage"
    }
  )
);

import { create } from "zustand";
import type { WorkflowRunState, WorkflowValidationResult } from "../types/workflow";

interface WorkflowBuilderStore {
  selectedNodeId?: string;
  selectedEdgeId?: string;
  validation?: WorkflowValidationResult;
  runState?: WorkflowRunState;
  activePanel: "config" | "run" | "agent";
  setSelectedNode: (nodeId?: string) => void;
  setSelectedEdge: (edgeId?: string) => void;
  setValidation: (validation?: WorkflowValidationResult) => void;
  setRunState: (runState?: WorkflowRunState) => void;
  setActivePanel: (activePanel: "config" | "run" | "agent") => void;
}

export const useWorkflowBuilderStore = create<WorkflowBuilderStore>((set) => ({
  activePanel: "config",
  setSelectedNode: (selectedNodeId) => set({ selectedNodeId, selectedEdgeId: undefined, activePanel: "config" }),
  setSelectedEdge: (selectedEdgeId) => set({ selectedEdgeId, selectedNodeId: undefined, activePanel: "config" }),
  setValidation: (validation) => set({ validation }),
  setRunState: (runState) => set({ runState, activePanel: "run" }),
  setActivePanel: (activePanel) => set({ activePanel }),
}));


import type { WorkflowExecutionHistoryEntry } from "../types/workflow";

export function createHistoryEntry(
  currentNodeId: string,
  previousNodeId: string | undefined,
  action: string,
  note?: string,
): WorkflowExecutionHistoryEntry {
  return {
    currentNodeId,
    previousNodeId,
    action,
    timestamp: new Date().toISOString(),
    note,
  };
}


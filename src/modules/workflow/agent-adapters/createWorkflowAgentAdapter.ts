import { WorkflowAgent } from "../agents/WorkflowAgent";
import type { WorkflowAgentAdapter } from "../types/agent";
import { LlmWorkflowAgentAdapter, type LlmWorkflowAgentAdapterOptions } from "./LlmWorkflowAgentAdapter";

export function createWorkflowAgentAdapter(options?: LlmWorkflowAgentAdapterOptions): WorkflowAgentAdapter {
  if (!options?.endpoint) {
    return new WorkflowAgent();
  }
  return new LlmWorkflowAgentAdapter(options);
}


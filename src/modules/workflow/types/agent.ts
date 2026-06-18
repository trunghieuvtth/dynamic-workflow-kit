import type { WorkflowDefinition } from "./workflow";

export interface WorkflowAgentAdapter {
  promptToWorkflow(prompt: string): Promise<WorkflowDefinition>;
  explainWorkflow(workflow: WorkflowDefinition): Promise<string>;
  suggestFixes(workflow: WorkflowDefinition): Promise<string[]>;
}

export interface WorkflowLogicIssueExplanation {
  severity: "error" | "warning";
  message: string;
  targetId?: string;
}


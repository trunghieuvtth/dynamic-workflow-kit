import type { WorkflowAgentAdapter } from "../types/agent";
import type { WorkflowDefinition } from "../types/workflow";
import { promptToWorkflow } from "./promptToWorkflow";
import { explainWorkflow } from "./explainWorkflow";
import { suggestWorkflowFixes } from "./suggestWorkflowFixes";

export class WorkflowAgent implements WorkflowAgentAdapter {
  async promptToWorkflow(prompt: string): Promise<WorkflowDefinition> {
    return promptToWorkflow(prompt);
  }

  async explainWorkflow(workflow: WorkflowDefinition): Promise<string> {
    return explainWorkflow(workflow);
  }

  async suggestFixes(workflow: WorkflowDefinition): Promise<string[]> {
    return suggestWorkflowFixes(workflow);
  }
}


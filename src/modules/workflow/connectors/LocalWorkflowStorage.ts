import type { WorkflowStorageAdapter } from "../types/connector";
import type { WorkflowDefinition } from "../types/workflow";
import { WORKFLOW_STORAGE_KEY } from "../core/workflowUtils";
import { WorkflowSerializer } from "../core/WorkflowSerializer";

export class LocalWorkflowStorage implements WorkflowStorageAdapter {
  private key: string;

  constructor(key = WORKFLOW_STORAGE_KEY) {
    this.key = key;
  }

  async load(): Promise<WorkflowDefinition | undefined> {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      return undefined;
    }
    return WorkflowSerializer.parse(raw);
  }

  async save(workflow: WorkflowDefinition): Promise<void> {
    localStorage.setItem(this.key, WorkflowSerializer.serialize(workflow));
  }

  async delete(): Promise<void> {
    localStorage.removeItem(this.key);
  }

  async list(): Promise<WorkflowDefinition[]> {
    const workflow = await this.load();
    return workflow ? [workflow] : [];
  }
}

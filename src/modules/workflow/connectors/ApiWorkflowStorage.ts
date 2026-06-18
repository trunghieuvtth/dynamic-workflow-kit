import type { WorkflowStorageAdapter } from "../types/connector";
import type { WorkflowDefinition } from "../types/workflow";
import { createWorkflowApiClient } from "./WorkflowApiClient";
import type { WorkflowHttpClientOptions } from "../types/connector";

export class ApiWorkflowStorage implements WorkflowStorageAdapter {
  private client;

  constructor(options: WorkflowHttpClientOptions) {
    this.client = createWorkflowApiClient(options);
  }

  async load(workflowId?: string): Promise<WorkflowDefinition | undefined> {
    if (!workflowId) {
      const workflows = await this.client.listWorkflows();
      return workflows[0];
    }
    return this.client.getWorkflow(workflowId);
  }

  async save(workflow: WorkflowDefinition): Promise<void> {
    await this.client.saveWorkflow(workflow);
  }

  async delete(workflowId: string): Promise<void> {
    await this.client.deleteWorkflow(workflowId);
  }

  async list(): Promise<WorkflowDefinition[]> {
    return this.client.listWorkflows();
  }
}

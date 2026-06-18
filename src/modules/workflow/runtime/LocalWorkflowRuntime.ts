import { WorkflowEngine } from "../core/WorkflowEngine";
import { WorkflowPluginRegistry } from "../core/WorkflowPluginRegistry";
import { WorkflowValidator } from "../core/WorkflowValidator";
import { defaultWorkflowPlugins } from "../plugins/defaultPlugins";
import type { WorkflowRuntimeAdapter } from "../types/connector";
import type { WorkflowNodePlugin } from "../types/plugin";

export class LocalWorkflowRuntime implements WorkflowRuntimeAdapter {
  private registry: WorkflowPluginRegistry;

  constructor(plugins: WorkflowNodePlugin[] = defaultWorkflowPlugins) {
    this.registry = new WorkflowPluginRegistry(plugins);
  }

  async validate(workflow: Parameters<NonNullable<WorkflowRuntimeAdapter["validate"]>>[0]) {
    return new WorkflowValidator(this.registry).validate(workflow);
  }

  async run(workflow: Parameters<NonNullable<WorkflowRuntimeAdapter["run"]>>[0], variables?: Record<string, unknown>) {
    return new WorkflowEngine(workflow).start(variables);
  }
}


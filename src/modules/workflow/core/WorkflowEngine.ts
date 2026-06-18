import type { WorkflowDefinition, WorkflowRunState } from "../types/workflow";
import { advanceWorkflow, createInitialRunState, runWorkflow } from "../engine/runWorkflow";

export class WorkflowEngine {
  private workflow: WorkflowDefinition;

  constructor(workflow: WorkflowDefinition) {
    this.workflow = workflow;
  }

  start(variables: Record<string, unknown> = {}): WorkflowRunState {
    return createInitialRunState(this.workflow, variables);
  }

  step(state: WorkflowRunState, actionId: string, note?: string): WorkflowRunState {
    return advanceWorkflow(this.workflow, state, actionId, note);
  }

  runToEnd(): WorkflowRunState {
    return runWorkflow(this.workflow);
  }
}

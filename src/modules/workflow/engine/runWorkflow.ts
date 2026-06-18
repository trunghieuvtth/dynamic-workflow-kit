import type { WorkflowDefinition, WorkflowRunAction, WorkflowRunState } from "../types/workflow";
import { evaluateCondition } from "./evaluateCondition";
import { createHistoryEntry } from "./executionHistory";

export function getAvailableActions(
  workflow: WorkflowDefinition,
  currentNodeId: string,
  variables: Record<string, unknown>,
): WorkflowRunAction[] {
  const currentNode = workflow.nodes.find((node) => node.id === currentNodeId);
  if (!currentNode || currentNode.type === "end") {
    return [];
  }

  return workflow.edges
    .filter((edge) => edge.source === currentNodeId || (edge.direction === "bidirectional" && edge.target === currentNodeId))
    .filter((edge) => {
      if (currentNode.type !== "condition" || !edge.condition) {
        return true;
      }
      const result = evaluateCondition(edge.condition, variables);
      return result === undefined || result;
    })
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    .map((edge) => ({
      id: edge.id,
      label: edge.label ?? edge.edgeType,
      edge,
    }));
}

export function createInitialRunState(workflow: WorkflowDefinition, variables: Record<string, unknown> = {}): WorkflowRunState {
  const start = workflow.nodes.find((node) => node.type === "start");
  const availableActions = start ? getAvailableActions(workflow, start.id, variables) : [];
  return {
    currentNodeId: start?.id,
    variables,
    history: start ? [createHistoryEntry(start.id, undefined, "start", "Started workflow test run.")] : [],
    availableActions,
    completed: false,
  };
}

export function advanceWorkflow(
  workflow: WorkflowDefinition,
  state: WorkflowRunState,
  actionId: string,
  note?: string,
): WorkflowRunState {
  if (!state.currentNodeId || state.completed) {
    return state;
  }

  const action = state.availableActions.find((item) => item.id === actionId);
  if (!action) {
    return state;
  }

  const edge = action.edge;
  const nextNodeId = edge.direction === "bidirectional" && edge.target === state.currentNodeId ? edge.source : edge.target;
  const nextNode = workflow.nodes.find((node) => node.id === nextNodeId);
  const variables = {
    ...state.variables,
    lastAction: action.label,
    approvalResult: edge.metadata?.result ?? state.variables.approvalResult,
  };
  const completed = nextNode?.type === "end";

  return {
    currentNodeId: nextNodeId,
    previousNodeId: state.currentNodeId,
    variables,
    history: [...state.history, createHistoryEntry(nextNodeId, state.currentNodeId, action.label, note)],
    availableActions: completed ? [] : getAvailableActions(workflow, nextNodeId, variables),
    completed,
  };
}

export function runWorkflow(workflow: WorkflowDefinition): WorkflowRunState {
  let state = createInitialRunState(workflow);
  let guard = 0;
  while (!state.completed && state.availableActions.length > 0 && guard < 100) {
    state = advanceWorkflow(workflow, state, state.availableActions[0].id);
    guard += 1;
  }
  return state;
}


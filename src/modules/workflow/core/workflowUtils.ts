import type { WorkflowDefinition, WorkflowEdge, WorkflowNode } from "../types/workflow";

export const WORKFLOW_STORAGE_KEY = "dynamic-workflow-kit-current";

export function createWorkflowId(prefix = "workflow"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createNodeId(type: string): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function createEdgeId(source: string, target: string): string {
  return `edge_${source}_${target}_${Math.random().toString(36).slice(2, 6)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function cloneWorkflow(workflow: WorkflowDefinition): WorkflowDefinition {
  return structuredClone(workflow);
}

export function getNodeById(workflow: WorkflowDefinition, nodeId?: string): WorkflowNode | undefined {
  return workflow.nodes.find((node) => node.id === nodeId);
}

export function getOutgoingEdges(workflow: WorkflowDefinition, nodeId: string): WorkflowEdge[] {
  return workflow.edges
    .filter((edge) => edge.source === nodeId || (edge.direction === "bidirectional" && edge.target === nodeId))
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
}

export function getTargetNodeIdForEdge(edge: WorkflowEdge, currentNodeId: string): string {
  if (edge.direction === "bidirectional" && edge.target === currentNodeId) {
    return edge.source;
  }
  return edge.target;
}

export function makeEmptyWorkflow(name = "Untitled Workflow"): WorkflowDefinition {
  const timestamp = nowIso();
  return {
    id: createWorkflowId(),
    name,
    version: "1.0.0",
    status: "draft",
    nodes: [],
    edges: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}


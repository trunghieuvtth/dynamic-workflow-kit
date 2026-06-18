export type WorkflowStatus = "draft" | "active" | "archived";

export type WorkflowNodeType =
  | "start"
  | "end"
  | "task"
  | "approval"
  | "condition"
  | "form"
  | "api"
  | "database"
  | "notification"
  | "document"
  | "delay"
  | "ai-review"
  | string;

export type WorkflowEdgeDirection = "forward" | "backward" | "bidirectional";

export type WorkflowEdgeType =
  | "normal"
  | "condition"
  | "approval"
  | "return"
  | "loop"
  | "error"
  | string;

export interface WorkflowNodeData {
  label: string;
  description?: string;
  config?: Record<string, unknown>;
  pluginType?: string;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: {
    x: number;
    y: number;
  };
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  direction: WorkflowEdgeDirection;
  edgeType: WorkflowEdgeType;
  priority?: number;
  metadata?: Record<string, unknown>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowValidationIssue {
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface WorkflowValidationResult {
  valid: boolean;
  errors: WorkflowValidationIssue[];
  warnings: WorkflowValidationIssue[];
}

export interface WorkflowExecutionHistoryEntry {
  currentNodeId: string;
  previousNodeId?: string;
  action: string;
  timestamp: string;
  note?: string;
}

export interface WorkflowExecutionContext {
  workflow: WorkflowDefinition;
  currentNode: WorkflowNode;
  previousNode?: WorkflowNode;
  variables: Record<string, unknown>;
  history: WorkflowExecutionHistoryEntry[];
}

export interface WorkflowExecutionResult {
  status: "success" | "failed" | "waiting" | "completed";
  variables?: Record<string, unknown>;
  message?: string;
  nextAction?: string;
}

export interface WorkflowRunAction {
  id: string;
  label: string;
  edge: WorkflowEdge;
}

export interface WorkflowRunState {
  currentNodeId?: string;
  previousNodeId?: string;
  variables: Record<string, unknown>;
  history: WorkflowExecutionHistoryEntry[];
  availableActions: WorkflowRunAction[];
  completed: boolean;
}


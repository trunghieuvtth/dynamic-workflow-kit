import type { ComponentType } from "react";
import type {
  WorkflowDefinition,
  WorkflowExecutionContext,
  WorkflowExecutionResult,
  WorkflowNode,
} from "./workflow";

export type WorkflowPluginCategory =
  | "basic"
  | "process"
  | "logic"
  | "data"
  | "integration"
  | "ai"
  | "document"
  | "system"
  | string;

export interface WorkflowHandleDefinition {
  id: string;
  label: string;
}

export interface WorkflowNodeRenderProps {
  node: WorkflowNode;
  selected?: boolean;
}

export interface WorkflowNodeConfigPanelProps {
  node: WorkflowNode;
  workflow: WorkflowDefinition;
  onChange: (node: WorkflowNode) => void;
}

export interface WorkflowNodePlugin {
  type: string;
  label: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  category: WorkflowPluginCategory;
  defaultConfig: Record<string, unknown>;
  inputHandles: WorkflowHandleDefinition[];
  outputHandles: WorkflowHandleDefinition[];
  renderNode: ComponentType<WorkflowNodeRenderProps>;
  renderConfigPanel?: ComponentType<WorkflowNodeConfigPanelProps>;
  validate?: (
    node: WorkflowNode,
    workflow: WorkflowDefinition,
  ) => {
    valid: boolean;
    errors: string[];
    warnings?: string[];
  };
  execute?: (
    context: WorkflowExecutionContext,
  ) => Promise<WorkflowExecutionResult> | WorkflowExecutionResult;
}


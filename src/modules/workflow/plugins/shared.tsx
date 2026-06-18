/* eslint-disable react-refresh/only-export-components */
import type { WorkflowNodePlugin, WorkflowNodeRenderProps } from "../types/plugin";
import type { WorkflowExecutionResult } from "../types/workflow";

export const nodeToneByType: Record<string, string> = {
  start: "dwk-node-start",
  end: "dwk-node-end",
  task: "dwk-node-task",
  approval: "dwk-node-approval",
  condition: "dwk-node-condition",
  form: "dwk-node-form",
  api: "dwk-node-api",
  database: "dwk-node-database",
  notification: "dwk-node-notification",
  document: "dwk-node-document",
  delay: "dwk-node-delay",
  "ai-review": "dwk-node-ai",
};

export function DefaultWorkflowNode({ node, selected }: WorkflowNodeRenderProps) {
  const tone = nodeToneByType[node.type] ?? "dwk-node-task";
  return (
    <div className={`dwk-node ${tone} ${selected ? "dwk-node-selected" : ""}`}>
      <div className="dwk-node-header">
        <span className="dwk-node-badge">{node.type}</span>
      </div>
      <div className="dwk-node-title">{node.data.label}</div>
      {node.data.description ? <div className="dwk-node-description">{node.data.description}</div> : null}
    </div>
  );
}

export function successResult(message: string, variables: Record<string, unknown> = {}): WorkflowExecutionResult {
  return { status: "success", message, variables };
}

export function defineWorkflowPlugin(plugin: WorkflowNodePlugin): WorkflowNodePlugin {
  return plugin;
}

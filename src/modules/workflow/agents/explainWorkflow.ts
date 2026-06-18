import type { WorkflowDefinition } from "../types/workflow";

export function explainWorkflow(workflow: WorkflowDefinition): string {
  const start = workflow.nodes.find((node) => node.type === "start");
  if (!start) {
    return "Quy trình chưa có điểm bắt đầu.";
  }

  const phrases: string[] = [`Quy trình "${workflow.name}" bắt đầu tại "${start.data.label}".`];
  workflow.edges.forEach((edge) => {
    const source = workflow.nodes.find((node) => node.id === edge.source);
    const target = workflow.nodes.find((node) => node.id === edge.target);
    if (source && target) {
      const direction = edge.direction === "backward" ? "quay lại" : edge.direction === "bidirectional" ? "có thể đi hai chiều với" : "chuyển đến";
      phrases.push(`Từ "${source.data.label}" ${direction} "${target.data.label}" qua nhánh "${edge.label ?? edge.edgeType}".`);
    }
  });
  return phrases.join(" ");
}


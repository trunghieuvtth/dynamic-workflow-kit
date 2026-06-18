import type { WorkflowDefinition } from "../types/workflow";
import { WorkflowPluginRegistry } from "../core/WorkflowPluginRegistry";
import { WorkflowValidator } from "../core/WorkflowValidator";

export function suggestWorkflowFixes(workflow: WorkflowDefinition, registry?: WorkflowPluginRegistry): string[] {
  const result = new WorkflowValidator(registry).validate(workflow);
  const suggestions = [
    ...result.errors.map((issue) => `Cần sửa: ${issue.message}`),
    ...result.warnings.map((issue) => `Nên kiểm tra: ${issue.message}`),
  ];

  const hasNotificationAfterApproval = workflow.edges.some((edge) => {
    const source = workflow.nodes.find((node) => node.id === edge.source);
    const target = workflow.nodes.find((node) => node.id === edge.target);
    return source?.type === "approval" && target?.type === "notification";
  });
  if (!hasNotificationAfterApproval) {
    suggestions.push("Nên thêm bước gửi thông báo sau phê duyệt hoặc từ chối.");
  }

  const hasDocument = workflow.nodes.some((node) => node.type === "document");
  if (!hasDocument) {
    suggestions.push("Nên thêm Document node nếu quy trình cần tạo văn bản, phiếu hoặc báo cáo.");
  }

  return suggestions.length > 0 ? suggestions : ["Workflow hiện chưa phát hiện vấn đề logic đáng kể."];
}


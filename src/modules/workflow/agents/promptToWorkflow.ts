import type { WorkflowDefinition } from "../types/workflow";
import { createWorkflowId, nowIso } from "../core/workflowUtils";

export function promptToWorkflow(prompt: string): WorkflowDefinition {
  const timestamp = nowIso();
  const mentionsReturn = /trả về|tra ve|bổ sung|bo sung/i.test(prompt);
  const workflow: WorkflowDefinition = {
    id: createWorkflowId("agent_workflow"),
    name: "Quy trình xử lý hồ sơ và phê duyệt văn bản",
    description: prompt,
    version: "1.0.0",
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
    nodes: [
      { id: "start", type: "start", position: { x: 80, y: 180 }, data: { label: "Start", config: {} } },
      { id: "receive", type: "task", position: { x: 280, y: 180 }, data: { label: "Tiếp nhận hồ sơ", config: { assignee: "Văn thư", priority: "medium", instructions: "Kiểm tra thành phần hồ sơ." } } },
      { id: "specialist", type: "task", position: { x: 520, y: 180 }, data: { label: "Chuyên viên xử lý", config: { assignee: "Chuyên viên", priority: "high", instructions: "Thẩm định và chuẩn bị nội dung trình duyệt." } } },
      { id: "approval_leader", type: "approval", position: { x: 760, y: 180 }, data: { label: "Lãnh đạo phê duyệt", config: { approverRole: "Lãnh đạo", approverName: "", allowReject: true, allowReturn: mentionsReturn, approvalNoteRequired: true } } },
      { id: "document_issue", type: "document", position: { x: 1020, y: 80 }, data: { label: "Ban hành văn bản", config: { templateName: "Văn bản ban hành", outputFormat: "pdf", variables: {} } } },
      { id: "notify_success", type: "notification", position: { x: 1260, y: 80 }, data: { label: "Thông báo kết quả", config: { channel: "email", recipients: "", subject: "Hồ sơ đã được phê duyệt", messageTemplate: "Hồ sơ đã được phê duyệt và ban hành văn bản." } } },
      { id: "notify_rejected", type: "notification", position: { x: 1020, y: 310 }, data: { label: "Thông báo từ chối", config: { channel: "email", recipients: "", subject: "Hồ sơ bị từ chối", messageTemplate: "Hồ sơ không được phê duyệt." } } },
      { id: "end_success", type: "end", position: { x: 1500, y: 80 }, data: { label: "End - Hoàn tất", config: {} } },
      { id: "end_rejected", type: "end", position: { x: 1260, y: 310 }, data: { label: "End - Từ chối", config: {} } },
    ],
    edges: [
      { id: "e_start_receive", source: "start", target: "receive", label: "Bắt đầu", direction: "forward", edgeType: "normal" },
      { id: "e_receive_specialist", source: "receive", target: "specialist", label: "Chuyển xử lý", direction: "forward", edgeType: "normal" },
      { id: "e_specialist_approval", source: "specialist", target: "approval_leader", label: "Trình duyệt", direction: "forward", edgeType: "approval" },
      { id: "e_approved_document", source: "approval_leader", target: "document_issue", label: "Đồng ý", condition: "approvalResult == 'approved'", direction: "forward", edgeType: "approval", metadata: { result: "approved" } },
      { id: "e_document_notify", source: "document_issue", target: "notify_success", label: "Gửi thông báo", direction: "forward", edgeType: "normal" },
      { id: "e_notify_success_end", source: "notify_success", target: "end_success", label: "Hoàn tất", direction: "forward", edgeType: "normal" },
      { id: "e_rejected_notify", source: "approval_leader", target: "notify_rejected", label: "Từ chối", condition: "approvalResult == 'rejected'", direction: "forward", edgeType: "approval", metadata: { result: "rejected" } },
      { id: "e_notify_rejected_end", source: "notify_rejected", target: "end_rejected", label: "Kết thúc", direction: "forward", edgeType: "normal" },
      { id: "edge_return_to_specialist", source: "approval_leader", target: "specialist", label: "Trả về bổ sung", condition: "approvalResult == 'returned'", direction: "backward", edgeType: "return", metadata: { result: "returned" } },
    ],
  };

  return workflow;
}


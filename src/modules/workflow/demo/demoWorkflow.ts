import type { WorkflowDefinition } from "../types/workflow";

export const demoWorkflow: WorkflowDefinition = {
  id: "demo_approval_document_workflow",
  name: "Quy trình xử lý hồ sơ và phê duyệt văn bản",
  description: "Demo workflow có phê duyệt, nhánh từ chối và edge quay lui để bổ sung hồ sơ.",
  version: "1.0.0",
  status: "draft",
  createdAt: "2026-06-18T00:00:00.000Z",
  updatedAt: "2026-06-18T00:00:00.000Z",
  nodes: [
    { id: "start", type: "start", position: { x: 60, y: 210 }, data: { label: "Start", config: {} } },
    { id: "receive_profile", type: "task", position: { x: 270, y: 210 }, data: { label: "Tiếp nhận hồ sơ", description: "Kiểm tra thông tin và thành phần hồ sơ.", config: { assignee: "Bộ phận một cửa", dueDate: "", priority: "medium", instructions: "Tiếp nhận, kiểm tra thành phần hồ sơ ban đầu." } } },
    { id: "specialist_process", type: "task", position: { x: 520, y: 210 }, data: { label: "Chuyên viên xử lý", description: "Thẩm định nội dung và chuẩn bị hồ sơ trình duyệt.", config: { assignee: "Chuyên viên", dueDate: "", priority: "high", instructions: "Thẩm định nội dung; bổ sung tài liệu nếu lãnh đạo trả về." } } },
    { id: "approval_leader", type: "approval", position: { x: 790, y: 210 }, data: { label: "Lãnh đạo phê duyệt", description: "Phê duyệt, từ chối hoặc trả về bổ sung.", config: { approverRole: "Lãnh đạo phòng", approverName: "", allowReject: true, allowReturn: true, approvalNoteRequired: true } } },
    { id: "document_issue", type: "document", position: { x: 1070, y: 90 }, data: { label: "Tạo văn bản ban hành", config: { templateName: "Quyết định ban hành", outputFormat: "pdf", variables: { soHoSo: "{{profile.id}}" } } } },
    { id: "notify_success", type: "notification", position: { x: 1320, y: 90 }, data: { label: "Gửi thông báo", config: { channel: "email", recipients: "{{applicant.email}}", subject: "Hồ sơ đã được phê duyệt", messageTemplate: "Hồ sơ của bạn đã được phê duyệt và văn bản đã được ban hành." } } },
    { id: "notify_rejected", type: "notification", position: { x: 1070, y: 360 }, data: { label: "Gửi thông báo từ chối", config: { channel: "email", recipients: "{{applicant.email}}", subject: "Hồ sơ bị từ chối", messageTemplate: "Hồ sơ chưa đủ điều kiện phê duyệt." } } },
    { id: "end_success", type: "end", position: { x: 1560, y: 90 }, data: { label: "End - Hoàn tất", config: {} } },
    { id: "end_rejected", type: "end", position: { x: 1320, y: 360 }, data: { label: "End - Từ chối", config: {} } },
  ],
  edges: [
    { id: "edge_start_receive", source: "start", target: "receive_profile", label: "Bắt đầu", direction: "forward", edgeType: "normal", priority: 1 },
    { id: "edge_receive_specialist", source: "receive_profile", target: "specialist_process", label: "Chuyển chuyên viên", direction: "forward", edgeType: "normal", priority: 1 },
    { id: "edge_specialist_leader", source: "specialist_process", target: "approval_leader", label: "Trình lãnh đạo", direction: "forward", edgeType: "approval", priority: 1 },
    { id: "edge_approved_document", source: "approval_leader", target: "document_issue", label: "Đồng ý", condition: "approvalResult == 'approved'", direction: "forward", edgeType: "approval", priority: 1, metadata: { result: "approved" } },
    { id: "edge_document_notify", source: "document_issue", target: "notify_success", label: "Ban hành", direction: "forward", edgeType: "normal", priority: 1 },
    { id: "edge_notify_success_end", source: "notify_success", target: "end_success", label: "Hoàn tất", direction: "forward", edgeType: "normal", priority: 1 },
    { id: "edge_rejected_notify", source: "approval_leader", target: "notify_rejected", label: "Từ chối", condition: "approvalResult == 'rejected'", direction: "forward", edgeType: "approval", priority: 2, metadata: { result: "rejected" } },
    { id: "edge_notify_rejected_end", source: "notify_rejected", target: "end_rejected", label: "Kết thúc", direction: "forward", edgeType: "normal", priority: 1 },
    {
      id: "edge_return_to_specialist",
      source: "approval_leader",
      target: "specialist_process",
      label: "Trả về bổ sung",
      condition: "approvalResult == 'returned'",
      direction: "backward",
      edgeType: "return",
      priority: 3,
      metadata: { result: "returned" },
    },
  ],
};


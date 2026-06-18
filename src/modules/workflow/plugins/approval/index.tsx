import { BadgeCheck } from "lucide-react";
import { DefaultWorkflowNode, defineWorkflowPlugin, successResult } from "../shared";

export const ApprovalNodePlugin = defineWorkflowPlugin({
  type: "approval",
  label: "Approval",
  description: "Node phê duyệt",
  icon: BadgeCheck,
  category: "process",
  defaultConfig: {
    approverRole: "",
    approverName: "",
    allowReject: true,
    allowReturn: true,
    approvalNoteRequired: false,
  },
  inputHandles: [{ id: "in", label: "In" }],
  outputHandles: [
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "returned", label: "Returned" },
  ],
  renderNode: DefaultWorkflowNode,
  execute: () => successResult("Approval is waiting for a selected outcome."),
});


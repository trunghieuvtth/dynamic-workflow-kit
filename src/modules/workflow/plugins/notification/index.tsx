import { Bell } from "lucide-react";
import { DefaultWorkflowNode, defineWorkflowPlugin, successResult } from "../shared";

export const NotificationNodePlugin = defineWorkflowPlugin({
  type: "notification",
  label: "Notification",
  description: "Node gửi thông báo",
  icon: Bell,
  category: "integration",
  defaultConfig: {
    channel: "email",
    recipients: "",
    subject: "",
    messageTemplate: "",
  },
  inputHandles: [{ id: "in", label: "In" }],
  outputHandles: [{ id: "sent", label: "Sent" }],
  renderNode: DefaultWorkflowNode,
  execute: ({ currentNode }) => successResult(`Mock notification via ${currentNode.data.config?.channel ?? "email"}.`),
});


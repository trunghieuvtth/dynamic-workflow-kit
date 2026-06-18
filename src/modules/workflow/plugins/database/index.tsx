import { Database } from "lucide-react";
import { DefaultWorkflowNode, defineWorkflowPlugin, successResult } from "../shared";

export const DatabaseNodePlugin = defineWorkflowPlugin({
  type: "database",
  label: "Database",
  description: "Node đọc/ghi dữ liệu",
  icon: Database,
  category: "data",
  defaultConfig: {
    operation: "read",
    table: "",
    filters: {},
    payload: {},
  },
  inputHandles: [{ id: "in", label: "In" }],
  outputHandles: [
    { id: "success", label: "Success" },
    { id: "error", label: "Error" },
  ],
  renderNode: DefaultWorkflowNode,
  execute: ({ currentNode }) => successResult(`Mock database ${currentNode.data.config?.operation ?? "read"}.`),
});


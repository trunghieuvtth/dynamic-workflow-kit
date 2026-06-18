import { FileText } from "lucide-react";
import { DefaultWorkflowNode, defineWorkflowPlugin, successResult } from "../shared";

export const DocumentNodePlugin = defineWorkflowPlugin({
  type: "document",
  label: "Document",
  description: "Node tạo văn bản/báo cáo/phiếu",
  icon: FileText,
  category: "document",
  defaultConfig: {
    templateName: "",
    outputFormat: "pdf",
    variables: {},
  },
  inputHandles: [{ id: "in", label: "In" }],
  outputHandles: [{ id: "created", label: "Created" }],
  renderNode: DefaultWorkflowNode,
  execute: ({ currentNode }) => successResult(`Generated ${currentNode.data.config?.outputFormat ?? "pdf"} document.`),
});


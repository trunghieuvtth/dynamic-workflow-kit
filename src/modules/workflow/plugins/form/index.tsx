import { FormInput } from "lucide-react";
import { DefaultWorkflowNode, defineWorkflowPlugin, successResult } from "../shared";

export const FormNodePlugin = defineWorkflowPlugin({
  type: "form",
  label: "Form",
  description: "Node nhập biểu mẫu",
  icon: FormInput,
  category: "process",
  defaultConfig: {
    formName: "",
    fields: [{ name: "fullName", label: "Họ tên", type: "text", required: true }],
  },
  inputHandles: [{ id: "in", label: "In" }],
  outputHandles: [{ id: "submitted", label: "Submitted" }],
  renderNode: DefaultWorkflowNode,
  execute: ({ currentNode }) => successResult(`Form ${currentNode.data.config?.formName ?? currentNode.data.label} submitted.`),
});


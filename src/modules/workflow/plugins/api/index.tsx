import { Cable } from "lucide-react";
import { DefaultWorkflowNode, defineWorkflowPlugin, successResult } from "../shared";

export const ApiNodePlugin = defineWorkflowPlugin({
  type: "api",
  label: "API",
  description: "Node gọi API",
  icon: Cable,
  category: "integration",
  defaultConfig: {
    method: "GET",
    url: "",
    headers: {},
    bodyTemplate: {},
    responseMapping: {},
  },
  inputHandles: [{ id: "in", label: "In" }],
  outputHandles: [
    { id: "success", label: "Success" },
    { id: "error", label: "Error" },
  ],
  renderNode: DefaultWorkflowNode,
  execute: ({ currentNode }) => successResult(`Mock API call ${currentNode.data.config?.method ?? "GET"}.`),
});


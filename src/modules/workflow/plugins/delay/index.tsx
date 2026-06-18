import { Timer } from "lucide-react";
import { DefaultWorkflowNode, defineWorkflowPlugin, successResult } from "../shared";

export const DelayNodePlugin = defineWorkflowPlugin({
  type: "delay",
  label: "Delay",
  description: "Node chờ",
  icon: Timer,
  category: "system",
  defaultConfig: {
    duration: 1,
    unit: "hours",
  },
  inputHandles: [{ id: "in", label: "In" }],
  outputHandles: [{ id: "done", label: "Done" }],
  renderNode: DefaultWorkflowNode,
  execute: ({ currentNode }) => successResult(`Mock delay ${currentNode.data.config?.duration ?? 1} ${currentNode.data.config?.unit ?? "hours"}.`),
});


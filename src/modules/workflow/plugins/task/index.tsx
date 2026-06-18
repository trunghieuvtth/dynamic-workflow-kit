import { ClipboardList } from "lucide-react";
import { DefaultWorkflowNode, defineWorkflowPlugin, successResult } from "../shared";

export const TaskNodePlugin = defineWorkflowPlugin({
  type: "task",
  label: "Task",
  description: "Việc cần xử lý",
  icon: ClipboardList,
  category: "process",
  defaultConfig: {
    assignee: "",
    dueDate: "",
    priority: "medium",
    instructions: "",
  },
  inputHandles: [{ id: "in", label: "In" }],
  outputHandles: [{ id: "out", label: "Done" }],
  renderNode: DefaultWorkflowNode,
  execute: ({ currentNode }) => successResult(`Completed task ${currentNode.data.label}.`),
});


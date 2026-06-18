import { PlayCircle } from "lucide-react";
import { DefaultWorkflowNode, defineWorkflowPlugin, successResult } from "../shared";

export const StartNodePlugin = defineWorkflowPlugin({
  type: "start",
  label: "Start",
  description: "Điểm bắt đầu workflow",
  icon: PlayCircle,
  category: "basic",
  defaultConfig: {},
  inputHandles: [],
  outputHandles: [{ id: "out", label: "Next" }],
  renderNode: DefaultWorkflowNode,
  validate: (node, workflow) => ({
    valid: workflow.nodes.filter((item) => item.type === node.type).length === 1,
    errors: workflow.nodes.filter((item) => item.type === node.type).length === 1 ? [] : ["Chỉ được có đúng 1 Start node."],
  }),
  execute: () => successResult("Workflow started."),
});


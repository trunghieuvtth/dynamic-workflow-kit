import { CircleStop } from "lucide-react";
import { DefaultWorkflowNode, defineWorkflowPlugin } from "../shared";

export const EndNodePlugin = defineWorkflowPlugin({
  type: "end",
  label: "End",
  description: "Điểm kết thúc workflow",
  icon: CircleStop,
  category: "basic",
  defaultConfig: {},
  inputHandles: [{ id: "in", label: "In" }],
  outputHandles: [],
  renderNode: DefaultWorkflowNode,
  execute: () => ({ status: "completed", message: "Workflow completed." }),
});


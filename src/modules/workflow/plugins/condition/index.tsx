import { GitBranch } from "lucide-react";
import { DefaultWorkflowNode, defineWorkflowPlugin, successResult } from "../shared";

export const ConditionNodePlugin = defineWorkflowPlugin({
  type: "condition",
  label: "Condition",
  description: "Node điều kiện",
  icon: GitBranch,
  category: "logic",
  defaultConfig: {
    expression: "",
    trueLabel: "True",
    falseLabel: "False",
  },
  inputHandles: [{ id: "in", label: "In" }],
  outputHandles: [
    { id: "true", label: "True" },
    { id: "false", label: "False" },
  ],
  renderNode: DefaultWorkflowNode,
  execute: () => successResult("Condition evaluated by outgoing edge rules."),
});


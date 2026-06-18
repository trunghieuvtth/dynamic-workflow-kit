import { Sparkles } from "lucide-react";
import { DefaultWorkflowNode, defineWorkflowPlugin, successResult } from "../shared";

export const AiReviewNodePlugin = defineWorkflowPlugin({
  type: "ai-review",
  label: "AI Review",
  description: "Node AI hỗ trợ rà soát",
  icon: Sparkles,
  category: "ai",
  defaultConfig: {
    instruction: "Rà soát dữ liệu đầu vào và đề xuất vấn đề cần xử lý.",
    inputFields: [],
    outputField: "aiReviewResult",
  },
  inputHandles: [{ id: "in", label: "In" }],
  outputHandles: [
    { id: "passed", label: "Passed" },
    { id: "needs_changes", label: "Needs changes" },
  ],
  renderNode: DefaultWorkflowNode,
  execute: ({ currentNode }) =>
    successResult("Rule-based AI review completed.", {
      [String(currentNode.data.config?.outputField ?? "aiReviewResult")]: "passed",
    }),
});


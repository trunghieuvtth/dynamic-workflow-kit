import { useState } from "react";
import type { WorkflowAgentAdapter } from "../types/agent";
import type { WorkflowDefinition } from "../types/workflow";
import { WorkflowAgent } from "../agents/WorkflowAgent";

interface WorkflowAgentPanelProps {
  workflow: WorkflowDefinition;
  agentAdapter?: WorkflowAgentAdapter;
  onApplyWorkflow: (workflow: WorkflowDefinition) => void;
}

const defaultPrompt = "Tạo quy trình tiếp nhận hồ sơ, chuyên viên xử lý, lãnh đạo phê duyệt. Nếu đồng ý thì ban hành văn bản. Nếu sai thì trả về chuyên viên bổ sung rồi trình lại.";

export function WorkflowAgentPanel({ workflow, agentAdapter, onApplyWorkflow }: WorkflowAgentPanelProps) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [output, setOutput] = useState<string[]>([]);
  const agent = agentAdapter ?? new WorkflowAgent();

  return (
    <div className="dwk-agent-panel">
      <div className="dwk-panel-heading">
        <div>
          <span className="dwk-panel-kicker">Workflow Agent</span>
          <h2>Rule-based assistant</h2>
        </div>
      </div>

      <label className="dwk-field">
        <span>Prompt tiếng Việt</span>
        <textarea value={prompt} rows={5} onChange={(event) => setPrompt(event.target.value)} />
      </label>

      <div className="dwk-action-list">
        <button
          className="dwk-primary-button"
          type="button"
          onClick={async () => {
            const generated = await agent.promptToWorkflow(prompt);
            onApplyWorkflow(generated);
            setOutput(["Đã tạo workflow từ mô tả và áp dụng vào canvas."]);
          }}
        >
          Generate workflow
        </button>
        <button
          className="dwk-secondary-button"
          type="button"
          onClick={async () => setOutput([await agent.explainWorkflow(workflow)])}
        >
          Explain workflow
        </button>
        <button
          className="dwk-secondary-button"
          type="button"
          onClick={async () => setOutput(await agent.suggestFixes(workflow))}
        >
          Suggest fixes
        </button>
      </div>

      <div className="dwk-muted-box">
        <strong>Agent output</strong>
        {output.length ? output.map((item) => <p key={item}>{item}</p>) : <p>No output yet.</p>}
      </div>
    </div>
  );
}

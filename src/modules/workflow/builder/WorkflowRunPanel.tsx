import type { WorkflowDefinition, WorkflowRunState } from "../types/workflow";

interface WorkflowRunPanelProps {
  workflow: WorkflowDefinition;
  runState?: WorkflowRunState;
  onStart: () => void;
  onStep: (actionId: string) => void;
}

export function WorkflowRunPanel({ workflow, runState, onStart, onStep }: WorkflowRunPanelProps) {
  const currentNode = workflow.nodes.find((node) => node.id === runState?.currentNodeId);

  return (
    <div className="dwk-run-panel">
      <div className="dwk-panel-heading">
        <div>
          <span className="dwk-panel-kicker">Run/Test Workflow</span>
          <h2>Execution</h2>
        </div>
        <button className="dwk-primary-button" type="button" onClick={onStart}>
          Start
        </button>
      </div>

      <div className="dwk-muted-box">
        <strong>Current node</strong>
        <p>{currentNode ? `${currentNode.data.label} (${currentNode.type})` : "Not started"}</p>
      </div>

      <div className="dwk-action-list">
        <strong>Available next actions</strong>
        {runState?.availableActions.length ? (
          runState.availableActions.map((action) => (
            <button key={action.id} type="button" className="dwk-secondary-button" onClick={() => onStep(action.id)}>
              {action.label}
            </button>
          ))
        ) : (
          <p className="dwk-small-text">{runState?.completed ? "Workflow completed." : "No action available."}</p>
        )}
      </div>

      <div className="dwk-muted-box">
        <strong>Workflow variables</strong>
        <pre>{JSON.stringify(runState?.variables ?? {}, null, 2)}</pre>
      </div>

      <div className="dwk-history">
        <strong>Execution history</strong>
        {(runState?.history ?? []).map((entry) => (
          <div key={`${entry.timestamp}-${entry.currentNodeId}`} className="dwk-history-item">
            <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
            <p>{entry.action} {"->"} {entry.currentNodeId}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

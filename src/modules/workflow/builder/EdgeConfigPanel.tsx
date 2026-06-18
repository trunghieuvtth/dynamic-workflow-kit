import type { WorkflowEdge } from "../types/workflow";

interface EdgeConfigPanelProps {
  edge?: WorkflowEdge;
  readonly?: boolean;
  onChange: (edge: WorkflowEdge) => void;
  onDelete: (edgeId: string) => void;
}

export function EdgeConfigPanel({ edge, readonly, onChange, onDelete }: EdgeConfigPanelProps) {
  if (!edge) {
    return <div className="dwk-empty-panel">Select an edge to edit routing rules.</div>;
  }

  const update = (patch: Partial<WorkflowEdge>) => onChange({ ...edge, ...patch });

  return (
    <div className="dwk-config-panel">
      <div className="dwk-panel-heading">
        <div>
          <span className="dwk-panel-kicker">{edge.source} {"->"} {edge.target}</span>
          <h2>Edge Config</h2>
        </div>
        {!readonly ? (
          <button className="dwk-danger-button" type="button" onClick={() => onDelete(edge.id)}>
            Delete
          </button>
        ) : null}
      </div>

      <label className="dwk-field">
        <span>Label</span>
        <input value={edge.label ?? ""} disabled={readonly} onChange={(event) => update({ label: event.target.value })} />
      </label>

      <label className="dwk-field">
        <span>Direction</span>
        <select value={edge.direction} disabled={readonly} onChange={(event) => update({ direction: event.target.value as WorkflowEdge["direction"] })}>
          <option value="forward">forward</option>
          <option value="backward">backward</option>
          <option value="bidirectional">bidirectional</option>
        </select>
      </label>

      <label className="dwk-field">
        <span>Edge type</span>
        <select value={edge.edgeType} disabled={readonly} onChange={(event) => update({ edgeType: event.target.value })}>
          <option value="normal">normal</option>
          <option value="condition">condition</option>
          <option value="approval">approval</option>
          <option value="return">return</option>
          <option value="loop">loop</option>
          <option value="error">error</option>
        </select>
      </label>

      <label className="dwk-field">
        <span>Condition</span>
        <textarea value={edge.condition ?? ""} disabled={readonly} onChange={(event) => update({ condition: event.target.value })} />
      </label>

      <label className="dwk-field">
        <span>Priority</span>
        <input
          type="number"
          value={edge.priority ?? 0}
          disabled={readonly}
          onChange={(event) => update({ priority: Number(event.target.value) })}
        />
      </label>
    </div>
  );
}

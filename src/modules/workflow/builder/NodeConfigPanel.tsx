import type { WorkflowDefinition, WorkflowNode } from "../types/workflow";
import { WorkflowPluginRegistry } from "../core/WorkflowPluginRegistry";

interface NodeConfigPanelProps {
  workflow: WorkflowDefinition;
  node?: WorkflowNode;
  registry: WorkflowPluginRegistry;
  readonly?: boolean;
  onChange: (node: WorkflowNode) => void;
  onDelete: (nodeId: string) => void;
}

function stringifyValue(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function parseValue(raw: string, previous: unknown): unknown {
  if (typeof previous === "boolean") {
    return raw === "true";
  }
  if (typeof previous === "number") {
    const numberValue = Number(raw);
    return Number.isFinite(numberValue) ? numberValue : previous;
  }
  if (Array.isArray(previous) || (previous && typeof previous === "object")) {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return previous;
    }
  }
  return raw;
}

export function NodeConfigPanel({ workflow, node, registry, readonly, onChange, onDelete }: NodeConfigPanelProps) {
  if (!node) {
    return <div className="dwk-empty-panel">Select a node to edit its settings.</div>;
  }

  const plugin = registry.get(node.type);
  const PluginPanel = plugin?.renderConfigPanel;
  const config = node.data.config ?? {};

  const updateData = (dataPatch: Partial<WorkflowNode["data"]>) => {
    onChange({ ...node, data: { ...node.data, ...dataPatch } });
  };

  const updateConfig = (key: string, value: unknown) => {
    updateData({ config: { ...config, [key]: value } });
  };

  return (
    <div className="dwk-config-panel">
      <div className="dwk-panel-heading">
        <div>
          <span className="dwk-panel-kicker">{plugin?.label ?? node.type}</span>
          <h2>Node Config</h2>
        </div>
        {!readonly ? (
          <button className="dwk-danger-button" type="button" onClick={() => onDelete(node.id)}>
            Delete
          </button>
        ) : null}
      </div>

      <label className="dwk-field">
        <span>Label</span>
        <input value={node.data.label} disabled={readonly} onChange={(event) => updateData({ label: event.target.value })} />
      </label>

      <label className="dwk-field">
        <span>Description</span>
        <textarea value={node.data.description ?? ""} disabled={readonly} onChange={(event) => updateData({ description: event.target.value })} />
      </label>

      <label className="dwk-field">
        <span>Type</span>
        <input value={node.type} disabled />
      </label>

      {PluginPanel ? <PluginPanel node={node} workflow={workflow} onChange={onChange} /> : null}

      <div className="dwk-config-fields">
        <h3>Config</h3>
        {Object.entries(config).map(([key, value]) => (
          <label key={key} className="dwk-field">
            <span>{key}</span>
            {typeof value === "boolean" ? (
              <select value={String(value)} disabled={readonly} onChange={(event) => updateConfig(key, event.target.value === "true")}>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : typeof value === "object" && value !== null ? (
              <textarea
                value={stringifyValue(value)}
                disabled={readonly}
                rows={5}
                onChange={(event) => updateConfig(key, parseValue(event.target.value, value))}
              />
            ) : (
              <input value={stringifyValue(value)} disabled={readonly} onChange={(event) => updateConfig(key, parseValue(event.target.value, value))} />
            )}
          </label>
        ))}
      </div>

      <div className="dwk-muted-box">
        <strong>Handles</strong>
        <p>Input: {plugin?.inputHandles.map((handle) => handle.label).join(", ") || "None"}</p>
        <p>Output: {plugin?.outputHandles.map((handle) => handle.label).join(", ") || "None"}</p>
      </div>
    </div>
  );
}

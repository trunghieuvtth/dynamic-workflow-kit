import { useRef, useState } from "react";
import { Clipboard, Download, FileJson, Play, Save, Upload, Wand2 } from "lucide-react";
import type { WorkflowDefinition, WorkflowValidationResult } from "../types/workflow";
import { WorkflowSerializer } from "../core/WorkflowSerializer";

interface WorkflowToolbarProps {
  workflow: WorkflowDefinition;
  validation?: WorkflowValidationResult;
  showAgent?: boolean;
  onSave: () => void;
  onLoad: () => void;
  onValidate: () => void;
  onRun: () => void;
  onImport: (workflow: WorkflowDefinition) => void;
  onOpenAgent: () => void;
}

export function WorkflowToolbar({
  workflow,
  validation,
  showAgent,
  onSave,
  onLoad,
  onValidate,
  onRun,
  onImport,
  onOpenAgent,
}: WorkflowToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  const exportJson = async () => {
    const content = WorkflowSerializer.serialize(workflow);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workflow.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    await navigator.clipboard?.writeText(content).catch(() => undefined);
  };

  const importJson = (json: string) => {
    const result = WorkflowSerializer.tryParse(json);
    if (result.workflow) {
      setImportError("");
      setImportText("");
      onImport(result.workflow);
      return;
    }
    setImportError(result.error ?? "Invalid workflow JSON");
  };

  return (
    <header className="dwk-toolbar">
      <div className="dwk-toolbar-title">
        <strong>{workflow.name}</strong>
        <span>{workflow.nodes.length} nodes / {workflow.edges.length} edges</span>
      </div>
      <div className="dwk-toolbar-actions">
        <button type="button" onClick={onSave} title="Save"><Save size={16} />Save</button>
        <button type="button" onClick={onLoad} title="Load"><Upload size={16} />Load</button>
        <button type="button" onClick={onRun} title="Run test"><Play size={16} />Run</button>
        <button type="button" onClick={onValidate} title="Validate"><Clipboard size={16} />Validate</button>
        <button type="button" onClick={exportJson} title="Export JSON"><Download size={16} />Export</button>
        <button type="button" onClick={() => fileRef.current?.click()} title="Import JSON"><FileJson size={16} />Import</button>
        {showAgent ? <button type="button" onClick={onOpenAgent} title="Workflow Agent"><Wand2 size={16} />Agent</button> : null}
      </div>
      <input
        ref={fileRef}
        className="dwk-hidden"
        type="file"
        accept="application/json,.json"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }
          const reader = new FileReader();
          reader.onload = () => importJson(String(reader.result ?? ""));
          reader.readAsText(file);
          event.currentTarget.value = "";
        }}
      />
      <details className="dwk-import-details">
        <summary>Paste JSON</summary>
        <textarea value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="Paste workflow JSON here" />
        <button type="button" onClick={() => importJson(importText)}>Import pasted JSON</button>
        {importError ? <p className="dwk-error-text">{importError}</p> : null}
      </details>
      {validation ? (
        <div className={`dwk-validation-pill ${validation.valid ? "dwk-validation-ok" : "dwk-validation-bad"}`}>
          {validation.valid ? "Valid" : `${validation.errors.length} errors`} / {validation.warnings.length} warnings
        </div>
      ) : null}
    </header>
  );
}


import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import type { WorkflowNodePlugin } from "../types/plugin";
import type { WorkflowDefinition, WorkflowEdge, WorkflowNode } from "../types/workflow";
import { WorkflowEngine } from "../core/WorkflowEngine";
import { WorkflowPluginRegistry } from "../core/WorkflowPluginRegistry";
import { WorkflowValidator } from "../core/WorkflowValidator";
import { WORKFLOW_STORAGE_KEY, makeEmptyWorkflow, nowIso } from "../core/workflowUtils";
import { defaultWorkflowPlugins } from "../plugins/defaultPlugins";
import { EdgeConfigPanel } from "./EdgeConfigPanel";
import { NodeConfigPanel } from "./NodeConfigPanel";
import { NodeSidebar } from "./NodeSidebar";
import { WorkflowAgentPanel } from "./WorkflowAgentPanel";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { WorkflowRunPanel } from "./WorkflowRunPanel";
import { WorkflowToolbar } from "./WorkflowToolbar";
import { useWorkflowBuilderStore } from "./workflowStore";
import "../styles/workflow.css";
import "@xyflow/react/dist/style.css";

export interface WorkflowBuilderProps {
  initialWorkflow?: WorkflowDefinition;
  plugins?: WorkflowNodePlugin[];
  readonly?: boolean;
  showToolbar?: boolean;
  showSidebar?: boolean;
  showConfigPanel?: boolean;
  onSave?: (workflow: WorkflowDefinition) => void;
  onChange?: (workflow: WorkflowDefinition) => void;
  onRun?: (workflow: WorkflowDefinition) => void;
}

export function WorkflowBuilder({
  initialWorkflow,
  plugins = defaultWorkflowPlugins,
  readonly,
  showToolbar = true,
  showSidebar = true,
  showConfigPanel = true,
  onSave,
  onChange,
  onRun,
}: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState<WorkflowDefinition>(() => initialWorkflow ?? makeEmptyWorkflow("Dynamic Workflow"));
  const registry = useMemo(() => new WorkflowPluginRegistry(plugins), [plugins]);
  const {
    activePanel,
    runState,
    selectedEdgeId,
    selectedNodeId,
    validation,
    setActivePanel,
    setRunState,
    setSelectedEdge,
    setSelectedNode,
    setValidation,
  } = useWorkflowBuilderStore();

  useEffect(() => {
    onChange?.(workflow);
  }, [onChange, workflow]);

  const updateWorkflow = (nextWorkflow: WorkflowDefinition) => {
    setWorkflow({ ...nextWorkflow, updatedAt: nowIso() });
  };

  const selectedNode = workflow.nodes.find((node) => node.id === selectedNodeId);
  const selectedEdge = workflow.edges.find((edge) => edge.id === selectedEdgeId);

  const validateWorkflow = () => {
    const result = new WorkflowValidator(registry).validate(workflow);
    setValidation(result);
    return result;
  };

  const saveWorkflow = () => {
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflow));
    onSave?.(workflow);
  };

  const loadWorkflow = () => {
    const raw = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      updateWorkflow(JSON.parse(raw) as WorkflowDefinition);
    } catch {
      setValidation({
        valid: false,
        errors: [{ code: "LOCALSTORAGE_PARSE", message: "Saved workflow JSON cannot be parsed." }],
        warnings: [],
      });
    }
  };

  const updateNode = (node: WorkflowNode) => {
    updateWorkflow({ ...workflow, nodes: workflow.nodes.map((item) => (item.id === node.id ? node : item)) });
  };

  const updateEdge = (edge: WorkflowEdge) => {
    updateWorkflow({ ...workflow, edges: workflow.edges.map((item) => (item.id === edge.id ? edge : item)) });
  };

  const deleteNode = (nodeId: string) => {
    setSelectedNode(undefined);
    updateWorkflow({
      ...workflow,
      nodes: workflow.nodes.filter((node) => node.id !== nodeId),
      edges: workflow.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    });
  };

  const deleteEdge = (edgeId: string) => {
    setSelectedEdge(undefined);
    updateWorkflow({ ...workflow, edges: workflow.edges.filter((edge) => edge.id !== edgeId) });
  };

  const startRun = () => {
    validateWorkflow();
    setRunState(new WorkflowEngine(workflow).start());
    onRun?.(workflow);
  };

  const stepRun = (actionId: string) => {
    if (!runState) {
      return;
    }
    setRunState(new WorkflowEngine(workflow).step(runState, actionId));
  };

  return (
    <ReactFlowProvider>
      <div className="dwk-shell">
        {showToolbar ? (
          <WorkflowToolbar
            workflow={workflow}
            validation={validation}
            showAgent
            onSave={saveWorkflow}
            onLoad={loadWorkflow}
            onValidate={validateWorkflow}
            onRun={startRun}
            onImport={updateWorkflow}
            onOpenAgent={() => setActivePanel("agent")}
          />
        ) : null}
        <main className="dwk-layout">
          {showSidebar && !readonly ? <NodeSidebar plugins={plugins} /> : null}
          <WorkflowCanvas
            workflow={workflow}
            registry={registry}
            readonly={readonly}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            onChange={updateWorkflow}
            onSelectNode={setSelectedNode}
            onSelectEdge={setSelectedEdge}
          />
          {showConfigPanel ? (
            <aside className="dwk-right-panel">
              <div className="dwk-panel-tabs">
                <button className={activePanel === "config" ? "active" : ""} type="button" onClick={() => setActivePanel("config")}>Config</button>
                <button className={activePanel === "run" ? "active" : ""} type="button" onClick={() => setActivePanel("run")}>Run</button>
                <button className={activePanel === "agent" ? "active" : ""} type="button" onClick={() => setActivePanel("agent")}>Agent</button>
              </div>
              {activePanel === "config" && selectedEdge ? (
                <EdgeConfigPanel edge={selectedEdge} readonly={readonly} onChange={updateEdge} onDelete={deleteEdge} />
              ) : null}
              {activePanel === "config" && !selectedEdge ? (
                <NodeConfigPanel workflow={workflow} node={selectedNode} registry={registry} readonly={readonly} onChange={updateNode} onDelete={deleteNode} />
              ) : null}
              {activePanel === "run" ? <WorkflowRunPanel workflow={workflow} runState={runState} onStart={startRun} onStep={stepRun} /> : null}
              {activePanel === "agent" ? <WorkflowAgentPanel workflow={workflow} onApplyWorkflow={updateWorkflow} /> : null}
            </aside>
          ) : null}
        </main>
        {validation && (validation.errors.length > 0 || validation.warnings.length > 0) ? (
          <section className="dwk-validation-panel">
            {validation.errors.map((issue) => <p key={`${issue.code}-${issue.nodeId ?? issue.edgeId ?? issue.message}`} className="dwk-error-text">{issue.code}: {issue.message}</p>)}
            {validation.warnings.map((issue) => <p key={`${issue.code}-${issue.nodeId ?? issue.edgeId ?? issue.message}`} className="dwk-warning-text">{issue.code}: {issue.message}</p>)}
          </section>
        ) : null}
      </div>
    </ReactFlowProvider>
  );
}


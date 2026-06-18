import { ReactFlowProvider } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { WorkflowAgentAdapter } from "../types/agent";
import type { WorkflowRuntimeAdapter, WorkflowStorageAdapter } from "../types/connector";
import type { WorkflowNodePlugin } from "../types/plugin";
import type { WorkflowDefinition, WorkflowEdge, WorkflowNode } from "../types/workflow";
import { WorkflowEngine } from "../core/WorkflowEngine";
import { WorkflowPluginRegistry } from "../core/WorkflowPluginRegistry";
import { WorkflowValidator } from "../core/WorkflowValidator";
import { WORKFLOW_STORAGE_KEY, makeEmptyWorkflow, nowIso } from "../core/workflowUtils";
import { LocalWorkflowStorage } from "../connectors/LocalWorkflowStorage";
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
  storage?: WorkflowStorageAdapter;
  runtimeAdapter?: WorkflowRuntimeAdapter;
  agentAdapter?: WorkflowAgentAdapter;
  workflowId?: string;
  autoLoad?: boolean;
  onSave?: (workflow: WorkflowDefinition) => void;
  onChange?: (workflow: WorkflowDefinition) => void;
  onError?: (error: Error) => void;
  onRun?: (workflow: WorkflowDefinition) => void;
}

export function WorkflowBuilder({
  initialWorkflow,
  plugins = defaultWorkflowPlugins,
  readonly,
  showToolbar = true,
  showSidebar = true,
  showConfigPanel = true,
  storage,
  runtimeAdapter,
  agentAdapter,
  workflowId,
  autoLoad = false,
  onSave,
  onChange,
  onError,
  onRun,
}: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState<WorkflowDefinition>(() => initialWorkflow ?? makeEmptyWorkflow("Dynamic Workflow"));
  const registry = useMemo(() => new WorkflowPluginRegistry(plugins), [plugins]);
  const storageAdapter = useMemo(() => storage ?? new LocalWorkflowStorage(WORKFLOW_STORAGE_KEY), [storage]);
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

  const updateWorkflow = useCallback((nextWorkflow: WorkflowDefinition) => {
    setWorkflow({ ...nextWorkflow, updatedAt: nowIso() });
  }, []);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }
    storageAdapter
      .load(workflowId)
      .then((loadedWorkflow) => {
        if (loadedWorkflow) {
          updateWorkflow(loadedWorkflow);
        }
      })
      .catch((error: unknown) => {
        onError?.(error instanceof Error ? error : new Error("Failed to auto-load workflow."));
      });
  }, [autoLoad, onError, storageAdapter, updateWorkflow, workflowId]);

  useEffect(() => {
    onChange?.(workflow);
  }, [onChange, workflow]);

  const selectedNode = workflow.nodes.find((node) => node.id === selectedNodeId);
  const selectedEdge = workflow.edges.find((edge) => edge.id === selectedEdgeId);

  const validateWorkflow = async () => {
    const result = runtimeAdapter?.validate ? await runtimeAdapter.validate(workflow) : new WorkflowValidator(registry).validate(workflow);
    setValidation(result);
    return result;
  };

  const saveWorkflow = async () => {
    try {
      await storageAdapter.save(workflow);
      onSave?.(workflow);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error("Failed to save workflow."));
    }
  };

  const loadWorkflow = async () => {
    try {
      const loadedWorkflow = await storageAdapter.load(workflowId);
      if (loadedWorkflow) {
        updateWorkflow(loadedWorkflow);
      }
    } catch (error) {
      setValidation({
        valid: false,
        errors: [{ code: "WORKFLOW_LOAD", message: error instanceof Error ? error.message : "Workflow could not be loaded." }],
        warnings: [],
      });
      onError?.(error instanceof Error ? error : new Error("Failed to load workflow."));
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
    void validateWorkflow();
    if (runtimeAdapter?.run) {
      runtimeAdapter
        .run(workflow)
        .then(setRunState)
        .catch((error: unknown) => onError?.(error instanceof Error ? error : new Error("Failed to run workflow.")));
    } else {
      setRunState(new WorkflowEngine(workflow).start());
    }
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
            onSave={() => void saveWorkflow()}
            onLoad={() => void loadWorkflow()}
            onValidate={() => void validateWorkflow()}
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
              {activePanel === "agent" ? <WorkflowAgentPanel workflow={workflow} agentAdapter={agentAdapter} onApplyWorkflow={updateWorkflow} /> : null}
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

import { ReactFlowProvider } from "@xyflow/react";
import type { WorkflowNodePlugin } from "../types/plugin";
import type { WorkflowDefinition } from "../types/workflow";
import { WorkflowPluginRegistry } from "../core/WorkflowPluginRegistry";
import { defaultWorkflowPlugins } from "../plugins/defaultPlugins";
import { WorkflowCanvas } from "../builder/WorkflowCanvas";
import "../styles/workflow.css";
import "@xyflow/react/dist/style.css";

interface WorkflowRendererProps {
  workflow: WorkflowDefinition;
  plugins?: WorkflowNodePlugin[];
}

export function WorkflowRenderer({ workflow, plugins = defaultWorkflowPlugins }: WorkflowRendererProps) {
  const registry = new WorkflowPluginRegistry(plugins);

  return (
    <ReactFlowProvider>
      <div className="dwk-renderer">
        <WorkflowCanvas
          workflow={workflow}
          registry={registry}
          readonly
          onChange={() => undefined}
          onSelectNode={() => undefined}
          onSelectEdge={() => undefined}
        />
      </div>
    </ReactFlowProvider>
  );
}


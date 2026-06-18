import type { WorkflowBuilderProps } from "../builder/WorkflowBuilder";
import { WorkflowBuilder } from "../builder/WorkflowBuilder";
import { DynamicWorkflowKitProvider, useDynamicWorkflowKit } from "./DynamicWorkflowKitContext";
import type { DynamicWorkflowKitConfig } from "../types/connector";

export interface WorkflowQuickConnectProps extends Omit<WorkflowBuilderProps, "plugins"> {
  config?: DynamicWorkflowKitConfig;
}

function ConnectedWorkflowBuilder(props: Omit<WorkflowQuickConnectProps, "config">) {
  const kit = useDynamicWorkflowKit();
  return (
    <WorkflowBuilder
      {...props}
      plugins={kit.plugins}
      storage={kit.storage}
      agentAdapter={kit.agentAdapter}
      runtimeAdapter={kit.config.runtimeAdapter}
      workflowId={kit.config.workflowId}
      autoLoad={kit.config.autoLoad}
    />
  );
}

export function WorkflowQuickConnect({ config, ...builderProps }: WorkflowQuickConnectProps) {
  return (
    <DynamicWorkflowKitProvider config={config}>
      <ConnectedWorkflowBuilder {...builderProps} />
    </DynamicWorkflowKitProvider>
  );
}

import { WorkflowBuilder } from "../builder/WorkflowBuilder";
import { defaultWorkflowPlugins } from "../plugins/defaultPlugins";
import { demoWorkflow } from "./demoWorkflow";

export function DemoWorkflowPage() {
  return (
    <WorkflowBuilder
      plugins={defaultWorkflowPlugins}
      initialWorkflow={demoWorkflow}
      onSave={(workflow) => console.info("Saved workflow", workflow)}
      onRun={(workflow) => console.info("Run workflow", workflow.name)}
    />
  );
}


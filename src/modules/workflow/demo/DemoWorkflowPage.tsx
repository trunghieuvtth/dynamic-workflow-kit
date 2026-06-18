import { defaultWorkflowPlugins } from "../plugins/defaultPlugins";
import { WorkflowQuickConnect } from "../runtime/WorkflowQuickConnect";
import { demoWorkflow } from "./demoWorkflow";

export function DemoWorkflowPage() {
  return (
    <WorkflowQuickConnect
      config={{ plugins: defaultWorkflowPlugins }}
      initialWorkflow={demoWorkflow}
      onSave={(workflow) => console.info("Saved workflow", workflow)}
      onRun={(workflow) => console.info("Run workflow", workflow.name)}
    />
  );
}

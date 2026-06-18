# DynamicWorkflowKit

DynamicWorkflowKit is a React + TypeScript workflow builder module for building dynamic approval, routing, document, integration, and AI-assisted workflows. It is designed as a plugin-friendly kit that can be embedded into other React/Vite/Next.js applications.

## Run The Project

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. The first page is the workflow builder demo for **Quy trình xử lý hồ sơ và phê duyệt văn bản**.

## Build And Lint

```bash
npm run lint
npm run build
```

## Module Location

```text
src/modules/workflow/
```

Main exports:

```ts
import {
  WorkflowBuilder,
  WorkflowRenderer,
  WorkflowEngine,
  WorkflowAgent,
  WorkflowPluginRegistry,
  defaultWorkflowPlugins,
  demoWorkflow,
} from "@/modules/workflow";
```

## Embed WorkflowBuilder

```tsx
import {
  WorkflowBuilder,
  defaultWorkflowPlugins,
  demoWorkflow,
} from "@/modules/workflow";

export default function WorkflowPage() {
  return (
    <WorkflowBuilder
      plugins={defaultWorkflowPlugins}
      initialWorkflow={demoWorkflow}
      onSave={(workflow) => console.log(workflow)}
    />
  );
}
```

## Create A New Node Plugin

```tsx
import { ClipboardList } from "lucide-react";
import type { WorkflowNodePlugin } from "@/modules/workflow";

export const CustomReviewPlugin: WorkflowNodePlugin = {
  type: "custom-review",
  label: "Custom Review",
  description: "A custom review step",
  icon: ClipboardList,
  category: "process",
  defaultConfig: {
    reviewer: "",
    checklist: [],
  },
  inputHandles: [{ id: "in", label: "In" }],
  outputHandles: [{ id: "done", label: "Done" }],
  renderNode: ({ node }) => <div>{node.data.label}</div>,
  execute: () => ({ status: "success", message: "Custom review completed." }),
};
```

Then pass it to the builder:

```tsx
<WorkflowBuilder plugins={[...defaultWorkflowPlugins, CustomReviewPlugin]} />
```

## Bidirectional And Return Edges

Edges support `forward`, `backward`, and `bidirectional` direction values:

```ts
{
  id: "edge_return_to_specialist",
  source: "approval_leader",
  target: "specialist_process",
  label: "Trả về bổ sung",
  condition: "approvalResult == 'returned'",
  direction: "backward",
  edgeType: "return",
}
```

The builder styles return/backward edges with dashed orange lines. Bidirectional edges render arrows at both ends when supported by React Flow markers.

## Validate Workflow

```ts
import { WorkflowPluginRegistry, WorkflowValidator, defaultWorkflowPlugins } from "@/modules/workflow";

const registry = new WorkflowPluginRegistry(defaultWorkflowPlugins);
const result = new WorkflowValidator(registry).validate(workflow);
```

The validator checks Start/End rules, edge source/target integrity, condition branches, approval branches, loops, isolated nodes, reachability from Start, and paths to End.

## Run/Test Workflow

```ts
import { WorkflowEngine } from "@/modules/workflow";

const engine = new WorkflowEngine(workflow);
let state = engine.start();
state = engine.step(state, state.availableActions[0].id);
```

The builder includes a Run/Test panel with current node, available next actions, execution history, and workflow variables.

## Import, Export, And LocalStorage

The toolbar supports:

- Save to LocalStorage key `dynamic-workflow-kit-current`
- Load from LocalStorage
- Export JSON as a file and copy JSON to clipboard
- Import JSON from file or pasted text
- Validate imported schema with Zod

## WorkflowAgent

The current agent is rule-based and offline. It supports:

- Generate a Vietnamese approval workflow from a prompt
- Explain workflow JSON in Vietnamese
- Suggest logic fixes using `WorkflowValidator`

Future adapters can implement the same interface:

```ts
export interface WorkflowAgentAdapter {
  promptToWorkflow(prompt: string): Promise<WorkflowDefinition>;
  explainWorkflow(workflow: WorkflowDefinition): Promise<string>;
  suggestFixes(workflow: WorkflowDefinition): Promise<string[]>;
}
```

This makes it straightforward to swap in OpenAI, a local LLM, or a backend orchestration service later.


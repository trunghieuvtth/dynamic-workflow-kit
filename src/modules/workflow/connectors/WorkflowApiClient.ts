import type { WorkflowApiClient, WorkflowHttpClientOptions } from "../types/connector";
import type { WorkflowDefinition, WorkflowRunState, WorkflowValidationResult } from "../types/workflow";

async function resolveHeaders(headers: WorkflowHttpClientOptions["headers"]): Promise<Record<string, string>> {
  if (!headers) {
    return {};
  }
  return typeof headers === "function" ? headers() : headers;
}

async function requestJson<T>(options: WorkflowHttpClientOptions, path: string, init: RequestInit = {}): Promise<T> {
  const headers = await resolveHeaders(options.headers);
  const response = await fetch(`${options.baseUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    credentials: options.credentials,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Workflow API request failed: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function createWorkflowApiClient(options: WorkflowHttpClientOptions): WorkflowApiClient {
  return {
    listWorkflows: () => requestJson<WorkflowDefinition[]>(options, "/workflows"),
    getWorkflow: (workflowId) => requestJson<WorkflowDefinition | undefined>(options, `/workflows/${encodeURIComponent(workflowId)}`),
    saveWorkflow: (workflow) =>
      requestJson<WorkflowDefinition>(options, `/workflows/${encodeURIComponent(workflow.id)}`, {
        method: "PUT",
        body: JSON.stringify(workflow),
      }),
    deleteWorkflow: (workflowId) =>
      requestJson<void>(options, `/workflows/${encodeURIComponent(workflowId)}`, {
        method: "DELETE",
      }),
    validateWorkflow: (workflow) =>
      requestJson<WorkflowValidationResult>(options, "/workflows/validate", {
        method: "POST",
        body: JSON.stringify(workflow),
      }),
    runWorkflow: (workflow, variables) =>
      requestJson<WorkflowRunState>(options, "/workflows/run", {
        method: "POST",
        body: JSON.stringify({ workflow, variables }),
      }),
  };
}


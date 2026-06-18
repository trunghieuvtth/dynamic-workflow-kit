import type { ReactNode } from "react";
import type { WorkflowAgentAdapter } from "./agent";
import type { WorkflowNodePlugin } from "./plugin";
import type { WorkflowDefinition, WorkflowRunState, WorkflowValidationResult } from "./workflow";

export interface WorkflowStorageAdapter {
  load: (workflowId?: string) => Promise<WorkflowDefinition | undefined>;
  save: (workflow: WorkflowDefinition) => Promise<void>;
  delete?: (workflowId: string) => Promise<void>;
  list?: () => Promise<WorkflowDefinition[]>;
}

export interface WorkflowHttpClientOptions {
  baseUrl: string;
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
  credentials?: RequestCredentials;
}

export interface WorkflowRuntimeAdapter {
  validate?: (workflow: WorkflowDefinition) => Promise<WorkflowValidationResult>;
  run?: (workflow: WorkflowDefinition, variables?: Record<string, unknown>) => Promise<WorkflowRunState>;
}

export interface DynamicWorkflowKitConfig {
  storage?: WorkflowStorageAdapter;
  apiBaseUrl?: string;
  http?: WorkflowHttpClientOptions;
  plugins?: WorkflowNodePlugin[];
  agentAdapter?: WorkflowAgentAdapter;
  runtimeAdapter?: WorkflowRuntimeAdapter;
  autoLoad?: boolean;
  workflowId?: string;
}

export interface DynamicWorkflowKitProviderProps {
  config?: DynamicWorkflowKitConfig;
  children: ReactNode;
}

export interface WorkflowApiClient {
  listWorkflows: () => Promise<WorkflowDefinition[]>;
  getWorkflow: (workflowId: string) => Promise<WorkflowDefinition | undefined>;
  saveWorkflow: (workflow: WorkflowDefinition) => Promise<WorkflowDefinition>;
  deleteWorkflow: (workflowId: string) => Promise<void>;
  validateWorkflow: (workflow: WorkflowDefinition) => Promise<WorkflowValidationResult>;
  runWorkflow: (workflow: WorkflowDefinition, variables?: Record<string, unknown>) => Promise<WorkflowRunState>;
}


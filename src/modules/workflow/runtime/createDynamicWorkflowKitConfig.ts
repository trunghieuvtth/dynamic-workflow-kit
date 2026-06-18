import { LlmWorkflowAgentAdapter } from "../agent-adapters/LlmWorkflowAgentAdapter";
import { ApiWorkflowStorage } from "../connectors/ApiWorkflowStorage";
import { defaultWorkflowPlugins } from "../plugins/defaultPlugins";
import type { DynamicWorkflowKitConfig, WorkflowHttpClientOptions } from "../types/connector";
import type { WorkflowNodePlugin } from "../types/plugin";

export interface CreateDynamicWorkflowKitConfigOptions {
  apiBaseUrl?: string;
  http?: WorkflowHttpClientOptions;
  plugins?: WorkflowNodePlugin[];
  workflowId?: string;
  autoLoad?: boolean;
  llm?: {
    endpoint: string;
    apiKey?: string;
    model?: string;
  };
}

export function createDynamicWorkflowKitConfig(options: CreateDynamicWorkflowKitConfigOptions = {}): DynamicWorkflowKitConfig {
  const http = options.http ?? (options.apiBaseUrl ? { baseUrl: options.apiBaseUrl } : undefined);
  return {
    http,
    apiBaseUrl: options.apiBaseUrl,
    workflowId: options.workflowId,
    autoLoad: options.autoLoad,
    plugins: options.plugins ?? defaultWorkflowPlugins,
    storage: http ? new ApiWorkflowStorage(http) : undefined,
    agentAdapter: options.llm ? new LlmWorkflowAgentAdapter(options.llm) : undefined,
  };
}


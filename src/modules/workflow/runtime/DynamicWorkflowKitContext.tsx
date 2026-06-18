/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from "react";
import type { DynamicWorkflowKitConfig, DynamicWorkflowKitProviderProps } from "../types/connector";
import { WorkflowAgent } from "../agents/WorkflowAgent";
import { LocalWorkflowStorage } from "../connectors/LocalWorkflowStorage";
import { ApiWorkflowStorage } from "../connectors/ApiWorkflowStorage";
import { defaultWorkflowPlugins } from "../plugins/defaultPlugins";

export interface DynamicWorkflowKitContextValue extends Required<Pick<DynamicWorkflowKitConfig, "storage" | "plugins" | "agentAdapter">> {
  config: DynamicWorkflowKitConfig;
}

const DynamicWorkflowKitContext = createContext<DynamicWorkflowKitContextValue | undefined>(undefined);

function resolveStorage(config: DynamicWorkflowKitConfig) {
  if (config.storage) {
    return config.storage;
  }
  if (config.http) {
    return new ApiWorkflowStorage(config.http);
  }
  if (config.apiBaseUrl) {
    return new ApiWorkflowStorage({ baseUrl: config.apiBaseUrl });
  }
  return new LocalWorkflowStorage();
}

export function DynamicWorkflowKitProvider({ config = {}, children }: DynamicWorkflowKitProviderProps) {
  const value = useMemo<DynamicWorkflowKitContextValue>(
    () => ({
      config,
      storage: resolveStorage(config),
      plugins: config.plugins ?? defaultWorkflowPlugins,
      agentAdapter: config.agentAdapter ?? new WorkflowAgent(),
    }),
    [config],
  );

  return <DynamicWorkflowKitContext.Provider value={value}>{children}</DynamicWorkflowKitContext.Provider>;
}

export function useDynamicWorkflowKit() {
  const context = useContext(DynamicWorkflowKitContext);
  if (!context) {
    return {
      config: {},
      storage: new LocalWorkflowStorage(),
      plugins: defaultWorkflowPlugins,
      agentAdapter: new WorkflowAgent(),
    };
  }
  return context;
}

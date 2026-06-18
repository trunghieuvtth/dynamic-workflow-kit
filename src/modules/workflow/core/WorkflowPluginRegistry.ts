import type { WorkflowNodePlugin } from "../types/plugin";

export class WorkflowPluginRegistry {
  private plugins = new Map<string, WorkflowNodePlugin>();

  constructor(plugins: WorkflowNodePlugin[] = []) {
    plugins.forEach((plugin) => this.register(plugin));
  }

  register(plugin: WorkflowNodePlugin): void {
    this.plugins.set(plugin.type, plugin);
  }

  unregister(type: string): void {
    this.plugins.delete(type);
  }

  get(type: string): WorkflowNodePlugin | undefined {
    return this.plugins.get(type);
  }

  getAll(): WorkflowNodePlugin[] {
    return Array.from(this.plugins.values());
  }

  getByCategory(category: string): WorkflowNodePlugin[] {
    return this.getAll().filter((plugin) => plugin.category === category);
  }
}


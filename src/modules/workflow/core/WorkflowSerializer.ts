import { z } from "zod";
import type { WorkflowDefinition } from "../types/workflow";

const nodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({
    label: z.string(),
    description: z.string().optional(),
    config: z.record(z.string(), z.unknown()).optional(),
    pluginType: z.string().optional(),
  }),
});

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  condition: z.string().optional(),
  direction: z.enum(["forward", "backward", "bidirectional"]),
  edgeType: z.string(),
  priority: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const workflowDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string(),
  status: z.enum(["draft", "active", "archived"]),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export class WorkflowSerializer {
  static serialize(workflow: WorkflowDefinition): string {
    return JSON.stringify(workflow, null, 2);
  }

  static parse(json: string): WorkflowDefinition {
    const parsed = JSON.parse(json) as unknown;
    return workflowDefinitionSchema.parse(parsed);
  }

  static tryParse(json: string): { workflow?: WorkflowDefinition; error?: string } {
    try {
      return { workflow: WorkflowSerializer.parse(json) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Invalid workflow JSON" };
    }
  }
}


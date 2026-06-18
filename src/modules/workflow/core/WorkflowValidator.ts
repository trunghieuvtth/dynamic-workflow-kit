import type { WorkflowDefinition, WorkflowValidationIssue, WorkflowValidationResult } from "../types/workflow";
import type { WorkflowPluginRegistry } from "./WorkflowPluginRegistry";

export class WorkflowValidator {
  private registry?: WorkflowPluginRegistry;

  constructor(registry?: WorkflowPluginRegistry) {
    this.registry = registry;
  }

  validate(workflow: WorkflowDefinition): WorkflowValidationResult {
    const errors: WorkflowValidationIssue[] = [];
    const warnings: WorkflowValidationIssue[] = [];
    const nodeIds = new Set(workflow.nodes.map((node) => node.id));
    const startNodes = workflow.nodes.filter((node) => node.type === "start");
    const endNodes = workflow.nodes.filter((node) => node.type === "end");

    if (startNodes.length !== 1) {
      errors.push({ code: "START_COUNT", message: "Workflow must have exactly one Start node." });
    }

    if (endNodes.length < 1) {
      errors.push({ code: "END_REQUIRED", message: "Workflow must have at least one End node." });
    }

    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push({ code: "EDGE_SOURCE_MISSING", message: `Edge source '${edge.source}' does not exist.`, edgeId: edge.id });
      }
      if (!nodeIds.has(edge.target)) {
        errors.push({ code: "EDGE_TARGET_MISSING", message: `Edge target '${edge.target}' does not exist.`, edgeId: edge.id });
      }
      const target = workflow.nodes.find((node) => node.id === edge.target);
      if (target?.type === "start") {
        errors.push({ code: "EDGE_TO_START", message: "Edges cannot point into a Start node.", edgeId: edge.id, nodeId: target.id });
      }
    }

    for (const node of workflow.nodes) {
      const incoming = workflow.edges.filter((edge) => edge.target === node.id || (edge.direction === "bidirectional" && edge.source === node.id));
      const outgoing = workflow.edges.filter((edge) => edge.source === node.id || (edge.direction === "bidirectional" && edge.target === node.id));

      if (node.type !== "start" && node.type !== "end" && incoming.length === 0 && outgoing.length === 0) {
        warnings.push({ code: "ISOLATED_NODE", message: "Node is not connected yet.", nodeId: node.id });
      }

      if (node.type === "end" && outgoing.length > 0) {
        errors.push({ code: "END_HAS_OUTPUT", message: "End nodes cannot have outgoing edges.", nodeId: node.id });
      }

      if (node.type === "condition" && outgoing.length < 2) {
        errors.push({ code: "CONDITION_OUTPUTS", message: "Condition nodes need at least two outgoing edges.", nodeId: node.id });
      }

      if (node.type === "approval") {
        const labels = outgoing.map((edge) => `${edge.label ?? ""} ${String(edge.metadata?.result ?? "")}`.toLowerCase());
        if (!labels.some((label) => label.includes("approved") || label.includes("đồng ý") || label.includes("dong y"))) {
          warnings.push({ code: "APPROVAL_APPROVED_MISSING", message: "Approval node should have an approved branch.", nodeId: node.id });
        }
        if (!labels.some((label) => label.includes("rejected") || label.includes("từ chối") || label.includes("tu choi"))) {
          warnings.push({ code: "APPROVAL_REJECTED_MISSING", message: "Approval node should have a rejected branch.", nodeId: node.id });
        }
        if (node.data.config?.allowReturn === true && !labels.some((label) => label.includes("returned") || label.includes("trả về") || label.includes("tra ve"))) {
          warnings.push({ code: "APPROVAL_RETURN_MISSING", message: "Approval node allows return but has no returned branch.", nodeId: node.id });
        }
      }

      const plugin = this.registry?.get(node.type);
      const pluginResult = plugin?.validate?.(node, workflow);
      if (pluginResult && !pluginResult.valid) {
        pluginResult.errors.forEach((message) => errors.push({ code: "PLUGIN_VALIDATION", message, nodeId: node.id }));
      }
      pluginResult?.warnings?.forEach((message) => warnings.push({ code: "PLUGIN_WARNING", message, nodeId: node.id }));
    }

    this.addReachabilityWarnings(workflow, warnings);
    this.addCycleWarnings(workflow, warnings);

    return { valid: errors.length === 0, errors, warnings };
  }

  private addReachabilityWarnings(workflow: WorkflowDefinition, warnings: WorkflowValidationIssue[]): void {
    const start = workflow.nodes.find((node) => node.type === "start");
    if (!start) {
      return;
    }
    const reachable = new Set<string>();
    const stack = [start.id];
    while (stack.length > 0) {
      const nodeId = stack.pop();
      if (!nodeId || reachable.has(nodeId)) {
        continue;
      }
      reachable.add(nodeId);
      workflow.edges
        .filter((edge) => edge.source === nodeId || (edge.direction === "bidirectional" && edge.target === nodeId))
        .forEach((edge) => stack.push(edge.source === nodeId ? edge.target : edge.source));
    }
    workflow.nodes
      .filter((node) => !reachable.has(node.id))
      .forEach((node) => warnings.push({ code: "UNREACHABLE_FROM_START", message: "Node cannot be reached from Start.", nodeId: node.id }));

    for (const node of workflow.nodes.filter((item) => item.type !== "end")) {
      if (!this.canReachEnd(workflow, node.id)) {
        warnings.push({ code: "NO_PATH_TO_END", message: "This branch does not currently lead to an End node.", nodeId: node.id });
      }
    }
  }

  private canReachEnd(workflow: WorkflowDefinition, nodeId: string): boolean {
    const visited = new Set<string>();
    const stack = [nodeId];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || visited.has(current)) {
        continue;
      }
      visited.add(current);
      const node = workflow.nodes.find((item) => item.id === current);
      if (node?.type === "end") {
        return true;
      }
      workflow.edges
        .filter((edge) => edge.source === current || (edge.direction === "bidirectional" && edge.target === current))
        .forEach((edge) => stack.push(edge.source === current ? edge.target : edge.source));
    }
    return false;
  }

  private addCycleWarnings(workflow: WorkflowDefinition, warnings: WorkflowValidationIssue[]): void {
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const parentEdge = new Map<string, string>();

    const visit = (nodeId: string): void => {
      visiting.add(nodeId);
      const edges = workflow.edges.filter((edge) => edge.source === nodeId || (edge.direction === "bidirectional" && edge.target === nodeId));
      for (const edge of edges) {
        const next = edge.source === nodeId ? edge.target : edge.source;
        if (!visited.has(next) && !visiting.has(next)) {
          parentEdge.set(next, edge.id);
          visit(next);
        } else if (visiting.has(next)) {
          const controlled = edge.edgeType === "loop" || edge.edgeType === "return";
          warnings.push({
            code: controlled ? "CONTROLLED_LOOP" : "UNCONTROLLED_LOOP",
            message: controlled ? "Workflow contains a controlled loop/return path." : "Workflow contains a loop without loop or return edge type.",
            edgeId: edge.id || parentEdge.get(next),
          });
        }
      }
      visiting.delete(nodeId);
      visited.add(nodeId);
    };

    workflow.nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    });
  }
}

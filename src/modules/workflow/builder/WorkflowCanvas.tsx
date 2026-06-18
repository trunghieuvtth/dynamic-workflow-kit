import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useMemo } from "react";
import type { Connection, Edge, EdgeChange, Node, NodeChange, NodeProps } from "@xyflow/react";
import type { WorkflowNodePlugin } from "../types/plugin";
import type { WorkflowDefinition, WorkflowEdge, WorkflowNode } from "../types/workflow";
import { WorkflowPluginRegistry } from "../core/WorkflowPluginRegistry";
import { createEdgeId, createNodeId, nowIso } from "../core/workflowUtils";
import { WorkflowMiniMap } from "./WorkflowMiniMap";

interface WorkflowCanvasProps {
  workflow: WorkflowDefinition;
  registry: WorkflowPluginRegistry;
  readonly?: boolean;
  selectedNodeId?: string;
  selectedEdgeId?: string;
  onChange: (workflow: WorkflowDefinition) => void;
  onSelectNode: (nodeId?: string) => void;
  onSelectEdge: (edgeId?: string) => void;
}

interface FlowNodeData extends Record<string, unknown> {
  workflowNode: WorkflowNode;
  plugin?: WorkflowNodePlugin;
  selected: boolean;
}

interface FlowEdgeData extends Record<string, unknown> {
  workflowEdge: WorkflowEdge;
}

type FlowNode = Node<FlowNodeData>;
type FlowEdge = Edge<FlowEdgeData>;

function WorkflowFlowNode({ data, selected }: NodeProps<FlowNode>) {
  const workflowNode = data.workflowNode;
  const plugin = data.plugin;
  const RenderNode = plugin?.renderNode;
  const inputHandles = plugin?.inputHandles ?? [{ id: "in", label: "In" }];
  const outputHandles = plugin?.outputHandles ?? [{ id: "out", label: "Out" }];

  return (
    <div className="dwk-flow-node">
      {inputHandles.map((handle, index) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="target"
          position={Position.Left}
          style={{ top: `${((index + 1) * 100) / (inputHandles.length + 1)}%` }}
        />
      ))}
      {RenderNode ? (
        <RenderNode node={workflowNode} selected={selected || data.selected} />
      ) : (
        <div className="dwk-node dwk-node-task">
          <span className="dwk-node-badge">missing</span>
          <div className="dwk-node-title">{workflowNode.data.label}</div>
        </div>
      )}
      {outputHandles.map((handle, index) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="source"
          position={Position.Right}
          style={{ top: `${((index + 1) * 100) / (outputHandles.length + 1)}%` }}
        />
      ))}
    </div>
  );
}

const nodeTypes = { workflowNode: WorkflowFlowNode };

function toFlowNode(node: WorkflowNode, registry: WorkflowPluginRegistry, selectedNodeId?: string): FlowNode {
  return {
    id: node.id,
    type: "workflowNode",
    position: node.position,
    selected: selectedNodeId === node.id,
    data: {
      workflowNode: node,
      plugin: registry.get(node.type),
      selected: selectedNodeId === node.id,
    },
  };
}

function edgeStyle(edge: WorkflowEdge): FlowEdge {
  const colorByType: Record<string, string> = {
    return: "#d97706",
    loop: "#9333ea",
    error: "#dc2626",
    condition: "#ca8a04",
    approval: "#7c3aed",
  };
  const stroke = colorByType[edge.edgeType] ?? (edge.direction === "backward" ? "#ea580c" : "#2563eb");
  const markerEnd = { type: MarkerType.ArrowClosed, color: stroke };
  const markerStart = edge.direction === "bidirectional" ? { type: MarkerType.ArrowClosed, color: stroke } : undefined;

  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label ?? edge.edgeType,
    markerEnd,
    markerStart,
    animated: edge.edgeType === "loop" || edge.edgeType === "return",
    style: {
      stroke,
      strokeWidth: edge.direction === "backward" ? 2.5 : 2,
      strokeDasharray: edge.direction === "backward" || edge.edgeType === "return" ? "6 4" : undefined,
    },
    data: { workflowEdge: edge },
  };
}

export function WorkflowCanvas({
  workflow,
  registry,
  readonly,
  selectedNodeId,
  selectedEdgeId,
  onChange,
  onSelectNode,
  onSelectEdge,
}: WorkflowCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const nodes = useMemo(() => workflow.nodes.map((node) => toFlowNode(node, registry, selectedNodeId)), [workflow.nodes, registry, selectedNodeId]);
  const edges = useMemo(() => workflow.edges.map(edgeStyle).map((edge) => ({ ...edge, selected: edge.id === selectedEdgeId })), [workflow.edges, selectedEdgeId]);

  const updateWorkflow = useCallback(
    (partial: Partial<WorkflowDefinition>) => {
      onChange({ ...workflow, ...partial, updatedAt: nowIso() });
    },
    [onChange, workflow],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      if (readonly) {
        return;
      }
      const updated = applyNodeChanges(changes, nodes);
      const updatedIds = new Set(updated.map((node) => node.id));
      updateWorkflow({
        nodes: workflow.nodes
          .filter((node) => updatedIds.has(node.id))
          .map((node) => {
            const flowNode = updated.find((item) => item.id === node.id);
            return flowNode ? { ...node, position: flowNode.position } : node;
          }),
        edges: workflow.edges.filter((edge) => updatedIds.has(edge.source) && updatedIds.has(edge.target)),
      });
    },
    [nodes, readonly, updateWorkflow, workflow.edges, workflow.nodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<FlowEdge>[]) => {
      if (readonly) {
        return;
      }
      const updated = applyEdgeChanges(changes, edges);
      const updatedIds = new Set(updated.map((edge) => edge.id));
      updateWorkflow({ edges: workflow.edges.filter((edge) => updatedIds.has(edge.id)) });
    },
    [edges, readonly, updateWorkflow, workflow.edges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (readonly || !connection.source || !connection.target) {
        return;
      }
      const edge: WorkflowEdge = {
        id: createEdgeId(connection.source, connection.target),
        source: connection.source,
        target: connection.target,
        label: "Next",
        direction: "forward",
        edgeType: "normal",
        metadata: {
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        },
      };
      updateWorkflow({ edges: [...workflow.edges, edge] });
    },
    [readonly, updateWorkflow, workflow.edges],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (readonly) {
        return;
      }
      const type = event.dataTransfer.getData("application/dwk-node-type");
      const plugin = registry.get(type);
      if (!plugin) {
        return;
      }
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const node: WorkflowNode = {
        id: createNodeId(type),
        type,
        position,
        data: {
          label: plugin.label,
          description: plugin.description,
          config: structuredClone(plugin.defaultConfig),
          pluginType: plugin.type,
        },
      };
      updateWorkflow({ nodes: [...workflow.nodes, node] });
    },
    [readonly, registry, screenToFlowPosition, updateWorkflow, workflow.nodes],
  );

  return (
    <div className="dwk-canvas" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onSelectNode(node.id)}
        onEdgeClick={(_, edge) => onSelectEdge(edge.id)}
        onPaneClick={() => {
          onSelectNode(undefined);
          onSelectEdge(undefined);
        }}
        fitView
        nodesDraggable={!readonly}
        nodesConnectable={!readonly}
        elementsSelectable
      >
        <Background gap={18} size={1} />
        <Controls />
        <WorkflowMiniMap />
      </ReactFlow>
    </div>
  );
}

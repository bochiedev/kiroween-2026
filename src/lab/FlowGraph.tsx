import '@xyflow/react/dist/style.css';
import { Background, ReactFlow } from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import type { SimState } from '../simulation';
import { flowEdges, flowNodes } from './flowModel';

/** XYFlow lives only in this module, which is loaded lazily from ArchitectureView. */
export default function FlowGraph({ state }: { state: SimState }) {
  const nodes: Node[] = flowNodes(state).map((n) => ({
    id: n.id,
    position: { x: n.x, y: 0 },
    draggable: false,
    selectable: false,
    focusable: false,
    className: n.up ? 'node-up' : 'node-down',
    data: {
      label: (
        <span>
          <span aria-hidden="true">{n.up ? '●' : '▲'}</span> {n.label}
          <br />
          {n.up ? 'UP' : 'DOWN'}
          {n.detail ? <><br />{n.detail}</> : null}
        </span>
      ),
    },
    style: { width: 150 },
  }));
  const edges: Edge[] = flowEdges(state).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: e.moving,
    focusable: false,
    className: e.moving ? 'edge-moving' : undefined,
  }));
  return (
    <div className="flow" role="img" aria-label="Diagram: API to Queue to Worker to Database. The text list below has the same state.">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: false }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

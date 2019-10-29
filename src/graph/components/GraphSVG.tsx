import React from 'react';
import { Graph } from '../types/graphTypes';
import { GraphState } from '../types/graphStateTypes';
import { getPortId } from '../graphHelpers';
import GraphSVGConnection from './GraphSVGConnection';

type Props = {
    graph: Graph;
    state: GraphState;
}

type Connection = { portId: string, sx: number, sy: number, ex: number, ey: number };

function getNodePos(graph: Graph, state: GraphState, nodeId: string): { x: number, y: number } | undefined {
    const node = graph.nodes[nodeId];
    if (node == null) return;

    let x = node.x;
    let y = node.y;
    const nodeDrag = state.nodeDrag;

    if (nodeDrag && nodeDrag.nodeId === nodeId) {
        
        if (nodeDrag.dx != null) {
            x = nodeDrag.dx;
        }

        if (nodeDrag.dy != null) {
            y = nodeDrag.dy;
        }
    }

    return { x, y };
}

function getConnections(graph: Graph, state: GraphState) {
    const offsets = state.portOffsets;
    const connections: Connection[] = [];

    for (let [nodeId, node] of Object.entries(graph.nodes)) {

        const nodePos = getNodePos(graph, state, nodeId);
        if (nodePos == null) continue;

        for (let [portName, port] of Object.entries(node.ports.out)) {
            if (port == null) continue;

            const portId = getPortId(nodeId, true, portName);
            const portOffset = offsets[portId];
            if (portOffset == null) continue;

            const targetNodePos = getNodePos(graph, state, port.node);
            if (targetNodePos == null) continue;

            const targetPortId = getPortId(port.node, false, port.port);
            const targetPortOffset = offsets[targetPortId];
            if (targetPortOffset == null) continue;

            const sx = nodePos.x + portOffset.offX;
            const sy = nodePos.y + portOffset.offY;
            const ex = targetNodePos.x + targetPortOffset.offX;
            const ey  = targetNodePos.y + targetPortOffset.offY;

            connections.push({ portId, sx, sy, ex, ey });
        }
    }

    return connections;
}

export default function GraphSVG({ graph, state }: Props) {
    const connections = getConnections(graph, state);

    return (
        <svg className="graph-svg">
            {connections.map(conn => (
                <GraphSVGConnection
                    key={conn.portId}
                    sx={conn.sx}
                    sy={conn.sy}
                    ex={conn.ex}
                    ey={conn.ey}
                />
            ))}
        </svg>
    );
}


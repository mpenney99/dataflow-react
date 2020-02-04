import { GraphNode } from "../types/graphTypes";
import { GraphConfig } from "../types/graphConfigTypes";
import { GraphNodeContext } from "../types/graphInputTypes";

export function computeGraphNodeContexts<Ctx, Params>(
    params: Params | undefined,
    graphNodes: { [id: string]: GraphNode },
    graphConfig: GraphConfig<Ctx, Params>
): Map<string, GraphNodeContext<Ctx, Params>> {

    const baseContext = graphConfig.context;
    const baseParams: Params = params ?? graphConfig.params!;

    const contexts = new Map<string, GraphNodeContext<Ctx, Params>>();
    const seen = new Set<string>();

    function resolve(nodeId: string): Ctx {
        const node = graphNodes[nodeId];
        if (!node) {
            return baseContext;
        }

        const nodeConfig = graphConfig.nodes[node.type];
        if (contexts.has(nodeId)) {
            const context = contexts.get(nodeId)!;
            const ctx = context.context;
            
            if (nodeConfig.mapContext) {
                return nodeConfig.mapContext(node, ctx, baseParams);

            } else {
                return ctx;
            }
        }

        if (seen.has(nodeId)) {
            throw new Error('Error computing graph-node contexts. Cyclic dependency detected!');
        }

        seen.add(nodeId);

        let context: Ctx | undefined;
        const parents: { [key: string]: Ctx[] } = {};

        const portConfigs = nodeConfig.ports.in;
        const ports = node.ports.in;

        for (const portId in portConfigs) {
            const portTargets = ports[portId];
            
            if (portTargets) {
                const n = portTargets.length;
                const p = new Array<Ctx>(n);

                for (let i = 0; i < n; i++) {
                    const parentNodeId = portTargets[i].node;
                    const parentCtx = resolve(parentNodeId);
                    p[i] = parentCtx;

                    if (!context) {
                        context = parentCtx;

                    } else {
                        context = graphConfig.mergeContexts(context, parentCtx);
                    }
                }

                parents[portId] = p;

            } else {
                parents[portId] = [];
            }
        }

        if (!context) {
            context = baseContext;
        }

        contexts.set(nodeId, {
            context,
            params: baseParams,
            parents
        });

        if (nodeConfig.mapContext) {
            return nodeConfig.mapContext(node, context, baseParams);

        } else {
            return context;
        }
    }

    for (const nodeId in graphNodes) {
        resolve(nodeId);
    }

    return contexts;
}

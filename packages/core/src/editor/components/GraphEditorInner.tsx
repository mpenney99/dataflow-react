import React, { useMemo, useEffect } from 'react';
import { useStore } from 'react-redux';
import Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

import { Graph } from '../../types/graphTypes';
import { GraphConfig } from '../../types/graphConfigTypes';
import { GraphPreviewParams } from '../../types/graphEditorTypes';
import { GraphTemplate } from '../../types/graphTemplateTypes';
import { StoreState } from '../../types/storeTypes';

import ContextMenu from './contextmenu/ContextMenu';
import GraphConnectionsContainer from './connections/GraphConnectionsContainer';
import GraphEditorContent from './GraphEditorContent';
import { graphContext, GraphContext } from '../graphEditorContext';
import GraphEditorPreview from './preview/GraphEditorPreview';
import GraphEditorNodes from './GraphEditorNodes';
import SideBar from './sidebar/SideBar';
import { selectGraph } from '../../store/selectors';
import { GraphNodePortRefs } from '../GraphNodePortRefs';
import { dialogsContext, DialogsManager } from './dialog/DialogsManager';
import { useRef } from 'react';
import DialogsContainer from './dialog/DialogsContainer';

type Props<Ctx, P> = {
    modalRoot: HTMLElement;
    graphConfig: GraphConfig<Ctx, P>;
    params?: P;
    templates?: GraphTemplate[];
    onGraphChanged?: (graph: Graph) => void;
    renderPreview?: (params: GraphPreviewParams) => React.ReactNode | null;
}

function useDialogsManager() {
    const ref = useRef<DialogsManager>();
    if (!ref.current) {
        ref.current = new DialogsManager();
    }
    return ref.current;
}

function GraphEditorInner<Ctx, P>({ modalRoot, graphConfig, params, templates, onGraphChanged, renderPreview }: Props<Ctx, P>) {
    const store = useStore<StoreState>();
    
    useEffect(() => {
        if (onGraphChanged) {
            let prevGraph = selectGraph(store.getState());

            // subscribe to the store directly, to avoid
            // rendering unnecessarily
            return store.subscribe(() => {
                const state = store.getState();
                const graph = selectGraph(state);

                if (prevGraph !== graph) {
                    prevGraph = graph;
                    onGraphChanged(graph);
                }
            });
        }
    }, [store, onGraphChanged]);

    // construct the port refs instance
    const portRefs = useMemo(() => {
        return new GraphNodePortRefs();
    }, []);

    // construct the graph context. Be careful that this doesn't change often, otherwise it will have
    // a large performance impact.
    const graphContextValue = useMemo((): GraphContext<Ctx, P> => {
        return {
            graphConfig,
            modalRoot,
            ports: portRefs,
            params: params || graphConfig.params!,
            templates: templates || [],
        };
    }, [graphConfig, templates, modalRoot, portRefs, params]);

    // create the dialog manager instance
    const dialogsManager = useDialogsManager();

    return (
        <graphContext.Provider value={graphContextValue}>
            <dialogsContext.Provider value={dialogsManager}>
                <DndProvider backend={Backend}>
                    <SideBar/>
                    <GraphEditorContent>
                        <>
                            <GraphConnectionsContainer/>
                            <GraphEditorNodes
                                graphConfig={graphConfig}
                            />
                        </>
                    </GraphEditorContent>
                    {renderPreview
                        ? <GraphEditorPreview
                            renderPreview={renderPreview}/>
                        : undefined
                    }
                    <ContextMenu/>
                    <DialogsContainer/>
                </DndProvider>
            </dialogsContext.Provider>
        </graphContext.Provider>
    );
}

export default GraphEditorInner;

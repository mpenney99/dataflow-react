import React, { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { loadGraph } from '../../store/actions';
import { initStore } from '../../store/store';
import { GraphConfig } from '../../types/graphConfigTypes';
import { GraphTemplate } from '../../types/graphTemplateTypes';
import { Graph } from '../../types/graphTypes';
import GraphEditorInner from './GraphEditorInner';

type Props<Ctx, Params> = {
    initialGraph?: Graph;
    graphConfig: GraphConfig<Ctx, Params>;
    params?: Params;
    templates?: GraphTemplate[];
    renderPreview?: (graph: Graph) => React.ReactNode | null;
    onGraphChanged?: (graph: Graph) => void;
}

export default function GraphEditor<Ctx, Params>(props: Props<Ctx, Params>) {
    const [modalRoot, setModalRoot] = useState<HTMLElement>();
    const modalRootRef = useRef<HTMLDivElement>(null);
    const [storeInstance] = useState(initStore);

    // track reference to the DOM node to use as the modal root
    useEffect(() => {
        const el = modalRootRef.current;
        if (el) {
            setModalRoot(el);
        }
    }, []);

    // load the initial graph into the store
    const prevGraph = useRef<Graph>();
    useEffect(() => {
        if (props.initialGraph && props.initialGraph !== prevGraph.current) {
            prevGraph.current = props.initialGraph;
            storeInstance.dispatch(loadGraph(props.initialGraph));
        }
    });

    return (
        <Provider store={storeInstance}>
            <div className="ngraph-editor">
                {modalRoot ? <GraphEditorInner modalRoot={modalRoot} { ...props }/> : undefined}
                <div ref={modalRootRef} className="ngraph-modals"/>
            </div>
        </Provider>
    );
}

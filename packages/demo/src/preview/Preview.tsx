import React, { useRef, useEffect, useReducer } from 'react';
import {
    Graph,
    GraphConfig,
    createGraphNodeProcessors,
    runProcessors
} from '@react-ngraph/core';

import { ChartContext, ChartParams } from '../chartContext';
import { previewsReducer, reset, updatePreview, setActivePreview, init } from './previewsReducer';
import { ViewConfig, ViewType } from '../types/valueTypes';
import ChartPreview from './ChartPreview';
import GridPreview from './GridPreview';

type Props = {
    graph: Graph;
    graphConfig: GraphConfig<ChartContext, ChartParams>;
    variables: { [key: string]: unknown };
    width: number;
    height: number;
}

function renderView(viewConfig: ViewConfig) {
    if (viewConfig.viewType === ViewType.CHART) {
        return (
            <ChartPreview
                chartConfig={viewConfig}
            />
        );

    } else {
        return (
            <GridPreview
                gridConfig={viewConfig}
            />
        );
    }
}

export default function Preview(props: Props) {
    const { graph, graphConfig, variables, width, height } = props;
    
    const [state, dispatch] = useReducer(previewsReducer, null, init);

    useEffect(() => {
        dispatch(reset());

        const params: ChartParams = {
            variables,
            renderView(viewId, config) {
                dispatch(updatePreview(viewId, config));
            }
        };

        const processors = createGraphNodeProcessors(graph, graphConfig, params);
        return runProcessors(processors);
    }, [graphConfig, graph, variables]);

    const handleChangeActivePreview = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setActivePreview(e.target.value));
    };

    return (
        <div className="preview-container">
            <select className="active-preview" value={state.previewId || ''} onChange={handleChangeActivePreview}>
                {Object.keys(state.previews).map((previewId, index) => (
                    <option key={index} value={previewId}>{previewId}</option>
                ))}
            </select>
            {state.previewId ? renderView(state.previews[state.previewId]) : undefined}
        </div>
    )
}
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { GraphPreviewParams } from '../../../types/graphEditorTypes';
import { useToggle } from '../../../utils/hooks/useToggle';
import { useSelector } from 'react-redux';
import { selectGraph } from '../../../store/selectors';

type Props = {
    renderPreview: (params: GraphPreviewParams) => React.ReactNode | null;
}

function GraphEditorPreview(props: Props) {
    const [expanded, toggleMaximized] = useToggle(true);
    const [dims, setDims] = useState({ width: 300, height: 300 });
    const graph = useSelector(selectGraph);

    return (
        <div className="ngraph-preview">
            <div className="ngraph-preview-header">
                <span className="ngraph-preview-header-title">Preview</span>
                <FontAwesomeIcon className="ngraph-preview-header-icon" icon={expanded ? "minus" : "plus"} onClick={toggleMaximized}/>
            </div>
            {expanded ? (
                <div
                    className="ngraph-preview-body"
                    style={{
                        width: dims.width,
                        height: dims.height
                    }}
                >
                    {props.renderPreview({
                        graph: graph,
                        width: dims.width,
                        height: dims.height
                    })}
                </div>
            ) : undefined}
        </div>
    );
}

export default React.memo(GraphEditorPreview);
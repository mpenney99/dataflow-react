import { Column, GraphNodeConfig, InputType, GraphNode, BaseNodeProcessor } from "@react-ngraph/core";

import { ChartContext, ChartParams } from "../../types/contextTypes";
import { ViewType, GridColumnConfig, GridValueConfig, Row } from "../../types/valueTypes";
import { mergeContextsArray, getContextsForSinglePort } from "../../chartContext";

function getDefaultViewName(node: GraphNode) {
    return 'grid-' + node.id;
}

const PORT_COLUMNS = 'columns';
const PORT_DATA = 'data';
const PORT_ON_CLICK = 'onClick';

class GridViewProcessor extends BaseNodeProcessor {
    private data: Row[] | undefined;
    private columns: GridColumnConfig[] | undefined;

    constructor(
        private readonly viewName: string,
        private readonly params: ChartParams
    ) {
        super();
    }

    process(portName: string, values: unknown[]) {
        if (portName === PORT_DATA) {
            this.data = values[0] as Row[];

        } else if (portName === PORT_COLUMNS) {
            this.columns = values as GridColumnConfig[];
        }

        if (!this.data || !this.columns) {
            return;
        }

        // map column configs to columns
        const columnConfigs = this.columns
        const columns: Column[] = columnConfigs.map<Column>(column => ({
            name: column.name,
            editable: true,
            width: column.width,
            maxWidth: 400
        }));

        // map rows to grid-values
        const gridValues: GridValueConfig[][] = this.data.map((row, index) => {
            return columnConfigs.map(column => column.mapper(row, index))
        });

        this.params.actions.renderView?.(this.viewName, {
            type: ViewType.GRID,
            columns,
            data: gridValues,
        });
    }
}

export const GRID_VIEW_NODE: GraphNodeConfig<ChartContext, ChartParams> = {
    title: 'Grid View',
    menuGroup: 'Grid',
    description: 'Displays the data as a grid view.',
    ports: {
        in: {
            [PORT_DATA]: {
                type: 'row[]'
            },
            [PORT_COLUMNS]: {
                type: 'column',
                multi: true
            },
        },
        out: {
            [PORT_ON_CLICK]: {
                type: 'row'
            }
        }
    },
    fields: {
        name: {
            label: 'Name',
            initialValue: '',
            type: InputType.TEXT
        }
    },
    computeContext: {
        compute(_, contexts: ChartContext[]) {
            return mergeContextsArray(contexts);
        },
        deps({ node, contexts }) {
            const targets = node.ports.in[PORT_DATA];
            return getContextsForSinglePort(targets, contexts);
        }
    },
    createProcessor(node, params) {
        let viewName = node.fields.name as string;

        if (!viewName) {
            viewName = getDefaultViewName(node);
        }

        return new GridViewProcessor(viewName, params);
    }
}

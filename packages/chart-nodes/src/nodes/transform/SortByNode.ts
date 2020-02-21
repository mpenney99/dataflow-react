import { GraphNodeConfig, InputType, columnExpression, ColumnMapperInputValue, expressions, NodeProcessor } from "@react-ngraph/core";
import { ChartContext, ChartParams } from "../../types/contextTypes";
import { Row } from "../../types/valueTypes";
import { rowToEvalContext } from "../../utils/expressionUtils";
import { NodeType } from "../nodes";

const PORT_ROWS = 'rows';

type Config = {
    descending: boolean;
    mapColumnKey: expressions.Mapper;
}

class SortByNodeProcessor implements NodeProcessor {
    private readonly subs: ((value: unknown) => void)[] = [];

    constructor(
        private readonly params: ChartParams,
        private readonly config: Config
    ) { }

    get type(): string {
        return NodeType.SORT_BY;
    }
    
    registerProcessor(portIn: string, portOut: string, processor: NodeProcessor): void {
        if (portIn === PORT_ROWS) {
            processor.subscribe(portOut, this.onNext.bind(this));
        }
    }

    subscribe(portName: string, sub: (value: unknown) => void): void {
        if (portName === PORT_ROWS) {
            this.subs.push(sub);
        }
    }

    private onNext(value: unknown) {
        if (!this.subs.length) return;

        const rows = value as Row[];
        const rowsSorted = rows.slice(0);

        rowsSorted.sort((a, b) => {
            const sortKeyA = this.config.mapColumnKey(rowToEvalContext(a, null, this.params.variables)) as any;
            const sortKeyB = this.config.mapColumnKey(rowToEvalContext(b, null, this.params.variables)) as any;
          
            if (sortKeyB > sortKeyA) {
                return this.config.descending ? 1 : -1;

            } else if (sortKeyB < sortKeyA) {
                return this.config.descending ? -1 : 1;

            } else {
                return 0;
            }
        });

        for (const sub of this.subs) {
            sub(rowsSorted);
        };  
    }
}

export const SORT_BY_NODE: GraphNodeConfig<ChartContext, ChartParams> = {
    title: 'Sort By',
    menuGroup: 'Transform',
    description: 'Sorts the rows by a key.',
    ports: {
        in: {
            [PORT_ROWS]: {
                type: 'row[]'
            }
        },
        out: {
            [PORT_ROWS]: {
                type: 'row[]'
            }
        }
    },
    fields: {
        column: {
            label: 'Map Column Key',
            type: InputType.COLUMN_MAPPER,
            initialValue: columnExpression(''),
            params: {
                target: 'row'
            },
            resolve: ({ context }) => ({
                columns: context.columns
            })
        },
        desc: {
            label: 'Descending',
            type: InputType.CHECK,
            initialValue: false
        }
    },
    createProcessor(node, params) {
        const descending = node.fields.desc as boolean;
        const mapColumnKeyExpr = node.fields.column as ColumnMapperInputValue;
        const mapColumnKey = expressions.compileColumnMapper(mapColumnKeyExpr, 'row');
        return new SortByNodeProcessor(params, { descending, mapColumnKey });
    }
}

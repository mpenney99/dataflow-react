import { BaseNodeProcessor, Entry, GraphNodeConfig, InputType } from "@react-ngraph/core";
import { ChartAxisConfig, ChartAxisType } from "../../types/chartValueTypes";
import { ChartContext, ChartParams } from "../../types/contextTypes";
import { compileEntriesMapper } from "../../utils/expressionUtils";

const PORT_OUT_AXIS = 'axis';

const FIELD_TYPE = 'type';
const FIELD_LABEL = 'label';
const FIELD_BEGIN_AT_ZERO = 'beginAtZero';
const FIELD_STACKED = 'stacked';
const FIELD_PARAMS = 'params';

type Config = {
    label: string;
    axisType: ChartAxisType;
    beginAtZero: boolean;
    stacked: boolean;
    params: Entry<unknown>[];
}

class ChartAxisNodeProcessor extends BaseNodeProcessor {
    constructor(private readonly config: Config) {
        super();
    }

    process(): void {
        // do nothing
    }

    start() {
        const axis: ChartAxisConfig = {
            type: this.config.axisType,
            label: this.config.label,
            beginAtZero: this.config.beginAtZero,
            stacked: this.config.stacked,
            params: this.config.params
        };
        
        this.emitResult(PORT_OUT_AXIS, axis);
    }
}

export const CHART_AXIS_NODE: GraphNodeConfig<ChartContext, ChartParams> = {
    title: 'Chart Axis',
    menuGroup: 'Chart',
    description: 'Constructs an axis for the chart.',
    ports: {
        in: {},
        out: {
            [PORT_OUT_AXIS]: {
                type: 'axis'
            }
        }
    },
    fields: {
        [FIELD_TYPE]: {
            label: 'Type',
            type: InputType.SELECT,
            initialValue: 'linear',
            params: {
                options: [
                    'category',
                    'linear',
                    'logarithmic',
                    'time'
                ]
            }
        },
        [FIELD_LABEL]: {
            label: 'Label',
            type: InputType.TEXT,
            initialValue: ''
        },
        [FIELD_BEGIN_AT_ZERO]: {
            label: 'Begin at Zero',
            type: InputType.CHECK,
            initialValue: false
        },
        [FIELD_STACKED]: {
            label: 'Stacked',
            type: InputType.CHECK,
            initialValue: false
        },
        [FIELD_PARAMS]: {
            label: 'Params',
            type: InputType.MULTI,
            initialValue: [],
            subFields: {
                key: {
                    label: 'Key',
                    type: InputType.TEXT,
                    initialValue: ''
                },
                value: {
                    label: 'Value',
                    type: InputType.TEXT,
                    initialValue: ''
                }
            }
        }
    },
    createProcessor(node, params) {
        const axisType = node.fields[FIELD_TYPE] as ChartAxisType;
        const label = node.fields[FIELD_LABEL] as string;
        const paramExprs = node.fields[FIELD_PARAMS] as Entry<string>[];
        const beginAtZero = node.fields[FIELD_BEGIN_AT_ZERO] as boolean;
        const stacked = node.fields[FIELD_STACKED] as boolean;

        const paramsMapper = compileEntriesMapper(paramExprs);
        const paramsMapped = paramsMapper(params.variables);
        
        return new ChartAxisNodeProcessor({
            axisType,
            label,
            beginAtZero,
            stacked,
            params: paramsMapped
        });
    }
};

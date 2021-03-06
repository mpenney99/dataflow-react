import { Entry } from "@react-ngraph/core";
import jexl from 'jexl';
import Expression from 'jexl/Expression';
import { Row } from "../types/valueTypes";

const CHAR_SPACE = 32;
const CHAR_EQ = 61;
const CHAR_DBL_QUOTE = 34;

const KEY_VALUE = 'value';
const KEY_ROW_INDEX = 'i';
const KEY_COLUMN_KEY = 'key';

export type Mapper = (ctx: { [key: string]: unknown }) => unknown;
export type EntriesMapper = (context: { [key: string]: unknown }) => Entry<unknown>[];

export function autoConvert(input: string | undefined): string | boolean | number {
    if (input == null) {
        return '';
    }

    const t = input.trim();
    const charStart = t.charCodeAt(0);
    const charEnd = t.charCodeAt(t.length - 1);
   
    if (charStart === CHAR_DBL_QUOTE && charEnd === CHAR_DBL_QUOTE) {
        return t.slice(1, t.length - 1);
    }

    if (t === 'true') {
        return true;
    }
    
    if (t === 'false') {
        return false;
    }

    if (input.length) {
        const v = +input;

        if (!isNaN(v)) {
            return v;
        }
    }

    return input;
}

function getExpressionStartIndex(input: string): number {
    for (let i = 0, n = input.length; i < n; i++) {
        const c = input.charCodeAt(i);

        if (c === CHAR_EQ) {
            return i + 1;

        } else if (c !== CHAR_SPACE) {
            return -1;
        }
    }

    return -1;
}

/**
 * compile an expression string to an evaluatable function
 * @param input 
 */
export function compileExpression(input: string | undefined): (context: { [key: string]: unknown }) => unknown {
    if (typeof input !== 'string') {
        return () => input;
    }

    const idx = getExpressionStartIndex(input);

    if (idx < 0) {
        // the expression is not evaluatable. Auto-convert it to a primitive value
        const value = autoConvert(input);
        return () => value;

    } else {
        input = input.slice(idx);
        
        let expr: Expression;
        try {
            // compile the input to an AST
            expr = jexl.compile(input);
        } catch(err) {
            console.error(err);
            return () => null;
        }

        return (context) => {
            try {
                // evaluate the expression with the provided context
                return expr.evalSync(context);

            } catch(err) {
                console.error(err);
                return null;
            }
        };
    }
}

/**
 * compile a list of entries to an evaluatable function
 * @param inputs 
 */
export function compileEntriesMapper(inputs: Entry<string>[]): EntriesMapper {
    const fns = inputs.map(input => compileExpression(input.value));
    
    return (context: { [key: string]: unknown }): Entry<unknown>[] => {
        return inputs.map((input, i) => {
            const fn = fns[i];
            const value = fn(context);
            return { key: input.key, value };
        });
    };
}

export function rowToEvalContext(row: Row | null, rowIndex: number | null, colKey: string | null, variables: { [key: string]: unknown }) {
    const values = Object.assign({}, row, variables);
    values[KEY_VALUE] = row;
    values[KEY_COLUMN_KEY] = colKey;
    values[KEY_ROW_INDEX] = rowIndex;
    return values;
}

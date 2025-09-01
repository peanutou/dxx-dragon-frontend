// The comparison operators supported in expressions
export type Operator =
    | 'contain'
    | 'not contain'
    | 'start with'
    | 'end with'
    | 'match'
    | 'equal'
    | 'not equal'
    | 'greater'
    | 'greater equal'
    | 'less'
    | 'less equal'

// The source type for an operand
export type OperandSource = 'value' | 'variable' | 'column' | 'function'

// An operand can be a field from the target table, input table, or a variable
export type Operand =
    // Literal value operand
    | {
        id: string;
        source: OperandSource;
        name?: string;
        label?: string;
        description?: string;
        value?: string | number | boolean;
        args?: Operand[]
    }

// An expression is either a basic comparison or a composite (AND/OR) of two expressions
export type Expression =
    | { id: string; kind: 'basic'; left: Operand; op: Operator; right: Operand }
    | { id: string; kind: 'composite'; operator: 'and' | 'or'; children: Expression[] }


export interface FunctionArgument {
    name: string
    label: string
    description?: string
}

export interface FunctionDefinition {
    label: string
    value: string
    args: FunctionArgument[]
    expandable?: boolean
}

export const FUNCTION_OPTIONS: FunctionDefinition[] = [
    {
        label: 'lower',
        value: 'lower',
        args: [
            {
                name: 'text',
                label: 'String',
                description: 'The input string to be converted.'
            }
        ],
        expandable: false
    },
    {
        label: 'find',
        value: 'find',
        args: [
            {
                name: 'haystack',
                label: 'Haystack',
                description: 'The string to search in.'
            },
            {
                name: 'needle',
                label: 'Needle',
                description: 'The substring to search for.'
            }
        ],
        expandable: true
    },
    {
        label: 'extract',
        value: 'extract',
        args: [
            {
                name: 'text',
                label: 'Text',
                description: 'The input string to apply the regex pattern on.'
            },
            {
                name: 'pattern',
                label: 'Regex Pattern',
                description: 'The regular expression pattern used to extract matches.'
            }
        ],
        expandable: false
    },
    {
        label: 'replace',
        value: 'replace',
        args: [
            {
                name: 'text',
                label: 'Text',
                description: 'The input string to apply the replacement on.'
            },
            {
                name: 'pattern',
                label: 'Regex Pattern',
                description: 'The regular expression pattern used to find matches.'
            },
            {
                name: 'replacement',
                label: 'Replacement',
                description: 'The string to replace the matches with.'
            }
        ],
        expandable: false
    },
    {
        label: 'similarity',
        value: 'similarity',
        args: [
            {
                name: 'text1',
                label: 'Text',
                description: 'The first string to compare.'
            },
            {
                name: 'text2',
                label: 'Text',
                description: 'The second string to compare.'
            }
        ],
        expandable: false
    },
    {
        label: 'extract_groups',
        value: 'extract_groups',
        args: [
            {
                name: 'text',
                label: 'Text',
                description: 'The text to extract groups from.'
            },
            {
                name: 'pattern',
                label: 'Regex Pattern',
                description: 'The regular expression pattern used to extract groups.'
            }
        ],
        expandable: false
    },
    {
        label: 'pick_at_indices',
        value: 'pick_at_indices',
        args: [
            {
                name: 'array',
                label: 'Array',
                description: 'The array to pick an item from.'
            },
            {
                name: 'indices',
                label: 'Indices',
                description: 'The indices of the items to pick from the array.'
            }
        ],
        expandable: false
    }
]

export type FunctionName = typeof FUNCTION_OPTIONS[number]['value']
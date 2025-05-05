// Comparison mode mirror of backend enum
export enum ComparisonMode {
    GROUP = 'group',
    INDIVIDUAL = 'individual'
}

// Comparison expression mapping
export interface ComparisonExpression {
    mode: ComparisonMode
    expression: string
}

// Comparer node configuration interface, extending BaseNodeConfig data shape
export interface ComparerNodeConfig {
    name: string
    type: string  // NodeType.COMPARER identifier
    target_table: Record<string, any[]>
    input_table: Record<string, any[]>
    rules: ComparisonExpression[]
    [key: string]: any
}
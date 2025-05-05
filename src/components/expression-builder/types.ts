// The comparison operators supported in expressions
export type Operator =
    | 'contain'
    | 'start with'
    | 'end with'
    | 'match'
    | 'equal'
    | 'not equal'
    | 'greater'
    | 'greater or equal'
    | 'less'
    | 'less or equal'

// An operand can be a field from the target table, input table, or a variable
export type Operand =
    // Literal value operand
    | { source: 'value'; value: string | number | boolean }
    // Variable operand
    | { source: 'variable'; name: string }
    // Function call: fetch one value from target table column
    | { source: 'function'; name: 'target'; args: [Operand] }
    // Function call: fetch one value from input table column
    | { source: 'function'; name: 'input'; args: [Operand] }

// An expression is either a basic comparison or a composite (AND/OR) of two expressions
export type Expression =
    | { kind: 'basic'; left: Operand; op: Operator; right: Operand }
    | { kind: 'composite'; operator: 'and' | 'or'; children: Expression[] }

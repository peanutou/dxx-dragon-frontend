import { generateShortId } from '@/utils/uid'
import type { Expression, Operand, OperandSource } from '../types'
import { FUNCTION_OPTIONS } from '../types'

function operandToString(operand: Operand): string {
    switch (operand.source) {
        case 'value': {
            const raw = operand.value;
            if (typeof raw === 'string') {
                const trimmed = raw.trim();
                // Case 1: Already quoted string (e.g. "abc")
                if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
                    (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                    return trimmed;
                }
                // Case 2: Try to parse as number
                const num = Number(trimmed);
                if (!isNaN(num)) {
                    return trimmed;
                }
                // Case 3: Try to interpret as boolean
                const lowered = trimmed.toLowerCase();
                if (lowered === 'true') return 'True';
                if (lowered === 'false') return 'False';
                if (lowered === 'none') return 'None';
                if (lowered === 'null') return 'None';
                // Case 4: Try to parse as array
                if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                    try {
                        const arr = JSON.parse(trimmed);
                        if (Array.isArray(arr)) {
                            return `[${arr.map(item => operandToString({ ...operand, value: item })).join(', ')}]`;
                        }
                    } catch (e) {
                        // Ignore JSON parse errors
                    }
                }
                // Case 5: Treat as string with quotes
                return JSON.stringify(trimmed);
            }
            if (typeof raw === 'boolean') {
                return raw ? 'True' : 'False';
            }
            return String(raw ?? '');
        }
        case 'variable':
            return operand.name ?? ''
        case 'column':
            return `column("${operand.name}")`
        case 'function':
            const argsStr = operand.args?.map(arg => operandToString(arg)).join(', ') ?? ''
            return `${operand.name ?? ''}(${argsStr})`
        default:
            return ''
    }
}

export function expressionToString(expr: Expression): string {
    if (expr.kind === 'basic') {
        // Always wrap basic expressions in parentheses
        return `(${operandToString(expr.left)} ${expr.op} ${operandToString(expr.right)})`
    } else if (expr.kind === 'composite') {
        if (expr.children.length === 1) {
            // For a single child, return the child's string directly (no extra parens)
            return expressionToString(expr.children[0])
        }
        // For multiple children, join and wrap in parentheses
        const joined = expr.children.map(child => expressionToString(child)).join(` ${expr.operator} `)
        return `(${joined})`
    }
    return ''
}

export function createDefaultExpression(kind: 'basic' | 'composite' = 'composite'): Expression {
    if (kind === 'basic') {
        return {
            id: generateShortId(),
            kind: 'basic',
            left: createOperand('value'),
            op: 'equal',
            right: createOperand('value')
        }
    } else if (kind === 'composite') {
        return {
            id: generateShortId(),
            kind: 'composite',
            operator: 'and',
            children: [] as Expression[]
        }
    }
    throw new Error('Invalid expression kind')
}

export function createOperand(source: OperandSource, funcName?: string): Operand {
    const base = { source, id: generateShortId() }
    switch (source) {
        case 'value':
            return { ...base, name: '', value: '' }
        case 'variable':
        case 'column':
            return { ...base, name: '' }
        case 'function': {
            const fnName = funcName || 'find'
            const fnDef = FUNCTION_OPTIONS.find(f => f.value === fnName)
            const args = fnDef?.args.map(arg => {
                const operand = createOperand('value')
                operand.name = arg.name
                operand.label = arg.label
                operand.description = arg.description
                return operand
            }) ?? []
            console.log('Function definition:', args)
            return { ...base, name: fnName, args }
        }
        default:
            throw new Error('Unsupported operand source')
    }
}

/**
 * 判断一个字符串是否整体被一对括号 () 包裹
 * - 自动忽略首尾空格
 * - 要求括号匹配且最外层只有一对
 */
function isWrappedByParentheses(s: string): boolean {
    if (!s) return false;
    const trimmed = s.trim();
    if (!(trimmed.startsWith("(") && trimmed.endsWith(")"))) {
        return false;
    }

    let depth = 0;
    for (let i = 0; i < trimmed.length; i++) {
        const ch = trimmed[i];
        if (ch === "(") depth++;
        else if (ch === ")") {
            depth--;
            // 如果提前归零且不是最后一个位置，说明外层不是唯一一对
            if (depth === 0 && i < trimmed.length - 1) {
                return false;
            }
            if (depth < 0) return false;
        }
    }

    return depth === 0;
}

/**
 * Parse a string representation back into an Expression object.
 */
export function parseExpression(exprStr: string, isRoot = true): Expression {
    console.log('Parsing expression:', exprStr);
    let trimmed = exprStr.trim();
    // Strip only one layer of outer parentheses so basic expressions like ("12" equal "12") parse correctly
    if (isRoot && trimmed.startsWith('(') && trimmed.endsWith(')') && isWrappedByParentheses(trimmed)) {
        trimmed = trimmed.slice(1, -1).trim();
    }
    // Composite: split top-level 'and'
    const andParts = splitTopLevel(trimmed, ' and ');
    if (andParts.length > 1) {
        console.log('AND parts:', andParts);
        return {
            id: generateShortId(),
            kind: 'composite',
            operator: 'and',
            children: andParts.map(part => parseExpression(stripParens(part), false)),
        };
    }
    // Composite: split top-level 'or'
    const orParts = splitTopLevel(trimmed, ' or ');
    if (orParts.length > 1) {
        console.log('OR parts:', orParts);
        return {
            id: generateShortId(),
            kind: 'composite',
            operator: 'or',
            children: orParts.map(part => parseExpression(stripParens(part), false)),
        };
    }
    // Basic expression: find operator
    const operators = [
        'not contain',
        'contain',
        'start with',
        'end with',
        'match',
        'not equal',
        'greater equal',
        'greater',
        'less equal',
        'less',
        'equal',
    ] as const;
    for (const op of operators) {
        const opToken = ` ${op} `;
        const idx = trimmed.toLowerCase().indexOf(opToken);
        if (idx !== -1) {
            const leftStr = trimmed.slice(0, idx).trim();
            const rightStr = trimmed.slice(idx + opToken.length).trim();
            const basicExpr: Expression = {
                id: generateShortId(),
                kind: 'basic',
                left: parseOperand(leftStr),
                op,
                right: parseOperand(rightStr),
            };
            return isRoot
                ? {
                    id: generateShortId(),
                    kind: 'composite',
                    operator: 'and',
                    children: [basicExpr],
                }
                : basicExpr;
        }
    }
    console.warn(`Failed to parse expression: ${exprStr}`);
    return createDefaultExpression('composite')
}

function stripParens(s: string): string {
    let str = s.trim();
    if (str.startsWith('(') && str.endsWith(')')) {
        return str.slice(1, -1).trim();
    }
    return str;
}

function splitTopLevel(s: string, delimiter: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let start = 0;
    const lower = s.toLowerCase();
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        if (depth === 0 && lower.slice(i, i + delimiter.length) === delimiter) {
            parts.push(s.slice(start, i));
            start = i + delimiter.length;
            i += delimiter.length - 1;
        }
    }
    parts.push(s.slice(start));
    return parts;
}

/**
 * 将参数串按顶层逗号分割为参数列表。
 * 支持：
 *  - 圆/方/花括号的任意嵌套：() [] {}
 *  - 字符串：'...'、"..."、`...`（含模板插值 ${ ... } 的嵌套）
 *  - 忽略字符串内部的逗号与括号
 * 行为：
 *  - 仅在“栈为空”（即不在任何括号或模板插值内、且不在字符串内）时才对逗号进行分割
 *  - 返回的每个片段会 trim，空片段会被过滤
 */
export function splitArgs(s: string): string[] {
    const parts: string[] = [];
    const stack: string[] = []; // 存括号或模板占位符标记：'(', '[', '{', '${'
    let start = 0;

    // 字符串状态
    let inString: '"' | "'" | '`' | null = null;
    let escaped = false;

    const pushPart = (endIdx: number) => {
        const piece = s.slice(start, endIdx).trim();
        if (piece) parts.push(piece);
        start = endIdx + 1; // 跳过逗号
    };

    for (let i = 0; i < s.length; i++) {
        const ch = s[i];

        // --- 在字符串内部 ---
        if (inString) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (ch === '\\') {
                escaped = true;
                continue;
            }

            if (inString === '`') {
                // 处理模板插值开始：${ ... }
                if (ch === '$' && s[i + 1] === '{') {
                    stack.push('${');
                    i++; // 消费 '{'
                    continue;
                }
                // 处理模板插值结束：... }
                if (ch === '}' && stack[stack.length - 1] === '${') {
                    stack.pop();
                    continue;
                }
            }

            // 字符串结束
            if (
                (inString === '"' && ch === '"') ||
                (inString === "'" && ch === "'") ||
                (inString === '`' && ch === '`')
            ) {
                inString = null;
            }
            continue;
        }

        // --- 不在字符串内时 ---
        // 进入字符串
        if (ch === '"' || ch === "'" || ch === '`') {
            inString = ch as unknown as typeof inString;
            escaped = false;
            continue;
        }

        // 处理括号入栈
        if (ch === '(' || ch === '[' || ch === '{') {
            stack.push(ch);
            continue;
        }

        // 处理括号出栈
        if (ch === ')' || ch === ']' || ch === '}') {
            const top = stack[stack.length - 1];
            if (
                (ch === ')' && top === '(') ||
                (ch === ']' && top === '[') ||
                (ch === '}' && top === '{')
            ) {
                stack.pop();
            } else {
                // 不匹配：保留原字符，但不改变栈（宽松处理）
            }
            continue;
        }

        // 顶层逗号分割（不再强制要求后面有空格）
        if (ch === ',' && stack.length === 0) {
            pushPart(i);
        }
    }

    // 收尾
    const tail = s.slice(start).trim();
    if (tail) parts.push(tail);

    return parts;
}

function parseOperand(str: string): Operand {
    const s = str.trim();
    // Column: column("name")
    const col = /^column\("(.+)"\)$/.exec(s);
    if (col) {
        const operand = createOperand('column');
        operand.name = col[1];
        return operand;
    }
    // Function call: name(args)
    const fn = /^([A-Za-z_]\w*)\((.*)\)$/.exec(s);
    if (fn) {
        const name = fn[1];
        const args = splitArgs(fn[2]).map(a => parseOperand(a));
        const operand = createOperand('function', name);
        console.log('Parsed function:', name, args);
        args.forEach((arg, index) => {
            arg.label = operand.args?.[index].label;
            arg.description = operand.args?.[index].description;
        });
        operand.args = args;
        return operand;
    }
    // String literal
    if ((s.startsWith('"') && s.endsWith('"')) ||
        (s.startsWith("'") && s.endsWith("'")) ||
        (s.startsWith('r"') && s.endsWith('"')) ||
        (s.startsWith("r'") && s.endsWith("'"))) {
        const operand = createOperand('value');
        operand.value = s;
        return operand;
    }
    // Number literal
    const num = Number(s);
    if (!isNaN(num)) {
        const operand = createOperand('value');
        operand.value = JSON.stringify(num);
        return operand;
    }
    // Boolean literal
    if (s.toLowerCase() === 'true' || s.toLowerCase() === 'false') {
        const operand = createOperand('value');
        operand.value = s;
        return operand;
    }
    // Array literal
    if (s.startsWith('[') && s.endsWith(']')) {
        try {
            const arr = JSON.parse(s);
            if (Array.isArray(arr)) {
                const operand = createOperand('value');
                operand.value = s;
                return operand;
            }
        } catch (e) {
            // Ignore JSON parse errors
        }
    }
    // Variable name
    const operand = createOperand('variable');
    operand.name = s;
    return operand;
}
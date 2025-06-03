
export function hasExpresstionString(input: string): boolean {
    return /\{\{.*\}\}/.test(input)
}

export function isValidName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
}

export function isLabelValid(label?: string): boolean {
    if (!label) return true
    const isChinese = /[\u4e00-\u9fa5]/.test(label)
    if (isChinese) {
        return label.length <= 20
    } else {
        const words = label.trim().split(/\s+/)
        return words.length <= 20
    }
}

export function isValidObject(obj: string): boolean {
    if (!obj) return true
    if (hasExpresstionString(obj)) return true // 如果包含表达式字符串，则不验证
    try {
        const parsed = JSON.parse(obj)
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    } catch {
        return false
    }
}

export function isValidArray(arr: string): boolean {
    if (!arr) return true
    if (hasExpresstionString(arr)) return true // 如果包含表达式字符串，则不验证
    try {
        const parsed = JSON.parse(arr)
        if (!Array.isArray(parsed)) return false
        if (parsed.length === 0) return true
        const firstType = typeof parsed[0]
        const allSameType = parsed.every(item => typeof item === firstType)
        if (!allSameType) return false
        return true
    } catch {
        return false
    }
}

export function isValidBoolean(value: string): boolean {
    if (!value) return true
    if (hasExpresstionString(value)) return true // 如果包含表达式字符串，则不验证
    return value === 'true' || value === 'false' || value === 'True' || value === 'False' || value === 'TRUE' || value === 'FALSE'
}

export function isValidNumber(value: string): boolean {
    if (!value) return true
    if (hasExpresstionString(value)) return true // 如果包含表达式字符串，则不验证
    return !isNaN(Number(value)) && isFinite(Number(value))
}
/**
 * 根据节点类型返回背景样式 class
 */
export function getNodeBgClassByType(nodeType: string): string {
    switch (nodeType.toLowerCase()) {
        case 'prompt':
            return 'bg-blue-50'
        case 'http':
            return 'bg-green-50'
        case 'regex':
            return 'bg-yellow-50'
        case 'aggregator':
            return 'bg-red-50'
        case 'excel':
            return 'bg-purple-50'
        default:
            return 'bg-gray-50'
    }
}

export function getNodeCapitalizedType(nodeType: string): string {
    const type = nodeType || ''
    return type.charAt(0).toUpperCase() + type.slice(1)
}
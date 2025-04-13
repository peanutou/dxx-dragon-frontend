export default function schematize(data: any): any {
    if (Array.isArray(data)) {
        return data.length > 0 ? [schematize(data[0])] : []
    } else if (data !== null && typeof data === 'object') {
        const result: Record<string, any> = {}
        for (const key in data) {
            result[key] = schematize(data[key])
        }
        return result
    } else {
        return typeof data
    }
}

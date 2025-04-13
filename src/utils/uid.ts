import { v4 as uuidv4 } from 'uuid'
import md5 from 'md5'

/**
 * 生成一个唯一的 ID，先使用 uuid，再用 md5 压缩为 10 位字符串
 */
export function generateShortId(): string {
    const uuid = uuidv4()
    const hash = md5(uuid)
    return hash.substring(0, 10)
}

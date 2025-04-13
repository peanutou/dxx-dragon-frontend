import { createDiscreteApi } from 'naive-ui'
import type { MessageApi, DialogApi } from 'naive-ui'

declare global {
    interface Window {
        $message: MessageApi
        $dialog: DialogApi
    }
}
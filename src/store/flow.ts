import { time } from 'console'
import { defineStore } from 'pinia'

/********** Flow Inputs **********/

type InputFieldType = 'string' | 'number' | 'select' | 'boolean' | 'file'

export interface InputFieldConfig {
    name: string
    label?: string
    type: InputFieldType
    required?: boolean
    default?: string
    options?: string[]
}

/********** Base Node **********/

export interface NodeOutputs {
    [key: string]: any
}

export interface NodeTrace {
    [key: string]: any
}

export interface NodeTestInputs {
    [key: string]: any
}

export interface BaseNodeConfig {
    id: string
    type: string
    position: { x: number; y: number }
    data: {
        name: string;
        type?: string;
        depends_on?: string[];
        inputs?: Record<string, any>;
        outputs?: NodeOutputs;
        outputs_schema?: string | number | boolean | object | any[] | null;
        debug_info?: Record<string, any>;
        frontend?: {
            id: string
            position: { x: number; y: number }
            [key: string]: any
        }
        test_inputs?: NodeTestInputs;
        [key: string]: any;
    }
    [key: string]: any
}

/********** Flow Meta **********/

export interface FlowViewport {
    x: number;
    y: number;
    zoom: number;
}

export interface FlowEdgeMeta {
    source: string;
    sourceHandle: string | null;
    target: string;
    targetHandle: string | null;
    [key: string]: any;
}

export interface FlowFrontendMeta {
    viewport: FlowViewport;
    edges?: FlowEdgeMeta[];
}

export interface FlowMeta {
    name?: string;
    description?: string;
    version?: string;
    status?: string;
    created_at?: string;
    frontend: FlowFrontendMeta;
}

/********** Flow Store **********/

export enum SnapshotReason {
    INITIAL = 'INITIAL',
}

export const useFlowStore = defineStore('flow', {
    state: () => ({
        nodes: [] as BaseNodeConfig[],
        edges: [] as any[],
        inputs: [] as InputFieldConfig[],
        variables: {} as Record<string, any>,
        meta: {
            frontend: {
                viewport: { x: 0, y: 0, zoom: 1 },
                edges: []
            }
        } as FlowMeta,
        messages: [] as { type: string, content: string }[],
        // Undo/Redo state
        undoStack: [] as Array<{
            nodes: any[]
            edges: any[]
            inputs: any[]
            variables: Record<string, any>
            meta: Record<string, any>
        }>,
        redoStack: [] as Array<{
            nodes: any[]
            edges: any[]
            inputs: any[]
            variables: Record<string, any>
            meta: Record<string, any>
        }>,
        hasChanges: false as boolean,
        currentTestNode: null as BaseNodeConfig | null,  // added for test node storage
        lastSnapshot: null as {
            nodes: any[]
            edges: any[]
            inputs: any[]
            variables: Record<string, any>
            meta: Record<string, any>
        } | null,
    }),

    actions: {
        /**
         * Reset all flow state fields to their initial values.
         */
        resetFlowState() {
            this.nodes = []
            this.edges = []
            this.inputs = []
            this.variables = {}
            this.meta = {
                frontend: {
                    viewport: { x: 0, y: 0, zoom: 1 },
                    edges: []
                }
            }
            this.messages = []
            this.undoStack = []
            this.redoStack = []
            this.hasChanges = false
            this.currentTestNode = null
            this.lastSnapshot = null
        },
        
        setFlowState(payload: {
            nodes?: any[]
            edges?: any[]
            inputs?: any[]
            variables?: Record<string, any>
            meta?: Record<string, any>
        }) {
            if (payload.nodes) this.nodes = JSON.parse(JSON.stringify(payload.nodes))
            if (payload.edges) this.edges = JSON.parse(JSON.stringify(payload.edges))
            if (payload.inputs) this.inputs = JSON.parse(JSON.stringify(payload.inputs))
            if (payload.variables) this.variables = JSON.parse(JSON.stringify(payload.variables))
            if (payload.meta) this.meta = JSON.parse(JSON.stringify(payload.meta))
        },

        getFlowState() {
            return {
                nodes: this.nodes,
                edges: this.edges,
                inputs: this.inputs,
                variables: this.variables,
                meta: this.meta,
            }
        },

        // Save a snapshot of the current state and clear redoStack
        snapshot(reason?: SnapshotReason) {
            if (reason === SnapshotReason.INITIAL) {
                this.lastSnapshot = {
                    nodes: JSON.parse(JSON.stringify(this.nodes)),
                    edges: JSON.parse(JSON.stringify(this.edges)),
                    inputs: JSON.parse(JSON.stringify(this.inputs)),
                    variables: JSON.parse(JSON.stringify(this.variables)),
                    meta: JSON.parse(JSON.stringify(this.meta)),
                }
                return
            }
            if (this.lastSnapshot !== null) {
                this.undoStack.push(this.lastSnapshot)
            } else {
                console.log('No last snapshot to push to undoStack')
                return
            }
            this.lastSnapshot = {
                nodes: JSON.parse(JSON.stringify(this.nodes)),
                edges: JSON.parse(JSON.stringify(this.edges)),
                inputs: JSON.parse(JSON.stringify(this.inputs)),
                variables: JSON.parse(JSON.stringify(this.variables)),
                meta: JSON.parse(JSON.stringify(this.meta)),
            }
            // Limit stack size
            if (this.undoStack.length > 50) {
                this.undoStack.shift()
            }
            this.redoStack = []
            this.hasChanges = true
        },

        // Undo: restore previous state from undoStack, push current to redoStack
        undo() {
            if (this.undoStack.length === 0) return
            const current = {
                nodes: JSON.parse(JSON.stringify(this.nodes)),
                edges: JSON.parse(JSON.stringify(this.edges)),
                inputs: JSON.parse(JSON.stringify(this.inputs)),
                variables: JSON.parse(JSON.stringify(this.variables)),
                meta: JSON.parse(JSON.stringify(this.meta)),
            }
            this.redoStack.push(current)
            this.lastSnapshot = this.undoStack.pop() || null
            if (this.lastSnapshot) {
                // Restore all fields
                this.setFlowState(this.lastSnapshot)
            }
            if (this.undoStack.length === 0) {
                this.hasChanges = false
            }
        },

        // Redo: restore next state from redoStack, push current to undoStack
        redo() {
            if (this.redoStack.length === 0) return
            const current = {
                nodes: JSON.parse(JSON.stringify(this.nodes)),
                edges: JSON.parse(JSON.stringify(this.edges)),
                inputs: JSON.parse(JSON.stringify(this.inputs)),
                variables: JSON.parse(JSON.stringify(this.variables)),
                meta: JSON.parse(JSON.stringify(this.meta)),
            }
            this.undoStack.push(current)
            const next = this.redoStack.pop()
            if (next) {
                this.lastSnapshot = next
                this.setFlowState(next)
                this.hasChanges = true
            }
        },

        addMessage(message: { type: string, content: string }) {
            this.messages.push(message);
        },
        clearMessages() {
            this.messages = [];
        },

        setTestNode(node: BaseNodeConfig) {
            this.currentTestNode = JSON.parse(JSON.stringify(node))
        },
        clearTestNode() {
            this.currentTestNode = null
        },

        /**
         * Update each node's data.frontend with its id and position for frontend sync.
         */
        dumpNodesToFrontend() {
            this.nodes.forEach((node) => {
                node.data.frontend = {
                    ...(node.data.frontend || {}),
                    id: node.id,
                    position: node.position
                }
            })
        },

        /**
         * Convert a data array to VueFlow node objects and set to this.nodes.
         * @param dataArray Array of node data objects
         */
        loadDataToNodes(dataArray: any[]) {
            this.nodes = dataArray.map((data) => {
                const type = data.type?.charAt(0).toUpperCase() + data.type?.slice(1) || 'Unknown'
                const id = data.frontend?.id || `${type}-${Math.random().toString(36).substr(2, 5)}`
                const position = data.frontend?.position || { x: 0, y: 0 }
                return {
                    id,
                    type,
                    position,
                    data
                }
            })
        },
        
        dumpEdgesToMeta() {
            this.meta.frontend.edges = this.edges.map(e => ({
                id: e.id,
                source: e.source,
                sourceHandle: e.sourceHandle ?? null,
                target: e.target,
                targetHandle: e.targetHandle ?? null,
            }))
        },

        loadEdgesFromMeta() {
            if (Array.isArray(this.meta.frontend.edges)) {
                this.edges = this.meta.frontend.edges.map(e => ({
                    id: e.id,
                    source: e.source,
                    sourceHandle: e.sourceHandle ?? null,
                    target: e.target,
                    targetHandle: e.targetHandle ?? null,
                }))
            }
        },

        /**
         * 清理 depends_on 字段，移除无效引用，并确保 edges 的依赖关系被同步到 depends_on。
         */
        sanitizeDependsOn() {
            const allNodeNames = new Set(this.nodes.map(n => n.data?.name))
            this.nodes.forEach(node => {
                if (Array.isArray(node.data.depends_on)) {
                    const original = [...node.data.depends_on]
                    node.data.depends_on = node.data.depends_on.filter(name => {
                        if (!allNodeNames.has(name)) {
                            console.warn(`❌ 节点 "${node.data.name}" 的 depends_on 中无效引用已移除: ${name}`)
                            return false
                        }
                        return true
                    })
                }
            })

            this.edges.forEach((edge: { source: string; target: string }) => {
                const sourceNode = this.nodes.find(n => n.id === edge.source)
                const targetNode = this.nodes.find(n => n.id === edge.target)

                if (sourceNode?.data?.name && targetNode?.data) {
                    if (!Array.isArray(targetNode.data.depends_on)) {
                        targetNode.data.depends_on = []
                    }

                    if (!targetNode.data.depends_on.includes(sourceNode.data.name)) {
                        console.warn(`❌ 边连接 "${sourceNode.data.name}" → "${targetNode.data.name}" 但未在 depends_on 中声明，已自动修复`)
                        targetNode.data.depends_on.push(sourceNode.data.name)
                    }
                }
            })
        },

        /**
         * Generate the payload object formatted for backend saving.
         */
        generateFlowConfigPayload(): Record<string, any> {
            this.dumpNodesToFrontend()
            this.dumpEdgesToMeta()
            return {
                config: {
                    nodes: this.nodes.map(n => n.data),
                    inputs: this.inputs,
                    variables: this.variables,
                    ...this.meta
                }
            }
        },

        /**
         * Initialize the store state from a flowEntity object.
         * @param flowEntity The flow entity containing a config object.
         */
        initializeFromFlowEntity(flowEntity: any) {
            if (!flowEntity?.config) return

            this.lastSnapshot = null
            const config = flowEntity.config

            if (Array.isArray(config.nodes)) {
                this.loadDataToNodes(config.nodes)
            }

            if (Array.isArray(config.inputs)) {
                this.inputs = config.inputs
            }

            if (config.variables && typeof config.variables === 'object') {
                this.variables = config.variables
            }

            if (config.meta && typeof config.meta === 'object') {
                this.meta = config.meta
            } else {
                // fallback: assign other top-level meta fields if not in `meta`
                this.meta = {
                    ...this.meta,
                    name: config.name,
                    description: config.description,
                    version: config.version,
                    status: config.status,
                    created_at: config.created_at,
                    frontend: {
                        ...this.meta.frontend,
                        ...(config.frontend || {})
                    }
                }
            }

            // Load edges if available
            this.loadEdgesFromMeta()
            setTimeout(() => {
                this.snapshot(SnapshotReason.INITIAL)
            }, 100)
        },
    }
})


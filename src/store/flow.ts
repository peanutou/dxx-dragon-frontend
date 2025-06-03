import { defineStore } from 'pinia'
import { Node, NodeProps, Edge } from '@vue-flow/core'

/********** Flow Inputs **********/

export type FieldType = 'string' | 'number' | 'select' | 'boolean' | 'file' | 'object' | 'array' 
export type NodeType = 'Prompt' | 'Http' | 'Regex' | 'Aggregator' | 'Excel' | 'Comparer' | 'Unknown' | 'Start' | 'End'

export interface FieldConfig {
    name: string
    label: string
    type: FieldType
    required: boolean
    default?: any
    expression?: string
    options: string[]
    properties: FieldConfig[] | null
    items: Record<string, any> | null
}

/********** Flow Store **********/

export enum SnapshotReason {
    INITIAL = 'INITIAL',
}

export const useFlowStore = defineStore('flow', {
    state: () => ({
        // Flow entity object
        flowEntity: null as any,
        // flowEntity.config
        name: null as string | null,
        description: null as string | null,
        version: null as string | null,
        created_at: null as string | null,
        status: null as string | null,
        nodes: [] as Node[],
        edges: [] as Edge[],
        inputs: [] as FieldConfig[],
        variables: [] as FieldConfig[],
        // variables: {} as Record<string, any>,
        outputs: null as string | number | boolean | object | any[] | null,
        viewport: { x: 0, y: 0, zoom: 1 },
        messages: [] as { type: string, content: string }[],
        // Undo/Redo state
        undoStack: [] as Array<{
            nodes: any[]
            edges: any[]
            inputs: any[]
            outputs: string | number | boolean | object | any[] | null
            variables: Record<string, any>
        }>,
        redoStack: [] as Array<{
            nodes: any[]
            edges: any[]
            inputs: any[]
            outputs: string | number | boolean | object | any[] | null
            variables: Record<string, any>
        }>,
        hasChanges: false as boolean,
        currentTestNode: null as Node | null,  // added for test node storage
        selectedNode: null as Node | null, // currently selected node in the flow
        lastSnapshot: null as {
            nodes: any[]
            edges: any[]
            inputs: any[]
            outputs: any
            variables: Record<string, any>
        } | null,
        // Simulated backend context for design mode use
        mockContext: {
            inputs: {},
            variables: {},
            outputs: {} as Record<string, any>,
            result: {},
        }
    }),

    actions: {
        /**
         * Reset all flow state fields to their initial values.
         */
        resetFlowState() {
            this.flowEntity = null
            this.viewport = { x: 0, y: 0, zoom: 1 }
            this.nodes = []
            this.edges = []
            this.inputs = []
            this.variables = []
            this.outputs = null
            this.mockContext = {
                inputs: {},
                variables: {},
                outputs: {} as Record<string, any>,
                result: {},
            }
            this.messages = []
            this.undoStack = []
            this.redoStack = []
            this.hasChanges = false
            this.currentTestNode = null
            this.lastSnapshot = null
        },
        /**
         * Convert the flow state fields to a plain object.
         */
        toObject() {
            return {
                nodes: JSON.parse(JSON.stringify(this.nodes)),
                edges: JSON.parse(JSON.stringify(this.edges)),
                inputs: JSON.parse(JSON.stringify(this.inputs)),
                outputs: JSON.parse(JSON.stringify(this.outputs)),
                variables: JSON.parse(JSON.stringify(this.variables)),
            }
        },
        /**
         * Set the flow state fields from the provided payload.
         * @param payload The payload object containing the new state values.
         */
        setFlowState(payload: {
            nodes?: any[]
            edges?: any[]
            inputs?: any[]
            outputs?: string | number | boolean | object | any[] | null
            variables?: Record<string, any>
        }) {
            if (payload.nodes) this.nodes = JSON.parse(JSON.stringify(payload.nodes))
            if (payload.edges) this.edges = JSON.parse(JSON.stringify(payload.edges))
            if (payload.inputs) this.inputs = JSON.parse(JSON.stringify(payload.inputs))
            if (payload.outputs) this.outputs = JSON.parse(JSON.stringify(payload.outputs))
            if (payload.variables) this.variables = JSON.parse(JSON.stringify(payload.variables))
        },
        getFlowState() {
            return {
                nodes: this.nodes,
                edges: this.edges,
                inputs: this.inputs,
                outputs: this.outputs,
                variables: this.variables,
            }
        },

        // Save a snapshot of the current state and clear redoStack
        snapshot(reason?: SnapshotReason) {
            if (reason === SnapshotReason.INITIAL) {
                this.lastSnapshot = this.toObject()
                return
            }
            if (this.lastSnapshot !== null) {
                this.undoStack.push(this.lastSnapshot)
            } else {
                console.log('No last snapshot to push to undoStack')
                return
            }
            this.lastSnapshot = this.toObject()
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
            const current = this.toObject()
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
            const current = this.toObject()
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

        setTestNode(node: NodeProps) {
            this.currentTestNode = JSON.parse(JSON.stringify(node))
        },
        clearTestNode() {
            this.currentTestNode = null
        },

        /**
         * Generate the payload object formatted for backend saving.
         */
        generateFlowConfigPayload(): Record<string, any> {
            return {
                config: {
                    name: this.name,
                    description: this.description,
                    version: this.version,
                    created_at: this.created_at,
                    status: this.status,
                    nodes: this.nodes,
                    edges: this.edges,
                    inputs: this.inputs,
                    variables: this.variables,
                    outputs: this.outputs,
                    viewport: {
                        x: this.viewport.x,
                        y: this.viewport.y,
                        zoom: this.viewport.zoom,
                    },
                }
            }
        },
        /**
         * Initialize the store state from a flowEntity object.
         * @param flowEntity The flow entity containing a config object.
         */
        initializeFromFlowEntity(flowEntity: any) {
            if (!flowEntity?.config) return

            this.resetFlowState()

            this.flowEntity = flowEntity
            this.lastSnapshot = null
            const config = flowEntity.config
            if (!config || typeof config !== 'object') {
                console.error('Flow entity config is missing')
                return
            }

            this.name = config.name
            this.description = config.description
            this.version = config.version
            this.created_at = config.created_at
            this.status = config.status

            if (!Array.isArray(config.nodes)) {
                this.nodes = []
            } else {
                this.nodes = JSON.parse(JSON.stringify(config.nodes))
            }

            if (!Array.isArray(config.edges)) {
                this.edges = []
            } else {
                this.edges = JSON.parse(JSON.stringify(config.edges))
            }

            if (!Array.isArray(config.inputs)) {
                this.inputs = []
            } else {
                this.inputs = JSON.parse(JSON.stringify(config.inputs))
            }

            if (config.outputs === undefined) {
                this.outputs = null
            } else {
                this.outputs = JSON.parse(JSON.stringify(config.outputs))
            }

            if (config.viewport === undefined || typeof config.viewport !== 'object') {
                config.viewport = { x: 0, y: 0, zoom: 1 }
            } else {
                this.viewport = {
                    x: config.viewport.x || 0,
                    y: config.viewport.y || 0,
                    zoom: config.viewport.zoom || 1,
                }
            }

            if (typeof config.variables !== 'object' || config.variables === null) {
                config.variables = {}
            } else {
                this.variables = JSON.parse(JSON.stringify(config.variables))
            }

            setTimeout(() => {
                this.snapshot(SnapshotReason.INITIAL)
            }, 100)
        },
    }
})


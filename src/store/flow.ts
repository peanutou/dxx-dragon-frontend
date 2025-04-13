import { defineStore } from 'pinia'

export const useFlowStore = defineStore('flow', {
    state: () => ({
        nodes: [] as any[],
        edges: [] as any[],
        inputs: [] as any[],
        variables: {} as Record<string, any>,
        meta: {} as Record<string, any>
    }),

    actions: {
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
                meta: this.meta
            }
        }
    }
})

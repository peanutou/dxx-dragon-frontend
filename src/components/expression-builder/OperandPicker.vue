<template>
    <div class="operand-picker">
        <label>{{ label }}</label>
        <select :value="modelValue?.key || ''" @change="onChange($event)">
            <option value="" disabled>Select a key</option>
            <option v-for="key in keys" :key="key" :value="key">{{ key }}</option>
        </select>
    </div>
</template>

<script>
export default {
    name: "OperandPicker",
    props: {
        modelValue: {
            type: Object,
            default: null
        },
        keys: {
            type: Array,
            required: true
        },
        source: {
            type: String,
            required: true
        },
        label: {
            type: String,
            default: ""
        }
    },
    methods: {
        onChange(event) {
            const selectedKey = event.target.value;
            this.$emit('update:modelValue', { source: this.source, key: selectedKey });
        }
    }
};
</script>

<style scoped>
.operand-picker {
    display: flex;
    flex-direction: column;
    margin-bottom: 1em;
}

label {
    margin-bottom: 0.25em;
    font-weight: 600;
}

select {
    padding: 0.25em;
    font-size: 1em;
}
</style>
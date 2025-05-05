<template>
    <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
        <option value="+">+</option>
        <option value="-">-</option>
        <option value="*">*</option>
        <option value="/">/</option>
        <option value="=">=</option>
        <option value="!=">!=</option>
        <option value="<">&lt;</option>
        <option value=">">&gt;</option>
        <option value="<=">&lt;=</option>
        <option value=">=">&gt;=</option>
    </select>
</template>

<script>
export default {
    name: 'OperatorPicker',
    props: {
        modelValue: {
            type: String,
            default: ''
        }
    }
}
</script>

<template>
    <div>
        <OperandPicker v-model="expr.left" :keys="targetKeys" source="target" label="Target Field" />
        <OperatorPicker v-model="expr.operator" />
        <OperandPicker v-model="expr.right" :keys="inputKeys" source="input" label="Input Field" />
    </div>
</template>

<script>
import OperandPicker from './OperandPicker.vue'
import OperatorPicker from './OperatorPicker.vue'

export default {
    components: {
        OperandPicker,
        OperatorPicker
    },
    props: {
        expr: Object,
        targetKeys: Array,
        inputKeys: Array
    }
}
</script>

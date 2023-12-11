<script setup lang="ts">

interface Props {
    titleText: string;
    titleIcon?: string;
    titleColor?: string;
    height?: number | string;
    persistent?: boolean;
    scrollable?: boolean
    transition?: string | boolean;
    modelValue: boolean;
}

withDefaults(defineProps<Props>(), {
    titleText: "Dialog",
    titleIcon: "mdi-information-slab-circle",
    titleColor: "success",
    persistent: false,
    scrollable: false,
    transition: "dialog-bottom-transition",
})



defineEmits<{
    "update:modelValue": [value: boolean]
}>()
</script>
<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" width="auto"
        :height="height" :transition="transition" :scrollable="scrollable" :persistent="persistent">
        <v-card>
            <v-card-title>
                <v-icon :icon="titleIcon"></v-icon>{{ titleText }}
                <v-icon class="float-right" icon="mdi-close-circle-outline" @click="$emit('update:modelValue', false)"
                    color="error"></v-icon>
            </v-card-title>
            <v-divider :thickness="3" color="success"></v-divider>
            <v-card-text class="ma-auto">
                <slot name="main"></slot>
            </v-card-text>
            <v-card-actions>
                <slot name="buttons"></slot>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

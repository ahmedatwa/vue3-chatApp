<script setup lang="ts">
import { ref, watch } from "vue";

const isVisible = ref(false);
const text = ref("");

interface Props {
    text: string;
    color?: string;
    timeout?: number;
}
const props = withDefaults(defineProps<Props>(), {
    timeout: 2500
})

watch(
    () => props.text,
    (newV) => {
        if (newV.length > 0)
            text.value = newV;
            isVisible.value = true;
    }
);
</script>   
<template>
    <template>
        <v-sheet class="d-flex flex-column">
            <v-snackbar :timeout="props.timeout" :color="props.color" variant="tonal" v-model="isVisible" location="top">
                <p class="text-center">{{ text }}</p>
            </v-snackbar>
        </v-sheet>
    </template>
</template>

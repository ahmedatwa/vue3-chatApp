<script setup lang="ts">
import { ref, watch } from "vue";
import { Snackbar } from "@/types";

const isVisible = ref(false);
//const text = ref("");

interface Props {
    alert: Snackbar | null;
    color?: string;
    timeout?: number;
}
const props = withDefaults(defineProps<Props>(), {
    timeout: 2500,
    color: "success"
})

watch(
    () => props.alert,
    (newAlert) => {
        if (newAlert)
            // text.value = newV;
            isVisible.value = true;
    }
);
</script>   
<template>
    <v-sheet class="d-flex flex-column" v-if="alert">
        <v-snackbar closable :timeout="timeout" :color="alert?.type" v-model="isVisible" location="end top">
            <p><span v-if="alert.title" class="font-weight-bold">{{ alert.title }}: </span>{{ alert?.text }}</p>
            <template v-slot:actions>
                <v-btn color="pink" variant="text" @click="isVisible = false">
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </v-sheet>
</template>

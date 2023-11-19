<script setup lang="ts">
import { ref, watch } from "vue";
import type { Snackbar } from "@/types";

const isVisible = ref(false);

const props = defineProps<{
    alert: Snackbar | null;
}>()

watch(
    () => props.alert,
    (newAlert) => {
        if (newAlert)
            isVisible.value = true;
    }
);


</script>   
<template>
    <v-sheet class="d-flex flex-column" v-if="alert">
        <v-snackbar closable :timeout="alert.timeout ? alert.timeout : 4000" :color="alert?.type" v-model="isVisible"
            location="top end"  multi-line variant="elevated" transition="scroll-y-transition">
            <v-sheet v-if="alert.title" color="transparent">
                <h4 class="font-weight-bold">
                    <v-icon
                        :icon="alert.type === 'error' ? 'mdi-alert-octagon' : 'mdi-alert-circle-check-outline'"></v-icon>
                    {{ alert.title }}
                </h4>
            </v-sheet>
            <v-sheet color="transparent">
                <p><span v-if="alert.code" class="me-2">{{ alert.code }}: </span>
                    {{ alert?.text }}
                </p>
            </v-sheet>
            <template v-slot:actions>
                <v-btn color="blue-grey-darken-3" variant="text" @click="isVisible = false">{{ $lang('button.close') }}
                </v-btn>
            </template>
        </v-snackbar>
    </v-sheet>
</template>

<script setup lang="ts">
import { ref } from "vue";
//import type { Alert } from "@/types"

const dialog = ref(false);

interface Props {
    titleText: string;
    titleIcon?: string;
    titleColor?: string;
    height?: number | string;
    persistent?: boolean;
    scrollable?: boolean
    transition?: string | boolean;
}

withDefaults(defineProps<Props>(), {
    titleText: "Dialog",
    titleIcon: "mdi-information-slab-circle",
    titleColor: "success",
    persistent: false,
    scrollable: false,
    transition: "dialog-bottom-transition"

})
</script>
<template>
    <v-dialog v-model="dialog" activator="parent" width="auto" :height="height" :transition="transition" scrollable
        persistent>
        <v-card>
            <v-card-title>
                <v-icon @click="dialog = false" :icon="titleIcon"></v-icon>
                {{ titleText }}
                <v-icon class="float-right" icon="mdi-close-circle-outline" @click="dialog = false" color="error"></v-icon>
            </v-card-title>
            <v-card-text class="ma-auto">
                <slot name="main"></slot>
            </v-card-text>
            <v-card-actions>
                <slot name="buttons"></slot>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const dialog = ref(false);

defineProps<{
    title: string;
    isAlert?: boolean;
    alertText?: string;
    alertType?: string;
    titleIcon: string;
}>();
</script>
<template>
    <v-dialog v-model="dialog" activator="parent" width="auto" transition="dialog-bottom-transition">
        <v-card>
            <v-card-text>
                <v-icon :icon="titleIcon" color="info"></v-icon> {{ title }}
            </v-card-text>
            <v-alert text="..." type="success" variant="tonal" v-if="isAlert"></v-alert>
            <slot name="append"></slot>
            <v-card-actions>
                <slot name="action-button"> </slot>
                <v-btn @click="dialog = false" class="ms-auto">
                    <v-icon icon="mdi-close-circle" color="error"></v-icon>Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

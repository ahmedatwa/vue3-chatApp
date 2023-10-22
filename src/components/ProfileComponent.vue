<script setup lang="ts">
import { ref, watch } from "vue"

const username = ref("");
const isVisible = ref(false);

interface Props {
    visible: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    // "update:visible": [value: boolean]
}>();

watch(
    () => props.visible,
    () => isVisible.value = props.visible
)

const saveProfile = () => {
    // emit("update:visible", false)
}
</script>
<template>
    <v-dialog v-model="props.visible" width="500" transition="dialog-top-transition" class="pa-4">
        <v-card>
            <v-card-title>
                Preferences
                <v-icon class="float-right" @click="isVisible = false" icon="mdi-close-circle-outline"></v-icon>
            </v-card-title>
            <v-divider :thickness="3" color="info"></v-divider>
            <v-form @submit.prevent="saveProfile">
                <v-text-field v-model="username" label="Name"></v-text-field>

                <v-text-field v-model="username" label="Name"></v-text-field>
                <v-select></v-select>

                <v-checkbox></v-checkbox>

                <v-btn class="me-4" type="submit">
                    submit
                </v-btn>
            </v-form>
        </v-card>
    </v-dialog>
</template>
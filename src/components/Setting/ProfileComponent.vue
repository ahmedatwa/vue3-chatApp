<script setup lang="ts">
import { ref, watch } from "vue"
import { UserSessionData } from "@/types";

const username = ref("");
const dialog = ref(false);

const props = defineProps<{
    user: UserSessionData | undefined;
}>()
const emit = defineEmits<{
    close: [value: boolean]
}>();

const saveProfile = () => {
    // emit("update:visible", false)
}

watch(
    () => props.user,
    (newU) => {
        console.log(newU);
        
    })
</script>
<template>
    <v-dialog v-model="dialog" activator="parent" width="500" transition="dialog-top-transition" class="pa-4">
        <v-card>
            <v-card-title>
                Preferences
                <v-icon class="float-right" @click="dialog = false" icon="mdi-close-circle-outline"></v-icon>
            </v-card-title>
            <v-divider :thickness="3" color="info"></v-divider>
            <v-form @submit.prevent="saveProfile" class="ma-3">
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
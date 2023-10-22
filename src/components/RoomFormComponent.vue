<script setup lang="ts">
import { ref, computed } from "vue"
import { snakeCase, capitalize, filter } from "lodash"
import { User } from "@/types";

const roomName = ref("");
const dialog = ref(false);

const props = defineProps<{
    users: User[] | undefined;
}>();

const emit = defineEmits<{
    "create:room": [value: string]
}>()

const createRoom = () => {
    emit('create:room', snakeCase(roomName.value))
    roomName.value = "";
    dialog.value = false
}

const users = computed(() => {
    if (props.users)
        return filter(props.users, ["self", false]);
})
</script>

<template>
    <v-btn color="primary" variant="text" icon="mdi-chat-plus" @click="dialog = true"></v-btn>
    <!-- Room Form -->
    <v-dialog v-model="dialog" width="auto">
        <v-card width="350">
            <v-card-title>
                Preferences
                <v-icon class="float-right" @click="dialog = false" icon="mdi-close-circle-outline"></v-icon>
            </v-card-title>
            <v-container>
                <v-form @submit.prevent="createRoom">
                    <v-text-field label="Room Name" v-model="roomName" hint="only '_|#|&' allowed"></v-text-field>
                    <v-divider></v-divider>
                    <v-list>
                        <v-list-subheader>Invite Users</v-list-subheader>
                        <v-list-item v-for="user in users" :key="user._id">
                            <v-list-item-title><v-checkbox :label="capitalize(user.username)" :value="user.uuid"
                                    hide-details="auto"></v-checkbox></v-list-item-title>
                        </v-list-item>
                    </v-list>
                    <v-btn type="submit">Create</v-btn>
                </v-form>
            </v-container>
        </v-card>
    </v-dialog>
</template>
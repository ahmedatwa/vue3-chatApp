<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { snakeCase, capitalize, filter } from "lodash";
import { DBUser } from "@/types";

const roomName = ref("");
const dialog = ref(false);
const isAlertVisible = ref(false);
const selectedRoomIds = ref([]);

const props = defineProps<{
    allUsers: DBUser[] | undefined;
    channelName?: string | null
    currentUser: string | undefined;
    icon: string
    color: string;
    title: string;
    subTitle?: string;
}>();

const emit = defineEmits<{
    "create:room": [value: { name: string, users: string[] }];
    "update:users": [value: string[]];
    "update:input:value": [value: string];
}>();

const createRoom = () => {
    emit("create:room", { name: snakeCase(roomName.value), users: selectedRoomIds.value });
    roomName.value = "";
    dialog.value = false;
    isAlertVisible.value = false;
};

const users = computed(() => {
    if (props.allUsers) return filter(props.allUsers, (user) => {
        return user._uuid !== props.currentUser
    });
});

watch(dialog, (newVal) => {
    if (newVal === false)
        roomName.value = "";
})
</script>
<template>
    <v-tooltip text="Invite Users" location="top">
        <template v-slot:activator="{ props }">
            <v-btn :color="color" variant="text" :icon="icon" @click="dialog = true" v-bind="props"></v-btn>
        </template>
    </v-tooltip>
    <!-- Room Form -->
    <v-dialog v-model="dialog" width="auto" persistent>
        <v-card width="350" class="ma-4">
            <v-card-title>
                {{ title }}
                <v-icon class="float-right" @click="dialog = false" icon="mdi-close-circle-outline"></v-icon>
            </v-card-title>
            <v-alert text="Changes Saved." type="success" variant="tonal" v-if="isAlertVisible"></v-alert>
            <v-form @submit.prevent="createRoom" class="ma-2">
                <v-text-field label="Channel Name" v-model="roomName"
                    @input="$emit('update:input:value', $event.target.value)" hint="only '_|#|&' allowed"
                    v-if="!channelName" clearable prepend-inner-icon="mdi-forum"></v-text-field>
                <v-divider></v-divider>
                <v-list-subheader v-if="subTitle">{{ subTitle }}</v-list-subheader>
                <v-virtual-scroll :height="200" :items="users">
                    <template v-slot:default="{ item }">
                        <v-list-item>
                            <v-checkbox :label="capitalize(item.username)" :value="item._uuid" v-model="selectedRoomIds"
                                hide-details="auto"></v-checkbox>
                        </v-list-item>
                    </template>
                </v-virtual-scroll>
                <slot></slot>
            </v-form>
        </v-card>
    </v-dialog>
</template>

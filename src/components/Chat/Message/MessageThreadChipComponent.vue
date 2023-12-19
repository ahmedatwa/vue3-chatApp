<script setup lang="ts">
import { computed, inject } from "vue"
import type { UserMessages } from "@/types/User";
import type { ChannelMessages } from "@/types/Channel";

const isThread = inject<boolean>("isThread");
const props = defineProps<{
    message: UserMessages | ChannelMessages;
}>();

const emit = defineEmits<{
    "update:threadMessages": [value: UserMessages | ChannelMessages];
}>();

const getLastThreadMessage = computed((): string => {
    if (props.message.thread && props.message.thread.length > 0) {
        const len = props.message.thread.slice(-1)[0];
        if (len) {
            return len.createdAt as string;
        }
    }
    return "";
});

const startThread = (start: boolean, message: UserMessages | ChannelMessages) => {
    if (start) {
        emit("update:threadMessages", message);
    }
};
</script>

<template>
    <v-sheet v-if="message.thread?.length" class="me-2 d-inline" :id="`thread-${message._id}`">
        <v-chip color="red" label size="x-small" variant="outlined" :key="message._id"
            @click.stop="startThread(isThread = true, message)">
            <v-icon start icon="mdi-label"></v-icon>
            {{ $lang("chat.button.thread", [message.thread?.length || 0]) }}
            <v-tooltip location="top" activator="parent">
                {{ $lang("chat.text.lastMessage", [getLastThreadMessage]) }}</v-tooltip>
        </v-chip>
    </v-sheet>
</template>
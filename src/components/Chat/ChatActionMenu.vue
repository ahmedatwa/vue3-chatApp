<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { MessageEditComponent, MessageDeleteComponent } from "@/components/Channel";
import type { ChannelMessages } from "@/types/Channel";
import type { UserSessionData } from "@/types/User";

const user = inject<UserSessionData>("user");
const isStartThread = inject<boolean>("isStartThread");
const toggleMenu = ref(false);
const isEditDialog = ref(false);
const isDeleteDialog = ref(false);

// Props
const props = defineProps<{
    message: ChannelMessages;
}>();

// emits
const emit = defineEmits<{
    "on:deleteMessage": [value: number];
    "on:editMessage": [
        value: {
            _messageId: string | number;
            editContent: string;
            content: string;
            updatedAt: string;
        }
    ];
    "start:thread": [value: { message: ChannelMessages }];
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

const startThread = (open: boolean, message: ChannelMessages) => {
    if (open) {
        emit("start:thread", { message: message });
    }
};
</script>
<template>
    <div id="channel-message-action" class="d-inline">
        <v-btn variant="text" size="xs" prepend-icon="mdi-dots-vertical" color="indigo" @click="toggleMenu = !toggleMenu">
        </v-btn>
        <v-tooltip :text="$lang('text.lastThreadMessage', [getLastThreadMessage])">
            <template v-slot:activator="{ props }">
                <v-chip v-if="message.thread?.length && !toggleMenu" class="ma-2" color="red" label size="x-small"
                    variant="outlined" @click.prevent="startThread((isStartThread = true), message)" v-bind="props">
                    <v-icon start icon="mdi-label"></v-icon>
                    {{ $lang("text.threadLabel", [message.thread?.length]) }}
                </v-chip>
            </template>
        </v-tooltip>
        <v-slide-x-transition mode="out-in">
            <v-sheet class="d-inline" v-if="toggleMenu" :key="`sheet-${message._id}`">
                <!-- v-if="message.from !== uuid" -->
                <v-btn prepend-icon="mdi-reply" color="blue-darken-1" class="ma-2" elevation="1" variant="tonal"
                    size="small" @click.prevent="startThread((isStartThread = true), message)">
                    <v-badge color="error" :content="message.thread?.length" floating>
                        {{ $lang("text.threadLabel", [message.thread?.length]) }}
                    </v-badge>
                </v-btn>
                <!-- Edit -->
                <v-btn prepend-icon="mdi-circle-edit-outline" color="green" v-if="message.from === user?._uuid" class="ma-2"
                    @click="isEditDialog = !isEditDialog" elevation="1" size="small" variant="tonal">
                    {{ $lang("button.edit") }}
                </v-btn>
                <!-- Delete -->
                <v-btn prepend-icon="mdi-delete-forever" color="red" class="ma-2" elevation="1" size="small" variant="tonal"
                    @click="isDeleteDialog = !isDeleteDialog" v-if="message.from === user?._uuid">
                    {{ $lang("button.delete") }}</v-btn>
            </v-sheet>
        </v-slide-x-transition>
        <!-- Edit -->
        <message-edit-component v-show="isEditDialog" v-model:model-value="isEditDialog" :message="message"
            @on:edit-message="$emit('on:editMessage', $event)" :key="`message-edit${message._id}`"></message-edit-component>
        <!-- Delete -->
        <message-delete-component v-show="isDeleteDialog" v-model:model-value="isDeleteDialog" :message="message"
            @on:delete-message="$emit('on:deleteMessage', $event)"
            :key="`message-delete${message._id}`"></message-delete-component>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { MessageEditComponent, MessageDeleteComponent } from "@/components/Channel";
import { MessageThreadComponent } from "@/components/Channel";
import type { ChannelMessages, SendThreadPayload } from "@/types/Channel";
import type { UserSessionData } from "@/types/User";
import type { TypingEvent } from "@/types";

const user = inject<UserSessionData>("user");
const isThreadDialog = ref<boolean>(false)
const toggleMenu = ref(false);
const isEditDialog = ref(false)
const isDeleteDialog = ref(false)

// Props
const props = defineProps<{
    message: ChannelMessages;
    isThreadLoading?: boolean;
    threadTyping: TypingEvent | null;
}>();

// emits
const emit = defineEmits<{
    "on:sendMessageThread": [payload: SendThreadPayload];
    "on:deleteMessage": [value: number];
    "on:editMessage": [value: { _messageId: string | number, editContent: string, content: string, updatedAt: string }];
    "on:threadTyping": [value: string];
   // "updatethreadMessage": [value: ChannelMessages]
}>();

const getLastThreadMessage = computed((): string => {
    if (props.message.thread && props.message.thread.length > 0) {
        const len = props.message.thread.slice(-1)[0]
        if (len) {
            return len.createdAt as string
        }
    }
    return ''
})
 


</script>
<template>
    <div id="channel-message-action" class="d-inline">
        <v-btn variant="text" size="xs" prepend-icon="mdi-dots-vertical" color="indigo" @click="toggleMenu = !toggleMenu">
        </v-btn>
        <v-tooltip :text="$lang('text.lastThreadMessage', [getLastThreadMessage])">
            <template v-slot:activator="{ props }">
                <v-chip v-if="message.thread?.length && !toggleMenu" class="ma-2" color="red" label size="x-small"
                    variant="outlined" @click="isThreadDialog = !isThreadDialog" v-bind="props">

                    <v-icon start icon="mdi-label"></v-icon>

                    {{ $lang('text.threadLabel', [message.thread?.length]) }}
                </v-chip>
            </template>
        </v-tooltip>
        <v-slide-x-transition mode="out-in">
            <v-sheet class="d-inline" v-if="toggleMenu" :key="`sheet-${message._id}`">
                <!-- v-if="message.from !== uuid" -->
                <v-btn prepend-icon="mdi-reply" color="blue-darken-1" class="ma-2" elevation="1" variant="tonal"
                    size="small" @click="isThreadDialog = !isThreadDialog">
                    <v-badge color="error" :content="message.thread?.length" floating>
                        {{ $lang('text.threadLabel', [message.thread?.length]) }}
                    </v-badge>
                </v-btn>
                <!-- Edit -->
                <v-btn prepend-icon="mdi-circle-edit-outline" color="green" v-if="message.from === user?._uuid" class="ma-2"
                    @click="isEditDialog = !isEditDialog" elevation="1" size="small" variant="tonal">
                    {{ $lang('button.edit') }}
                </v-btn>
                <!-- Delete -->
                <v-btn prepend-icon="mdi-delete-forever" color="red" class="ma-2" elevation="1" size="small" variant="tonal"
                    @click="isDeleteDialog = !isDeleteDialog" v-if="message.from === user?._uuid">
                    {{ $lang('button.delete') }}</v-btn>
            </v-sheet>
        </v-slide-x-transition>
        <!-- Thread -->
        <message-thread-component v-show="isThreadDialog" :current-message="message" :thread-typing="threadTyping"
            v-model:model-value="isThreadDialog" :is-loading="isThreadLoading"
            @on:thread-typing="$emit('on:threadTyping', $event)" @on:send-message-thread="$emit('on:sendMessageThread', $event)"
            :key="`message-thread${message._id}`"></message-thread-component>
        <!-- Edit -->
        <message-edit-component v-show="isEditDialog" v-model:model-value="isEditDialog" :message="message"
            @on:edit-message="$emit('on:editMessage', $event)" :key="`message-edit${message._id}`"></message-edit-component>
        <!-- Delete -->
        <message-delete-component v-show="isDeleteDialog" v-model:model-value="isDeleteDialog" :message="message"
            @on:delete-message="$emit('on:deleteMessage', $event)"
            :key="`message-delete${message._id}`"></message-delete-component>
    </div>
</template>
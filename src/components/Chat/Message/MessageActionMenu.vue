<script setup lang="ts">
import { ref, inject, watch, onMounted, onUnmounted } from "vue";
import { ChatEmojiComponent, MessageEditComponent } from "@/components/Chat"
import { MessageDeleteComponent } from "@/components/Chat"
// types
import type { UserMessages, User } from "@/types/User";
import type { ChannelMessages } from "@/types/Channel";

const isThread = inject<boolean>("isThread");
const isEditDialog = ref(false);
const isDeleteDialog = ref(false);
const isEmoji = ref(false);
const itemRef = ref<HTMLDivElement>()

// Props
const props = defineProps<{
    message: UserMessages | ChannelMessages;
    messageValue?: string | number | null;
    actionMenu?: boolean;
    selectedUser?: User | null;
}>();

// emits
const emit = defineEmits<{
    deleteMessage: [value: number | string];
    editMessage: [
        value: {
            _messageID: string | number;
            editContent: string;
            content: string;
            updatedAt: string;
        }
    ];
    "update:threadMessages": [value: UserMessages | ChannelMessages];
    "update:messageReaction": [value: { _id: string | number; emoji: string }];
    "update:actionMenu": [value: boolean];
    "update:messageValue": [value: string | number | null];
}>();

const startThread = (
    start: boolean,
    message: UserMessages | ChannelMessages
) => {
    if (start) {
        emit("update:threadMessages", message);
    }
};

const messageReaction = (_id: string | number, emoji: string) => {
    emit('update:messageReaction', { _id, emoji })
}

watch(isEmoji, (val) => {
    if (val) {
        itemRef.value?.classList.add('is-open')
    } else {
        itemRef.value?.classList.remove('is-open')
        if (!itemRef.value?.classList.contains("is-open") || !itemRef.value?.classList.contains("menu-active")) {
            emit("update:actionMenu", false)
            emit("update:messageValue", null)
        }
    }
})

watch([isEditDialog, () => isDeleteDialog.value], ([newEdit, newDelete]) => {
    if (newEdit || newDelete) {
        itemRef.value?.classList.add('is-open')
    } else {
        itemRef.value?.classList.remove('is-open')
        if (!itemRef.value?.classList.contains("is-open") || !itemRef.value?.classList.contains("menu-active")) {
            emit("update:actionMenu", false)
            emit("update:messageValue", null)
        }
    }
})

onMounted(() => {
    if (props.messageValue) {
        const activeElement = document.getElementById(`col-${props.messageValue}`)

        itemRef.value?.addEventListener("mouseover", (e) => {
            e.stopPropagation()
            itemRef.value?.classList.add("menu-active")
        })

        itemRef.value?.addEventListener("mouseleave", (e) => {
            e.stopPropagation()
            itemRef.value?.classList.remove("menu-active")
        })

        if (activeElement) {
            activeElement?.addEventListener("mouseover", (e) => {
                e.stopPropagation()
                activeElement.classList.add("is-hover")
            })

            activeElement?.addEventListener("mouseleave", (e) => {
                e.stopPropagation()
                if (!itemRef.value?.classList.contains("is-open")) {
                    activeElement.classList.remove("is-hover")
                    emit("update:actionMenu", false)
                    emit("update:messageValue", null)
                }
            })
        }
    }
})

onUnmounted(() => {
    itemRef.value?.replaceWith(itemRef.value.cloneNode(true))
    emit("update:actionMenu", false)
    emit("update:messageValue", null)
})

</script>
<template>
    <div class="action-menu-content-wrapper" ref="itemRef">
        <v-slide-x-reverse-transition>
            <v-btn-toggle divided density="comfortable" variant="elevated" v-if="actionMenu" class="border">
                <v-btn @click="messageReaction(message._id, '😂')">
                    <h2>😂</h2>
                    <v-tooltip activator="parent" location="top">joy</v-tooltip>
                </v-btn>
                <v-btn @click="messageReaction(message._id, '😆')">
                    <h2>😆</h2>
                    <v-tooltip activator="parent" location="top">laughing</v-tooltip>
                </v-btn>
                <chat-emoji-component @update:open="isEmoji = $event" :tooltip="$lang('chat.text.emoji')"
                    @update:selected="messageReaction(message._id, $event)"></chat-emoji-component>
                <v-btn @click.stop="startThread((isThread = true), message)">
                    <v-icon icon="mdi-message-reply-text" size="large"></v-icon>
                    <v-tooltip activator="parent" location="top">{{
                        $lang("chat.text.replyThread")
                    }}</v-tooltip>
                </v-btn>
                <message-edit-component :tooltip="$lang('chat.text.editMessage')" @update:open="isEditDialog = $event"
                    :message="message" :selected-user="selectedUser" @edit-message="$emit('editMessage', $event)"
                    :key="`message-edit${message._id}`">
                </message-edit-component>
                <message-delete-component :tooltip="$lang('chat.text.deleteMessage')" :message="message"
                    :selected-user="selectedUser" :key="`message-delete${message._id}`"
                    @delete-message="$emit('deleteMessage', $event)" @update:open="isDeleteDialog = $event">
                </message-delete-component>
            </v-btn-toggle>
        </v-slide-x-reverse-transition>
    </div>
</template>
<style scoped>
.action-menu-content-wrapper {
    position: absolute;
    transform: translate(0, 10px);
    overflow: hidden;
    /* bottom: 3.1rem; */
    bottom: calc(100% - 0.10em);
    right: 0;
}

.border {
    border: thin #f5f5f5f5;
    border-radius: 8px;
}
</style>

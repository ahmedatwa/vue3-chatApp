<script setup lang="ts">
import type { MessageReactions } from "@/types/Chat";

defineProps<{
  reactions: MessageReactions[];
  messageId: string | number
}>();

const emit = defineEmits<{
  "update:messageReaction": [value: { _id: string | number | null, _messageID: string | number, emoji: string }];
}>();


const updateMessageReaction = (_messageID: string | number, reaction: MessageReactions) => {
  emit('update:messageReaction', { _messageID, _id: reaction._id, emoji: reaction.emoji })
}
</script>

<template>
  <v-sheet class="reactions-wrapper" :id="`reaction-${messageId}`">
    <v-chip @click="updateMessageReaction(messageId, reaction)" size="small" class="mx-2" elevation="2"
      v-for="reaction in reactions" :key="reaction._id">
      <v-badge :content="reaction.total" color="transparent" location="bottom end">
        <h4 class="me-2">{{ reaction.emoji }}</h4>
      </v-badge>
      <v-tooltip activator="parent">
        {{ reaction.displayName }}</v-tooltip>
    </v-chip>
  </v-sheet>
</template>
<style scoped>
.reactions-wrapper {
  margin-left: 1em;
  margin-top: 2px;
  background-color: transparent;
}
</style>
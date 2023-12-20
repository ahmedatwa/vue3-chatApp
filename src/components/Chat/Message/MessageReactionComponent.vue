<script setup lang="ts">
import type { MessageReactions } from "@/types/Chat";

defineProps<{
  reactions: MessageReactions[];
  messageId: string | number
}>();

const emit = defineEmits<{
  "update:messageReaction": [value: { _id: string | number; emoji: string }];
}>();


const updateMessageReaction = (_id: string | number, emoji: string) => {
  emit('update:messageReaction', { _id, emoji, })
}
</script>

<template>
  <v-sheet class="reactions-wrapper" :id="`reaction-${messageId}`">
    <v-chip @click="updateMessageReaction(messageId, reaction.emoji)" size="small" class="mx-2" elevation="2"
      v-for="reaction in reactions" :key="reaction._messageID">
      <v-badge :content="reaction.total" color="transparent" location="bottom end">
        <h4 class="me-2">{{ reaction.emoji }}</h4>
      </v-badge>
      <v-tooltip activator="parent">{{
        reaction.displayName
      }}</v-tooltip>
    </v-chip>
  </v-sheet>
</template>
<style scoped>
.reactions-wrapper {
  margin-left: 70px;
  margin-top: 2px;
  background-color: transparent;
}
</style>
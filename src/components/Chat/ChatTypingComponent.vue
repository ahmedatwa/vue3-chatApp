<script setup lang="ts">
import type { Typing } from "@/types/Chat";

defineProps<{
  typing: Typing | null;
}>();
</script>
<template>
  <v-slide-x-transition mode="in-out">
    <p v-if="typing" class="ma-2 text-caption" :key="typing.from">
      {{ $lang("chat.text.typing", [typing.displayName]) }}
    </p>
  </v-slide-x-transition>
</template>

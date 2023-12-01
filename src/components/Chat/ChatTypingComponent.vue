<script setup lang="ts">
import type { TypingEvent } from "@/types"

defineProps<{
  typing: TypingEvent | null
}>()

</script>
<template>
  <v-slide-x-transition mode="in-out">
    <p  v-if="typing" class="ma-2 text-caption" :key="typing.from">{{ $lang('text.typing', [typing.name]) }}</p>
  </v-slide-x-transition>
</template>

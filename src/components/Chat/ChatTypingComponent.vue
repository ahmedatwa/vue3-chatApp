<script setup lang="ts">
import type { UserTyping } from "@/types/User"
import type { ChannelTyping } from "@/types/Channel"

defineProps<{
  typing: UserTyping | ChannelTyping | null
}>()

</script>
<template>
  <v-slide-x-transition mode="in-out">
    <p  v-if="typing" class="ma-2 text-caption" :key="typing.from">{{ $lang('text.typing', [typing.displayName]) }}</p>
  </v-slide-x-transition>
</template>

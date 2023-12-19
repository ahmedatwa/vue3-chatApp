<script setup lang="ts">
import { ref, watch } from "vue"
import "vue3-emoji-picker/css";
import EmojiPicker from "vue3-emoji-picker";
import { useTheme } from 'vuetify'

const theme = useTheme()
const isEmoji = ref(false)

defineProps<{
  hideSearch?: boolean;
  tooltip?: boolean;
  tooltipText?: string;
  iconColor?: string;
  offset?: string | number | number[];
  location?: any;
}>()


const emit = defineEmits<{
  "update:selected": [value: string]
  "update:open": [value: boolean]
}>()

watch(isEmoji, (value) => {
  emit("update:open", value)
})

</script>
<template>
  <v-btn @click.stop="isEmoji = !isEmoji">
    <v-menu v-model="isEmoji" :close-on-content-click="false" target="parent" @mouseleave="isEmoji = false"
      :offset="offset" :location="location">
      <emoji-picker :native="true" :hide-search="hideSearch" @mouseleave="$emit('update:open', false)"
        :theme="theme.global.name.value" @select="$emit('update:selected', $event.i)"></emoji-picker>
    </v-menu>
    <v-icon icon="mdi-emoticon" size="large" :color="iconColor"></v-icon>
    <v-tooltip activator="parent" location="top" v-if="tooltip">{{ $lang("chat.text.emoji") }}</v-tooltip>
  </v-btn>
</template>

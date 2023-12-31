<script setup lang="ts">
import { ref, onMounted } from "vue"
import { formatTimeShort, writeClipboard } from "@/helpers"
// types
import type { UserSessionData } from "@/types/User";

const isCopied = ref(false)
const dialog = ref(false)
const topic = ref("")

// Props
const props = defineProps<{
  currentUser: UserSessionData | undefined
}>();

// emits
const emit = defineEmits<{
  "update:userSettings": [value: { key: string, value: string }]
}>();

const copyChannelID = () => {
  if (props.currentUser) writeClipboard(props.currentUser._uuid);
  isCopied.value = true;
};

onMounted(() => {
  if (props.currentUser?.topic) topic.value = props.currentUser.topic
})

</script>
<template>
  <v-btn @click.stop="dialog = !dialog" append-icon="mdi-menu-down" variant="text">
    <template #prepend>
      <v-avatar :image="currentUser?.image" v-if="currentUser?.image" size="25"></v-avatar>
      <v-avatar color="info" v-else size="25">
        <v-icon icon="mdi-account-circle"></v-icon>
      </v-avatar>
    </template>
    {{ currentUser?.displayName }}
  </v-btn>
  <v-dialog width="500" v-model="dialog">
    <v-card>
      <v-card-title>
        <v-badge dot location="bottom end" :color="currentUser?.connected ? 'success' : 'grey'" class="ma-1">
          <v-avatar :image="currentUser?.image" v-if="currentUser?.image" size="25"></v-avatar>
          <v-avatar color="info" v-else size="25">
            <v-icon icon="mdi-account-circle"></v-icon>
          </v-avatar>
        </v-badge>
        {{ currentUser?.displayName }}
        <v-icon class="float-right" color="red" icon="mdi-close-circle-outline" @click="dialog = false"></v-icon>
      </v-card-title>
      <v-divider :thickness="3" color="info"></v-divider>
      <v-card-text>
        <v-sheet :border="true" class="ma-2 pa-2" rounded>
          <p>{{ $lang('directMessages.textTopic') }}</p>
          <v-text-field v-model="topic" clearable :label="$lang('directMessages.textAddTopic')"
            append-icon="mdi-content-save-edit-outline"
            @click:append="$emit('update:userSettings', { key: 'topic', value: topic })">
          </v-text-field>
        </v-sheet>
        <v-sheet :border="true" class="ma-2 pa-2" rounded>
          <p class="my-2"><v-icon icon="mdi-clock-time-four-outline"></v-icon>
            {{ $lang('directMessages.textTime', [formatTimeShort()]) }}</p>
          <p><v-icon icon="mdi-email-outline"></v-icon> {{ currentUser?.email }}</p>
        </v-sheet>
        <v-sheet :border="true" class="ma-2 pa-2" rounded>
          <p>{{ $lang('directMessages.textFiles') }}</p>
        </v-sheet>
      </v-card-text>
      <v-card-actions class="pa-2 ma-2">
        <v-sheet>
          {{ $lang("directMessages.textChannelID", [currentUser?._uuid]) }}
          <v-btn density="compact" elevation="0" @click="copyChannelID" class="ms-3" icon>
            <v-icon :icon="isCopied ? 'mdi-check-all' : 'mdi-content-copy'" size="small"></v-icon>
            <v-tooltip activator="parent" location="top">{{ $lang("directMessages.copyChannelID") }}</v-tooltip>
          </v-btn>
        </v-sheet>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

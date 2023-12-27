<script setup lang="ts">
import { ref } from "vue"
import { formatTimeShort, writeClipboard } from "@/helpers"
// types
import type { UserSessionData } from "@/types/User";

const isEditing = ref(false)
const isCopied = ref(false)
const dialog = ref(false)

// Props
const props = defineProps<{
  currentUser: UserSessionData | undefined
}>();

// emits
const emit = defineEmits<{
}>();

const copyChannelID = () => {
  if (props.currentUser) writeClipboard(props.currentUser._uuid);
  isCopied.value = true;
};

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
          <v-textarea clearable :label="$lang('directMessages.textAddTopic')" :readonly="!isEditing" rows="1"
          row-height="15">
            <template v-slot:append>
              <v-slide-x-reverse-transition mode="out-in">
                <v-icon :key="`icon-${isEditing}`" :color="isEditing ? 'success' : 'info'"
                  :icon="isEditing ? 'mdi-check-outline' : 'mdi-circle-edit-outline'"
                  @click="isEditing = !isEditing"></v-icon>
              </v-slide-x-reverse-transition>
            </template>
          </v-textarea>
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

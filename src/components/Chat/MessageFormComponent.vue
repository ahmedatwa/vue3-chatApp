<script setup lang="ts">
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";
import { ref, watch } from "vue";
import { useFileDialog } from "@vueuse/core";
import { forEach, isEmpty } from "lodash";

const messageValue = ref("");
const chip = ref(false);
const uploadedFile = ref<File>();
const isDisabled = ref(true);

interface Props {
  threadId?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [payload: { _threadId: string | null; text: string; file?: File }];
  typing: [value: string];
}>();

const { files, open, reset, onChange } = useFileDialog({
  accept: "image/*, application/pdf", // Set to accept only image files
});

const handleInput = (e: KeyboardEvent) => {
  if (e.code === "Enter" && !e.shiftKey) {
    e.preventDefault();
    onSubmit();
  }
};
const onSubmit = () => {
  if (!isEmpty(messageValue.value) || uploadedFile.value) {
    emit("submit", {
      _threadId: props.threadId ? props.threadId : null,
      text: messageValue.value,
      file: uploadedFile.value,
    });
  }
  messageValue.value = "";
  removeFile();
};

// emoji
const onSelectEmoji = (emoji: any) => {
  messageValue.value += emoji.i;
};

watch(messageValue, (newVal) => {
  if (newVal) emit("typing", newVal);
});

watch([messageValue, () => uploadedFile.value], ([newM, newF]) => {
  if (newM || newF) {
    isDisabled.value = false;
  } else {
    isDisabled.value = true;
  }
});

onChange((files) => {
  chip.value = true;
  forEach(files, (file) => {
    uploadedFile.value = file;
  });
});

const removeFile = () => {
  chip.value = false;
  uploadedFile.value = undefined;
  reset();
};
</script>

<template>
  <v-card :elevation="4">
    <v-form>
      <v-textarea name="input-message" label="Send A Message..." rows="2" row-height="15" auto-grow v-model="messageValue"
        @keydown="handleInput" hide-details="auto" clearable hint="Shift + Return to add new line">
        <template v-slot:prepend-inner>
          <v-chip closable class="ma-2" @click:close="removeFile" v-if="files">
            <span v-for="file in files" :key="file.name">
              {{ file.name }}
            </span>
          </v-chip>
        </template>
      </v-textarea>
    </v-form>
    <v-sheet>
      <div class="float-left ml-2"></div>
      <div class="float-right">
        <v-btn icon="mdi-plus-circle" density="default" color="orange-accent-2" @click="open"></v-btn>
        <v-btn icon="mdi-emoticon-happy-outline" density="default" id="emoji-activator" color="orange-darken-2">
        </v-btn>
        <v-menu :close-on-content-click="false" location="top" open-on-hover activator="#emoji-activator">
          <EmojiPicker :native="true" :hide-search="false" @select="onSelectEmoji" />
        </v-menu>
        <v-btn type="submit" icon="mdi-send" color="teal-lighten-1" :disabled="isDisabled"
          @click.prevent="onSubmit"></v-btn>
      </div>
    </v-sheet>
  </v-card>
</template>

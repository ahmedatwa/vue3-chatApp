<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import { onMounted, watchEffect } from "vue";
import { ChatUploadComponent, ChatMarkedComponent } from "@/components/Chat";
import { ChatEmojiComponent } from "@/components/Chat";
import { useMarkdown } from "@/composables/markdown"

const uploadedFiles = ref<File[]>([]);
const error = ref("");
const isEmoji = ref(false);
const alignment = ref("");
const formatting = ref('');
const isMarkDown = ref(false);
const txtareaRef = ref<HTMLInputElement>();
const selectedTxt = ref("");

interface Props {
  id?: string | number;
  inputValue: string;
  textAreaRows: number | string;
  textAreaRowHeight: number | string;
  textAreaLabel?: string;
  autoGrow?: boolean;
  noResize?: boolean;
  uploadButton?: boolean;
  emojiButton?: boolean;
  submitButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  textAreaRows: 3,
  textAreaRowHeight: 15,
  textAreaLabel: "",
  autoGrow: false,
  noResize: false,
  uploadButton: false,
  emojiButton: true,
  submitButton: true,
});
// emits
const emit = defineEmits<{
  "update:inputValue": [value: string];
  "update:emoji": [value: string];
  "update:files": [value: File[]];
  "update:submit": [value: boolean];
}>();

const clearMessage = () => {
  emit("update:inputValue", "");
};
const newUpload = (files: File[]) => {
  emit("update:files", files);
};

const onSelectEmoji = (emoji: string) => {
  emit("update:emoji", emoji);
};

const removeFile = (index: number) => {
  uploadedFiles.value?.splice(index, 1);
  emit("update:files", uploadedFiles.value);
};

const isDisabled = computed((): boolean => {
  if (props.inputValue.length > 0 || uploadedFiles.value.length > 0) {
    return false
  }
  return true
});

const submitForm = () => {
  if (props.inputValue.length > 0 || uploadedFiles.value.length > 0) {
    emit("update:submit", true);
  }
};

const handleEnter = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    submitForm();
  }
};



const getSelected = () => {
  const start = txtareaRef.value?.selectionStart;
  const finish = txtareaRef.value?.selectionEnd;
  if (start && finish)
    selectedTxt.value = txtareaRef.value?.value.substring(start, finish) ?? "";
};

onMounted(() =>  txtareaRef.value?.addEventListener("mouseup", getSelected))

onUnmounted(() =>
  txtareaRef.value?.removeEventListener("mouseup", getSelected)
);


const { markedTextResult } = useMarkdown(props.inputValue, selectedTxt.value, formatting.value, alignment.value)

if(markedTextResult.value) {
  emit('update:inputValue', markedTextResult.value)
}

 

</script>

<template>
  <v-form :id="`chat-input${id}`" :key="`chat-input${id}`" @submit.prevent>
    sss: {{ selectedTxt }}
    <v-card elevation="4" id="message-form-wrapper">
      <v-textarea ref="txtareaRef" :name="`input-message${id}`" :label="textAreaLabel" :rows="textAreaRows"
        :row-height="textAreaRowHeight" :auto-grow="autoGrow" :no-resize="noResize" :model-value="inputValue"
        hide-details="auto" clearable autofocus :hint="$lang('chat.help.newLine')" :error-messages="error"
        @click:clear="clearMessage" persistent-hint @update:model-value="$emit('update:inputValue', $event)"
        @keyup.enter="handleEnter" >
        <template v-slot:prepend-inner>
          <div class="d-flex flex-wrap" v-if="uploadedFiles">
            <v-chip v-for="(file, index) in uploadedFiles" :key="file.name" closable class="ma-2"
              @click:close="removeFile(index)">
              {{ file.name }}
            </v-chip>
          </div>
        </template>
        <div v-html="markedTextResult"></div>
      </v-textarea>
      <v-sheet class="d-flex flex-wrap">
        <div class="flex-1-0">
          <!-- upload button -->
          <chat-upload-component v-if="uploadButton" v-model:files="uploadedFiles" @update:files="newUpload"
            @error:upload="error = $event"></chat-upload-component>
          <chat-emoji-component icon-color="orange-darken-2" @update:open="isEmoji = $event"
            @update:selected="onSelectEmoji" offset="40" location="left"></chat-emoji-component>
          <!-- markdown button -->
          <v-btn @click.stop="isMarkDown = !isMarkDown" icon>
            <v-icon icon="mdi-format-header-pound"></v-icon>
          </v-btn>
          <chat-marked-component :is-markdown="isMarkDown" v-model:alignment="alignment"
            v-model:formatting="formatting"></chat-marked-component>
        </div>
        <!-- submit buton -->
        <div v-if="submitButton">
          <v-btn icon color="teal" :disabled="isDisabled" type="submit" @click="$emit('update:submit', true)"
            variant="text">
            <v-icon icon="mdi-send" size="large"></v-icon>
          </v-btn>
        </div>
      </v-sheet>
    </v-card>
  </v-form>
</template>

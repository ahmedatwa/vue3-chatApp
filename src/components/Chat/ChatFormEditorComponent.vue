<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted } from "vue";
import { ChatUploadComponent, ChatMarkedComponent } from "@/components/Chat";
import { ChatEmojiComponent, ChatTenorComponent } from "@/components/Chat";
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@vueup/vue-quill/dist/vue-quill.bubble.css';

const uploadedFiles = ref<File[] | null>(null);
const content = ref()
const error = ref("");
const isEmoji = ref(false);
const alignment = ref("");
const formatting = ref<string[]>([]);
const isMarkDown = ref(false);
const txtareaRef = ref<HTMLInputElement>();
const selectedTxt = ref("");

interface Props {
  // id?: string | number;
  // inputValue: string;
  // textAreaRows: number | string;
  // textAreaRowHeight: number | string;
  content?: string;
  contentType?: string;
  textAreaLabel?: string;
  autoGrow?: boolean;
  noResize?: boolean;
  uploadButton?: boolean;
  emojiButton?: boolean;
  submitButton?: boolean;
  markedButton?: boolean;
  tenorButton?: boolean;
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
  tenorButton: true,
  markedButton: true,
});
// emits
const emit = defineEmits<{
  "update:inputValue": [value: string];
  "update:emoji": [value: string];
  "update:files": [value: File[] | null];
  "update:submit": [value: boolean];
  //
  "update:formatting": [value: string[]];
  "update:alignment": [value: string];
  "update:selectedTxt": [value: string];
  "update:tenor": [value: string];
}>();

// const removeFile = (index: number) => {
//   if (uploadedFiles.value !== null) {
//     uploadedFiles.value?.splice(index, 1);
//     emit("update:files", uploadedFiles.value);
//   }
// };

// const isDisabled = computed((): boolean => {
//   if (props.inputValue.length > 0 || uploadedFiles.value !== null) {
//     return false;
//   }
//   return true;
// });

// const submitForm = () => {
//   if (props.inputValue.length > 0 || uploadedFiles.value !== null) {
//     emit("update:submit", true);
//     uploadedFiles.value = null;
//     emit("update:inputValue", "");
//   }
// };

// const handleEnter = (event: KeyboardEvent) => {
//   if (event.key === "Enter" && !event.shiftKey) {
//     submitForm();
//   }
// };

const getSelected = () => {
  const start = txtareaRef.value?.selectionStart;
  const finish = txtareaRef.value?.selectionEnd;
  if (start && finish)
    selectedTxt.value = txtareaRef.value?.value.substring(start, finish) ?? "";
  emit("update:selectedTxt", selectedTxt.value);
};

onMounted(() => txtareaRef.value?.addEventListener("mouseup", getSelected));

onUnmounted(() =>
  txtareaRef.value?.removeEventListener("mouseup", getSelected)
);

const testTenor = (e: string) => {
  const el = document.getElementById("input-message")
  console.log(el);
  console.log(txtareaRef.value);
  
  
}
</script>

<template>

<v-card elevation="4" >
      <quill-editor theme="bubble" v-model="content" toolbar="full"></quill-editor>

      <!-- <v-textarea
        ref="txtareaRef"
        :name="`input-message-${id}`"
        id="input-message"
        :label="textAreaLabel"
        :rows="textAreaRows"
        :row-height="textAreaRowHeight"
        :auto-grow="autoGrow"
        :no-resize="noResize"
        :model-value="inputValue"
        hide-details="auto"
        clearable
        autofocus
        :hint="$lang('chat.help.newLine')"
        :error-messages="error"
        @click:clear="$emit('update:inputValue', '')"
        persistent-hint
        @update:model-value="$emit('update:inputValue', $event)"
        @keyup.enter="handleEnter"
      >
        <template v-slot:prepend-inner>
          <div class="d-flex flex-wrap" v-if="uploadedFiles">
            <v-chip
              v-for="(file, index) in uploadedFiles"
              :key="file.name"
              closable
              class="ma-2"
              @click:close="removeFile(index)"
            >
              {{ file.name }}
            </v-chip>
          </div>
        </template>
      </v-textarea> -->
      <v-sheet class="d-flex flex-wrap">
        <div class="flex-1-0">
          <!-- upload button -->
          <chat-upload-component
            v-if="uploadButton"
            v-model:files="uploadedFiles"
            @update:files="$emit('update:files', $event)"
            @error:upload="error = $event"
          >
          </chat-upload-component>
          <chat-emoji-component
            icon-color="orange-darken-2"
            @update:open="isEmoji = $event"
            @update:selected="$emit('update:emoji', $event)"
            offset="40"
            location="left"
          >
          </chat-emoji-component>
          <!-- markdown button -->
          <v-btn @click.stop="isMarkDown = !isMarkDown" icon>
            <v-icon icon="mdi-format-header-pound"></v-icon>
          </v-btn>
          <chat-marked-component
            v-if="markedButton"
            :is-markdown="isMarkDown"
            v-model:alignment="alignment"
            v-model:formatting="formatting"
            @update:formatting="$emit('update:formatting', $event)"
          ></chat-marked-component>
          <chat-tenor-component
            v-if="tenorButton"
            @update:tenor="testTenor"
          >
          </chat-tenor-component>
        </div>
          <v-btn
            v-if="submitButton"
            icon
            color="teal"
            type="submit"
            variant="text"
          >
            <v-icon icon="mdi-send" size="large"></v-icon>
          </v-btn>
      </v-sheet>
    </v-card>
</template>

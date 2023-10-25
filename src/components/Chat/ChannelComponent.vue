<script setup lang="ts">
import { MessageFormComponent } from "@/components";
import { ref, onMounted, computed } from "vue";
import { Room, TypingEvent, RoomMessages } from "@/types";
import { capitalize, reduce, set, replace } from "lodash";
import { useDateFormat } from "@vueuse/core";

// Props
interface Props {
  room: Room | null;
  typing?: TypingEvent | null;
  uuid: String | undefined;
  username: string | undefined;
  isLoading: boolean;
}
const props = defineProps<Props>();
const isEditDisalog = ref(false);
const selectedToEditMessage = ref<RoomMessages | null>(null)
const editMessageContent = ref("");

// emits
const emit = defineEmits<{
  "submit:form": [payload: { text: string; file?: File }];
  "update:typing": [value: string];
  "update:seen": [value: boolean];
  "update:newMessagesCount": [value: number];
  "delete:message": [value: RoomMessages];
  "edit:message": [value: RoomMessages];
}>();

const handleScroll = (): void => {
  const el = document.querySelector(".v-virtual-scroll");
  el?.scroll({ top: el?.scrollHeight, behavior: "instant" });
};

const roomMessages = computed(() => {
  if (props.room?.messages) {
    return reduce(
      props.room.messages,
      (result: any, value) => {
        const date = value.createdAt.split(" ")[0];
        (result[date] || (result[date] = [])).push(value);
        return result;
      },
      {}
    );
  }
});

onMounted(() => {
  handleScroll();
});

const onMutate = () => {
  handleScroll();
};

const deleteMessage = (message: RoomMessages) => {
  emit("delete:message", message);
};

const onEditMessage = (message: RoomMessages) => {
  // emit("edit:message", message);
  selectedToEditMessage.value = message
  editMessageContent.value = message.content
  isEditDisalog.value = true
};

const editMessage = () => {
  if (selectedToEditMessage.value) {
    set(selectedToEditMessage.value, 'content', editMessageContent.value);
    emit("edit:message", selectedToEditMessage.value);
  }
  isEditDisalog.value = false
}

const dateFormat = (date: string | number, format: string): string => {
  const formatted = useDateFormat(date, format);
  return replace(formatted.value, '"', '');
}
</script>
<template>
  <v-container class="flex-1-1-100 ma-2 pa-2">
    <v-card class="mx-auto" id="container" :loading="isLoading">
      <v-card-title>
        {{ capitalize(room?.name) }}
      </v-card-title>
      <v-divider :thickness="3" color="success"></v-divider>

      <v-virtual-scroll :height="420" :items="[roomMessages]" v-mutate="onMutate">
        <template v-slot:default="{ item }">
          <v-list v-for="(messages, key) in item" :key="key">
            <v-list-subheader :key="key" class="d-flex justify-center">
              {{ dateFormat(key, "dddd, MMMM DD, YYYY") }}
            </v-list-subheader>

            <v-list-item v-for="(message, index) in messages" :key="index">
              <v-list-item-title :key="message._id" :id="`id-${message._id}`" transition="v-slide-y-reverse-transition">
                <div>
                  <!-- Action Menu -->
                  <v-btn variant="plain" density="compact" size="xs" prepend-icon="mdi-dots-vertical">
                    <v-menu activator="parent" location="top" transition="slide-x-transition">
                      <v-list nav>
                        <v-list-item :key="`edit`" @click="onEditMessage(message)" v-if="message.from === uuid">
                          <v-list-item-title><v-icon icon="mdi-pencil"></v-icon></v-list-item-title>
                        </v-list-item>
                        <v-list-item :key="`delete`" @click="deleteMessage(message)" class="float-right" v-if="message.from === uuid">
                          <v-list-item-title>
                            <v-icon icon="mdi-delete-forever"></v-icon></v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-btn>
                  <!-- action menu -->
                  {{ dateFormat(message.createdAt, "HH:MM A") }}
                  <span class="font-weight-bold text-teal" v-if="message.from === uuid">
                    {{ capitalize(username) }}: </span>
                  <span class="font-weight-bold text-teal" v-else>
                    {{ capitalize(message.username) }}: </span>
                  <span>{{ message.content }}</span>
                  <v-img v-if="message.file" :width="150" :src="message.file" aspect-ratio="16/9" cover>
                    {{ message.name }}</v-img>
                </div>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </template>
      </v-virtual-scroll>
      <v-sheet>
        <v-card-actions class="w-100 d-inline-block">
          <MessageFormComponent :key="room?._roomId" @submit="$emit('submit:form', $event)"
            @typing="$emit('update:typing', $event)">
          </MessageFormComponent>
          <v-expand-x-transition v-if="typing">
            <p class="font-weight-light ma-2">
              {{ capitalize(typing.username) }} is Typing...
            </p>
          </v-expand-x-transition>
        </v-card-actions>
      </v-sheet>
    </v-card>
  </v-container>

  <!-- edit Message Dialog -->
  <v-dialog v-model="isEditDisalog" width="auto">
    <v-card>
      <v-textarea clearable auto-grow v-model="editMessageContent">
      </v-textarea>
      <v-card-actions>
        <v-btn color="primary" prepend-icon="mdi-content-save-check-outline" @click="editMessage">Save</v-btn>
        <v-btn color="error" @click="isEditDisalog = false" class="ms-auto" prepend-icon="mdi-close-circle">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.p-2 {
  padding: 4px !important;
}
</style>

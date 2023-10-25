<script setup lang="ts">
import { MessageFormComponent } from "@/components";
import { onMounted, computed } from "vue";
import { User, TypingEvent } from "@/types";
import { capitalize, reduce, isEmpty, replace } from "lodash";
import { useDateFormat } from '@vueuse/core'

// Props
interface Props {
  selectedUser: User | null;
  room: string | null;
  typing?: TypingEvent | null
  username?: string
  isLoading: boolean;
}
const props = defineProps<Props>();

// emits 
const emit = defineEmits<{
  "submit:form": [payload: { text: string, file?: File }],
  "update:typing": [value: string],
  "update:seen": [value: boolean],
  "update:newMessagesCount": [value: number],
}>()

// group messages by date
const userMessages = computed(() => {
  if (props.selectedUser?.messages) {
    return reduce(props.selectedUser.messages, (result: any, value) => {
      const date = value.createdAt.split(' ')[0];
      (result[date] || (result[date] = [])).push(value);
      return result;
    }, {});
  }
})

const handleScroll = (): void => {
  const el = document.querySelector(".v-virtual-scroll");
  el?.scroll({ top: el?.scrollHeight, behavior: "instant" });
};

onMounted(() => {
  handleScroll();
  //emit("update:seen", true);
  //emit("update:newMessagesCount", 0);
});

const onMutate = (() => {
  handleScroll();
  //emit("update:seen", true);
  //emit("update:newMessagesCount", 0);
})

const dateFormat = (date: string | number, format: string): string => {
  const formatted = useDateFormat(date, format);
  return replace(formatted.value, '"', '');
}

</script>
<template>
  <v-container class="flex-1-1-100 ma-2 pa-2">
    <v-card class="mx-auto" id="container" :loading="isLoading">
      <v-card-title>
        <v-avatar>
          <v-img v-if="!isEmpty(selectedUser?.image)" :src="selectedUser?.image" alt="image"></v-img>
          <v-icon icon="mdi-account-circle" :color="selectedUser?.connected ? 'success' : 'dark'" v-else> </v-icon> </v-avatar>
        <v-badge dot inline :color="selectedUser?.connected ? 'success' : 'dark'">
          <p class="mr-1">{{ capitalize(selectedUser?.username) }}</p>
        </v-badge>
      </v-card-title>
      <v-divider :thickness="3" color="success"></v-divider>

      <v-virtual-scroll :height="420" :items="[userMessages]" v-mutate="onMutate">
        <template v-slot:default="{ item }">
          <v-list v-for="(message, index) in item" :key="index" :id="`list-${index}`">
            <v-list-subheader :key="index" class="d-flex justify-center">
              {{ dateFormat(index, 'dddd, MMMM DD, YYYY') }}
            </v-list-subheader>


            <v-list-item v-for="($mess, i) in message" :key="i" :id="`list-${index}`">
              <v-list-item-title v-if="$mess.fromSelf" :key="$mess.from">
                <div>{{ dateFormat($mess.createdAt, "HH:MM A") }} <span class="font-weight-bold text-teal">{{
                  capitalize(username) }}</span> : <span>{{ $mess.content }}</span>
                  <v-img v-if="$mess.file" :width="150" :src="$mess.file" aspect-ratio="16/9" cover>{{ $mess.name
                  }}</v-img>

                </div>
              </v-list-item-title>
              <v-list-item-title v-else :key="$mess.to">
                <div>{{ dateFormat($mess.createdAt, "HH:MM A") }} <span class="font-weight-bold text-light-blue">
                    {{ capitalize(selectedUser?.username) }}</span> : <span>{{ $mess.content }}</span>
                  <v-img v-if="$mess.file" :width="150" :src="$mess.file" aspect-ratio="16/9" cover>{{ $mess.name
                  }}</v-img>

                </div>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </template>
      </v-virtual-scroll>
      <v-sheet>
        <v-card-actions class="w-100 d-inline-block">
          <MessageFormComponent :key="selectedUser?._uuid" @submit="$emit('submit:form', $event)"
            @typing="$emit('update:typing', $event)">
          </MessageFormComponent>
          <v-sheet v-if="typing">
            <p class="font-weight-light ma-2">{{ capitalize(typing.username) }} is Typing...</p>
          </v-sheet>
        </v-card-actions>
      </v-sheet>
    </v-card>







  </v-container>
</template>

<style scoped>
.p-2 {
  padding: 4px !important;
}
</style>

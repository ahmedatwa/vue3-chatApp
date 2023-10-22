<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from "vue";
import { DBUsers } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useLoginStore } from "@/stores";

const userLoginStore = useLoginStore();

const emit = defineEmits(["selected"]);

const toggle = ref(false);
const isLogged = ref(false);
const selected = ref<DBUsers | null>(null)
onBeforeMount(() => {
  const sessionId = localStorage.getItem("JSESSIOND");
  if (sessionId)
    isLogged.value = true
})

onMounted(async () => {
  await userLoginStore.getUsers();
});

const login = () => {
  emit("selected", { ...selected.value, sessionId: uuidv4() });
  isLogged.value = true
};
</script>

<template>
  <v-card class="mx-auto" width="auto" v-if="!isLogged">
          <v-btn @click.stop="toggle = !toggle" icon="mdi-eye-circle" class="d-flex align-center"></v-btn>

          <v-form @submit.prevent="userLoginStore.createUser" id="create-user-form mt-2" v-if="toggle">
            <v-text-field label="Add User..." v-model="userLoginStore.username" append-inner-icon="mdi-plus-circle"
              type="text" :loading="userLoginStore.isLoading" clearable>
            </v-text-field>
          </v-form>
      <v-table>
        <thead>
          <tr>
            <th></th>
            <th>UUID</th>
            <th>Username</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userLoginStore.users" :key="user._id">
            <td>
              <div class="form-check">
                <input class="form-check-input" type="radio" :name="`input${user._id}`" :id="`id-${user._id}`"
                  :value="user" v-model="selected" />
              </div>
            </td>
            <td>{{ user.uuid }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.createdAt }}</td>
          </tr>
          <tr class="text-end">
            <td colspan="6">
              <v-btn :disabled="!selected" :loading="userLoginStore.isLoading" @click="login" icon="mdi-location-enter"
                color="primary">
              </v-btn>
            </td>
          </tr>
          <tr v-if="userLoginStore.users.length === 0">
            <td colspan="4" class="text-center">No Users</td>
          </tr>
        </tbody>
      </v-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from "vue";
import { useStorageStore, useSessionStore, useUserStore } from "@/stores";
// types
import type { User, NewUserForm } from "@/types/User.ts";

const storageStore = useStorageStore();
const sessionStore = useSessionStore();
const userStore = useUserStore();
const isLogged = ref(false);
const selected = ref<User | null>(null);
const isCreateDialog = ref(false);

const form = ref<NewUserForm>({
  firstName: "",
  lastName: "",
  email: "",
});

onBeforeMount(() => {
  if (storageStore.sessionID) isLogged.value = true;
});

onMounted(async () => {
  await userStore.getAllUsers()
});

const login = async () => {
  if (selected.value) {
    await sessionStore.addSession({
      ...selected.value,
    });
  }
};

const createUser = () => {
  if (form.value) {
    userStore.createUser(form.value);
    form.value = {
      firstName: "",
      lastName: "",
      email: "",
    }
    isCreateDialog.value = false
  }
};
</script>

<template>
  <v-card class="mx-auto" width="500" v-if="!isLogged">
    <v-btn @click.stop="isCreateDialog = !isCreateDialog" icon="mdi-eye-circle" color="teal" class="ma-4"></v-btn>
    <v-table>
      <thead>
        <tr>
          <th></th>
          <th>Username</th>
          <th>Email</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in userStore.allUsers" :key="user._id">
          <td>
            <div class="form-check">
              <input class="form-check-input" type="radio" :name="`input${user._id}`" :id="`id-${user._id}`" :value="user"
                v-model="selected" />
            </div>
          </td>
          <td>{{ user.displayName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.createdAt }}</td>
        </tr>
        <tr class="text-end">
          <td colspan="6">
            <v-btn :disabled="!selected" :loading="sessionStore.isLoading" @click="login" prepend-icon="mdi-location-enter"
              color="primary">Login
            </v-btn>
          </td>
        </tr>
        <tr v-if="!userStore.allUsers.length">
          <td colspan="4" class="text-center">No Users</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
  <v-dialog v-model="isCreateDialog" width="400">
    <v-card :loading="sessionStore.isLoading" title="Create User">
      <v-card-text>
        <v-text-field label="firstname" v-model="form.firstName" type="text">
        </v-text-field>
        <v-text-field label="last name" v-model="form.lastName" type="text"></v-text-field>
        <v-text-field label="email" v-model="form.email" type="email">
        </v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn @click.prevent="createUser" block color="indigo" :disabled="form.email.length < 3"
          variant="tonal">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

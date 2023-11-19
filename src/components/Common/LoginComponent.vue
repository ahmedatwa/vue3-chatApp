<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from "vue";
import { useLoginStore, useSessionStore } from "@/stores";
import { nanoid } from "nanoid";
// types
import type { DBUser } from "@/types/User.ts";

const userLoginStore = useLoginStore();
const sessionStore = useSessionStore();

const toggle = ref(false);
const isLogged = ref(false);
const selected = ref<DBUser | null>(null);

onBeforeMount(() => {
  const sessionId = localStorage.getItem("JSESSIOND");
  if (sessionId) isLogged.value = true;
});

onMounted(async () => {
  await userLoginStore.getAllUsers();
});

const login = async () => {
  if (selected.value) {
    await sessionStore.addSession({
      ...selected.value,
      sessionID: nanoid(36)
    });
    isLogged.value = true;
  }
};
</script>

<template>
  <v-card class="mx-auto" width="500" v-if="!isLogged">
    <v-btn @click.stop="toggle = !toggle" prepend-icon="mdi-eye-circle" color="indigo" class="ma-4">Add
      User</v-btn>
    <v-form id="create-user-form mt-2" v-if="toggle" @submit.prevent="userLoginStore.createUser" class="ma-4">
      <v-text-field label="firstname" v-model="userLoginStore.form.firstName" type="text"
        :loading="userLoginStore.isLoading">
      </v-text-field>
      <v-text-field label="last name" v-model="userLoginStore.form.lastName" type="text"
        :loading="userLoginStore.isLoading">
      </v-text-field>
      <v-btn type="submit" block color="indigo" :disabled="userLoginStore.form.firstName.length < 3">Submit</v-btn>
    </v-form>
    <v-table>
      <thead>
        <tr>
          <th></th>
          <th>Username</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in userLoginStore.users" :key="user._id">
          <td>
            <div class="form-check">
              <input class="form-check-input" type="radio" :name="`input${user._id}`" :id="`id-${user._id}`" :value="user"
                v-model="selected" />
            </div>
          </td>
          <td>{{ user.userName }}</td>
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

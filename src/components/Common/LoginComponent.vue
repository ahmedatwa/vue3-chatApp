<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from "vue";
import { useStorageStore, useUserStore } from "@/stores";
// types
import type { User, CreateUserForm } from "@/types/User.ts";

const storageStore = useStorageStore();
const userStore = useUserStore();

const toggle = ref(false);
const isLogged = ref(false);
const selected = ref<User | null>(null);

  
const form = ref<CreateUserForm>({
    userName: "",
    firstName: "",
    lastName: ""
  })

onBeforeMount(() => {  
  if (storageStore.sessionID) isLogged.value = true;
});

onMounted(async () => {
  await userStore.getAllUsers();
});

const login = async () => {
  if (selected.value) {
    await userStore.addSession({
      ...selected.value,
    });
  }
};

const createUser = () => {
  userStore.createUser(form.value)
}
</script>

<template>
  <v-card class="mx-auto" width="500" v-if="!isLogged">
    <v-btn @click.stop="toggle = !toggle" prepend-icon="mdi-eye-circle" color="indigo" class="ma-4">Add
      User</v-btn>
    <v-form id="create-user-form mt-2" v-if="toggle" @submit.prevent="createUser" class="ma-4">
      <v-text-field label="firstname" v-model="form.firstName" type="text"
        :loading="userStore.isLoading">
      </v-text-field>
      <v-text-field label="last name" v-model="form.lastName" type="text"
        :loading="userStore.isLoading">
      </v-text-field>
      <v-btn type="submit" block color="indigo" :disabled="form.firstName.length < 3">Submit</v-btn>
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
        <tr v-for="user in userStore.allUsers" :key="user._id">
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
            <v-btn :disabled="!selected" :loading="userStore.isLoading" @click="login" icon="mdi-location-enter"
              color="primary">
            </v-btn>
          </td>
        </tr>
        <tr v-if="!userStore.allUsers.length">
          <td colspan="4" class="text-center">No Users</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

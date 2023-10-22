import { defineStore } from "pinia";
import { ref } from "vue";
import socket from "@/client";
import { Room } from "@/types";
import { instance } from "@/axios";
import { v4 as uuidv4 } from 'uuid';
import { useSessionStore } from "@/stores";


export const useRoomStore = defineStore("roomStore", () => {
    const sessionStore = useSessionStore();
    const isLoading = ref(false);
    const rooms = ref<Room[]>([])
    const errors = ref();

    const getRooms = () => {
        isLoading.value = true;
        instance.get("/getrooms").then((response) => {
            rooms.value = response.data
        }).then((error) => {
            errors.value = error;
        }).finally(() => {
            isLoading.value = false;
        })
    }
    const createRoom = (name: string) => {
        isLoading.value = true;
        instance.post("/addroom", {
            room_id: uuidv4(),
            name: name,
            created_by: sessionStore.userSessionData?.uuid
        }).then((response) => {
            rooms.value.push(response.data);

            socket.emit('create-room', {
                _roomId: response.data.room_id,
                name: response.data.name,
                createdBy: response.data.created_by
            })
        }).finally(() => {
            isLoading.value = false
        })
    }

    return { rooms, getRooms, createRoom }

})
<script setup lang="ts">
import { shallowRef } from "vue"

const audioBlobs = shallowRef<Blob[]>()
const mediaRecorder = shallowRef<MediaRecorder | null>(null)
const streamBeingCaptured = shallowRef<MediaStream | null>(null)
const audioElement = shallowRef()
const isAudioStart = shallowRef(false)

const emit = defineEmits<{
    "update:recordingStart": [value: boolean]
}>();

const start = async () => {
    //Feature Detection
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        return Promise.reject(new Error('mediaDevices API or getUserMedia method is not supported in this browser.'));
    }
    else {
        //create an audio stream
        return navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                streamBeingCaptured.value = stream;
                mediaRecorder.value = new MediaRecorder(stream);
                audioBlobs.value = [];
                mediaRecorder.value.addEventListener("dataavailable", event => {
                    audioBlobs.value?.push(event.data);
                });
                mediaRecorder.value.start();
            });
    }
}

const stop = () => {
    return new Promise(resolve => {
        let mimeType = mediaRecorder.value?.mimeType;
        mediaRecorder.value?.addEventListener("stop", () => {
            let audioBlob = new Blob(audioBlobs.value, { type: mimeType });
            resolve(audioBlob);
        });

        mediaRecorder.value?.stop();
        stopStream();
        resetRecordingProperties();
    });
}

const stopStream = () => {
    streamBeingCaptured.value?.getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
}

const resetRecordingProperties = () => {
    mediaRecorder.value = null;
    streamBeingCaptured.value = null;
}

const startAudioRecording = () => {
    start()
        .then(() => {
            isAudioStart.value = true
            emit("update:recordingStart", isAudioStart.value)
            console.log("Recording Audio...")
        })
        .catch(error => { //on error
            if (error.message.includes("mediaDevices API or getUserMedia method is not supported in this browser.")) {
                console.log("To record audio, use browsers like Chrome and Firefox.");
            }
        });
}


const StopAudioRecording = () => {
    stop().then((audioAsblob) => {
        isAudioStart.value = false
        emit("update:recordingStart", isAudioStart.value)
        playAudio(audioAsblob);
    }).catch(error => {
        switch (error.name) {
            case 'InvalidStateError':
                console.log("An InvalidStateError has occured.");
                break;
            default:
                console.log("An error occured with the error name " + error.name);
        };

    });
}


const playAudio = (recorderAudioAsBlob: any) => {
    let reader = new FileReader();
    reader.onload = (e) => {
        let base64URL = e.target?.result;
        audioElement.value.src = base64URL
        audioElement.value.type = recorderAudioAsBlob.type
        audioElement.value?.load();
        audioElement.value?.play();
    };
    reader.readAsDataURL(recorderAudioAsBlob);
}

</script>
 
<template>
    <div class="d-inline">
        <v-btn @click="StopAudioRecording" v-if="isAudioStart">
            <v-icon icon="mdi-stop-circle-outline"> </v-icon>
        </v-btn>
        <v-btn @click="startAudioRecording" v-else>
            <v-icon icon="mdi-microphone"> </v-icon>
        </v-btn>
       
    </div>
</template>
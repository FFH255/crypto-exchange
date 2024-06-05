<script setup>

import MyPrependedInput from "@/components/MyPrependedInput.vue";
import {useApi} from "@/composables/useApi.js";

const props = defineProps(["messageExchange", "isConnected"])

const {
    senderKeysData,
    senderMessageData,
    sendToPair,
    sendKeysToPair,
    sendMessageToPair
} = props.messageExchange

async function signMessage() {
    const responseJson = await useApi().signMessage(senderKeysData, senderMessageData)

    senderMessageData.value.w2 = responseJson["w2"]
    senderMessageData.value.s = responseJson["s"]
    senderMessageData.value.h = responseJson["h"]
}
</script>

<template>
    <div class="list item _border_main">
        <div class="list">
            <h2 class="item__title">Ваш публичный ключ</h2>
            <MyPrependedInput v-model="senderKeysData.p" prepend="P"></MyPrependedInput>
            <el-input v-model="senderKeysData.pChecks" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
                      id="prime-checks-p"
                      disabled resize="none" placeholder="Проверки на простоту p"></el-input>
            <MyPrependedInput v-model="senderKeysData.q" prepend="Q"></MyPrependedInput>
            <el-input v-model="senderKeysData.qChecks" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
                      id="prime-checks-q"
                      disabled resize="none" placeholder="Проверки на простоту q"></el-input>
            <MyPrependedInput v-model="senderKeysData.a" prepend="A"></MyPrependedInput>
            <MyPrependedInput v-model="senderKeysData.y" prepend="Y"></MyPrependedInput>
            <div style="display: flex; flex-direction: row; justify-content: space-between">
                <el-button type="danger" class="button_theme_danger" :disabled="!isConnected" @click="() => sendKeysToPair()">Отправить
                    публичный ключ
                    собеседнику
                </el-button>
            </div>
            <h2 class="item__title">Ваш приватный ключ</h2>
            <MyPrependedInput v-model="senderKeysData.x" prepend="X"></MyPrependedInput>
        </div>

        <div class="list">
            <h2 class="item__title">Введите сообщение</h2>
            <MyPrependedInput v-model="senderMessageData.message" prepend="M"/>
            <MyPrependedInput v-model="senderMessageData.h" prepend="H"></MyPrependedInput>
            <MyPrependedInput v-model="senderMessageData.w2" prepend="W'"></MyPrependedInput>
            <MyPrependedInput v-model="senderMessageData.s" prepend="S"></MyPrependedInput>
            <div style="display: flex; flex-direction: row; justify-content: space-between">
                <el-button type="primary" @click="signMessage" class="button_theme_positive"
                           :disabled="senderMessageData.message.length === 0">Подписать
                    сообщение
                </el-button>
                <el-button class="button_theme_danger" type="danger" :disabled="!isConnected" @click="sendMessageToPair">Отправить сообщение
                    и подпись
                </el-button>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>
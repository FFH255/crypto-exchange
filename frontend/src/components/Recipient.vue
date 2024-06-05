<script setup>

import MyPrependedInput from "@/components/MyPrependedInput.vue";
import {useApi} from "@/composables/useApi.js";

const props = defineProps(["messageExchange"])

const {
    recipientKeysData,
    recipientMessageData,
} = props.messageExchange

async function checkSign() {
    const responseJson = await useApi().checkSign(recipientKeysData.value, recipientMessageData.value)

    recipientMessageData.value.h2 = responseJson["h"]
    console.log(responseJson["h"], recipientMessageData.value.h)
    if (responseJson["h"] !== recipientMessageData.value.h) {
        alert("Хеш неверен. Подпись неверна")
        return;
    }
    if (responseJson["isCorrect"]) {
        alert("Подпись верна")
    } else {
        alert("Подпись неверна")
    }
}
</script>

<template>
    <div class="item _border_main">
        <div class="list">
            <h2 class="item__title">Открытый ключ собеседника</h2>
            <MyPrependedInput disabled v-model="recipientKeysData.p" prepend="P"></MyPrependedInput>
            <MyPrependedInput disabled v-model="recipientKeysData.q" prepend="Q"></MyPrependedInput>
            <MyPrependedInput disabled v-model="recipientKeysData.a" prepend="A"></MyPrependedInput>
            <MyPrependedInput disabled v-model="recipientKeysData.y" prepend="Y"></MyPrependedInput>
        </div>
        <div class="list">
            <h2 class="item__title">Полученное сообщение</h2>
            <MyPrependedInput disabled v-model="recipientMessageData.message" prepend="M'"/>
            <MyPrependedInput disabled v-model="recipientMessageData.h2" prepend="H'"></MyPrependedInput>
            <MyPrependedInput v-model="recipientMessageData.h" prepend="H"></MyPrependedInput>
            <MyPrependedInput disabled v-model="recipientMessageData.w2" prepend="W'"></MyPrependedInput>
            <MyPrependedInput disabled v-model="recipientMessageData.s" prepend="S"></MyPrependedInput>
            <div style="display: flex;">
                <el-button type="primary" @click="checkSign">Проверить подпись</el-button>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>
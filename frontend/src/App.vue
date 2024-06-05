<script setup>
import {computed, onBeforeMount, ref, watch} from "vue";
import {useWebsocketMessages} from "@/composables/useWebsocketMessages.js";
import Sender from "@/components/Sender.vue";
import Recipient from "@/components/Recipient.vue";
import MyPrependedInput from "@/components/MyPrependedInput.vue";
import {useApi} from "@/composables/useApi.js";
import CertificateChooser from "@/components/CertificateChooser.vue";

const client_id = ref(Date.now().toString())

const {
    currentConnections,
    pair,
    isConnected,
    wantPair,
    wantDisconnect,
    centersData,
    senderCertificate,
    recipientCertificates,
    recipientKeysData,
    messageExchange
} = useWebsocketMessages(client_id)

const wantedPair = ref('')

const selectedCenter = ref('')

const allCenters = ref([])



const allCertificates = computed(() => {
    const data = [
        {
            label: "Сертификаты получателя",
            options: [
                {
                    name: "Ваш сертификационный центр",
                    certification_center_public_key: {
                        p: centersData.value.p,
                        q: centersData.value.q,
                        a: centersData.value.a,
                        y: centersData.value.y,
                    }
                },
                ...centersData.value.parentCertificates
            ]
        },
        {
            label: "Сертификаты отправителя",
            options: [
                {
                    name: "Сертификат отправителя",
                    certificate_signature: {
                        h: recipientCertificates.value.recipientCertificate.h,
                        s: recipientCertificates.value.recipientCertificate.s,
                        w2: recipientCertificates.value.recipientCertificate.w2,
                    },
                    public_key: {
                        p: recipientKeysData.value.p,
                        q: recipientKeysData.value.q,
                        a: recipientKeysData.value.a,
                        y: recipientKeysData.value.y,
                    },
                    certification_center_public_key: recipientCertificates.value.recipientCenterKeys
                },
                ...recipientCertificates.value.recipientCentersCertificates
            ]
        }
    ]



    console.log(data)

    return data
})


onBeforeMount(async () => {
    const response = await useApi().getCenters()
    allCenters.value = response
})

async function getNewKeyPair() {
    const responseJson = await useApi().getNewKeyPair(selectedCenter.value)

    messageExchange.senderKeysData.value.p = responseJson["public_keys"]["p"]
    messageExchange.senderKeysData.value.q = responseJson["public_keys"]["q"]
    messageExchange.senderKeysData.value.a = responseJson["public_keys"]["a"]
    messageExchange.senderKeysData.value.x = responseJson["private_keys"]["x"]
    messageExchange.senderKeysData.value.y = responseJson["public_keys"]["y"]
    messageExchange.senderKeysData.value.pChecks = "Проверки p на простоту:\n" + responseJson["pChecks"]
    messageExchange.senderKeysData.value.qChecks = "Проверки q на простоту:\n" + responseJson["qChecks"]

    senderCertificate.value.h = responseJson["certificate_sign"]["h"]
    senderCertificate.value.w2 = responseJson["certificate_sign"]["w2"]
    senderCertificate.value.s = responseJson["certificate_sign"]["s"]

    centersData.value.p = responseJson["certificate"]["certification_center_public_key"]["p"]
    centersData.value.q = responseJson["certificate"]["certification_center_public_key"]["q"]
    centersData.value.a = responseJson["certificate"]["certification_center_public_key"]["a"]
    centersData.value.y = responseJson["certificate"]["certification_center_public_key"]["y"]
    centersData.value.parentCertificates = responseJson["parent_certificates"]
}


async function checkCertificate() {
    console.log(centersData, senderCertificate)
    const responseJson = await useApi().checkSign({
        p: centersData.value.p,
        q: centersData.value.q,
        a: centersData.value.a,
        y: centersData.value.y
    }, {
        w2: senderCertificate.value.w2,
        s: senderCertificate.value.s,
        message: JSON.stringify({
            certification_center_public_key: {
                p: centersData.value.p,
                q: centersData.value.q,
                a: centersData.value.a,
                y: centersData.value.y
            },
            user_public_key: {
                p: messageExchange.senderKeysData.value.p,
                q: messageExchange.senderKeysData.value.q,
                a: messageExchange.senderKeysData.value.a,
                y: messageExchange.senderKeysData.value.y
            }
        })
    })

    if (responseJson["isCorrect"]) {
        alert("Сертификат верен")
    } else {
        alert("Сертификат неверен")
    }
}

async function checkForeignCertificate() {
    console.log(certificatesToCheck)
    const responseJson = await useApi().checkSign({
        p: certificatesToCheck.value.keys.p,
        q: certificatesToCheck.value.keys.q,
        a: certificatesToCheck.value.keys.a,
        y: certificatesToCheck.value.keys.y
    }, {
        w2: certificatesToCheck.value.sign.w2,
        s: certificatesToCheck.value.sign.s,
        message: JSON.stringify({
            certification_center_public_key: {
                p: certificatesToCheck.value.keys.p,
                q: certificatesToCheck.value.keys.q,
                a: certificatesToCheck.value.keys.a,
                y: certificatesToCheck.value.keys.y
            },
            user_public_key: {
                p: certificatesToCheck.value.testKeys.p,
                q: certificatesToCheck.value.testKeys.q,
                a: certificatesToCheck.value.testKeys.a,
                y: certificatesToCheck.value.testKeys.y
            }
        })
    })

    if (responseJson["isCorrect"]) {
        alert("Сертификат верен")
    } else {
        alert("Сертификат неверен")
    }
}

const certificatesToCheck = ref({
    "keys": {},
    "sign": {},
    "testKeys": {}
})

</script>
<template>
    <el-row>
        <el-col :span="24" style="text-align: center; margin-bottom: 3rem;">
            <h1>ГОСТ Р 34.10-94</h1>
            <h2>ID: <span id="ws-id">{{ client_id }}</span></h2>
            <h2 style="color: cornflowerblue" v-if="!isConnected">Ожидание...</h2>
            <h2 style="color: var(--positive)" v-else>Подключение установлено c: <span style="color: var(--positive)">{{ pair }}</span>
            </h2>
            <div style="display: flex; flex-direction: column; width: 40dvw; margin: 0 auto; gap: 10px">
                <el-select
                    v-model="wantedPair"
                    placeholder="Выберите пользователя"
                    no-data-text="Нет пользователей"
                >
                    <el-option
                        v-for="connection in currentConnections"
                        :key="connection"
                        :label="connection"
                        :value="connection"
                    />
                </el-select>
                <div style="display:flex;">
                    <el-button type="primary" class="button_theme_positive" @click="() => wantPair(wantedPair)">Подключиться</el-button>
                    <el-button type="danger" class="button_theme_danger" @click="() => wantDisconnect()">Отключиться</el-button>
                </div>
            </div>
        </el-col>
    </el-row>

    <el-row>
        <el-col :span="12" style="text-align: center">
            <h1>Отправитель</h1>
        </el-col>
        <el-col :span="12" style="text-align: center">
            <h1>Получатель</h1>
        </el-col>
    </el-row>

    <el-row :gutter="12">
        <el-col :span="12" class="list">
            <div class="item _border_main">
                <div class="list">
                    <h2 class="item__title">Авторизация</h2>
                    <el-select
                        v-model="selectedCenter"
                        placeholder="Выберите сертификационный центр"
                        no-data-text="Нет центров"
                    >
                        <el-option
                            v-for="center in allCenters"
                            :key="center"
                            :label="center"
                            :value="center"
                        />
                    </el-select>
                    <div style="display: flex; flex-direction: row; justify-content: space-between; margin-top: 2px">
                        <el-button class="button_theme_positive" type="primary" @click="getNewKeyPair" :disabled="selectedCenter === ''">
                            Авторизоваться
                        </el-button>
                    </div>
                </div>
                <div class="list">
                    <h2 class="item__title">Ваш подписанный сертификат</h2>
                    <MyPrependedInput v-model="senderCertificate.h" prepend="H"></MyPrependedInput>
                    <MyPrependedInput v-model="senderCertificate.s" prepend="S"></MyPrependedInput>
                    <MyPrependedInput v-model="senderCertificate.w2" prepend="W'"></MyPrependedInput>
                    <div style="display: flex; flex-direction: row; justify-content: space-between;">
                        <el-button class="button_theme_positive" @click="checkCertificate" type="primary" :disabled="senderCertificate.h === ''">
                            Проверить сертификат
                        </el-button>
                    </div>
                </div>
                <div class="list">
                    <h2 class="item__title">Публичный ключ центра</h2>
                    <MyPrependedInput v-model="centersData.p" prepend="P"></MyPrependedInput>
                    <MyPrependedInput v-model="centersData.q" prepend="Q"></MyPrependedInput>
                    <MyPrependedInput v-model="centersData.a" prepend="A"></MyPrependedInput>
                    <MyPrependedInput v-model="centersData.y" prepend="Y'"></MyPrependedInput>
                </div>
            </div>
            <Sender :is-connected="isConnected" :message-exchange="messageExchange"></Sender>
        </el-col>
        <el-col :span="12" class="list">
            <div class="list item _border_main">
                <h2 class="item__title">Проверка сертификатов</h2>
                <CertificateChooser :all-certificates="allCertificates" type="from" @changed="(certificate) => certificatesToCheck.keys = certificate['certification_center_public_key']"></CertificateChooser>
                <CertificateChooser :all-certificates="allCertificates" type="to" @changed="(certificate) => {
                    certificatesToCheck.sign = certificate['certificate_signature']
                    certificatesToCheck.testKeys = certificate['public_key']
                }"></CertificateChooser>
                <div style="display: flex; flex-direction: row; justify-content: space-between;">
                    <el-button class="button_theme_positive" @click="checkForeignCertificate" type="primary">
                        Проверить сертификат
                    </el-button>
                </div>
            </div>
            <Recipient v-if="isConnected" :message-exchange="messageExchange"></Recipient>
        </el-col>
    </el-row>
</template>

<style>
#app {
    margin-inline: 1rem;
}

.el-row {
    margin-bottom: 20px;
}

.el-row:last-child {
    margin-bottom: 0;
}

.el-col {
    border-radius: 4px;
}

.grid-content {
    border-radius: 4px;
    min-height: 36px;
}

.prepend-span {
    width: 20px;
    text-align: center;
    color: #2c3d4f;
}

.el-input, .el-textarea {
    margin-bottom: 2px;
}

.el-button {
  flex: auto;
  font-size: .9rem !important;
  padding: .3rem .6rem !important;
  border-radius: 6px !important;
}

.el-input-group__prepend {
    background-color: var(--background-1000) !important;
}

.el-button.el-button--primary {
    border: 1px solid var(--positive) !important;
  background-color: var(--positive) !important;
  color: var(--background-1000) !important;
}

</style>

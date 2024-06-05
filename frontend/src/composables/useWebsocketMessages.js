import {ref} from "vue";
import {WS_URL} from "@/config.js";
import {ElNotification, ElMessageBox} from 'element-plus'

export function useWebsocketMessages(clientId) {
    const ws = new WebSocket(`${WS_URL}/ws/${clientId.value}`);
    const isConnected = ref(false)

    let currentConnections = ref([])
    let pair = ref(0)

    const senderKeysData = ref({
        p: '',
        pChecks: '',
        q: '',
        qChecks: '',
        a: '',
        x: '',
        y: '',
    })

    const senderMessageData = ref({
        message: '',
        h: '',
        w2: '',
        s: '',
    })

    const recipientKeysData = ref({
        p: '',
        q: '',
        a: '',
        y: '',
    })

    const recipientMessageData = ref({
        message: '',
        h: '',
        w2: '',
        s: '',
        h2: ''
    })

    const recipientCertificates = ref({
        recipientCertificate: {},
        recipientCenterKeys: {},
        recipientCentersCertificates: []
    })

    const centersData = ref({
        'parentCertificates': [],
        'p': '',
        'q': '',
        'a': '',
        'y': ''
    })

    const senderCertificate = ref({
        'h': '',
        'w2': '',
        's': ''
    })


    ws.addEventListener("message", function (event) {
        const data = JSON.parse(event.data)
        console.log(data)
        switch (data["type"]) {
            case "CURRENT_CONNECTIONS": {
                currentConnections.value = data["currentConnections"].filter((connectionId) => connectionId !== clientId.value)
                return;
            }
            case "WANT_PAIR": {
                if (pair.value) rejectPair(data["fromId"])
                ElMessageBox.confirm(
                    `Клиент ${data["fromId"]} хочет подключиться. Разрешить?`,
                    'Предупреждение',
                    {
                        confirmButtonText: 'Да',
                        cancelButtonText: 'Нет',
                        type: 'warning',
                    }
                ).then(() => {
                    console.log(data)
                    acceptPair(data["fromId"])
                }).catch(() => {
                    rejectPair(data["fromId"])
                })
                return;
            }
            case "ACCEPT_PAIR": {
                pair.value = data["fromId"]
                isConnected.value = true
                return;
            }
            case "REJECT_PAIR": {
                ElNotification({
                    title: 'Ошибка',
                    message: `Клиент ${data["fromId"]} отклонил запрос на подключение`,
                    type: 'error',
                    position: "bottom-left"
                })
                return;
            }
            case "KEY_EXCHANGE": {
                if (data["fromId"] !== pair.value) return
                ElMessageBox.confirm(
                  `Клиент ${data["fromId"]} предлагает обменятся публичными ключами. Обменяться?`,
                  "Предупреждение",
                  {
                    confirmButtonText: "Да",
                    cancelButtonText: "Нет",
                    type: "warning",
                  }
                ).then(() => {
                  sendKeysToPair("CONFIRM_KEY_EXCHANGE")
                  recipientKeysData.value.p = data["p"]
                  recipientKeysData.value.q = data["q"]
                  recipientKeysData.value.a = data["a"]
                  recipientKeysData.value.y = data["y"]
                  recipientCertificates.value.recipientCentersCertificates =
                    data["centerCertificates"]
                  recipientCertificates.value.recipientCertificate =
                    data["senderCertificate"]
                  recipientCertificates.value.recipientCenterKeys =
                    data["senderCenterKeys"]
                })
                return;
            }
            case "CONFIRM_KEY_EXCHANGE": {
                if (data["fromId"] !== pair.value) return
                recipientKeysData.value.p = data["p"]
                recipientKeysData.value.q = data["q"]
                recipientKeysData.value.a = data["a"]
                recipientKeysData.value.y = data["y"]
                recipientCertificates.value.recipientCentersCertificates = data["centerCertificates"]
                recipientCertificates.value.recipientCertificate = data["senderCertificate"]
                recipientCertificates.value.recipientCenterKeys = data["senderCenterKeys"]
                return;
            }
            case "SEND_MESSAGE": {
                if (data["fromId"] !== pair.value) return
                recipientMessageData.value.message = data["message"]
                recipientMessageData.value.w2 = data["w2"]
                recipientMessageData.value.s = data["s"]
                recipientMessageData.value.h = data["h"]
                return;
            }
            case "CLIENT_DISCONNECTED": {
                if (data["fromId"] !== pair.value) return;
                disconnect()
                ElNotification({
                    title: 'Ошибка',
                    message: `Клиент ${data["fromId"]} отключился`,
                    type: 'error',
                    position: "bottom-left"
                })
                return;
            }
        }
    })

    function disconnect() {
        pair.value = 0
        isConnected.value = false
        recipientKeysData.value.a = ''
        recipientKeysData.value.p = ''
        recipientKeysData.value.q = ''
        recipientKeysData.value.y = ''
        recipientMessageData.value.message = ''
        recipientMessageData.value.h = ''
        recipientMessageData.value.w2 = ''
        recipientMessageData.value.s = ''
        recipientMessageData.value.h2 = ''
    }

    function wantPair(connectionId) {
        ws.send(JSON.stringify({
            "message": {
                "fromId": clientId.value,
                "type": "WANT_PAIR"
            },
            "toId": connectionId
        }))
    }

    function wantDisconnect() {
        ws.send(JSON.stringify({
            "message": {
                "fromId": clientId.value,
                "type": "CLIENT_DISCONNECTED"
            },
            "toId": pair.value
        }))
        disconnect()
    }

    function acceptPair(connectionId) {
        console.log("ACCEPTED", connectionId)
        ws.send(JSON.stringify({
            "message": {
                "fromId": clientId.value,
                "type": "ACCEPT_PAIR"
            },
            "toId": connectionId
        }))
        pair.value = connectionId
        isConnected.value = true
    }

    function rejectPair(connectionId) {
        ws.send(JSON.stringify({
            "message": {
                "fromId": clientId.value,
                "type": "REJECT_PAIR"
            },
            "toId": connectionId
        }))
    }

    function sendToPair(message) {
        ws.send(JSON.stringify({
            "message": {
                ...message,
                "fromId": clientId.value
            },
            "toId": pair.value
        }))
    }

    function sendKeysToPair(type = "KEY_EXCHANGE") {
        sendToPair({
            ...senderKeysData.value,
            senderCertificate: senderCertificate.value,
            centerCertificates: centersData.value.parentCertificates,
            senderCenterKeys: {
                p: centersData.value.p,
                q: centersData.value.q,
                a: centersData.value.a,
                y: centersData.value.y,
            },
            "x": "",
            "type": type
        })
    }

    function sendMessageToPair() {
        sendToPair({
            ...senderMessageData.value,
            "type": "SEND_MESSAGE"
        })
    }

    return {
        currentConnections,
        pair,
        isConnected,
        wantPair,
        wantDisconnect,
        senderCertificate,
        centersData,
        recipientCertificates,
        recipientKeysData,
        messageExchange: {
            senderKeysData,
            senderMessageData,
            recipientKeysData,
            recipientMessageData,
            sendToPair,
            sendKeysToPair,
            sendMessageToPair
        }
    }
}
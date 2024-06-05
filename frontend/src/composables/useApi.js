import {API_URL} from "@/config.js";

export function useApi() {
    async function signMessage(senderKeysData, senderMessageData) {
        const response = await fetch(API_URL + "/signMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...senderKeysData.value,
                message: senderMessageData.value.message
            })
        })

        const responseJson = await response.json()

        return responseJson
    }

    async function checkSign(recipientKeysData, recipientMessageData) {
        const response = await fetch(API_URL + "/verifySignature", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...recipientKeysData,
                ...recipientMessageData,
            })
        })
        const responseJson = await response.json()

        return responseJson
    }

    async function getNewKeyPair(centerId) {
        const response = await fetch(API_URL + "/registerInCenter/" + centerId)
        const responseJson = await response.json()

        return responseJson
    }

    async function getCenters() {
        const response = await fetch(API_URL + "/getCertificationCenters")
        const responseJson = await response.json()

        return responseJson
    }

    return {
        signMessage,
        checkSign,
        getNewKeyPair,
        getCenters
    }
}
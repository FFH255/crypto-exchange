<script setup>
import {uuid} from "vue-uuid"
import MyPrependedInput from "@/components/MyPrependedInput.vue";
import {ref, watch} from "vue";

const props = defineProps(['allCertificates', 'type'])

const emit = defineEmits(["changed"])

const selectedCenterKeys = ref('')

const selectedCertificateData = ref({
    'p': '',
    'q': '',
    'a': '',
    'y': '',
    'h': '',
    'w2': '',
    's': ''
})

watch(selectedCenterKeys, () => {
    const [group, option] = selectedCenterKeys.value.split(":")
    const selectedOption = props.allCertificates.filter((item) => {
        console.log(item)
        return item.label === group
    })[0].options.filter((item) => {
        return item.name === option
    })[0]
    selectedCertificateData.value.s = ""
    selectedCertificateData.value.h = ""
    selectedCertificateData.value.w2 = ""
    selectedCertificateData.value.p = ""
    selectedCertificateData.value.q = ""
    selectedCertificateData.value.a = ""
    selectedCertificateData.value.y = ""

    if (selectedOption["certificate_signature"]) {
        selectedCertificateData.value.s = selectedOption["certificate_signature"]["s"]
        selectedCertificateData.value.h = selectedOption["certificate_signature"]["h"]
        selectedCertificateData.value.w2 = selectedOption["certificate_signature"]["w2"]
    }

    if (props.type === "from") {
        if (selectedOption["certification_center_public_key"]) {
            selectedCertificateData.value.p = selectedOption["certification_center_public_key"]["p"]
            selectedCertificateData.value.q = selectedOption["certification_center_public_key"]["q"]
            selectedCertificateData.value.a = selectedOption["certification_center_public_key"]["a"]
            selectedCertificateData.value.y = selectedOption["certification_center_public_key"]["y"]
        }
    } else {
        if (selectedOption["public_key"]) {
            selectedCertificateData.value.p = selectedOption["public_key"]["p"]
            selectedCertificateData.value.q = selectedOption["public_key"]["q"]
            selectedCertificateData.value.a = selectedOption["public_key"]["a"]
            selectedCertificateData.value.y = selectedOption["public_key"]["y"]
        }
    }

    console.log(selectedOption)

    emit("changed", selectedOption)
})

</script>

<template>
    <div class="list">
        <el-select
            v-model="selectedCenterKeys"
            placeholder="Выберите сертификат от центра"
            no-data-text="Нет сертификатов"
        >
            <el-option-group
                v-for="group in allCertificates"
                :key="group.label"
                :label="group.label"
            >
                <el-option
                    v-for="certificate in group.options"
                    :key="`${group.label}:${certificate.name}`"
                    :label="certificate.name"
                    :value="`${group.label}:${certificate.name}`"
                />
            </el-option-group>
        </el-select>
        <div class="list" v-if="props.type === 'to'">
            <h2 class="item__title">Сертификат</h2>
            <MyPrependedInput v-model="selectedCertificateData.h" prepend="H"
                              :disabled="!selectedCertificateData.h"></MyPrependedInput>
            <MyPrependedInput v-model="selectedCertificateData.w2" prepend="W'"
                              :disabled="!selectedCertificateData.w2"></MyPrependedInput>
            <MyPrependedInput v-model="selectedCertificateData.s" prepend="S"
                              :disabled="!selectedCertificateData.s"></MyPrependedInput>
        </div>
        <div class="list">
            <h2 class="item__title">Извлеченный публичный ключ</h2>
            <MyPrependedInput v-model="selectedCertificateData.p" prepend="P"></MyPrependedInput>
            <MyPrependedInput v-model="selectedCertificateData.q" prepend="Q"></MyPrependedInput>
            <MyPrependedInput v-model="selectedCertificateData.a" prepend="A"></MyPrependedInput>
            <MyPrependedInput v-model="selectedCertificateData.y" prepend="Y'"></MyPrependedInput>
        </div>
    </div>
</template>

<style scoped>

</style>
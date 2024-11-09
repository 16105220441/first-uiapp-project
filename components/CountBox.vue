<script setup>
	import {
		ref,
		computed,
		watch,
		onMounted,
		onUnmounted,
	} from "vue"
	const props = defineProps({
		value: {
			type: Number,
			default: 1
		},
		maxNum: {
			type: Number
		}
	})


	let countValue = ref(props.value);
	const emits = defineEmits(['updateValue'])

	function clickMinus() {
		countValue.value--
		emits('updateValue', countValue.value)
	}



	function clickAdd() {
		countValue.value++
		countValue.value =  Math.min(props.maxNum,countValue.value)
		emits('updateValue', countValue.value)

	}

	function onFormatter(e) {
		let filteredValue = e.replace(/[^\d]/g, '');
		if (filteredValue !== '' && parseInt(filteredValue) >= 1) {
			console.log('filteredValue',filteredValue);
			filteredValue = Math.min(props.maxNum, filteredValue)
			return e = filteredValue;
			
		} else {
			return ''
		}
	}

	function onChange(e) {
		if (e == '') {
			e = 1
		}
		countValue.value = e
		countValue.value =  Math.min(props.maxNum,countValue.value)
		emits('updateValue', Number(countValue.value))
	}
</script>


<template>
	<view class="count-box">
		<u-button class="minus" @click="clickMinus" :disabled="countValue > 1 ? false : true" text="-">

		</u-button>
		<u-input class="input" v-model="countValue" :formatter="onFormatter" @change="onChange"
			style="padding: 0;text-align: center !important;"></u-input>



		<u-button class="add" @click="clickAdd">+</u-button>
	</view>
</template>


<style lang="scss" scoped>
	.count-box {
		//width:100%
		display: flex;
		align-content: center;

		.add,
		.minus {
			width: 30px;
			height: 30px;
			background-color: #efefef;
			line-height: 100%;
			text-align: center;
		}

		.input {
			width: 40px;
			height: 30px;
			outline: none;
			border: none;
			margin: 0 5px;
			background-color: #efefef;
			text-align: center;

		}

		.uni-input-input {
			text-align: center !important;
		}

	}
</style>
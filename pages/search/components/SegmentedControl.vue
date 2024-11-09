<script setup>
	import {
		ref,computed, watch
	} from "vue"

	
	let items = ref([
		{
			text: '综合',
			fields: 'default'

		},
		{
			text: '销量',
			fields: 'productSales'
		},
		{
			text: '价格',
			fields: 'discountPrice'
		},
	])

	const emits = defineEmits(['clickSc'])

	function onClickItem(e) {
		if (currentIndex.value !== e.currentIndex) {
			currentIndex.value = e.currentIndex
			emits('clickSc', items.value[currentIndex.value].fields)
		}
		/* emits('clickSc', items.value[e.currentIndex].fields)
 */
	}
	
	let value = computed(()=>{
		return items.value.map(item=> item.text)
	})
	
	let currentIndex = ref(0)
	/* console.log(value.value) */
	defineExpose({currentIndex,items})
	
</script>

<template>
	<uni-segmented-control :current="currentIndex" :values="value" @clickItem="onClickItem" style-type="text"
		activeColor="#007aff"></uni-segmented-control>

</template>

<style lang="scss" scoped>
	.segmented-control{
		margin: 10px 0;
	}
</style>
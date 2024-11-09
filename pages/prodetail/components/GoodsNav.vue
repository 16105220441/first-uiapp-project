<script setup>
	import {
		ref,
		reactive,
		watch,
		watchEffect
	} from 'vue';
	const props = defineProps(['info', 'isAddToCart'])
	let options = reactive([{
		icon: '../../static/tabBar/shouye.png',
		text: '首页'
	}, {
		icon: '../../static/tabBar/31gouwuche.png',
		text: '购物车',
		info:props.info
	}], )
	
watch(() => props.info, (newInfo) => {
    options[1].info = newInfo; // 更新 options 中的 info
});
	

	
	function goodNavClick(e){
		if(e.index === 0){
			uni.switchTab({
				url:'/pages/index/index'
			})
		}
		else if(e.index === 1){
			uni.switchTab({
				url:'/pages/cart/cart'
			})
		}
	}
</script>

<template>
	<view class="footer">
		<uni-goods-nav :fill="true" :options="options" @click="goodNavClick" @buttonClick="function(e){
			if(e.index === 0){
				$emit('addNum',0)
			}
			else{
				$emit('buyNow')
			}
		}" >

		</uni-goods-nav>
	</view>
</template>

<style lang="scss" scoped>
	.footer {
		width: 100%;
		position: fixed;
		bottom: 0;
	}
</style>
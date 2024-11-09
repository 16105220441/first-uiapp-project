<script setup>
	import {ref,watch} from "vue"
	let popup = ref()
	function openPopup(){
		popup.value.open()
	}
	function closePopup () {
		
		popup.value.close()
	}
	function clickConfirm(){
		uni.navigateTo({
			url:'/pages/login/login'
		})
	}
	defineExpose({openPopup})
</script>

<template>
	<uni-popup ref="popup" type="center" >
						<uni-popup-dialog type="warning" mode="base" @close="closePopup" @confirm="clickConfirm" confirm-text="去登录" cancel-text="再逛逛" content="此时需要登录才能继续操作" title="温馨提示"></uni-popup-dialog>
	</uni-popup>
</template>



<style lang="scss" scoped>

</style>
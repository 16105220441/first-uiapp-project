<script setup>

import {
	ref,reactive
} from "vue"
import request from "@/utils/request.js"


import {onShow} from "@dcloudio/uni-app"
import countBox from "@/components/CountBox.vue"


function goToIndex(){
	uni.switchTab({
		url:'../index/index'
	})
}
let userStore = null

function getUserStore(){
	return new Promise((resolve,reject)=>{
		try{
				userStore = JSON.parse(uni.getStorageSync("userStore"))
				resolve(userStore);
		}catch(err){
			console.log(err)
			reject(err)
		}
	})

}
let cartListData = ref([])
let totalProNum = ref(0)
let proNum = reactive([])
let cartList = reactive([])
l
async function getCartListData(){
	console.log('getCartListData')
	 let { data: { cartList } } = await request(`/cart/list?customerId=${userStore.userId}`,"GET")

	for(const listElement of cartList[0].shoppingCartDetails){
		 listElement.isChecked = true
		   totalProNum.value += listElement.quantity
		   proNum.push({'goods_num':listElement.quantity})
	}


}

onShow( async ()=>{
	console.log('onShow')
	try{
		await getUserStore()
		await getCartListData()
	}catch(error){
		console.log(error)
	}

})
</script>

<template>


	<view>
		<view class="empty-cart">
			<image src="@/static/empty.png" mode=""></image>
			<view class="empty-cart-discripte is-login">
				<text>您的购物车是空的，快去逛逛吧</text>
			</view>
			<view class="empty-cart-discripte no-login">
				<text>尚未登录，请先登录</text>
			</view>

				<button @click="goToIndex">
					去逛逛
				</button>
		</view>

		<view class="no-empty-cart">
			<view class="cart-list">
				<uni-row :gutter="20">
					<uni-col :span="8">
						<image src="../../static/logo.png" mode="widthFix"></image>
					</uni-col>
					<uni-col :span="16" class="right">
						<u-text :lines="2" text="111111111111"></u-text>
						<uni-row class="info">
							<text>￥7999</text>
							<uni-col :span="12">
								<count-box></count-box>
							</uni-col>
						</uni-row>
					</uni-col>
				</uni-row>
			</view>
		</view>
	</view>

</template>

<style lang="scss" scoped>
	.empty-cart {
		padding: 80px 30px;

		uni-image {
			width: calc(140/375 * 750rpx);
			height: calc(92/375 * 750rpx);
			display: block;
			margin: 0 auto;
		}

		.empty-cart-discripte {
			text-align: center;
			color: #666;
			margin: 20px;
		}

		.no-login {
			display: none;
		}

		uni-button {
			width: calc(110/375 * 750rpx);
			height: calc(32/375 * 750rpx);
			line-height: calc(32/375 * 750rpx);
			border-radius: calc(16/375*750rpx);

			background-color: #ee0a24;
			color: #fff;
		}
	}
</style>

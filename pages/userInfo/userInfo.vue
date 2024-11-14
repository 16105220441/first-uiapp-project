<script setup>
	import {
		ref,
		reactive
	} from "vue"
	import request from "../../utils/request";
	import {onBeforeMount} from "vue"
	import {onShow} from "@dcloudio/uni-app"
	function getAllOrder() {

	}

	/* 我的服务 */
	/* 图标与文本 */
	const customIcons = reactive([{
			name: '收货地址',
			classname: `custom-icon-shouhuodizhiyebianji`
		},
		{
			name: '领券中心',
			classname: `custom-icon-lingquanzhongxin`
		},
		{
			name: '我的帮助',
			classname: `custom-icon-wodebangzhuzhongxin`
		},
		{
			name: '我的积分',
			classname: `custom-icon-wodejifen`
		},
		{
			name: '退还/售后',
			classname: `custom-icon-shouhouwuyou`
		},
	])


	let isLogin = ref(false)

	async function getToken() {

		const res = await new Promise((resolve, reject) => {
			uni.getStorage({
				key: 'userStore',
				success: (result) => {
					resolve(result)
				},
				fail: (error) => {
					reject(error)
				}
			})
		})

		const userData = JSON.parse(res.data)
		if (userData.userToken) {
			isLogin.value = true
			await getUserBasicInfo(userData.userId)
		}
	}

	let userBasicInfo = reactive({
		mobile: '',
		pickName: '',
		avatar:''
	})
	async function getUserBasicInfo(userId) {
		let {
			data: {
				info
			}
		} = await request(`/customer/getBasicInfo?userId=${userId}`)
		userBasicInfo.mobile = info.phone
		userBasicInfo.pickName = info.pickName
		userBasicInfo.avatar = info.avatar
	}

/* 	onBeforeMount(async ()=>{
		console.log("onBeforeMount")
		await getToken()
		console.log(userBasicInfo.avatar === null)
		console.log('isLogin',isLogin.value)
	}) */
	onShow(async ()=>{
		console.log("onShow")

			uni.getStorage({
				key: 'userStore',
				success: async (result) => {
					console.log("JSON.parse(result.data)",JSON.parse(result.data))
          const userData = JSON.parse(result.data)
          if (userData.userToken) {
            isLogin.value = true
            await getUserBasicInfo(userData.userId)
          }

        },
				fail: (error) => {
          userBasicInfo.mobile = ''
          userBasicInfo.pickName = ''
          userBasicInfo.avatar = ''
		  console.log('fail')
          uni.removeTabBarBadge({ index: 2 });

        }
		})

	})
	async function logout(){
		isLogin.value = false
		uni.clearStorage()
		await getToken()
	}
	 function login(){
		uni.navigateTo({
			url:"/pages/login/login"
		})
	}

	function goToDeliveryAddress(){
		uni.navigateTo({
			url:"/pages/deliveryAddress/list/list"
		})
	}
</script>

<template>
	<view class="page-container">
		<!-- 未登录的 -->

		<view v-if="!isLogin" class="header-container" >
			<view class="avatar-image user-info">
				<image src="@/static/default-avatar.png" mode="widthFix"></image>
				<view class="nick-name">

				</view>
			</view>
			<view class="tips-container">
				<view class="no-login">
					<text>未登录</text>
				</view>
				<view class="tips">
					点击登录账号
				</view>
			</view>
		</view>

		<view class="header-container" v-else>
			<view class="avatar-image user-info">
				<image v-if="userBasicInfo.avatar" :src="userBasicInfo.avatar" mode="widthFix"></image>
				<image v-else src="@/static/default-avatar.png" mode="widthFix"></image>

				<view class="nick-name">

				</view>
			</view>
			<view class="tips-container">
				<view class="logined">
					<text>昵称: {{userBasicInfo.pickName}}</text>
				</view>
				<view class="phone">
					手机号: {{userBasicInfo.mobile}}
				</view>
			</view>
		</view>



		<!-- 订单状态 -->

		<view class="order-navbar block-container">
			<uni-row :gutter="[20,20]">
				<uni-col :span="6" @click="getAllOrder">
					<u-icon name="order" :size="30"></u-icon>
					<text>全部订单</text>
				</uni-col>
				<uni-col :span="6">
					<u-icon name="clock" :size="30"></u-icon>
					<text>待支付</text>
				</uni-col>
				<uni-col :span="6">

					<uni-icons class="custom-icon custom-icon-daifahuo" :size="30">{</uni-icons>
					<text>待发货</text>
				</uni-col>
				<uni-col :span="6">

					<uni-icons class="custom-icon custom-icon-daishouhuo" :size="30"></uni-icons>
					<text>待收货</text>
				</uni-col>
			</uni-row>
		</view>

		<!-- 用户服务 -->
		<view class="my-service block-container">
			<view class="title">
				<uni-grid :column="4" :show-border="false">
					<uni-grid-item  align="center" v-for="(item,index) in customIcons"
                          :key="index"
                         @click="function(){
						if(index === 0){
							goToDeliveryAddress()
						}
					}">
						<uni-icons class="custom-icon" :size="30" color="#ff0000"
                       :class="item.classname" >

						</uni-icons>
						<text>{{item.name}}</text>
					</uni-grid-item>

				</uni-grid>
			</view>
		</view>

		<view>
			<button v-if="isLogin" class="logout button" @click="logout">退出登录</button>
			<button v-if="!isLogin" class="login button" @click="login">点击登录</button>
		</view>

	</view>
</template>

<style lang="scss" scoped>
	@import "../../static/iconFont/iconfont.css";

	.page-container {
		height: calc(100vh - 95px);
		box-sizing: border-box;
		background-color: #f7f7f7;
		padding: 20px 10px 20px;
	}




	.header-container {
		display: flex;
		width: calc(200/375 * 750rpx);
		margin: 0 10px;
		min-width: 210px;
		align-items: center;

		.avatar-image {
			width: 30%;

			uni-image {
				width: 100%;
				border-radius: 50%;
			}
		}

		.tips-container {
			padding-left: 10px;
			display: flex;
			flex-direction: column;

			.no-login {
				color: #b89b4a;
			}

		}
		.phone{
			white-space: nowrap;
		}

	}

	.block-container {
		padding: 15px;
		background-color: #fff;
		border-radius: 10px;
	}

	.order-navbar {
		margin: 10px 0;

		.uni-row {
			.uni-col {
				uni-text {
					margin-top: 5px;
				}
			}
		}
	}

	.my-service {
		.uni-grid {
			.uni-grid-item {
				align-items: center;
			}

			.uni-grid-item__box {
				.uni-icons {
					margin-bottom: 5px;
				}
			}
		}
	}


	.uni-row {
		display: flex;
		align-items: center;

		.uni-col {
			display: flex;
			flex-direction: column;
			align-items: center;

			.uni-icons {
				display: block;
			}
		}
	}

	.button {
		border-radius: 20px;
		margin: 20px 10% 20px;
		background-color: #c92217;
		color: #fff;
	}
</style>

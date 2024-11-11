<script setup>
	import {
		ref,
		reactive
	} from 'vue'
	import request from '@/utils/request.js';
	import {
		onShow
	} from "@dcloudio/uni-app"

	function goAddressEdit() {
		uni.navigateTo({
			url: "/pages/deliveryAddress/edit/edit"
		})
	}
	let addressList = reactive(([]))
	async function getAddressList() {
		let customerId = JSON.parse(uni.getStorageSync('userStore')).userId
		let {
			data: {
				shoppAddressList
			}
		} = await request(`/address/get/list?customerId=${customerId}`)

		if (shoppAddressList.length > 0) {
			if (shoppAddressList[0].shoppingAddressDetails?.length > 0) {
				current.value = shoppAddressList[0].shoppingAddressDetails.findIndex(address => address.isDefault ===
					'true')
				console.log('current', current.value)
				addressList.push(...shoppAddressList[0].shoppingAddressDetails)
			}
		}
	}


	let current = ref(-1)

	let isRequesting = false; // 定义一个标志来防止重复请求

	async function radioChange(e) {
	    // 如果当前已有请求正在进行，直接返回，避免重复执行
	    if (isRequesting) {
	        return;
	    }

	    // 设置请求状态为正在进行
	    isRequesting = true;

	    // 获取选中项的值
	    const { addressDetailId, customerId } = e.detail.value;

	    // 发送请求更新默认地址
	    let { code } = await request("/address/detail/update/default", "PUT", {
	        addressDetailId,
	        customerId
	    });

	    // 根据返回的 code 显示相应的消息框
	    if (code === 200) {
        uni.$off("backToPay")
	        // 若成功，显示成功的提示框
	        uni.showToast({
	            title: "该收货地址成功设为默认地址", // 提示内容
	            icon: "success", // 成功图标
	            duration: 1500 // 显示时间
	        });

	        // 使用 Promise 来等待消息提示框消失
	        await new Promise((resolve) => {
	            setTimeout(() => {
	                resolve(); // 结束 Promise
	            }, 1500); // 等待时间与提示框的 duration 相同
	        });

	        // 在消息提示框消失后更新数据
	        addressList.length = 0; // 清空现有地址列表
	        await getAddressList(); // 重新获取地址列表

	        // 等待 1 秒钟
	        await new Promise((resolve) => {
	            setTimeout(resolve, 1000); // 等待 1 秒
	        });

	        uni.navigateBack();

	    } else {
	        // 若失败，显示失败的提示框
	        uni.showToast({
	            title: "设置默认地址失败", // 错误提示
	            icon: "none", // 不显示图标
	            duration: 1500 // 显示时间
	        });
	    }

	    // 请求结束，重置状态
	    isRequesting = false;
	}

	async function editAddress(id) {
		uni.navigateTo({
			url: `/pages/deliveryAddress/edit/edit?addressDetailId=${id}`
		})
	}

	async function delectAddress(params) {
		const result = await new Promise((resolve) => {
			uni.showModal({
				title: '是否删除该收货地址',
				success: (res) => {
					resolve(res);
				}
			})
		})

		if (result.confirm) {
			let {
				code
			} = await request(`/address/detail/delete?address_detail_id=${params}`, 'DELETE');
			if (code == 200) {
				addressList.length = 0
				getAddressList()

			}
		} else if (result.cancel) {
			uni.showToast({
				title: "操作取消",
				icon: "fail",
				duration: 1500
			})
		}
	}

	onShow(() => {
		addressList.length = 0
		getAddressList()
	})
  function goPayPage(params) {
    uni.navigateBack()
    uni.$emit("backToPay",{addressDetailId:params})
  }


</script>

<template>
	<view class="page-container">

		<radio-group @change="radioChange">

			<uni-swipe-action>
				<uni-swipe-action-item v-for="(item,index) in addressList" :key="item.addressDetailId">
					<uni-row class="address-list-item">
						<radio class="radio" :value="item" :checked="index === current" />
						<view class="address-info" @click="goPayPage(item.addressDetailId)">
							<view>
								<uni-row>
									<view class="name padding-block">
										<text>
											{{item.name}}
										</text>
									</view>
									<view class="tel  padding-block">
										<text>
											{{item.tel}}
										</text>
									</view>
									<u-tag v-if="item.isDefault == 'true'" class="is-default" text="默认" shape="circle"
										bg-color="#c21401" border-color="#c21401" size="mini">

									</u-tag>
								</uni-row>
							</view>
							<view>
								<text>
									{{item.province+item.city+item.county+item.addressDetail}}
								</text>
							</view>

						</view>
					</uni-row>
					<template v-slot:right>
						<view class="slot-button">
							<view class="slot-button-text modification" @click="editAddress(item.
addressDetailId)">

								<text>修改</text>
							</view>
							<view class="slot-button-text  delete
							" @click="delectAddress(item.
addressDetailId)">
								删除
							</view>

						</view>
					</template>


				</uni-swipe-action-item>
			</uni-swipe-action>




		</radio-group>

	</view>
	<view class="footer">
		<button @click="goAddressEdit">新增收货地址</button>
	</view>
</template>

<style lang="scss" scoped>
	.page-container {
		margin-left: 10px;
		margin-top: 10px;
		padding-bottom: 50px;

		.uni-row {
			display: flex;
		}
	}

	.uni-swipe:not(:last-child) {
		border-bottom: 1px solid gray;
	}

	.address-list-item {
		margin-right: 20px;
		display: flex;
		align-items: center;

		uni-radio {
			padding-right: 10px;
		}
	}

	.address-info {
		display: flex;
		flex-direction: column;
		padding-right: 10px;
		padding-top: 10px;
		padding-bottom: 10px;

		>uni-view:nth-child(1) {
			margin-bottom: 10px;
		}

		.padding-block {
			padding-right: 5px;
		}
	}

	.slot-button {
		display: flex;
		height: 100%;
		flex: 1;
		flex-direction: row;
		justify-content: center;
		align-items: center;

		/* padding: 0 20px; */
		>view {
			width: 50%;
			height: 100%;
		}

		.slot-button-text {

			display: flex;
			align-items: center;
			color: #ffffff;
			font-size: 14px;
			text-align: center;
			padding: 0 50px;

		}

		.modification {
			background-color: #fdbf50;
		}

		.delete {
			background-color: #c21401;
		}
	}

	.footer {
		margin: 0 20px 15px;
		width: calc(100vw - 40px);
		position: fixed;
		bottom: 0;

		uni-button {
			border: none;
			background-color: #c21401;
			color: #ffff;
			border-radius: 25px;
		}

	}
</style>

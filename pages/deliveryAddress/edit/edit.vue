<script setup>
	import {
		ref,
		reactive,
		computed,
		watch
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app"
	import request from "@/utils/request.js";

	let defaultBoolean = ref(false);
	let poupShow = ref(false);

	let address = reactive({
		province: [],
		city: [],
		district: []
	});

	let colorIndex = ref(0);
	let selectAddressList = ref([]);

	let selectedAddress = ref({
		province: '',
		city: '',
		district: '',

	});



	const region = computed(() => {
		return `${selectedAddress.value.province} ${selectedAddress.value.city} ${selectedAddress.value.district}`
			.trim();
	});


	let userInfo = reactive({
		name: '',
		phone: '',
		detailAddress: '',
		Region: ''
	});

	let rules = reactive({
		name: {
			rules: [{
				required: true,
				errorMessage: '请填写姓名',

			}]

		},
		phone: {
			rules: [{
					required: true,
					errorMessage: '请填写手机号',
				},
				{
					minLength: 11,
					maxLength: 11,
					errorMessage: '请填写正确的手机格式'

				}
			]
		},
		Region: {
			rules: [{
				required: true,
				errorMessage: '请选择你所在地区',

			}]
		},

		detailAddress: {
			rules: [{
				required: true,
				errorMessage: '请填写详细地址',

			}]
		}

	});

	async function fetchProvinces() {
		let {
			data: {
				data
			}
		} = await request('/province/list');
		address.province = []
		address.province.push(...data);
	}

	async function handleAreaFocus() {
		console.log('handleAreaFocus')
		if (selectedAddress.value.district === '') {
			selectedAddress.value.province = '';
			selectedAddress.value.city = '';
			selectedAddress.value.district = '';
		}

		poupShow.value = true;
		await fetchProvinces();
		selectAddressList.value.push(...address.province.map(item => item.provinceName));
	}

	async function handleAddressSelection(key) {
		selectAddressList.value = [];
		if (key === 'province') {
			colorIndex.value = 0;
			await fetchProvinces();
			selectAddressList.value.push(...address.province.map(item => item.provinceName));
		} else if (key === 'city') {
			colorIndex.value = 1;
			let {
				data: {
					provinceId
				}
			} = await request(`/province/getProvinceId?provinceName=${selectedAddress.value.province}`);
			let {
				data: {
					cityList
				}
			} = await request(`/city/get/byProvinceId?provinceId=${provinceId}`);
			address.city = []
			address.city.push(...cityList);
			selectAddressList.value.push(...address.city.map(item => item.cityName));
		} else if (key === 'district') {
			colorIndex.value = 2;
			let {
				data: {
					cityId
				}
			} = await request(`/city/getCityId?cityName=${selectedAddress.value.city}`);
			let {
				data: {
					districtList
				}
			} = await request(`/district/get/byCityId?cityId=${cityId}`);
			address.district = []
			address.district.push(...districtList);
			selectAddressList.value.push(...address.district.map(item => item.districtName));
		}
	}

	async function selectAddress(item) {
		selectAddressList.value = [];
		colorIndex.value++;
		if (colorIndex.value === 1) {
			selectedAddress.value.province = item;
			selectedAddress.value.city = '';
			selectedAddress.value.district = '';
			let {
				data: {
					provinceId
				}
			} = await request(`/province/getProvinceId?provinceName=${selectedAddress.value.province}`);
			let {
				data: {
					cityList
				}
			} = await request(`/city/get/byProvinceId?provinceId=${provinceId}`);
			address.city.push(...cityList);
			selectAddressList.value.push(...address.city.map(item => item.cityName));
		} else if (colorIndex.value === 2) {
			selectedAddress.value.city = item;
			selectedAddress.value.district = '';
			let {
				data: {
					cityId
				}
			} = await request(`/city/getCityId?cityName=${selectedAddress.value.city}`);
			let {
				data: {
					districtList
				}
			} = await request(`/district/get/byCityId?cityId=${cityId}`);
			address.district.push(...districtList);
			selectAddressList.value.push(...address.district.map(item => item.districtName));
		} else if (colorIndex.value === 3) {
			selectedAddress.value.district = item;
			userInfo.Region = region.value
			poupShow.value = false;
			colorIndex.value = 0;
		}
	}

	function resetAddressSelection() {
		poupShow.value = false;
		address.province = [];
		address.city = [];
		address.district = [];
		selectedAddress.value.province = '';
		selectedAddress.value.city = '';
		selectedAddress.value.district = '';
		selectAddressList.value = [];
		colorIndex.value = 0;
	}
	let userInfoForm = ref()
	let hasRouterParams = ref(null)
	async function submit() {
		try {
			await userInfoForm.value.validate();

			userInfo.customerId = JSON.parse(uni.getStorageSync("userStore")).userId
			const resultArray = userInfo.Region.split(' ')
			
			console.log('resultArray', resultArray)
			if (hasRouterParams.value) {
				console.log('update')
				let {
					code
				} = await request("/address/detail/update", "PUT", {
					name: userInfo.name,
					province: resultArray[0],
					city: resultArray[1],
					county: resultArray[2],
					addressDetail: userInfo.detailAddress,
					customerId: userInfo.customerId,
					isDefault: defaultBoolean.value,
					tel: userInfo.phone,
					addressDetailId:hasRouterParams.value
				})
				if (code === 200) {
					uni.showToast({
						title: '修改成功',
						success() {
							setTimeout(() => {
								uni.navigateBack()
							}, 1500)
						}
					})
				}
			} else {
				let {
					code
				} = await request("/address/detail/add", "POST", {
					name: userInfo.name,
					province: resultArray[0],
					city: resultArray[1],
					county: resultArray[2],
					addressDetail: userInfo.detailAddress,
					customerId: userInfo.customerId,
					isDefault: defaultBoolean.value,
					tel: userInfo.phone
				})

				if (code === 200) {
					uni.showToast({
						title: '添加成功',
						success() {
							setTimeout(() => {
								uni.navigateBack()
							}, 1500)
						}
					})
				}

			}

		} catch (err) {
			console.log('err', err)
		}
	}


	onLoad(async (e) => {
		console.log(e)
		if (e?.addressDetailId) {
			uni.setNavigationBarTitle({
				title:"修改收货地址"
			})
			console.log('addressDetailId')
			hasRouterParams.value = e.addressDetailId
			let {
				data: {
					addressDetail
				}
			} = await request(`/address/detail/getInfo?addressDetailId=${e.addressDetailId}`)
			userInfo.name = addressDetail.name
			userInfo.phone = `${addressDetail.tel}`
			userInfo.Region = addressDetail.province + " " + addressDetail.city + " " + addressDetail.county
			userInfo.detailAddress = addressDetail.addressDetail
			defaultBoolean.value = addressDetail.isDefault === 'true' ? true : false

		}
	})
</script>

<template>
	<view class="page-container">
		<uni-card style="margin-top: 0px; border-radius: 10px;">
			<uni-forms v-model="userInfo" :rules="rules" ref="userInfoForm" validate-trigger="blur">
				<uni-forms-item label="姓名" required name="name">
					<uni-easyinput v-model="userInfo.name" placeholder="请输入姓名"></uni-easyinput>
				</uni-forms-item>
				<uni-forms-item label="联系电话" required name="phone">
					<uni-easyinput v-model="userInfo.phone" placeholder="请输入手机号" type="number"></uni-easyinput>
				</uni-forms-item>
				<uni-forms-item label="地区" required name="Region">
					<uni-easyinput v-model="userInfo.Region" @focus="handleAreaFocus" placeholder="请选择地区">
					</uni-easyinput>
				</uni-forms-item>
				<uni-forms-item label="详细地址" required name="detailAddress">
					<uni-easyinput v-model="userInfo.detailAddress" placeholder="请输入详细地址"></uni-easyinput>
				</uni-forms-item>
				<uni-forms-item>
					<view class="default-adress-btn">
						<view>
							<text>设为默认地址</text>
						</view>
						<u-switch v-model="defaultBoolean" active-color="#c21401" @change="function(){
							console.log(defaultBoolean)
						}"></u-switch>
					</view>
				</uni-forms-item>
			</uni-forms>

			<view class="submit-button">
				<button style="border: none;" @click="submit">
					保存
				</button>
			</view>
		</uni-card>

		<u-popup :show="poupShow" :safe-area-inset-top="true" mode="bottom" :round="10" closeable
			@close="resetAddressSelection">
			<view class="title">
				<uni-title title="请选择你的地址" align="center" type="h1"></uni-title>
			</view>
			<view class="address">
				<view v-for="(value, key) in selectedAddress" :key="key" @click="() => handleAddressSelection(key)">
					<text>{{ value }}</text>
				</view>
			</view>
			<scroll-view scroll-y style="height: 80vh;" :show-scrollbar="true">
				<u-cell v-for="(item, index) in selectAddressList" :key="index" :title="item"
					@click="() => selectAddress(item)"></u-cell>
			</scroll-view>
		</u-popup>
	</view>
</template>

<style lang="scss" scoped>
	uni-page-body {
		display: flex !important;
		justify-content: center;
		height: 100%;
		align-items: center;
	}


	.submit-button {

		>uni-button {
			border-radius: 25px;
			background-color: #c21401;
			color: #fff;
			height: 40px;

			font-size: 16px;

			::after {
				border: none;

			}

		}
	}

	.default-adress-btn {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-between;
	}

	.u-popup {
		.address {
			margin: 0px 20px;
			display: flex;
			padding-bottom: 10px;
			border-bottom: 1px solid gray;

			/* justify-content: center; */
			>view {
				margin-right: 10px;
			}
		}
	}
</style>
<script setup>
	import {
		ref,
		reactive,
		onMounted
	} from "vue"
	import request from "@/utils/request.js"

	let picUrl = ref('')
	let uid = ref('')
	async function getPicCodeInfo() {
		const {
			data: {
				baseImageCode,
				uuid
			}
		} = await request('/ImageCaptcha')
		console.log('uuid', uuid)
		picUrl.value = baseImageCode
		uid.value = uuid
	}
	getPicCodeInfo()

	let timer = null

	let second = ref(60)
	let totalSecond = ref(60)
	let msgCodeId = ref('')
	async function getMsgCode() {
		loginForm.value.clearValidate()
		let originalMsgCodeRules = JSON.parse(JSON.stringify(formRules.msgCode.rules));
		console.log('originalMsgCodeRules', originalMsgCodeRules);
		formRules.msgCode.rules = [];
		let isValidate
		try {
			console.log('validate')
			await loginForm.value.validate()
			isValidate = true
		} catch (err) {
			console.log('err')
			isValidate = false
		}
		formRules.msgCode.rules = originalMsgCodeRules;

		if (!isValidate) {
			return
		} else {
			if (!timer) {
				let res = await request(`/verify/imageCode?uid=${uid.value}&imageCode=${loginRequireData.picCode}`,
					'POST');
				if (res.code === 200) {
					if (second.value === totalSecond.value) {
						let {
							data
						} 	= await request('/messageCode')
						msgCodeId.value = data.msgCodeId
						showToast(data.msgCode)
						timer = setInterval(() => {
							second.value--
							if (second.value <= 0) {
								clearInterval(timer)
								timer = null
								second.value = totalSecond.value
							}
						}, 1000)
					}
				}
				else if(res.code === 401){
					uni.showToast({
						title:res.message,
						icon:"error",
						duration:1500
					})
				
					new Promise((resolve,reject)=>{
						setTimeout(()=>{
							resolve()
						},1500)
					}).then(()=>{
						getPicCodeInfo()
					}).catch((error)=>{
						console.log("再次请求消息",error)
					})
				}
			}
		}


	}

	let uToastRef = ref(null)

	function showToast(params) {
		uToastRef.value.show({
			message: `短信验证码:${params}`,
			duration: 1000 * 15
		})
	}


	let loginRequireData = reactive({
		mobile: '',
		picCode: '',
		msgCode: '',
	})
	let loginForm = ref('')
	let formRules = reactive({
		mobile: {
			rules: [{
					required: true,
					errorMessage: '请填写手机号'
				},
				{
					minLength: 11,
					maxLength: 11,
					errorMessage: '请填写正确的手机格式'
				}
			]
		},
		picCode: {
			rules: [{
					required: true,
					errorMessage: '请填写图形验证码'
				},
				{
					format: 'string',
					minLength: 4,
					maxLength: 4,
					errorMessage: '请填写正确的图形验证码'
				}
			]

		},
		msgCode: {
			rules: [{
					required: true,
					errorMessage: '请填写短信验证码'
				},
				{
					format: 'string',
					errorMessage: '请填写正确格式的短信验证码'
				},
				{
					minLength: 6,
					maxLength: 6,
					errorMessage: '请填写正确格式的短信验证码'
				}
			]
		}
	})

	async function submit() {
		try {
			// 等待验证结果
			await loginForm.value.validate();

			// 请求消息验证码
			let res = await request(
				`/verify/messageCode?msgCodeId=${msgCodeId.value}&&msgCode=${loginRequireData.msgCode}`,
				'POST'
			);

			if (res.code === 200) {
				// 登录请求
				const {
					data: {
						token,
						customerId
					}
				} = await request('/logIn', 'POST', {
					phone: loginRequireData.mobile
				});

				// 存储用户信息
				try{
					uni.setStorageSync('userStore', JSON.stringify({
						userToken: token,
						userId: customerId,
						
					}));
				}catch(e){
					console.log(e)
				}
				

				// 显示登录成功的提示
				uni.showToast({
				    title: '登录成功',
				    duration: 1500, // 设置显示时间
				    icon: 'success', // 可选：设置图标类型
					success() {
						 console.log('login');
					}
				});
				
				// 使用 setTimeout 延迟跳转
				setTimeout(() => {
				   
				    uni.navigateBack();
				}, 1500);

			}
		} catch (err) {
			console.log('err', err);
		}
	}

	onMounted(() => {
		clearInterval(timer)
	})
</script>

<template>
	<view class="page-container">
		<uni-card>
			<template v-slot:title>
				<uni-section title="手机号登录" sub-title="未注册的手机号将自动注册" title-font-size="28px" sub-title-font-size="14px"
					sub-title-color="#a1a1a1" style="padding-bottom: 0;"></uni-section>
			</template>
			<uni-forms v-model="loginRequireData" ref="loginForm" :rules="formRules" label-position="top"
				label-width="90px" :border="true">
				<uni-forms-item label="手机号" required name="mobile" style="white-space: normal !important;">
					<uni-easyinput v-model="loginRequireData.mobile" type="number" placeholder="请输入您的手机号"
						:input-border="false" style="border-bottom: 1px solid gray;" />
				</uni-forms-item>
				<uni-forms-item label="图形验证码" required name="picCode" type="text">
					<uni-easyinput v-model="loginRequireData.picCode" type="text" maxlength="4" placeholder="请输入图形验证码"
						:input-border="false" style="border:none; border-bottom: 1px solid gray;">
						<template #right>
							<view>
								<image :src="`data:image/jpg;base64,`+picUrl"
									style="height: 25px;width: 75px; background-color: black"></image>
							</view>
						</template>

					</uni-easyinput>
				</uni-forms-item>
				<uni-forms-item label="短信验证码" required name="msgCode" style="white-space: normal !important;">
					<uni-easyinput v-model="loginRequireData.msgCode" type="text" placeholder="请输入短信验证码"
						:input-border="false" style="border-bottom: 1px solid gray;">
						<template #right>
							<button size="mini" :plain="true" style="border:none; padding: 0; color:#dc9726;"
								:disabled="second === totalSecond ? false : true" @click="getMsgCode">{{
									second === totalSecond ? `获取短信验证码` : second + '秒后重新发送'
								}}</button>
						</template>
					</uni-easyinput>
				</uni-forms-item>
			</uni-forms>
			<template v-slot:actions>
				<view style="margin-bottom: 20px;">
					<button @click="submit"
						style="border: none; background-color: #f8aa2a; color: aliceblue;border-radius:25px ;">登录</button>
				</view>
			</template>
		</uni-card>

		<u-toast ref="uToastRef"></u-toast>
	</view>
</template>

<style lang="scss" scoped>
	.page-container {
		margin: 0 10px;
		height: calc(100vh - 44px);
		display: flex;
		align-items: center;

		.uni-card {
			border-radius: 10px;
			margin-top: 0 !important;

		}
	}
</style>
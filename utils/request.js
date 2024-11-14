const url_all = {
	/* 'DEV':'http://192.168.72.249:8082' */ //开发
	'DEV': 'http://116.205.188.40:8082',
	'PRO': '', //生产环境
}

let BaseUrl = url_all['DEV']
const request =  (path, method, data = {}, loading = true) => {
	let  token = ''

	 uni.getStorage({
		key:'userStore',
		success(res) {
			token =  JSON.parse(res.data).userToken

		}
	})

	if (loading) {
		uni.showLoading({
			title: '数据加载中',
			mask: true
		})
	}
	console.log('request')
	console.log('token',token)
	if (token != '' && token != null) {
		/* console.log('token',token)
		console.log('method',method) */
		return tokenRequest(path, method,data,loading, token)
	} else {
		return noTokenRequest(path, method, data, loading)
	}

}
export default request

function tokenRequest(path, method, data, loading, token) {
	/* console.log("tokenRequest.method",method) */
	console.log('token',token)
	return new Promise((resolve, reject) => {
		uni.request({
			url: BaseUrl + path,
			method,
			data,
			header:{
				'token':token
			},
			timeout:3000,
			success: (res) => {
			/* 	console.log(res) */
				/* console.log('tokenRequest')
				console.log('res.data',res.data)
				console.log('res.data.message',res.data.message) */
				if (res.data.code) {

				}
				uni.hideLoading()
				resolve(res.data)
			},
			fail: (err) => {
				console.log(err)
				const errorMessage = err && err.errMsg ? err.errMsg : '未知错误';
				uni.showToast({
					title:errorMessage,
					icon:"error",
					duration:2000
				})
				reject(err)
			}
		})
	})

}

function noTokenRequest(path, method, data, loading) {
	console.log('notoken')
	return new Promise((resolve, reject) => {
		uni.request({
			url: BaseUrl + path,
			method,
			data,
			success: (res) => {
				/* console.log('noTokenRequest')
				/* console.log('res.data',res.data)
				console.log('res.data.message',res.data.message) */
				if (res.data.code) {

				}
				uni.hideLoading()
				resolve(res.data)
			},
			fail: (err) => {
					const errorMessage = err && err.errMsg ? err.errMsg : '未知错误';
				uni.showToast({
					title:errorMessage,
					icon:"error",
					duration:2000
				})
				reject(err)
			},

		})
	})
}

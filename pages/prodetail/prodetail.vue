<script setup>
	import {
		ref,
		reactive
	} from 'vue';

	import {
		onLoad,
		onPageScroll,
		onReachBottom,
		onShow
	} from "@dcloudio/uni-app"
	import request from '../../utils/request';
	import GoodsNav from "./components/GoodsNav.vue"
	import CountBox from "@/components/CountBox.vue"
	import ToLogin from "@/components/ToLogin.vue"
	let defaultImg = "http://smart-shop.itheima.net/uploads/10001/20230321/a0db9adb2e666a65bc8dd133fbed7834.png"

	let proInfo = ref({})

	async function getProInfo(productId) {
		const {
			data: {
				productData
			}
		} = await request(`/products/detail?productId=${productId}`, 'GET')
		proInfo.value = productData
	}
	onLoad((e) => {
		console.log(e)
	 let ProStorge

		 try{
			ProStorge = JSON.parse(uni.getStorageSync("ProNumToCart"))
		 }catch(err){
			 uni.setStorageSync("ProStorge",JSON.stringify({number:0}))
		 }
	 if(ProStorge){
		 proNumToCartStorge.value = ProStorge.number
	 }

		getProInfo(e.productId)
		proId.value = e.productId
		getComments()
		getProDetail()
	})

	let proId = ref()
	let totalRef = ref(0)
	let comments_pro = ref([])
	let comments_page = ref(0)
	let comments_pageSize = 3
	let isLast_comment = ref(false)
	async function getComments() {
		if (!isLast_comment.value) {
			const {
				data: {
					proReviews: {
						list,
						total,
						isLastPage
					}
				}
			} = await request(
				`/products/productDetail/reviewList?productId=${proId.value}&&page=${ comments_page.value}&&pageSize=${comments_pageSize}`,
				'GET')
			comments_pro.value.push(...list)
			totalRef.value = total
			if (!isLastPage) {
				comments_page.value++
			} else {
				isLast_comment.value = isLastPage
			}
		}
	}
	onReachBottom(() => {
		if (!isLast_comment.value) {
			getComments()
		}
	})

	let pro_detail = ref({})
	async function getProDetail() {
		const {
			data: {
				productData
			}
		} = await request(`/products/detail?productId=${proId.value}`, 'GET')
		pro_detail.value = productData
	}

	let scrollTop = ref(0);
	let backTop_isShow = ref(false)
	onPageScroll((e) => {
		/* console.log('e', e) */
		if (e.scrollTop >= 1112) {
			backTop_isShow.value = true
		} else if (e.scrollTop === 0) {
			backTop_isShow.value = false
		}
	})

	function scrollToComment() {
		// 获取 .top 的位置
		uni.createSelectorQuery().select('.top').boundingClientRect(topRect => {
			// 获取 .back-top 的位置
			uni.createSelectorQuery().select('.back-top').boundingClientRect(backTopRect => {
				// 计算 scrollTop 的值
				console.log('topRect', topRect)
				console.log('backTopRect', backTopRect);
				const scrollTopValue = topRect.top - backTopRect.top;

				// 滚动到指定位置
				uni.pageScrollTo({
					duration: 1000, // 过渡时间
					scrollTop: scrollTopValue, // 返回顶部的 top 值
				});
			}).exec();
		}).exec();
	}
	/* 	console.log(uni.getStorageSync('ProNumToCart')=='') */
	let proNumToCartStorge = ref(0)
	let userInfo = ref(null)

	async function setProNumToCart() {


    const userStore = JSON.parse(uni.getStorageSync("userStore"))
    let {data:boolean}= await
        request(`/cartDetail/get/Info?customerId=${userStore.userId}&&productId=${proId.value}`,"GET")
    if(!boolean){
      proNumToCartStorge.value = parseInt(proNumToCartStorge.value) + addCount.value
    }
		    // 发起请求添加产品到购物车
		    await request("/cartDetail/add/product", "POST", {
		        productId: Number(proId.value),
		        quantity:addCount.value,
		        customerId: userStore.userId
		    });

		    // 更新本地存储
		    uni.setStorageSync('ProNumToCart', JSON.stringify({
		        number: proNumToCartStorge.value
		    }))
	}

	let addCount = ref(1)

	function addNum(n) {
		if (n === 0) {
			actionSheetShow.value = true
			actionSheetTitle.value = '加入购物车'
		}
	}

	function buyNow() {
		actionSheetShow.value = true
		actionSheetTitle.value = '立即购买'

	}

	let actionSheetShow = ref(false)
	let actionSheetTitle = ref('')

	function submitAddCart() {
		console.log('userInfo.value', userInfo.value)
		if (userInfo.value !== '' && userInfo.value !== null) {

			setProNumToCart()
			actionSheetShow.value = false

		} else {
			console.log(`userInfo.value == ''`)
			toLgoin.value.openPopup()
			actionSheetShow.value = false
			return
		}


	}

	function summitBuyNow() {
		if (userInfo.value !== '') {
			actionSheetShow.value = false
			uni.navigateTo({
				url: `/pages/pay/pay?productId=${proId.value}&&proNum=${addCount.value}`
			})
		} else {
			toLgoin.value.openPopup()
			actionSheetShow.value = false
			return
		}

	}

	function updateCount(e) {
		console.log('e', e)
		addCount.value = e
	}

	let toLgoin = ref(null)
	onShow(()=>{
		try {
		    userInfo.value = JSON.parse(uni.getStorageSync('userStore'));
			console.log( userInfo.value )
		} catch (error) {
		    console.error("从 storage 获取用户信息时出错:", error);
		    // 你可以在这里采用其他处理措施，比如设置 userInfo 为 null 或默认值
		    userInfo.value = null; // 举例，假设你需要重置用户信息
		}


	})
</script>

<template>

	<view id="top" class="top">
		<swiper :indicator-dots="true" indicator-active-color="#828282" indicator-color="#dcdcdc" :autoplay="true"
			:interval="3000" :duration="1000" :circular="true">

			<swiper-item v-for="(item,index) in proInfo.productDetail" :key="item.productDetailId">
				<image :src="item.productCarousel" m></image>
			</swiper-item>
		</swiper>
	</view>

	<view class="info">
		<view class="title">
			<view class="price">
				<text class="now">
					￥{{ proInfo.discountPrice }}
				</text>
				<text class="oldPrice">
					￥{{ proInfo.originalPrice }}
				</text>
			</view>
			<view class="sellCount">
				已售{{ proInfo.productSales }}件
			</view>
		</view>
		<up-text :lines="2" :text="proInfo.name"></up-text>

		<view class="service">
			<view class="left-words">
				<text>
					<uni-icons type="hand-up" color="#fa3030"></uni-icons>
					七天无理由退货
				</text>
				<text>
					<uni-icons type="hand-up" color="#fa3030"></uni-icons>
					48小时发货
				</text>
			</view>
			<view class="right-icon">
				<icon name="arrow"></icon>
			</view>
		</view>
	</view>


	<view class="pro_desc">
		<view class="" v-html="pro_detail.content"></view>
	</view>
	<view class="comments">
		<view class="comments-head">
			<view class="total-addCount">
				商品评价（{{totalRef}}条）
			</view>
		</view>
		<view class="comments-body">
			<uni-row v-for="(item,index) in comments_pro" :key="index">
				<uni-col :span="24">
					<view class="header">
						<image :src="item.customers?.avatar || defaultImg"></image>
						<text class="name">{{ item.customers?.pickName }}</text>
						<uni-rate :value="item.satisfaction" class="rate"></uni-rate>
					</view>
					<view class="footer">

						<up-text :lines="1" :text="item.review"></up-text>
						<text class="time">
							{{item.createTime}}
						</text>
					</view>
				</uni-col>
			</uni-row>
		</view>

	</view>

	<view v-if="backTop_isShow" class="back-top" @click="scrollToComment" style="background-color: #1989fa;">
		<uni-icons type="arrow-up" color="#fff"></uni-icons>
	</view>

	<goods-nav :info="proNumToCartStorge" @add-num="addNum" @buy-now="buyNow"></goods-nav>

	<u-action-sheet :title="actionSheetTitle" :show="actionSheetShow" round="20px" :safeAreaInsetBottom="true"
		@close="actionSheetShow = false">
		<template v-slot="content">
			<view class="product">
				<uni-row class="product-title" :gutter="20">
					<uni-col :span="8" class="left">
						<image :src="pro_detail.productImage" mode="widthFix" />
					</uni-col>
					<uni-col :span="16" class="right" style="text-align: left;">
						<view class="price">
							<text>￥</text>
							<text class="nowPrice">{{ pro_detail.discountPrice }}</text>
						</view>
						<view class="count">
							<text>库存</text>
							<text>{{ pro_detail.stockTotal }}</text>
						</view>
					</uni-col>
				</uni-row>

				<view class="addCount-box" style="text-align: left;">

					<text>数量</text>


					<CountBox :value="addCount" :maxNum="pro_detail.stockTotal" @updateValue="updateCount"></CountBox>



				</view>

				<view class="showButton" v-if="pro_detail.stockTotal > 0">
					<button @click="function(){
						  if(actionSheetTitle == '加入购物车'){
							  submitAddCart()
						  }else{
							  summitBuyNow()
						  }

					  }" color="#fe5630">{{actionSheetTitle}}
					</button>
				</view>
				<view class="showButton" v-else>
					<button color="#cccccc" round>该商品已抢空</button>
				</view>
			</view>
		</template>
	</u-action-sheet>

	<to-login ref="toLgoin"></to-login>
</template>

<style lang="scss" scoped>
	uni-swiper {
		height: 750rpx !important;

		uni-image {
			width: 750rpx;
			height: 750rpx;
		}
	}

	.info {
		padding: 10px;

		.title {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.now {
				//font-size:24px;
				font-size: 20px;
				color: #c21401;
			}

			.oldPrice {
				color: $uni-text-color-grey;
				text-decoration: line-through;
			}

			.sellCount {
				color: #959595;
			}
		}

		.service {
			margin-top: 10px;
			background-color: #fafafa;
			display: flex;
			justify-content: space-between;

		}
	}

	.comments {
		padding: 0 10px 55px;

		.comments-body {
			.uni-row {
				.header {
					display: flex;

					uni-image {
						width: calc(20/375*750rpx);
						height: calc(20/375*750rpx);
					}

					.rate {
						margin: 0 10px !important;
					}
				}

				.footer {
					display: flex;
				}
			}
		}

		.uni-load-more {
			border: #959595 1px solid;
		}

	}


	.back-top {
		position: fixed;
		right: 20px;
		bottom: 60px;
		width: 32px;
		height: 32px;
		border-radius: 50%;

		uni-text {

			display: block;
			width: 100%;
			text-align: center;
			font-size: 32px !important;
		}
	}

	uni-view .u-action-sheet {

		.product {
			padding: 0 10px;

			uni-image {
				width: 100%;
			}

			.price {
				color: #fe5f16;

				.nowPrice {
					font-size: 24px;

				}

			}

			.addCount-box {
				display: flex;
				margin: 20px 10px;
				justify-content: space-between;
				align-content: center;
			}

			.showButton {
				margin: auto;
				padding: 0 5% 15px;

				uni-button {
					background-color: #fe5f16;
					border-radius: 25px;
					color: white;
					width: 100%
				}
			}
		}
	}
</style>

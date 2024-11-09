<script setup>
	import {
		ref,
		reactive,
		onMounted,
		watch,

	} from "vue"

	import {
		onReachBottom,

	} from "@dcloudio/uni-app"


	import request from "../../utils/request";
	import GoodsItem from "@/components/GoodsItem.vue"


	const bannerList = reactive([])
	const getBannerList = async () => {
		let {
			data: {
				carouselImg
			}
		} = await request('/carousel/get/img')
		bannerList.splice(0, bannerList.length, ...carouselImg)
	}
	getBannerList()

	const navigateToSearch = () => {
		console.log(1)
		uni.navigateTo({
			url: '/pages/search/search'
		})
	}

	const navList = reactive([])
	const getTopCategorise = () => {
		return request('/topCategorise')

	}
	const getNavList = async () => {
		let {
			data: {
				topCategorise
			}
		} = await getTopCategorise()

		navList.splice(0, navList.length, ...topCategorise)
	}
	getNavList()

	let page = ref(1)
	let proList = reactive([])
	let lastPageBoolean = ref(false)
	const getProList = async () => {
		let {
			data: {
				productsData: {
					list,
					isLastPage
				}
			}
		} = await
		request(`/products/recommend?page=${page.value}&&travelPageSize=3`, 'GET')
		proList.push(...list)
		if (!isLastPage) {
			page.value++
		} else {
			lastPageBoolean.value = isLastPage
		}
	}
	getProList()

	onReachBottom(() => {
		console.log('onReachBottom函数')

		if (!lastPageBoolean.value)
			getProList()
	})
</script>

<template>

	<view class="page">

		<view class="esearch sticky-item">
			<uni-search-bar placeholder="请输入搜索关键词" :radius="50" clearButton="none" cancelButton="none"
				@click="navigateToSearch"></uni-search-bar>
		</view>

		<view class="">
			<swiper :indicator-dots="true" indicator-active-color="#ffffff" indicator-color="#dcdcdc" :autoplay="true"
				:interval="3000" :duration="1000" circular class="uni-swiper">
				<swiper-item v-for="(item,index) in bannerList" :key="index">
					<image class="swiper-item" :src="item.imageUrl"></image>
				</swiper-item>
			</swiper>
		</view>

		<view class="">
			<uni-grid :column="5" :showBorder="false">
				<uni-grid-item v-for="(item,index) in navList" :key="index">
					<view class="grid-item-box" style="background-color: #fff;">
						<image :src="item.imageUrl"></image>
						<text>{{item.text}}</text>
					</view>


				</uni-grid-item>
			</uni-grid>
		</view>

		<view class="pirtures">
			<image src="../../static/main.png" mode="aspectFit"></image>
		</view>

		<view class="guess">
			<p class="topic-title">——猜你喜欢——</p>

			<navigator v-for="(item,index) in proList" open-type="navigate"
                 :url="`/pages/prodetail/prodetail?productId=${item.productId}`" :key="index">
				<uni-row >
					<goods-item :data-item="item" style="margin-top: 10px; margin-bottom: 10px;"></goods-item>
				</uni-row>
			</navigator>

		</view>

	</view>

</template>


<style lang="scss" scoped>
	.page {
		width: 750rpx;
	}
	.sticky-item{
		position: sticky;
		top:44px;
		background-color: #ffffff;
		z-index: 99;
	}
	uni-swiper {
		width: 100%;
		height: 369rpx;
	}

	.uni-swiper-wrapper {
		.swiper-item {
			width: 100%;
			height: 100%;
		}

	}

	.uni-grid {

		.uni-grid-item {
			.grid-item-box {
				width: 100%;
				// box-sizing: border-box;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-around;
				align-items: center;

				image {
					width: 50%;
					height: 50%;

				}

			}
		}


	}

	.pirtures {
		margin-top: 20px;
		margin-bottom: 20px;

		uni-image {
			width: 750rpx;
			height: calc(134/425*750rpx);
		}
	}

	.topic-title {
		text-align: center;
	}
	.guess{
		padding: 0 10px;
	}
</style>

<script setup>
	import {
		ref,
		onMounted,
		onUnmounted
	} from "vue"
	import {
		onLoad,
		onReachBottom
	} from "@dcloudio/uni-app";
	import GoodsItem from "@/components/GoodsItem.vue"
	import request from "../../utils/request";
	import {getHistoryList,setHistoryList} from "@/utils/searchHistoryStorage.js"
	import SegmentedControl from "./components/SegmentedControl.vue"
	let querySearch = ref()
	let categoryId = ref(null)
	let proList = ref([])
	let isLastData = ref(false)
	
	function reSearch(){
		categoryId.value = null
		if(segmentedControl.value.currentIndex !== 0){
			segmentedControl.value.currentIndex = 0
		}
		isLastData.value = false
		page.value = 1
		proList.value = []
		getGoodsList()
		let searchHistory = getHistoryList()
		console.log('searchHistory',searchHistory)
		if(querySearch.value.length !== 0){
			const index = searchHistory.indexOf(querySearch.value)
			if(index > -1){
				 searchHistory.splice(index, 1)
			}
			searchHistory.unshift(querySearch.value)
			setHistoryList(searchHistory)
		}
		
		
	}
	
	onLoad((e) => {
		querySearch.value = e.search === undefined ? null :e.search
		categoryId.value = e.categoryId == undefined ? null : e.categoryId
		console.log('querySearch',e.querySearch)
		console.log('categoryId',e.categoryId)
	

	})
	async function getGoodsList(e) {
		let parturl = ''
		if(querySearch.value !== null){
			parturl = `goodsName=${querySearch.value}&&`
		}
		if(categoryId.value !== null){
			parturl += `categoryId=${categoryId.value}`
		}
		console.log('partUrl',parturl)
		let {
			data: {
				productsData: {
					list,
					isLastPage
				}
			}
		} = await request(`/products/by_Category/id&&name?${parturl}&&page=${page.value}&&travelPageSize=${travelPageSize.value}&&orderType=${segmentedControl.value.items[segmentedControl.value.currentIndex].fields}`, 'GET')
		console.log('isLastPage',isLastPage)
		proList.value.push(...list)
		if(!isLastPage){
			page.value++
		}else{
			isLastData.value = isLastPage
		}
		
		console.log('isLastData',isLastData.value)
	}
	onMounted(() => {
		console.log('onMounted')
		console.log(categoryId.value === null)
		getGoodsList(categoryId.value)
		
	})
	
	let page = ref(1)
	let travelPageSize = ref(6)
	onReachBottom(() => {
		console.log('onReachBottom')
		if (!isLastData.value) {
			getGoodsList(categoryId.value)
		}
	})
	
	onUnmounted(()=>{
		console.log('页面卸载')
	})
	
	function onOptionChange(e){
		/* console.log('e',e) */
		page.value = 1
		proList.value.splice(0,proList.value.length)
		getGoodsList(e)
	}
	let segmentedControl = ref(null)
</script>

<template>

	<view class="sticky-item">
		<uni-search-bar placeholder="请输入搜索关键词" :radius="50" v-model="querySearch" @confirm="reSearch(querySearch)"
			:maxlength="5">
			<template v-slot:searchIcon>
				<uni-icons color="#999999" size="18" type="search" @click="console.log('点击了自定义搜索图标')"></uni-icons>
			</template>

		</uni-search-bar>
	<segmented-control ref="segmentedControl" @clickSc="onOptionChange"></segmented-control>	
	</view>
	<view class="content">
		
		<uni-row v-for="(item,index) in proList" :key="index">
			<navigator :url="`/pages/prodetail/prodetail?productId=${item.productId}`"  open-type="navigate">
				<goods-item :data-item="item"></goods-item>
			</navigator>
			
		</uni-row>
	</view>
	


</template>

<style lang="scss" scoped>
	.sticky-item{
		position: sticky;
		top:44px;
		background-color: #ffffff;
		z-index: 99;
	}
	.content{
		margin: 0 10px;
	}
</style>
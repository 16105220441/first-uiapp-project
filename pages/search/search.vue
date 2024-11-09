<script setup>
	import {
		ref,
		reactive
	} from "vue"
	import {
		getHistoryList,
		setHistoryList,
		removeHistoryList
	} from "@/utils/searchHistoryStorage.js"
	import {onShow} from "@dcloudio/uni-app"
	let searchValue = ref('')
	let history = ref([])

	onShow(()=>{
		history.value = []
		history.value.push(...getHistoryList())
	})
	
	function goSearch(e) {
		if(e.length !== 0){
			const index = history.value.indexOf(e)
			if (index > -1) {
				history.value.splice(index, 1)
			}
			history.value.unshift(e);
			setHistoryList(history.value)
			history.value = getHistoryList()
			
		}
		uni.navigateTo({
			url: `./searchList?search=${e}`
		})
		
	}
	
	function removeHistory(){
		removeHistoryList()
		history.value = getHistoryList()
	}
	
	function removeHistoryItem(item) {
		const index = history.value.indexOf(item)
		history.value.splice(index, 1)
		setHistoryList(history.value)
	}
</script>

<template>

	<view>

		<view>
			<uni-search-bar placeholder="请输入搜索关键词" :radius="50" v-model="searchValue" @confirm="goSearch(searchValue)"
				:maxlength="5">
				<template v-slot:searchIcon>
					<uni-icons color="#999999" size="18" type="search" @click="console.log('点击了自定义搜索图标')"></uni-icons>
				</template>
				
			</uni-search-bar>

		</view>

		<view class="search-history" v-if="history.length > 0">
			<view class="title">
				<uni-section class="mb-10" title="最近搜索">
					<template v-slot:right>
						<uni-icons type="trash" @click="removeHistory"></uni-icons>
					</template>
				</uni-section>
			</view>
			<uni-row :gutter="[10,10]">
				<uni-col :span="6" v-for="(item,index) in history" :key="index">

					<u-tag :text="item" :plain="true" shape="circle" :closable="true" @close="removeHistoryItem(item)" @click="goSearch(item)"
						style="color: beige;"></u-tag>
				</uni-col>
			</uni-row>
		</view>

	</view>


</template>

<style lang="less" scoped>
	.search-history {
		.title {
			border-bottom: 1px solid #d4d4d4;
		}

		.uni-row {
			margin-top: 10px;
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;

			.uni-col {
				display: flex;
				justify-content: space-around;
			}
		}

	}
</style>
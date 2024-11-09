<script setup>
import {ref,reactive} from "vue"
import request  from "@/utils/request.js"


let parentCategoryData = reactive([])
async function getParentCategory(){
	let {data:{parentCategory}} = await request("/ParentCategory",'GET')
	parentCategoryData.push(...parentCategory)
	await getCategory(parentCategoryData[0].id)
}
getParentCategory()

let categoryData = ref([])
async function getCategory(parentCategoryId){
	let {data:{categoryList}} = await request(`/Category?parent_category_id=${parentCategoryId}`,'GET')
	
	categoryData.value = categoryList
}

let activeIndex = ref(0)
</script>

<template>
	<view class="main">
		
		<view class="left-sidebar">
			<view :class="[activeIndex == index ? 'active-sidebar-item':'','sidebar-item']" v-for="(item,index) in parentCategoryData" :key="index" @click="function(){
				 getCategory(item.id)
				 activeIndex =  index
			}">
				<text>{{item.name}}</text>
			</view>
			
		</view>
		
		<view class="right">
			<uni-row :gutter="20">
				
				<uni-col :span="8" v-for="(item,index) in categoryData" :key="index">
					<navigator open-type="navigate" :url="`/pages/search/searchList?categoryId=${item.id}`">
						<image :src="item.previewImageUrl" ></image>
						<view style="text-align: center;">{{item.name}}</view>
					</navigator>
				</uni-col>
			</uni-row>
		</view>
	</view>
</template>

<style lang="scss" scoped>
.main{
	display: flex;
	
}
.left-sidebar{
	width: calc(90/375 * 750rpx);
	background-color: #eaeaeb;
	height: 100vh;
	overflow-y: scroll;
	.sidebar-item{
		text-align: center;
		margin: 20px 0;
	}
	.active-sidebar-item{
		background-color: #ffffff;
		border-left: solid 1px #c21401;
	}
}

.right{
	width: calc((375 - 90) /375 * 750rpx);
	padding: 0 10px;
	.uni-col{
		margin-bottom: 10px;
	}
	uni-image{
		width: calc(90/375*750rpx);
		height: calc(90/375*750rpx);
	}
}
</style>

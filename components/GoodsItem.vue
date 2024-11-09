<script setup>
	const a = defineProps(['dataItem'])
	/* console.log('a',a.dataItem) */
</script>

<template>
		<view style="display: flex; justify-content: space-evenly;">
			<view  class="product-image-box">
				<image :src="dataItem.productImage"></image>
			</view>
			
			<view  class="right-content">
				<view>
					<uni-col>
					
						<u-text :lines="2" :text="dataItem.name"></u-text>
					</uni-col>
				</view>
			
				<uni-row class="sold-number">
					<text>已售{{dataItem.productSales}}件</text>
				</uni-row>
			
				<uni-row class="value">
					<uni-col>
						<text class="new-value">
							促销价:￥{{dataItem.discountPrice}}
						</text>
						<view>
							<text>原价:</text>
							<text class="old-value">￥{{ dataItem.originalPrice}}</text>
						</view>
						
					</uni-col>
				</uni-row>	
			</view>
		</view>
		
	
</template>



<style lang="scss" scoped>
	.product-image-box {
		width: calc(105/375 * 750rpx);

		uni-image {
			width: calc(105/375 * 750rpx);
			height: calc(105/375 * 750rpx);

		}
	}

	.right-content {
		margin-left: 20px !important;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-around;

		.sold-number {
			color: $uni-text-color-grey;
		}

		.value {
			color: $uni-text-color-grey;
			.uni-col{
				display: flex;
			}
			.new-value {
				color: #c21401;
				margin-right: 20px;
			}

			.old-value {
				text-decoration: $uni-text-color-grey line-through;
				text-align: center;
				font-size: 0.8em;
			}
		}
	}
</style>
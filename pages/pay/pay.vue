<script setup>
import {reactive, ref} from "vue"
import {onLoad, onShow} from "@dcloudio/uni-app"
import request from "@/utils/request.js"

function goToAddressList() {

  uni.navigateTo({
    url: '/pages/deliveryAddress/list/list'
  })
}

let proNum = ref()
let params
onLoad(async (e) => {
console.log('onLoad')
  console.log(e)
  proNum.value = e.proNum
  params = e
  await getProInfo(e)
})

let ProInfo = reactive({})

async function getProInfo(e) {
  console.log('getProInfo')
  console.log('e', e)
  let {
    data: {
      productData
    }
  } = await request(`/products/detail?productId=${e.productId}`)
  Object.assign(ProInfo, productData)
}

function addToOrder() {
  request('/orderDetail/add', 'POST', {})
}

let default_address = ref('')
let message = ref()
let addressDetailId
async function getDefalutAddress() {

  try {
    uni.$on('backToPay', function (data) {
      addressDetailId = data.addressDetailId
      console.log('addressDetailId1',addressDetailId)
      console.log(data)
    })
  } catch (err) {
    console.error(err)
  }
  if(addressDetailId){
   let {data:{addressDetail}}  = await
        request(`/address/detail/getInfo?addressDetailId=${addressDetailId}`)
    default_address.value = addressDetail
  }
  else{
    const customerId = JSON.parse(uni.getStorageSync("userStore")).userId
    let {data: {defaultAddress}} = await request(`/address/detail/default?isDefault=true&&customerId=${customerId}`)
    default_address.value = defaultAddress
  }

}


onShow(() => {
  getDefalutAddress()
  addressDetailId = undefined
})
</script>

<template>
  <view class="page-container">
    <view class="page-header" @click="goToAddressList">
      <uni-row>
        <uni-col :span="3">
          <view class="left-icon">
            <u-icon name="car-fill" size="24px"></u-icon>
          </view>

        </uni-col>
        <uni-col :span="18">
          <view v-if="default_address" class="info">
            <view class="info-content">
              <text class="name" style="padding-right: 10px;">
                {{ default_address.name }}
              </text>
              <text class="phone">
                {{ default_address.tel }}
              </text>
            </view>

            <u-text :lines="2"
                    :text="default_address.province+default_address.city+default_address.county+default_address.addressDetail">
            </u-text>
          </view>

          <view v-else class="info">
            <text>请填写配送地址</text>
          </view>
        </uni-col>

        <uni-col :span="3" class="right-icon">
          <view>
            <uni-icons type="right"></uni-icons>
          </view>
        </uni-col>

      </uni-row>
    </view>

    <view class="pay-list">
      <uni-row v-if="ProInfo" :gutter="20">
        <uni-col :span="8">
          <image :src="ProInfo.productImage" mode="widthFix" style=""></image>
        </uni-col>
        <uni-col :span="16" class="right">
          <u-text :lines="2" :text="ProInfo.name"></u-text>
          <uni-row class="info">
            <uni-col :span="12">
              <text>*{{ proNum }}</text>
            </uni-col>
            <uni-col :span="12" class="custom-class">
              <text>
                ¥{{ ProInfo.discountPrice }}
              </text>
            </uni-col>
          </uni-row>
        </uni-col>
      </uni-row>
    </view>

    <view class="pay-info">
      <uni-row class="pay-detail">
        <uni-col :span="12">订单总金额：</uni-col>
        <uni-col :span="12" class="custom-class">
          ￥{{ proNum * ProInfo.discountPrice }}
        </uni-col>
      </uni-row>
      <uni-row class="pay-cell">
        <uni-col :span="12">优惠券：</uni-col>
        <uni-col :span="12" class="right-text">无优惠券可用</uni-col>
      </uni-row>
      <uni-row class="pay-cell">
        <uni-col :span="12">配送费用：</uni-col>
        <uni-col v-if="!default_address" :span="12" class="right-text">
          <text>
            请先选择配送地址
          </text>
        </uni-col>
        <uni-col v-else :span="12" class="custom-class right-text">
          <text>
            +￥0.00
          </text>
        </uni-col>
      </uni-row>
    </view>


    <u-cell-group inset>
      <u-textarea v-model="message" autosize border count maxlength="50"
                  placeholder="选填：买家留言（50字以内）"
                  rows="2" type="textarea">
      </u-textarea>
    </u-cell-group>


  </view>
  <view class="footer-container">
    <view class="footer">
      <uni-row>
        <uni-col :span="9">
          <view class="footer-right">
            <text>实付金额:</text>
            <text class="cost">￥{{ proNum * ProInfo.discountPrice }}</text>
          </view>

        </uni-col>
        <uni-col :offset="7" :span="8" class="button-block">
          <button size="mini">提交订单</button>
        </uni-col>
      </uni-row>
    </view>

  </view>

</template>

<style lang="scss" scoped>
.page-container {
  padding-top: 10px;
  margin: 0 10px;
}

.page-header {
  padding-bottom: 10px;
  border-bottom: 1px solid gray;

  > .uni-row {

    display: flex;
    align-items: center;

    .info {
      font-size: 18px;
      display: flex;
      flex-direction: column;

    }

    .right-icon {
      > view {
        uni-text {
          display: block;
          text-align: right;
        }
      }
    }
  }

}

.pay-list {
  padding: 10px 0;
  border-bottom: 1px solid gray;

  .uni-row {
    display: flex;
    align-items: center;

    uni-image {
      width: calc(106 / 375 * 750rpx);
    }

    .info {
      margin-top: 10px;

    }


  }

}

.pay-info {

  padding: 10px 0;

  > .uni-row:not(:last-child) {
    margin-bottom: 5px;
  }

  .right-text {
    text-align: right;
  }
}

.custom-class {
  text-align: right;
  color: #c21401;
}

.footer-container {
  width: 100vw;
  position: fixed;
  bottom: 5px;
  border-top: 1px solid gray;
}

.footer {

  padding-top: 5px;

  width: calc(100vw - 20px);
  margin-left: 10px;

  .uni-row {
    display: flex;
    align-items: center;
  }

  .footer-right {
    display: flex;

    .cost {
      color: #c21401;
    }
  }

  .button-block {
    display: flex;

    uni-button {
      margin-left: auto;
      margin-right: 0;
      border: none;
      background-color: #c21401;
      color: #fff;
    }
  }

}
</style>

<script setup>

import {reactive, ref, watch,onBeforeMount} from "vue"
import request from "@/utils/request"


import {onLoad} from "@dcloudio/uni-app"
import countBox from "@/components/CountBox.vue"
import UniRow from "../../uni_modules/uni-row/components/uni-row/uni-row.vue";
import UText from "../../uni_modules/uview-plus/components/u--text/u--text.vue";
import UniSwipeActionItem
  from "../../uni_modules/uni-swipe-action/components/uni-swipe-action-item/uni-swipe-action-item.vue";
import UniSwipeAction
  from "../../uni_modules/uni-swipe-action/components/uni-swipe-action/uni-swipe-action.vue";
import UCheckboxGroup
  from "../../uni_modules/uview-plus/components/u-checkbox-group/u-checkbox-group.vue";
import UCheckbox
  from "../../uni_modules/uview-plus/components/u-checkbox/u-checkbox.vue";


function goToIndex() {
  uni.switchTab({
    url: '../index/index'
  })
}

let userStore = null

function getUserStore() {
  return new Promise((resolve, reject) => {
    try {
      userStore = JSON.parse(uni.getStorageSync("userStore"))
      resolve(userStore);
    } catch (err) {
      console.log(err)
      reject(err)
    }
  })

}

let cartListData = reactive({
  list: [],
  totalProNum: 0,
  totalPrice: 0,
  isLastPage: false,

})

let checkGroupBoolean = reactive([])

async function getCartListData() {
  console.log('getCartListData')
  let {data: {cartList}} = await request(`/cart/list?customerId=${userStore.userId}`, "GET")
  cartListData.totalProNum = cartList.total
  cartListData.isLastPage = cartList.isLastPage
  if (cartList.list !== null) {
    let list = cartList.list

    cartListData.list.push(...list[0].shoppingCartDetails)
    for (let i = 0; i < cartListData.list?.length; i++) {
      checkGroupBoolean.push({checkBoxBoolean: true})
    }
  }

  cartListData.list.forEach(item => {
    cartListData.totalPrice += item.itemTotalPrice; // 累加每个商品的总价
  });
  cartListData.totalPrice = cartListData.totalPrice.toFixed(2) // 保留两位小数
}



function handleRadioCheckBooleanChange(value) {
  console.log('immediate');

    for (let i = 0; i < checkGroupBoolean.length; i++) {
      checkGroupBoolean[i].checkBoxBoolean = !value;
    }

}

onBeforeMount(async () => {
  console.log("onLoad")
  try {
    await getUserStore()
    await getCartListData()
    console.log('11111')
    handleRadioCheckBooleanChange(radioCheckBoolean.value);
  } catch (error) {
    console.log(error)
  }

})
let radioCheckBoolean = ref(true)
function checkBox(index){
  checkGroupBoolean[index].checkBoxBoolean = !checkGroupBoolean[index].checkBoxBoolean
}


watch(() => radioCheckBoolean.value, (newVal) => {
  console.log("radioCheckBoolean")
  handleRadioCheckBooleanChange(newVal);
}, { immediate: true });

watch(checkGroupBoolean,()=>{
  console.log("checkGroupBoolean")
  let boolean = true
  for (let i = 0; i < checkGroupBoolean.length; i++){
    if(checkGroupBoolean[i].checkBoxBoolean){
      boolean = false
      break;
    }
  }
  radioCheckBoolean.value = boolean
},{immediate:true})
function changeRadio(){
  console.log("changeRadio")
  radioCheckBoolean.value = !radioCheckBoolean.value
}

async function deleteCartItem(index,delectItemNum,productId){

  let res = new Promise((resolve,reject)=>{
    try {
      let deleteCartItemList = []
      deleteCartItemList.push({
        productId:productId,
        customerId:userStore.
            userId

      })
      resolve(request("/cartDetail/delete","POST",deleteCartItemList))

    }catch (err){
     reject(err)
    }
  })


  checkGroupBoolean.splice(index,delectItemNum)
  cartListData.list.splice(index,delectItemNum)




}
</script>

<template>


  <view class="page-container">
    <view class="empty-cart">
      <image mode="" src="@/static/empty.png"></image>
      <view class="empty-cart-discripte is-login">
        <text>您的购物车是空的，快去逛逛吧</text>
      </view>
      <view class="empty-cart-discripte no-login">
        <text>尚未登录，请先登录</text>
      </view>

      <button @click="goToIndex">
        去逛逛
      </button>
    </view>


    <view class="cart-list">

      <uni-swipe-action>

          <uni-swipe-action-item v-for="(item,index) in cartListData.list"
                                 :key="item.id" class="bottom-margin">
            <uni-row
                class="cart-item">

              <view class="check-box">
                <u-checkbox ref="checkBoxRef" :usedAlone="true"
                    :checked="!checkGroupBoolean[index].checkBoxBoolean"
                    @change="checkBox(index)"
                    activeColor="#c21401" shape="circle"
                ></u-checkbox>
              </view>

              <image :src="item.products?.productImage" alt=""
                     class="product-preview"
                     mode="widthFix"
                     srcset=""/>
              <view class="right">
                <view class="details">
                  <u-text :lines="2" :text="item.products?.name"></u-text>

                  <view class="bottom" style="margin-top: 10px">
                    <view class="price">

                      <text>¥{{ item.products?.discountPrice }}</text>
                    </view>
                    <view class="count">
                      <count-box :maxNum="item.products?.stockTotal"
                                 :value="item.quantity"></count-box>
                    </view>
                  </view>
                </view>
              </view>
            </uni-row>
            <template v-slot:right>
              <view class="slot-button" >
                <view class="slot-button-item"
                      @click="deleteCartItem(index,1,item.products?.productId)">
                  删除
                </view>

              </view>
            </template>
          </uni-swipe-action-item>
      </uni-swipe-action>


    </view>

    <view class="page-fix-bottom">

      <view class="left-container">
        <radio :checked="radioCheckBoolean" activeBackgroundColor="#c21401"
               @click="changeRadio"
        ></radio>
        <text>全选</text>
        <view class="price-container">
          <text>合计:</text>
          <text class="price">¥{{ cartListData.totalPrice }}</text>
        </view>
      </view>

      <view class="button-container">
        <button>去结算</button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  height: calc(100vh - 94px);
  background: #ececec;
}

.empty-cart {
  padding: 80px 30px;

  uni-image {
    width: calc(140 / 375 * 750rpx);
    height: calc(92 / 375 * 750rpx);
    display: block;
    margin: 0 auto;
  }

  .empty-cart-discripte {
    text-align: center;
    color: #666;
    margin: 20px;
  }

  .no-login {
    display: none;
  }

  uni-button {
    width: calc(110 / 375 * 750rpx);
    height: calc(32 / 375 * 750rpx);
    line-height: calc(32 / 375 * 750rpx);
    border-radius: calc(16 / 375 * 750rpx);

    background-color: #ee0a24;
    color: #fff;
  }
}

.cart-item:not(:last-child) {
  padding-bottom: 10px;


}

.bottom-margin:not(:last-child) {
  margin-bottom: 5px;
}

.bottom-margin {
  border-radius: 10px;
}

.cart-item {
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .product-preview {
    min-width: 77px;
    width: calc(77 / 375 * 750rpx);
    display: block;
    margin-left: 7px;
    margin-right: 14px;

  }

  .right {
    .price {
      color: #c21401;
    }

    .bottom {
      display: flex;
      flex: 1;
      justify-content: space-between;
      align-items: center;
    }
  }

  .check-box {
    min-width: 20px;
  }
}

.uni-row {
  padding-top: 10px;
  padding-bottom: 10px;
  background-color: #fff;
}

.slot-button {
  background-color: #c21401;
  display: flex;
  width: 80px;
  align-items: center;
  text-align: center;
  color: #FFFFFF;

  .slot-button-item {
    margin: auto;
  }
}

.page-fix-bottom {
  position: fixed;

  bottom: 50px;
  width: calc(100% - 20px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  background-color: #FFFFFF;
  padding: 15px 10px;

  .price-container {
    padding-left: 10px;
  }

  .left-container {
    display: flex;

    .price {
      color: #c21401;
    }
  }

  .button-container {
    button {
      border-radius: 25px;
      border: none;
      background-color: #c21401;
      color: #FFFFFF;
      padding: 0 20px;
      height: 40px;
      line-height: 40px;
    }
  }

}
</style>

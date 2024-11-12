<script setup>

import {reactive, ref, watch, onBeforeMount,onMounted, computed} from "vue"
import request from "@/utils/request"


import {onLoad,onShow} from "@dcloudio/uni-app"
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

     userStore = null
      reject(err)
    }
  })

}

let cartListData = reactive({
  list: [],
  totalProNum: 0,
  totalPrice: 0.00,
  isLastPage: false,

})

function resetCartListData() {
  cartListData.list = []
  cartListData.totalProNum = 0

  cartListData.isLastPage = false
}

let checkGroupBoolean = reactive([])
let pageNum = ref(1)
let isLastPage = ref(false)
async function getCartListData(pageNumParam) {

  console.log('getCartListData')
  let {data: {cartList}} = await
      request(`/cart/list?customerId=${userStore.userId}&&pageNum=${pageNumParam}`, "GET")
  cartListData.totalProNum = cartList.total
  cartListData.isLastPage = cartList.isLastPage
  if(!cartList.isLastPage){
    pageNum.value++
  }else{
    isLastPage.value = true
  }
  if (cartList.list !== null) {
    let list = cartList.list

    cartListData.list.push(...list[0].shoppingCartDetails)
    for (let i = 0; i < cartListData.list?.length; i++) {
      checkGroupBoolean[i] = {checkBoxBoolean: true}
    }
  }
}

function initializeCheckGroup(cartListData) {

  for (let i = 0; i < cartListData.list?.length; i++) {
    checkGroupBoolean.push({checkBoxBoolean: true});
  }
}






function handleRadioCheckBooleanChange(value) {
 /* console.log('immediate');*/

    for (let i = 0; i < checkGroupBoolean.length; i++) {
      checkGroupBoolean[i].checkBoxBoolean = !value;
    }

}



onShow(async () => {
  console.log("onShow")
  pageNum.value = 1
  try {
    await getUserStore()
    resetCartListData()
    await getCartListData(pageNum.value)
   /* console.log('11111')*/
    handleRadioCheckBooleanChange(radioCheckBoolean.value);
    await updateCartCount()
  } catch (error) {

    resetCartListData()
    uni.removeTabBarBadge({ index: 2 });

    console.log(error)
  }

})
let radioCheckBoolean = ref(true)
function checkBox(index){
  checkGroupBoolean[index].checkBoxBoolean = !checkGroupBoolean[index].checkBoxBoolean
  if(checkGroupBoolean[index].checkBoxBoolean){
    radioCheckBoolean.value = false
  }
}
let value
   value = computed(()=>{
  let boolean = true
     console.log('computed')
  for (let i = 0; i < checkGroupBoolean.length; i++){
    if(checkGroupBoolean[i].checkBoxBoolean){
      boolean = false
      break
    }
  }
  if(boolean){
    radioCheckBoolean.value = true
  }
  return boolean
})

cartListData.totalPrice = computed(()=>{
  let totalPrice = 0.00
  for (let i = 0; i < checkGroupBoolean.length; i++){
    if(i >= cartListData.list.length) {
      break
    }
    if(!checkGroupBoolean[i].checkBoxBoolean){
      totalPrice += cartListData.list[i].products.discountPrice * cartListData.list[i].quantity
    }
  }
  return totalPrice.toFixed(2)
})

function changeRadio(){
  console.log("changeRadio")
  radioCheckBoolean.value = !radioCheckBoolean.value
  handleRadioCheckBooleanChange(radioCheckBoolean.value )
}

async function deleteCartItem(index,delectItemNum,productId){


    try {
      let deleteCartItemList = []
      deleteCartItemList.push({
        productId:productId,
        customerId:userStore.
            userId

      })
      await request("/cartDetail/delete","POST",deleteCartItemList)
      checkGroupBoolean.splice(index,delectItemNum)
      cartListData.list.splice(index,delectItemNum)
      return true
    }catch (err){
     console.log(err)
    }
}
// 在使用 deleteCartItem 的函数中调用 updateCartCount
async function handleDeleteItem(index, delectItemNum, productId) {
  const deleteSuccess = await deleteCartItem(index, delectItemNum, productId);

  if (deleteSuccess) {
    // 只有在删除成功后才更新购物车计数
    await updateCartCount();
  }
}
function goToProDetail(productId){
  uni.navigateTo({
    url: `/pages/prodetail/prodetail?productId=${productId}`
  })
}


function updateCartItem(e,userId,detailId,index){

}
let timeoutId;

function debounce(func, delay) {
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const debouncedHandleScroll = debounce(function() {
  if (!isLastPage.value) {
    getCartListData(pageNum.value);
  }
}, 300); // 设置300毫秒的防抖时间

async function updateCartCount() {
  try {
    const userId = JSON.parse(uni.getStorageSync("userStore")).userId;
    const { data: cartTotalNum } = await request(`/cartDetail/get/cartProTotalNum?customerId=${userId}`, "GET");

    uni.setStorageSync("ProNumToCart", JSON.stringify({ number: cartTotalNum }));
    if(cartTotalNum !== 0){
      uni.setTabBarBadge({ index: 2, text: cartTotalNum.toString() });
    }else{
      uni.removeTabBarBadge({ index: 2 });
    }


  } catch (err) {
    Object.assign(cartListData,{})
    console.log(err);
  }
}

// 使用 debouncedHandleScroll 替代原有的 handleScroll
</script>

<template>


  <view class="page-container">
    <view class="empty-cart" v-if="userStore === null ||
    cartListData.list.length  <= 0">
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


    <scroll-view class="cart-list" scroll-y="true"
                 @scroll="debouncedHandleScroll">


      <uni-swipe-action>

          <uni-swipe-action-item v-for="(item,index) in cartListData.list"
                                 :key="item.id" class="bottom-margin">
            <uni-row
                class="cart-item" >

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
                     srcset="" @click="goToProDetail(item.productId)"/>
              <view class="right">
                <view class="details">
                  <u-text :lines="2" :text="item.products?.name" @click="goToProDetail(item.productId)"></u-text>

                  <view class="bottom" style="margin-top: 10px">
                    <view class="price">

                      <text>¥{{ item.products?.discountPrice }}</text>
                    </view>
                    <view class="count">
                      <count-box :maxNum="item.products?.stockTotal"
                                 v-model:value="item.quantity"
                                 @updateValue="updateCartItem($event,userStore.userId
,item.detailId,index)"></count-box>
                    </view>
                  </view>
                </view>
              </view>
            </uni-row>
            <template v-slot:right>
              <view class="slot-button" >
                <view class="slot-button-item"
                      @click="handleDeleteItem(index,1,item.products?.productId)">
                  删除
                </view>

              </view>
            </template>
          </uni-swipe-action-item>
      </uni-swipe-action>


    </scroll-view>

    <view class="page-fix-bottom"  v-if=" cartListData.list.length  > 0">

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
.cart-list{
  height: 100%;
  box-sizing: border-box;
  padding: 20px 0 70px;
}
.cart-item:not(:last-child) {
  padding-bottom: 20px;


}

.bottom-margin:not(:last-child) {
  margin-bottom: 10px;
}

.bottom-margin {
  border-radius: 10px;
}


.cart-item {
  position: relative;
  height:calc((102/375) *750rpx);
  padding: 0 10px;
  display: flex;
  align-items: center;

  .product-preview {

    min-width: 77px;
    width: calc(77 / 375 * 750rpx);
    display: block;
    margin-left: 7px;
    margin-right: 14px;



  }

  .right {
  width: 60%;
   position: absolute;
    right: 20px;
    right: 20px;
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

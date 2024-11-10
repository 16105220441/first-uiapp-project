<script>

	import request from "./utils/request";

  export default {
		onLaunch:  async function () {
      console.log('App Launch')
    },
		onShow: async function() {
			console.log('App Show')


		},

    mounted: async function() {
      console.log('mounted')

    },
		onHide: function() {
			console.log('App Hide')
		},

		/* onReady:function(){
			console.log('onReady')
		} */
		/* onUnload() {
			console.log('监听页面卸载')
		}, */



	}
</script>

<style lang="scss">
	/*每个页面公共css */
  @import "@/uni_modules/uview-plus/index.scss";
</style>

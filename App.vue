<script>

	export default {
		onLaunch: function() {
			console.log('App Launch')
			/* console.log('uviewPlus',uviewPlus) */
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
    onLoad() {
        console.log('App Load')
    },
    onUnload() {
        console.log('App Unload')
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

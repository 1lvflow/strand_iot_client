<template>
  <view class="webview-page">
    <web-view 
      :src="webUrl" 
      @message="onMessage"
      @error="onError"
      @load="onLoad"
    />
  </view>
</template>

<script>
export default {
  data() {
    return {
      webUrl: ''
    }
  },
  onLoad(options) {
    if (options && options.url) {
      let url = decodeURIComponent(options.url)
      
      // 处理 URL
      if (url.startsWith('http') || url.startsWith('file://')) {
        this.webUrl = url
      }
      
      // 璁剧疆椤甸潰鏍囬
      if (options.title) {
        uni.setNavigationBarTitle({ title: decodeURIComponent(options.title) })
      }
    }
  },
  methods: {
    onMessage(e) {
      console.log('webview message:', e.detail.data)
    },
    onError(e) {
      console.error('webview error:', e.detail.src)
      uni.showToast({ title: '鍔犺浇澶辫触', icon: 'none' })
    },
    onLoad() {
      console.log('webview loaded')
    }
  }
}
</script>

<style lang="scss" scoped>
.webview-page {
  width: 100%;
  height: 100vh;
  background: #000;
}

web-view {
  width: 100%;
  height: 100%;
}
</style>

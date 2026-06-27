<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	page {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		min-height: 100vh;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
	}

	.container {
		padding: 20rpx;
	}

	.card {
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(20px);
		border-radius: 24rpx;
		padding: 30rpx;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 16rpx;
		padding: 24rpx 48rpx;
		font-size: 32rpx;
		font-weight: 500;
		border: none;
	}

	.text-white {
		color: #ffffff;
	}

	.text-gray {
		color: rgba(255, 255, 255, 0.6);
	}

	.text-sm {
		font-size: 24rpx;
	}

	.text-md {
		font-size: 28rpx;
	}

	.text-lg {
		font-size: 32rpx;
	}

	.text-xl {
		font-size: 40rpx;
	}
</style>
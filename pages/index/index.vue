<template>
  <view class="page" v-if="pageReady">
    <view class="header">
      <view class="header-left">
        <text class="header-title">IoT遥控器</text>
      </view>
      <view class="header-right">
        <view class="header-icon" @click="showCategoryManage = true">
          <text class="icon-text">☰</text>
        </view>
      </view>
    </view>

    <scroll-view class="category-scroll" scroll-x enable-flex>
      <view 
        v-for="cat in categories" 
        :key="cat.id" 
        :class="['category-item', { active: currentCategory === cat.id }]"
        @click="currentCategory = cat.id"
      >
        <text class="category-name">{{ cat.name }}</text>
      </view>
      <view class="add-category" @click="showAddCategory = true">
        <text class="add-icon">+</text>
      </view>
    </scroll-view>

    <scroll-view class="card-scroll" scroll-y>
      <view class="card-grid">
        <view 
          v-for="card in filteredCards" 
          :key="card.id" 
          class="card-item"
          @click="openCard(card)"
          @longpress="onLongPress(card)"
        >
          <view class="card-icon-wrapper">
            <image 
              v-if="card.icon && (card.icon.startsWith('http') || card.icon.includes('.png') || card.icon.includes('.jpg'))"
              :src="card.icon" 
              class="card-icon-img" 
              mode="aspectFit"
            />
            <text v-else class="card-icon-emoji">{{ card.icon || '📱' }}</text>
          </view>
          <text class="card-name">{{ card.name }}</text>
        </view>

        <view class="add-card" @click="showAddCard = true">
          <view class="add-card-inner">
            <text class="add-card-icon">+</text>
            <text class="add-card-text">添加卡片</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="showAddCard" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingCard ? '编辑卡片' : '添加卡片' }}</text>
          <view class="modal-close" @click="closeModal">
            <text>✕</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">卡片名称</text>
            <input 
              v-model="cardForm.name" 
              class="form-input" 
              placeholder="请输入卡片名称"
              placeholder-class="placeholder"
            />
          </view>
          <view class="form-item">
            <text class="form-label">选择图标</text>
            <view class="icon-selector">
              <view 
                v-for="icon in defaultIcons" 
                :key="icon.id"
                :class="['icon-option', { selected: cardForm.icon === icon.path }]"
                @click="cardForm.icon = icon.path"
              >
                <image v-if="icon.path.includes('.png')" :src="icon.path" class="icon-img" mode="aspectFit" />
                <text v-else class="icon-emoji">{{ icon.path }}</text>
              </view>
            </view>
            <view class="custom-icon-btn" @click="chooseCustomIcon">
              <text>选择自定义图标</text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">选择HTML文件</text>
            <view v-if="htmlFiles.length > 0" class="html-selector">
              <view 
                v-for="file in htmlFiles" 
                :key="file.path"
                :class="['html-option', { selected: cardForm.htmlPath === file.path }]"
                @click="cardForm.htmlPath = file.path"
              >
                <text class="html-file-name">{{ file.name }}</text>
                <view class="html-delete-btn" @click.stop="confirmDeleteHtml(file)">
                  <text>删除</text>
                </view>
              </view>
            </view>
            <view class="custom-html-btn" @click="chooseExternalHtml">
              <text>选择外部HTML文件</text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">选择分类</text>
            <picker :value="categoryIndex" :range="categories" range-key="name" @change="onCategoryChange">
              <view class="picker-value">
                <text>{{ categories[categoryIndex]?.name || '请选择分类' }}</text>
                <text class="picker-arrow">▾</text>
              </view>
            </picker>
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn-cancel" @click="closeModal">
            <text>取消</text>
          </view>
          <view class="btn-confirm" @click="saveCard">
            <text>保存</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showCategoryManage" class="modal-overlay" @click="showCategoryManage = false">
      <view class="modal-content small" @click.stop>
        <view class="modal-header">
          <text class="modal-title">分类管理</text>
          <view class="modal-close" @click="showCategoryManage = false">
            <text>✕</text>
          </view>
        </view>
        <view class="modal-body">
          <view v-for="cat in categories" :key="cat.id" class="category-manage-item">
            <text :class="{ 'default-category': cat.id === 'all' }">{{ cat.name }}</text>
            <view v-if="cat.id !== 'all'" class="delete-category" @click="deleteCategory(cat.id)">
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showAddCategory" class="modal-overlay" @click="showAddCategory = false">
      <view class="modal-content small" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加分类</text>
          <view class="modal-close" @click="showAddCategory = false">
            <text>✕</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">分类名称</text>
            <input 
              v-model="newCategoryName" 
              class="form-input" 
              placeholder="请输入分类名称"
              placeholder-class="placeholder"
            />
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn-cancel" @click="showAddCategory = false">
            <text>取消</text>
          </view>
          <view class="btn-confirm" @click="addCategory">
            <text>添加</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showExternalPathInput" class="modal-overlay" @click="showExternalPathInput = false">
      <view class="modal-content small" @click.stop>
        <view class="modal-header">
          <text class="modal-title">输入外部HTML路径</text>
          <view class="modal-close" @click="showExternalPathInput = false">
            <text>✕</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">文件路径</text>
            <input 
              v-model="externalFilePath" 
              class="form-input" 
              placeholder="例如: file:///storage/emulated/0/static_htmls/xxx.html"
              placeholder-class="placeholder"
            />
            <view class="path-hint">
              <text>安卓SD卡路径示例: file:///storage/emulated/0/static_htmls/xxx.html</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn-cancel" @click="showExternalPathInput = false">
            <text>取消</text>
          </view>
          <view class="btn-confirm" @click="confirmExternalPath">
            <text>确认</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
      <view class="modal-content small confirm-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ confirmModal.title }}</text>
        </view>
        <view class="modal-body">
          <text class="confirm-message">{{ confirmModal.content }}</text>
        </view>
        <view class="modal-footer">
          <view class="btn-cancel" @click="showConfirmModal = false">
            <text>取消</text>
          </view>
          <view class="btn-confirm" @click="confirmModal.onConfirm(); showConfirmModal = false">
            <text>确认</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showCardActionSheet" class="action-sheet-overlay" @click="showCardActionSheet = false">
      <view class="action-sheet" @click.stop>
        <view class="action-sheet-header">
          <text class="action-sheet-title">{{ selectedCard?.name || '卡片操作' }}</text>
        </view>
        <view class="action-sheet-body">
          <view class="action-sheet-item" @click="editCard(selectedCard); showCardActionSheet = false">
            <text>编辑</text>
          </view>
          <view class="action-sheet-item danger" @click="deleteCard(selectedCard.id); showCardActionSheet = false">
            <text>删除</text>
          </view>
        </view>
        <view class="action-sheet-cancel" @click="showCardActionSheet = false">
          <text>取消</text>
        </view>
      </view>
    </view>

    <view v-if="showExternalHtmlSheet" class="action-sheet-overlay" @click="showExternalHtmlSheet = false">
      <view class="action-sheet" @click.stop>
        <view class="action-sheet-header">
          <text class="action-sheet-title">选择HTML文件来源</text>
        </view>
        <view class="action-sheet-body">
          <view class="action-sheet-item" @click="openSystemFilePicker(); showExternalHtmlSheet = false">
            <text>从系统文件管理器选择</text>
          </view>
          <view class="action-sheet-item" @click="checkManageStoragePermission(() => { selectFromSDCard(); showExternalHtmlSheet = false; })">
            <text>从SD卡HTML目录选择</text>
          </view>
        </view>
        <view class="action-sheet-cancel" @click="showExternalHtmlSheet = false">
          <text>取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      pageReady: false,
      categories: [
        { id: 'all', name: '全部' },
        { id: 'living', name: '全屋' },
        { id: 'bedroom', name: '卧室' },
        { id: 'study', name: '书房' },
        { id: 'toy', name: '玩具' }
      ],
      currentCategory: 'all',
      cards: [],
      showAddCard: false,
      showCategoryManage: false,
      showAddCategory: false,
      showExternalPathInput: false,
      externalFilePath: '',
      editingCard: null,
      _pendingFilePick: null,
      newCategoryName: '',
      defaultIcons: [
        { id: '1', name: '电视', path: '📺' },
        { id: '2', name: '空调', path: '❄️' },
        { id: '3', name: '灯光', path: '💡' },
        { id: '4', name: '风扇', path: '🌀' },
        { id: '5', name: '音响', path: '🔊' },
        { id: '6', name: '窗帘', path: '🪟' },
        { id: '7', name: '摄像头', path: '📹' },
        { id: '8', name: '门锁', path: '🔒' },
        { id: '9', name: '温度', path: '🌡️' },
        { id: '10', name: '湿度', path: '💧' },
        { id: '11', name: '电源', path: '🔌' },
        { id: '12', name: '遥控器', path: '🎮' },
        { id: '13', name: 'LED', path: '✨' },
        { id: '14', name: '音乐', path: '🎵' },
        { id: '15', name: 'WiFi', path: '📶' },
        { id: '16', name: '默认', path: '🔷' }
      ],
      htmlFiles: [],
      cardForm: {
        name: '',
        icon: '🔷',
        htmlPath: '',
        category: 'living'
      },
      showConfirmModal: false,
      confirmModal: {
        title: '',
        content: '',
        onConfirm: () => {}
      },
      showCardActionSheet: false,
      selectedCard: null,
      showExternalHtmlSheet: false
    }
  },
  computed: {
    categoryIndex() {
      return this.categories.findIndex(c => c.id === this.cardForm.category)
    },
    filteredCards() {
      if (this.currentCategory === 'all') {
        return this.cards
      }
      return this.cards.filter(card => card.category === this.currentCategory)
    }
  },
  onLoad() {
    this.loadCards()
    const savedHtmlFiles = uni.getStorageSync('iot_html_files')
    if (savedHtmlFiles) {
      this.htmlFiles = JSON.parse(savedHtmlFiles)
    }
    this.loadExternalHtmlFiles()
    this.$nextTick(() => {
      this.pageReady = true
    })
  },
  onShow() {
    this.loadCards()
    const savedHtmlFiles = uni.getStorageSync('iot_html_files')
    if (savedHtmlFiles) {
      this.htmlFiles = JSON.parse(savedHtmlFiles)
    }
    this.loadExternalHtmlFiles()
    this.pageReady = false
    this.$nextTick(() => {
      this.pageReady = true
    })
  },
  onBackPress() {
    if (!this._backTimeout) {
      uni.showToast({ title: '再按一次退出', icon: 'none' })
      this._backTimeout = setTimeout(() => { this._backTimeout = null }, 2000)
      return true
    }
    plus.runtime.quit()
    return true
  },
  methods: {
    loadCards() {
      try {
        const saved = uni.getStorageSync('iot_cards')
        if (saved) {
          this.cards = JSON.parse(saved)
        } else {
          this.cards = []
          this.saveCards()
        }
      } catch (e) {
        this.cards = []
      }
    },
    saveCards() {
      uni.setStorageSync('iot_cards', JSON.stringify(this.cards))
    },
    saveHtmlFiles() {
      uni.setStorageSync('iot_html_files', JSON.stringify(this.htmlFiles))
    },
    loadExternalHtmlFiles() {
      if (typeof plus !== 'undefined') {
        plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
          fs.root.getDirectory('static_htmls', { create: false }, (dir) => {
            dir.createReader().readEntries((entries) => {
              const externalFiles = entries.filter((entry) => {
                return entry.isFile && entry.name.toLowerCase().endsWith('.html')
              }).map((entry) => ({
                name: entry.name,
                path: 'file://' + entry.fullPath
              }))
              
              externalFiles.forEach((extFile) => {
                const exists = this.htmlFiles.some((f) => f.path === extFile.path)
                if (!exists) {
                  this.htmlFiles.push(extFile)
                }
              })
              
              this.htmlFiles.sort((a, b) => {
                if (a.name.startsWith('cpy_') && !b.name.startsWith('cpy_')) {
                  return -1
                }
                if (!a.name.startsWith('cpy_') && b.name.startsWith('cpy_')) {
                  return 1
                }
                return b.name.localeCompare(a.name)
              })
              this.saveHtmlFiles()
            }, () => {
              uni.showToast({ title: '读取外部HTML目录失败', icon: 'none' })
            })
          }, () => {
          })
        }, () => {
          uni.showToast({ title: '无法访问应用私有目录', icon: 'none' })
        })
      }
    },
    openCard(card) {
      let url = card.htmlPath
      uni.navigateTo({
        url: '/pages/webview/webview?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(card.name)
      })
    },
    onLongPress(card) {
      this.selectedCard = card
      this.showCardActionSheet = true
    },
    closeModal() {
      this.showAddCard = false
      this.editingCard = null
      this.cardForm = {
        name: '',
        icon: '🔷',
        htmlPath: '',
        category: 'living'
      }
    },
    editCard(card) {
      this.editingCard = card
      this.cardForm = {
        name: card.name,
        icon: card.icon,
        htmlPath: card.htmlPath,
        category: card.category
      }
      this.showAddCard = true
    },
    deleteCard(id) {
      this.showConfirmModal = true
      this.confirmModal = {
        title: '确认删除',
        content: '确定要删除这个卡片吗？',
        onConfirm: () => {
          this.cards = this.cards.filter(c => c.id !== id)
          this.saveCards()
          uni.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    },
    confirmDeleteHtml(file) {
      this.showConfirmModal = true
      this.confirmModal = {
        title: '确认删除',
        content: '确定要删除文件 "' + file.name + '" 吗？',
        onConfirm: () => {
          this.deleteHtmlFile(file)
        }
      }
    },
    deleteHtmlFile(file) {
      if (file.path && file.path.startsWith('file://')) {
        const nativePath = file.path.substring(7)
        plus.io.resolveLocalFileSystemURL(nativePath, (entry) => {
          entry.remove(() => {
            this.htmlFiles = this.htmlFiles.filter(f => f.path !== file.path)
            if (this.cardForm.htmlPath === file.path) {
              this.cardForm.htmlPath = ''
            }
            uni.showToast({ title: '文件已删除', icon: 'success' })
            this.saveHtmlFiles()
          }, (err) => {
            uni.showModal({ title: '错误', content: '删除文件失败: ' + err.message, showCancel: false })
          })
        }, (err) => {
          uni.showModal({ title: '错误', content: '找不到文件: ' + err.message, showCancel: false })
        })
      }
    },
    saveCard() {
      if (!this.cardForm.name.trim()) {
        uni.showToast({ title: '请输入卡片名称', icon: 'none' })
        return
      }
      if (!this.cardForm.htmlPath) {
        uni.showToast({ title: '请选择HTML文件', icon: 'none' })
        return
      }

      const isValidPath = this.cardForm.htmlPath.startsWith('file://') || 
                         this.cardForm.htmlPath.startsWith('http')
      
      if (!isValidPath) {
        uni.showModal({ title: '错误', content: '无效的HTML文件路径', showCancel: false })
        return
      }

      const existsInList = this.htmlFiles.some((f) => f.path === this.cardForm.htmlPath)
      if (!existsInList && !this.cardForm.htmlPath.startsWith('http')) {
        uni.showModal({ title: '警告', content: '所选HTML文件不在可用列表中，是否继续？', confirmText: '继续', cancelText: '取消',
          success: (res) => {
            if (!res.confirm) {
              return
            }
            this.doSaveCard()
          }
        })
        return
      }

      this.doSaveCard()
    },
    doSaveCard() {
      if (this.editingCard) {
        const index = this.cards.findIndex(c => c.id === this.editingCard.id)
        if (index !== -1) {
          this.cards[index] = {
            ...this.editingCard,
            ...this.cardForm
          }
        }
        uni.showToast({ title: '修改成功', icon: 'success' })
      } else {
        const newCard = {
          id: Date.now().toString(),
          ...this.cardForm
        }
        this.cards.push(newCard)
        uni.showToast({ title: '添加成功', icon: 'success' })
      }

      this.saveCards()
      this.closeModal()
    },
    chooseCustomIcon() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.cardForm.icon = res.tempFilePaths[0]
        },
        fail: () => {
          uni.showToast({ title: '选择失败', icon: 'none' })
        }
      })
    },
    chooseExternalHtml() {
      if (typeof plus !== 'undefined') {
        this.showExternalHtmlSheet = true
      } else {
        this.showExternalPathInput = true
      }
    },
    getHtmlFileName(path) {
      if (!path) return ''
      return path.substring(path.lastIndexOf('/') + 1) || path
    },
    checkManageStoragePermission(callback) {
      try {
        const mainActivity = plus.android.runtimeMainActivity()
        const Build = plus.android.importClass('android.os.Build')
        const Environment = plus.android.importClass('android.os.Environment')
        
        const sdkInt = plus.android.getAttribute(Build.VERSION, 'SDK_INT')
        if (sdkInt >= 30) {
          const isManager = plus.android.invoke(Environment, 'isExternalStorageManager')
          if (isManager) {
            callback()
          } else {
            uni.showModal({
              title: '需要文件管理权限',
              content: 'Android 11+ 需要开启"管理所有文件"权限才能访问SD卡文件，是否前往设置开启？',
              confirmText: '去设置',
              success: (res) => {
                if (res.confirm) {
                  this.openManageStorageSettings(callback)
                }
              }
            })
          }
        } else {
          plus.android.requestPermissions(
            ['android.permission.READ_EXTERNAL_STORAGE'],
            (result) => {
              if (result.granted.length > 0) {
                callback()
              } else {
                uni.showToast({ title: '未获取存储权限', icon: 'none' })
              }
            }
          )
        }
      } catch (e) {
        uni.showToast({ title: '权限检查失败: ' + e.message, icon: 'none' })
      }
    },
    openManageStorageSettings(callback) {
      try {
        const mainActivity = plus.android.runtimeMainActivity()
        const Intent = plus.android.importClass('android.content.Intent')
        const Uri = plus.android.importClass('android.net.Uri')
        
        const intent = new Intent('android.settings.MANAGE_APP_ALL_FILES_ACCESS_PERMISSION')
        const packageName = plus.android.invoke(mainActivity, 'getPackageName')
        const uriObj = plus.android.invoke(Uri, 'parse', 'package:' + packageName)
        plus.android.invoke(intent, 'setData', uriObj)
        
        const REQUEST_CODE = 1003
        const that = this
        
        mainActivity.onActivityResult = function(requestCode, resultCode, data) {
          if (requestCode === REQUEST_CODE) {
            const Environment = plus.android.importClass('android.os.Environment')
            const isManager = plus.android.invoke(Environment, 'isExternalStorageManager')
            if (isManager) {
              if (callback) callback()
            } else {
              uni.showToast({ title: '未开启文件管理权限', icon: 'none' })
            }
          }
        }
        
        plus.android.invoke(mainActivity, 'startActivityForResult', intent, REQUEST_CODE)
      } catch (e) {
        uni.showToast({ title: '打开设置失败: ' + e.message, icon: 'none' })
      }
    },
    openSystemFilePicker() {
      try {
        const mainActivity = plus.android.runtimeMainActivity()
        const Intent = plus.android.importClass('android.content.Intent')
        
        const intent = new Intent('android.intent.action.GET_CONTENT')
        plus.android.invoke(intent, 'setType', '*/*')
        plus.android.invoke(intent, 'addCategory', 'android.intent.category.OPENABLE')
        
        const REQUEST_CODE = 1002
        const RESULT_OK = -1
        const that = this
        
        this._pendingFilePick = function(resultCode, data) {
          console.log('resultCode:', resultCode, 'RESULT_OK:', RESULT_OK, 'data:', data)
          
          if (resultCode === RESULT_OK && data) {
            try {
              const uri = plus.android.invoke(data, 'getData')
              
              let fileName = ''
              try {
                const contentResolver = plus.android.invoke(mainActivity, 'getContentResolver')
                const cursor = plus.android.invoke(contentResolver, 'query', uri, null, null, null, null)
                if (cursor != null) {
                  const moved = plus.android.invoke(cursor, 'moveToFirst')
                  if (moved) {
                    const displayNameIndex = plus.android.invoke(cursor, 'getColumnIndex', '_display_name')
                    if (displayNameIndex >= 0) {
                      fileName = plus.android.invoke(cursor, 'getString', displayNameIndex) || ''
                    }
                  }
                  plus.android.invoke(cursor, 'close')
                }
              } catch (e) {
                console.log('query cursor error:', e)
              }
              
              if (!fileName) {
                const uriStr = plus.android.invoke(uri, 'toString')
                const decodedUri = decodeURIComponent(uriStr)
                const lastSlash = decodedUri.lastIndexOf('/')
                if (lastSlash >= 0) {
                  fileName = decodedUri.substring(lastSlash + 1)
                }
              }
              
              console.log('fileName:', fileName, 'uri:', uri)
              
              if (!fileName || !fileName.toLowerCase().endsWith('.html')) {
                fileName = 'controller_' + Date.now() + '.html'
              }
              
              that.copyExternalFileToApp(uri, fileName, mainActivity)
            } catch (e) {
              uni.showModal({ title: '错误', content: '处理文件失败: ' + e.message, showCancel: false })
            }
          } else if (data) {
            try {
              const uri = plus.android.invoke(data, 'getData')
              if (uri) {
                let fileName = ''
                try {
                  const contentResolver = plus.android.invoke(mainActivity, 'getContentResolver')
                  const cursor = plus.android.invoke(contentResolver, 'query', uri, null, null, null, null)
                  if (cursor != null) {
                    const moved = plus.android.invoke(cursor, 'moveToFirst')
                    if (moved) {
                      const displayNameIndex = plus.android.invoke(cursor, 'getColumnIndex', '_display_name')
                      if (displayNameIndex >= 0) {
                        fileName = plus.android.invoke(cursor, 'getString', displayNameIndex) || ''
                      }
                    }
                    plus.android.invoke(cursor, 'close')
                  }
                } catch (e) {
                  console.log('query cursor error:', e)
                }
                
                if (!fileName) {
                  const uriStr = plus.android.invoke(uri, 'toString')
                  const decodedUri = decodeURIComponent(uriStr)
                  const lastSlash = decodedUri.lastIndexOf('/')
                  if (lastSlash >= 0) {
                    fileName = decodedUri.substring(lastSlash + 1)
                  }
                }
                
                console.log('fileName:', fileName, 'uri:', uri)
                
                if (!fileName || !fileName.toLowerCase().endsWith('.html')) {
                  fileName = 'controller_' + Date.now() + '.html'
                }
                
                that.copyExternalFileToApp(uri, fileName, mainActivity)
              } else {
                uni.showModal({ title: '提示', content: '未获取到文件URI', showCancel: false })
              }
            } catch (e) {
              uni.showModal({ title: '错误', content: '处理文件失败: ' + e.message, showCancel: false })
            }
          } else {
            uni.showModal({ title: '提示', content: '未选择文件 (resultCode=' + resultCode + ')', showCancel: false })
          }
          that._pendingFilePick = null
        }
        
        mainActivity.onActivityResult = function(requestCode, resultCode, data) {
          if (requestCode === REQUEST_CODE && that._pendingFilePick) {
            that._pendingFilePick(resultCode, data)
          }
        }
        
        plus.android.invoke(mainActivity, 'startActivityForResult', intent, REQUEST_CODE)
      } catch (e) {
        uni.showModal({ title: '错误', content: '打开文件管理器失败: ' + e.message, showCancel: false })
      }
    },
    copyExternalFileToApp(uri, fileName, mainActivity) {
      try {
        const contentResolver = plus.android.invoke(mainActivity, 'getContentResolver')
        if (!contentResolver) {
          uni.showModal({ title: '错误', content: '无法获取ContentResolver', showCancel: false })
          return
        }
        
        const inputStream = plus.android.invoke(contentResolver, 'openInputStream', uri)
        if (!inputStream) {
          uni.showModal({ title: '错误', content: '无法打开输入流', showCancel: false })
          return
        }
        
        let fileContent = ''
        try {
          const Scanner = plus.android.importClass('java.util.Scanner')
          const scanner = new Scanner(inputStream, 'UTF-8')
          plus.android.invoke(scanner, 'useDelimiter', '\\A')
          console.log('Scanner created, delimiter set to \\A')
          
          const hasNext = plus.android.invoke(scanner, 'hasNext')
          console.log('Scanner hasNext:', hasNext)
          
          if (hasNext) {
            fileContent = plus.android.invoke(scanner, 'next')
          }
          console.log('Scanner next() done, fileContent length:', fileContent ? fileContent.length : 'empty')
          plus.android.invoke(scanner, 'close')
        } catch (readErr) {
          console.log('读取文件内容异常:', readErr, 'message:', readErr ? readErr.message : 'unknown')
          uni.showModal({ title: '错误', content: '读取文件内容失败: ' + readErr.message, showCancel: false })
          plus.android.invoke(inputStream, 'close')
          return
        }
        
        console.log('Closing inputStream...')
        plus.android.invoke(inputStream, 'close')
        console.log('inputStream closed. fileContent length:', fileContent ? fileContent.length : 'empty')
        
        if (!fileContent || fileContent.length === 0) {
          console.log('fileContent is empty, aborting')
          uni.showModal({ title: '错误', content: '文件内容为空', showCancel: false })
          return
        }
        
        console.log('Requesting PRIVATE_DOC filesystem...')
        plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
          console.log('PRIVATE_DOC filesystem obtained, root:', fs.root.fullPath)
          fs.root.getDirectory('static_htmls', { create: true }, (dir) => {
            console.log('static_htmls directory obtained, fullPath:', dir.fullPath)
            let uniqueFileName = fileName
            while (this.htmlFiles.some(f => f.name === uniqueFileName)) {
              uniqueFileName = 'cpy_' + uniqueFileName
            }
            console.log('Using file name:', uniqueFileName, '(original:', fileName + ')')
            this.createAndWriteFile(dir, uniqueFileName, fileContent)
          }, (err) => {
            console.log('getDirectory error:', err, 'code:', err.code, 'message:', err.message)
            uni.showModal({ title: '错误', content: '无法创建HTML目录: ' + err.message, showCancel: false })
          })
        }, (err) => {
          console.log('requestFileSystem error:', err, 'code:', err.code, 'message:', err.message)
          uni.showModal({ title: '错误', content: '无法访问应用私有目录: ' + err.message, showCancel: false })
        })
      } catch (e) {
        uni.showModal({ title: '错误', content: '复制文件失败: ' + e.message, showCancel: false })
      }
    },
    createAndWriteFile(dir, fileName, fileContent) {
      if (!dir || !fileName || !fileContent) {
        uni.showModal({ title: '错误', content: '参数无效', showCancel: false })
        return
      }
      console.log('createAndWriteFile called, fileName:', fileName, 'content length:', fileContent.length)
      
      dir.getFile(fileName, { create: true, exclusive: false }, (fileEntry) => {
        if (!fileEntry) {
          uni.showModal({ title: '错误', content: '无法创建文件', showCancel: false })
          return
        }
        console.log('fileEntry created, fullPath:', fileEntry.fullPath)
        
        fileEntry.createWriter((writer) => {
          if (!writer) {
            uni.showModal({ title: '错误', content: '无法获取文件写入器', showCancel: false })
            return
          }
          
          writer.onwriteend = () => {
            console.log('writer.onwriteend fired, bytes written:', writer.length)
            let absolutePath = ''
            if (fileEntry.fullPath.startsWith('/storage/')) {
              absolutePath = 'file://' + fileEntry.fullPath
            } else {
              const nativePath = plus.io.convertLocalFileSystemURL('_doc' + fileEntry.fullPath)
              absolutePath = 'file://' + nativePath
            }
            console.log('fileEntry.fullPath:', fileEntry.fullPath, 'absolutePath:', absolutePath)
            
            dir.getFile(fileName, { create: false }, (verifyEntry) => {
              console.log('File verified, fullPath:', verifyEntry.fullPath)
              uni.showToast({ title: '复制成功: ' + fileName, icon: 'success' })
              this.cardForm.htmlPath = absolutePath
              
              const exists = this.htmlFiles.some((f) => f.path === absolutePath)
              if (!exists) {
                this.htmlFiles.push({ name: fileName, path: absolutePath })
                
                this.htmlFiles.sort((a, b) => {
                  if (a.name.startsWith('cpy_') && !b.name.startsWith('cpy_')) {
                    return -1
                  }
                  if (!a.name.startsWith('cpy_') && b.name.startsWith('cpy_')) {
                    return 1
                  }
                  return b.name.localeCompare(a.name)
                })
                this.saveHtmlFiles()
              }
            }, (err) => {
              console.log('File verification failed:', err)
              uni.showModal({ title: '错误', content: '验证文件创建失败: ' + (err.message || '未知错误'), showCancel: false })
            })
          }
          
          writer.onerror = (err) => {
            console.log('writer.onerror:', err)
            uni.showModal({ title: '错误', content: '写入文件失败: ' + (err?.message || '未知错误'), showCancel: false })
          }
          
          try {
            console.log('Writing fileContent as string, length:', fileContent.length)
            writer.write(fileContent)
          } catch (writeErr) {
            console.log('Write exception:', writeErr)
            uni.showModal({ title: '错误', content: '写入文件异常: ' + writeErr.message, showCancel: false })
          }
        }, (err) => {
          console.log('createWriter failed:', err)
          uni.showModal({ title: '错误', content: '无法创建文件写入器: ' + (err.message || ''), showCancel: false })
        })
      }, (err) => {
        console.log('getFile failed:', err)
        uni.showModal({ title: '错误', content: '无法创建文件: ' + fileName + ' - ' + (err.message || ''), showCancel: false })
      })
    },
    getUniqueFileName(dir, fileName, callback, depth = 0) {
      if (depth > 10) {
        uni.showModal({ title: '错误', content: '文件名冲突过多，无法生成唯一文件名', showCancel: false })
        return
      }
      
      if (!dir || !fileName || typeof callback !== 'function') {
        uni.showModal({ title: '错误', content: '参数无效', showCancel: false })
        return
      }
      
      dir.getFile(fileName, { create: false }, () => {
        const newFileName = 'cpy_' + fileName
        this.getUniqueFileName(dir, newFileName, callback, depth + 1)
      }, (err) => {
        if (err && err.code !== 1) {
          uni.showModal({ title: '错误', content: '检查文件存在失败: ' + err.message, showCancel: false })
          return
        }
        callback(fileName)
      })
    },
    selectFromSDCard() {
      if (typeof plus !== 'undefined') {
        plus.io.requestFileSystem(plus.io.EXTERNAL, (fs) => {
          fs.root.getDirectory('static_htmls', { create: false }, (dir) => {
            dir.createReader().readEntries((entries) => {
              const htmlFiles = entries.filter((entry) => {
                return entry.isFile && entry.name.toLowerCase().endsWith('.html')
              })
              if (htmlFiles.length === 0) {
                uni.showToast({ title: 'SD卡目录无HTML文件', icon: 'none' })
                return
              }
              const itemList = htmlFiles.map((f) => f.name)
              uni.showActionSheet({
                itemList: itemList,
                success: (res) => {
                  const selected = htmlFiles[res.tapIndex]
                  this.copyLocalFileToApp(selected)
                }
              })
            }, (err) => {
              uni.showToast({ title: '读取目录失败', icon: 'none' })
            })
          }, (err) => {
            plus.io.requestFileSystem(plus.io.EXTERNAL, (fs) => {
              fs.root.createReader().readEntries((entries) => {
                const dirs = entries.filter((entry) => entry.isDirectory)
                const dirNames = dirs.map((d) => d.name)
                if (dirNames.length > 0) {
                  uni.showToast({ title: 'HTML目录不存在，可选目录: ' + dirNames.slice(0, 3).join(', '), icon: 'none' })
                } else {
                  uni.showToast({ title: '无法访问SD卡目录', icon: 'none' })
                }
              })
            })
          })
        }, (err) => {
          uni.showToast({ title: '无法访问SD卡', icon: 'none' })
        })
      }
    },
    copyLocalFileToApp(fileEntry) {
      if (!fileEntry) {
        uni.showModal({ title: '错误', content: '文件对象为空', showCancel: false })
        return
      }
      
      const fileName = fileEntry.name
      if (!fileName || !fileName.toLowerCase().endsWith('.html')) {
        uni.showModal({ title: '错误', content: '无效的HTML文件', showCancel: false })
        return
      }
      
      fileEntry.file((file) => {
        if (!file) {
          uni.showModal({ title: '错误', content: '无法获取文件对象', showCancel: false })
          return
        }
        
        const reader = new FileReader()
        reader.onloadend = (e) => {
          const fileContent = e.target.result
          
          if (!fileContent || fileContent.length === 0) {
            uni.showModal({ title: '错误', content: '文件内容为空', showCancel: false })
            return
          }
          
          plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
            fs.root.getDirectory('static_htmls', { create: true }, (dir) => {
              this.getUniqueFileName(dir, fileName, (uniqueFileName) => {
                this.createAndWriteFile(dir, uniqueFileName, fileContent)
              })
            }, (err) => {
              uni.showModal({ title: '错误', content: '无法创建HTML目录: ' + err.message, showCancel: false })
            })
          }, (err) => {
            uni.showModal({ title: '错误', content: '无法访问应用私有目录: ' + err.message, showCancel: false })
          })
        }
        reader.onerror = (err) => {
          uni.showModal({ title: '错误', content: '读取文件失败: ' + (err?.message || '未知错误'), showCancel: false })
        }
        
        try {
          reader.readAsText(file)
        } catch (readErr) {
          uni.showModal({ title: '错误', content: '读取文件异常: ' + readErr.message, showCancel: false })
        }
      }, (err) => {
        uni.showModal({ title: '错误', content: '获取文件信息失败: ' + (err?.message || '未知错误'), showCancel: false })
      })
    },
    confirmExternalPath() {
      if (this.externalFilePath.trim()) {
        this.cardForm.htmlPath = this.externalFilePath.trim()
        uni.showToast({ title: '已选择外部HTML', icon: 'success' })
        this.showExternalPathInput = false
      } else {
        uni.showToast({ title: '请输入文件路径', icon: 'none' })
      }
    },
    onCategoryChange(e) {
      const index = e.detail.value
      this.cardForm.category = this.categories[index]?.id || 'living'
    },
    addCategory() {
      if (!this.newCategoryName.trim()) {
        uni.showToast({ title: '请输入分类名称', icon: 'none' })
        return
      }
      this.categories.push({
        id: Date.now().toString(),
        name: this.newCategoryName.trim()
      })
      this.newCategoryName = ''
      this.showAddCategory = false
      uni.showToast({ title: '添加成功', icon: 'success' })
    },
    deleteCategory(id) {
      this.showConfirmModal = true
      this.confirmModal = {
        title: '确认删除',
        content: '删除分类后，该分类下的卡片将移动到默认分类',
        onConfirm: () => {
          this.cards.forEach(card => {
            if (card.category === id) {
              card.category = 'living'
            }
          })
          this.categories = this.categories.filter(c => c.id !== id)
          this.saveCards()
          uni.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: env(safe-area-inset-bottom);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 30rpx 20rpx;
  background: transparent;
}

.header-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #ffffff;
}

.header-icon {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.icon-text {
  font-size: 36rpx;
  color: #ffffff;
}

.category-scroll {
  white-space: nowrap;
  padding: 20rpx 30rpx;
  box-sizing: border-box;
}

.category-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 32rpx;
  margin-right: 20rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 40rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: transparent;
  }
}

.category-name {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);

  .category-item.active & {
    color: #ffffff;
    font-weight: 500;
  }
}

.add-category {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 70rpx;
  height: 70rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  border: 1px dashed rgba(255, 255, 255, 0.3);
}

.add-icon {
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.6);
}

.card-scroll {
  height: calc(100vh - 280rpx);
  padding: 20rpx 30rpx;
  box-sizing: border-box;
  overflow-x: hidden;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  width: 100%;
  max-width: 750rpx;
  margin: 0 auto;
}

.card-item {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  padding: 30rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.12);
  }
}

.card-icon-wrapper {
  width: 100rpx;
  height: 100rpx;
  margin: 0 auto 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
}

.card-icon-img {
  width: 60rpx;
  height: 60rpx;
}

.card-icon-emoji {
  font-size: 56rpx;
}

.card-name {
  font-size: 28rpx;
  color: #ffffff;
  text-align: center;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24rpx;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240rpx;
  transition: all 0.3s ease;

  &:active {
    background: rgba(255, 255, 255, 0.08);
  }
}

.add-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.add-card-icon {
  font-size: 56rpx;
  color: rgba(255, 255, 255, 0.4);
}

.add-card-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background: #1e1e2f;
  border-radius: 32rpx 32rpx 0 0;
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  max-height: 80vh;
  overflow-y: auto;

  &.small {
    max-height: 50vh;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
}

.modal-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.6);
  font-size: 28rpx;
}

.modal-body {
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 15rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.icon-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90rpx, 1fr));
  gap: 16rpx;
}

.icon-option {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  border: 2px solid transparent;
  transition: all 0.2s ease;

  &.selected {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.2);
  }
}

.icon-img {
  width: 50rpx;
  height: 50rpx;
}

.icon-emoji {
  font-size: 48rpx;
}

.custom-icon-btn, .custom-html-btn {
  margin-top: 20rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  text-align: center;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.5);
}

.html-selector {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.html-option {
  padding: 20rpx 24rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12rpx;
  border: 2px solid transparent;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;

  &.selected {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.2);
  }
}

.picker-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.picker-arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 24rpx;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 500;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.category-manage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  margin-bottom: 15rpx;
  font-size: 30rpx;
  color: #ffffff;
}

.delete-category {
  color: #ff6b6b;
  font-size: 26rpx;
}

.default-category {
  color: rgba(255, 255, 255, 0.4);
}

.path-hint {
  margin-top: 15rpx;
  padding: 15rpx;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
}

.html-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.html-file-name {
  flex: 1;
}

.html-delete-btn {
  margin-left: 15rpx;
  padding: 8rpx 20rpx;
  background: rgba(255, 68, 68, 0.8);
  border-radius: 8rpx;
  color: white;
  font-size: 24rpx;
}

.html-delete-btn:active {
  background: rgba(255, 68, 68, 0.5);
}

.confirm-modal {
  min-width: 550rpx;
}

.confirm-message {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  line-height: 1.5;
}

.action-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

.action-sheet {
  width: 100%;
  max-width: 750rpx;
  background: #1a1a2e;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.action-sheet-header {
  padding: 40rpx 30rpx 20rpx;
  text-align: center;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.action-sheet-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 30rpx;
  font-weight: 500;
}

.action-sheet-body {
  background: #1a1a2e;
}

.action-sheet-item {
  padding: 35rpx 30rpx;
  text-align: center;
  color: #667eea;
  font-size: 32rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s;
}

.action-sheet-item:active {
  background: rgba(255, 255, 255, 0.05);
}

.action-sheet-item.danger {
  color: #ff6b6b;
}

.action-sheet-cancel {
  padding: 35rpx 30rpx;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 32rpx;
  background: #16213e;
  margin-top: 16rpx;
}

.action-sheet-cancel:active {
  background: rgba(255, 255, 255, 0.05);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>

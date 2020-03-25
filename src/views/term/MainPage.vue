<template>
  <div ref="termdiv">
    <el-tabs v-model="editableTabsValue" type="card" editable @edit="handleTabsEdit">
      <el-tab-pane
        :key="item.tabName"
        v-for="(item, index) in termPaneInfoList"
        :label="item.serverTitle === null ? item.id.toString() : item.serverTitle"
        :name="item.tabName"
      >
        <div class='terminal-div'>
          <div :id="'terminal' + item.id"></div>
        </div>
        <div class='tree-div'>
          <tree-page :mytree="(node, parent) => mytree(node, parent, termPaneInfoList[index])"
                     :showAdd="isShow => showAdd(isShow, termPaneInfoList[index])"
                     :showAddCmdFunc="(isShow, nodeModel) => showAddCmdFunc(isShow, nodeModel, termPaneInfoList[index])"
                     :delCmdFunc="(isChildren, nodeId, parentId) => delCmdFunc(isChildren, nodeId, parentId, termPaneInfoList[index])"
                     :freshTree="() => freshTree(termPaneInfoList[index])"
                     v-bind:ztreeDataSourceList="termPaneInfoList[index].ztreeDataSourceList"></tree-page>
          <el-button v-if="termPaneInfoList[index].isShowAddButton"
                     @click="handleAddServerButton(termPaneInfoList[index])" size="small" type="primary">添加服务器</el-button>
          <el-dialog
            title = '添加服务器'
            :append-to-body="true"
            :visible.sync="termPaneInfoList[index].showAddfolder"
            :before-close="handleClose"
            class="groupListInfoDialog"
          >
            <el-form
              status-icon
              v-if="termPaneInfoList[index].showAddfolder"
              ref="termPaneInfoList[index].formAddFolder"
              label-width="120px"
              :model="termPaneInfoList[index].formAddFolder"
              label-position="labelPosition"
              style="margin-left:-35px;margin-bottom:-35px;margin-top:15px;"
            >
              <el-form-item label="服务器名" prop="name">
                <el-input size="medium" clearable
                          v-model="termPaneInfoList[index].formAddFolder.serverName" placeholder="请输入服务器名，作为文件夹，不能重复"></el-input>
              </el-form-item>
              <el-form-item label="服务器值" prop="value">
                <el-input size="medium"
                          clearable v-model="termPaneInfoList[index].formAddFolder.serverValue" placeholder="请输入服务器值，作为第一条命令"></el-input>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" style="padding-left:5px;">
              <el-button type="primary" @click="addServer(termPaneInfoList[index])">确 定</el-button>
              <el-button @click="cancel(termPaneInfoList[index])">取消</el-button>
            </div>
          </el-dialog>
          <el-dialog
            title = '添加命令'
            :append-to-body="true"
            :visible.sync="termPaneInfoList[index].showAddCmd"
            :before-close="handleClose"
            class="groupListInfoDialog"
          >
            <el-form
              status-icon
              v-if="termPaneInfoList[index].showAddCmd"
              ref="termPaneInfoList[index].formAddCmd"
              label-width="120px"
              :model="termPaneInfoList[index].formAddCmd"
              label-position="labelPosition"
              style="margin-left:-35px;margin-bottom:-35px;margin-top:15px;"
            >
              <el-form-item label="命令名" prop="name">
                <el-input size="medium" clearable
                          v-model="termPaneInfoList[index].formAddCmd.name"></el-input>
              </el-form-item>
              <el-form-item label="命令内容" prop="value">
                <el-input size="medium" clearable
                          v-model="termPaneInfoList[index].formAddCmd.value"></el-input>
              </el-form-item>
              <el-form-item label="命令描述" prop="describtion">
                <el-input size="medium" clearable
                          v-model="termPaneInfoList[index].formAddCmd.describtion"></el-input>
              </el-form-item>
              <el-form-item label="选择分组">
                <el-select
                  size="medium"
                  filterable
                  v-model="termPaneInfoList[index].formAddCmd.cmdType"
                  :disabled="cmdTypeList.length === 0"
                  placeholder="请选择分组"
                >
                  <el-option v-for="item in cmdTypeList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" style="padding-left:5px;">
              <el-button type="primary" @click="addCmd(termPaneInfoList[index])">确 定</el-button>
              <el-button @click="cancelCmd(termPaneInfoList[index])">取消</el-button>
            </div>
          </el-dialog>
        </div>
        <div class = "file-div" v-show="termPaneInfoList[index].showFile">
          <el-form :model="termPaneInfoList[index].formFile">
            <div  v-show="termPaneInfoList[index].showFileDownload">
              <div v-show="termPaneInfoList[index].showFileDownloadInput">
                <el-form-item label="请输入文件名" required>
                  <el-input v-model="termPaneInfoList[index].formFile.fileName" auto-complete="off" class="el-col-width" required></el-input>
                </el-form-item>
              </div>
              <el-form-item>
                <el-button size="small" type="primary" @click="handleDownLoad(termPaneInfoList[index])">下载</el-button>
              </el-form-item>
            </div>
            <div  v-show="termPaneInfoList[index].showFileUpload">
              <el-form-item>
                <!-- 目前一次仅让上传一个文件 TODO. -->
                <el-upload class="upload-demo" :action="'/file/upload'" :on-error="handleUploadError" :before-remove="beforeRemove" multiple :limit="1"
                :on-exceed="handleExceed" :file-list="termPaneInfoList[index].fileList"
                :on-success="(response, file, fileList) => handleUploadSuccess(response, file, fileList, termPaneInfoList[index])" >
                  <el-button size="small" type="primary" @click="submitUpload((termPaneInfoList[index]))">点击上传</el-button>
                  <!-- <div slot="tip" class="el-upload__tip">一次文件不超过50MB</div> -->
                </el-upload>
              </el-form-item>
            </div>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
// 注意：xter@3.8.0版本
import { Terminal } from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
import * as attach from 'xterm/lib/addons/attach/attach'
import 'xterm/dist/xterm.css'
import elementResizeDetectorMaker from 'element-resize-detector'
import treePage from './TreePage.vue'
import 'element-ui/lib/theme-chalk/index.css'// element-ui的css
import wilkTerm from '@/models/term/wilkterm'
import TermPaneInfo from '@/models/term/TermPaneInfo'

Terminal.applyAddon(fit)
Terminal.applyAddon(attach)
const INNER_CMD_PREFIX = 'WILK_IN_'
const defaultPaneInfo = new TermPaneInfo()
let maxTermSize = 1
// https://www.cnblogs.com/freefei/p/8976802.html

export default {
  name: 'MainPage',
  components: { treePage },
  data() {
    return {
      editableTabsValue: '0',
      openedEachServerlen: {},
      termPaneInfoList: [defaultPaneInfo],
      cmdTypeList: [
        {
          id: 0,
          name: '普通命令'
        },
        {
          id: 1,
          name: '服务器地址'
        }
      ]
    }
  },
  methods: {
    async handleTabsEdit(targetName, action) { // eslint-disable-line
      if (action === 'add') {
        const paneInfo = new TermPaneInfo()
        paneInfo.id = maxTermSize
        maxTermSize += 1
        paneInfo.tabName = `${paneInfo.id}`
        this.editableTabsValue = paneInfo.tabName
        const res = await this.freshTree(paneInfo)
        console.log(res.result.length)
        this.termPaneInfoList.push(paneInfo)
      }
      if (action === 'remove') {
        if (this.editableTabsValue === targetName) {
          this.termPaneInfoList.forEach((tab, index) => {
            if (tab.tabName === targetName) {
              const nextTab = this.termPaneInfoList[index + 1] || this.termPaneInfoList[index - 1]
              if (nextTab) {
                this.editableTabsValue = nextTab.tabName
              }
            }
          })
        }
        this.termPaneInfoList = this.termPaneInfoList.filter(tab => tab.tabName !== targetName)
      }
    },
    // 弹框 右上角 X
    handleClose(done) {
      done()
    },
    async handleDownLoad(paneInfo) {
      // window.location.href = '/file/download?fileName=' + paneInfo.formFile.fileName
      // 判断文件名是否为空，弹窗提示 TODO.
      const res = await wilkTerm.fileDownload(paneInfo.formFile.fileName)
      const blob = new Blob([res])
      const downloadElement = document.createElement('a')
      const href = window.URL.createObjectURL(blob) // 创建下载的链接
      downloadElement.href = href
      downloadElement.download = paneInfo.formFile.fileName // 下载后文件名
      document.body.appendChild(downloadElement)
      downloadElement.click() // 点击下载
      document.body.removeChild(downloadElement) // 下载完成移除元素
      window.URL.revokeObjectURL(href) // 释放掉blob对象
      paneInfo.ws.send(`${INNER_CMD_PREFIX}wilkget done ${paneInfo.formFile.fileName}`)
      paneInfo.formFile.fileName = ''
      paneInfo.showFileDownload = false
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择1个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    // eslint-disable-next-line
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    // eslint-disable-next-line
	  handleUploadError(error, file) {
      this.$notify.error({
        title: 'error',
        message: `上传出错:${error}`,
        type: 'error',
        position: 'bottom-right'
      })
    },
    submitUpload(paneInfo) {
      paneInfo.showFileUpload = false
    },
    // eslint-disable-next-line
    handleUploadSuccess(response, file, fileList, paneInfo) { // 目前一次仅让上传一个文件 TODO.
      // 缓存接口调用所需的文件路径
      console.log('文件上传成功')
      paneInfo.ws.send(`${INNER_CMD_PREFIX}wilkput ${file.name}`)
      paneInfo.showFileUpload = false
      paneInfo.formFile.fileName = ''
      paneInfo.fileList = []
    },
    mytree(node, parent, paneInfo) {
      if (paneInfo.openedServerName === null) {
        paneInfo.openedServerName = parent.name
        paneInfo.serverTitle = paneInfo.openedServerName
        if (this.openedEachServerlen[paneInfo.openedServerName] === null
            || this.openedEachServerlen[paneInfo.openedServerName] === undefined) {
          this.openedEachServerlen[paneInfo.openedServerName] = 1
        } else {
          paneInfo.serverTitle = `${paneInfo.openedServerName}(${this.openedEachServerlen[paneInfo.openedServerName]})`
          this.openedEachServerlen[paneInfo.openedServerName] = this.openedEachServerlen[paneInfo.openedServerName] + 1
        }
      }
      // console.log('mytree')
      paneInfo.ws.send(`ZTREE_CMD_${node.id}`)
    },
    handleAddServerButton(paneInfo) {
      paneInfo.isShowAddButton = false
      this.showAdd(true, paneInfo)
    },
    showAdd(isShow, paneInfo) {
      paneInfo.showAddfolder = isShow
    },
    showAddCmdFunc(isShow, nodeModel, paneInfo) {
      console.log('showAddCmdFunc')
      paneInfo.showAddCmd = isShow
      paneInfo.nodeModelTp = nodeModel
    },
    async delCmdFunc(isChildren, nodeId, parentId, paneInfo) {
      // console.log(`delCmdFunc: nodeId: ${nodeId}, parentId: ${parentId}`)
      let res = ''
      if (isChildren) {
        res = await wilkTerm.deleteCmd(nodeId, parentId)
      } else {
        res = await wilkTerm.deleteServer(nodeId)
      }
      this.$message.success(res.result)
      this.freshTree(paneInfo)
    },
    async addServer(paneInfo) {
      console.log('add server')
      if (paneInfo.formAddFolder.serverName === '') {
        this.$message.error('命令名不能为空')
        return
      }
      if (paneInfo.formAddFolder.serverValue === '') {
        this.$message.error('命令内容不能为空')
        return
      }
      const res = await wilkTerm.addServer(paneInfo.formAddFolder.serverName,
        paneInfo.formAddFolder.serverValue)
      this.$message.success(res.result)
      paneInfo.showAddfolder = false
      paneInfo.formAddFolder = {
        serverName: '',
        serverValue: ''
      }
      this.freshTree(paneInfo)
    },
    async addCmd(paneInfo) {
      if (paneInfo.nodeModelTp != null) {
        console.log(paneInfo.nodeModelTp.id)
      }
      if (paneInfo.formAddCmd.name === '') {
        this.$message.error('命令名不能为空')
        return
      }
      if (paneInfo.formAddCmd.value === '') {
        this.$message.error('命令内容不能为空')
        return
      }
      const res = await wilkTerm.addCmd(
        paneInfo.formAddCmd.name,
        paneInfo.formAddCmd.value,
        paneInfo.formAddCmd.describtion,
        paneInfo.formAddCmd.cmdType,
        paneInfo.nodeModelTp.id
      )
      this.$message.success(res.result)
      paneInfo.formAddCmd = {
        name: '',
        value: '',
        describtion: '',
        cmdType: 0
      }
      paneInfo.showAddCmd = false
      this.freshTree(paneInfo)
    },
    cancel(paneInfo) {
      paneInfo.showAddfolder = false
      if (paneInfo.ztreeDataSourceList.length === 0) {
        paneInfo.isShowAddButton = true
      }
      paneInfo.formAddFolder = {
        serverName: '',
        serverValue: ''
      }
    },
    cancelCmd(paneInfo) {
      paneInfo.showAddCmd = false
      paneInfo.formAddCmd = {
        name: '',
        value: '',
        describtion: '',
        cmdType: 0
      }
    },
    async freshTree(paneInfo) {
      // 所有请求都在调用前先判断登录标记是否已invalid，我这个项目的前端请求封装不好 TODO.
      // console.log('freshTree')
      const res = await wilkTerm.freshTree('server/getserverandcmd')
      // console.log(res)
      if (res.result.length === 0) {
        paneInfo.isShowAddButton = true
      } else {
        paneInfo.ztreeDataSourceList = res.result
      }
      if (paneInfo.term === null) {
        this.initTerminal(paneInfo)
      }
      return res
    },
    termResize() {
      for (let i = 0; i < this.termPaneInfoList.length; i++) {
        const paneInfo = this.termPaneInfoList[i]
        if (paneInfo.termInited === true) {
          paneInfo.term.fit()
          // console.log(`${INNER_CMD_PREFIX}stty cols ${paneInfo.term.cols}; stty rows ${paneInfo.term.rows}\r`)
          paneInfo.ws.send(
            `${INNER_CMD_PREFIX}stty cols ${paneInfo.term.cols}; stty rows ${paneInfo.term.rows}\r`
          )
          // console.log('resize', [term.cols, term.rows])
        }
      }
    },
    initTerminal(paneInfo) {
      // 用户打开某服务器后，websocket会有定期保活的功能。
      // 如果用户登录了，但是一直没打开服务器，则过段时间，websocket可能会断开，
      // 要做下防护措施。可以在ws的关闭方法中，再次打开websocket。
      // 也可以在用户发信息前先判断服务器有没有断开，如果断开了，则重连。TODO.
      paneInfo.term = new Terminal(
        { cols: 100,
          rows: 39,
          cursorBlink: 5,
          scrollback: 1000,
          tabStopWidth: 4 }
      )
      paneInfo.ws = new WebSocket('ws://localhost:8088/websocket')
      // eslint-disable-next-line
      paneInfo.ws.onopen = function (event) {
        paneInfo.term.open(document.getElementById(`terminal${paneInfo.id}`))
        paneInfo.term.fit()
        // 如果是组装命令，可以用JSON.stringify来分隔命令跟参数，后端容易做判断。TODO.
        paneInfo.ws.onerror = () => {
          console.log('connect error.')
        }
        // eslint-disable-next-line
        paneInfo.ws.onmessage = function (event) {
          // console.log("click upload")
          // // this.$refs.uploadButton.$emit('click') // 这个应该是针对一般控件的
          // this.$refs.uploadButton.$el.click() // 这个是针对element-ui控件的
          // console.log('on message:', event.data)
          if (event.data === 'wilk-login-success') {
            // console.log(`${INNER_CMD_PREFIX}stty cols ${paneInfo.term.cols}; stty rows ${paneInfo.term.rows}\r`)
            paneInfo.ws.send(
              `${INNER_CMD_PREFIX}stty cols ${paneInfo.term.cols}; stty rows ${paneInfo.term.rows}\r`
            )
            paneInfo.termInited = true
          } else if (event.data.split(' ').length === 2 && event.data.split(' ')[0] === 'BTOF' && event.data.split(' ')[1] === 'wilkput') {
            // 目前不能直接在ws里调用弹出上传文件的窗口，只能是显示上传按钮，用户再自己点击一下了。
            paneInfo.showFileUpload = true
            // document.getElementById("btid").click()
          } else if (event.data.split(' ').length === 3 && event.data.split(' ')[0] === 'BTOF' && event.data.split(' ')[1] === 'wilkget') {
            paneInfo.formFile.fileName = event.data.split(' ')[2] // eslint-disable-line
            paneInfo.showFileDownload = true
          } else {
            paneInfo.term.write(event.data)
            paneInfo.lastCmdHistory = event.data
          }
        }
        paneInfo.term.textarea.onkeydown = e => {
          // https://www.cnblogs.com/gygg/p/11359598.html
          // https://zhidao.baidu.com/question/6865495.html
          // http://www.51hei.com/bbs/dpj-139731-1.html
          if (e.keyCode === 13) { // Enter，这个也是上下键选择的下载，之前用history方式记录了，得优化一下 TODO.
            if (paneInfo.lastCmdHistory === 'wilkput') {
              paneInfo.ws.send(`${INNER_CMD_PREFIX}history_wilkput`)
            } else if (paneInfo.lastCmdHistory.split(' ').length === 2 && paneInfo.lastCmdHistory.split(' ')[0] === 'wilkget') {
              paneInfo.ws.send(`${INNER_CMD_PREFIX}history_wilkget_${paneInfo.lastCmdHistory}`)
            }
          }
        }
        paneInfo.term.on('data', data => {
          // console.log('data =>', data)
          paneInfo.ws.send(data.toString())
        })
      }
    }
  },
  mounted() {
    const that = this // eslint-disable-line
    this.erd = elementResizeDetectorMaker()
    this.erd.listenTo(this.$refs.termdiv, this.termResize)
    console.log(defaultPaneInfo)
    if (defaultPaneInfo.term === null) {
      this.freshTree(defaultPaneInfo)
    }
  }
}
</script>

<style>
@import '../../assets/styles/mainpage.css';
</style>

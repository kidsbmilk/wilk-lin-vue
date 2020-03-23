/* eslint-disable class-methods-use-this */
export default class TermPaneInfo {
  id = 0

  // 目录树相关
  nodeModelTp = null

  formAddCmd = {
    name: '',
    value: '',
    describtion: '',
    cmdType: 0
  }

  formAddFolder = {
    serverName: '',
    serverValue: ''
  }

  fileList = []

  showAddfolder = false

  showAddCmd = false

  showFile = true

  showFileDownloadInput = false

  showFileDownload = false

  showFileUpload = false

  isShowAddButton = false

  ztreeDataSourceList = []

  formFile = {
    fileName: '',
  }

  // xterm.js相关
  term = null

  ws = null

  lastCmdHistory = null

  termInited = false

  openedServerName = null
}

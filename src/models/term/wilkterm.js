/* eslint-disable class-methods-use-this */
import { get, post } from '@/lin/plugins/axios'

// 我们通过 class 这样的语法糖使模型这个概念更加具象化，其优点：耦合性低、可维护性。
class WilkTerm {
  // constructor() {}

  // 类中的方法可以代表一个用户行为
  // 在这里通过 async await 语法糖让代码同步执行
  // 1. await 一定要搭配 async 来使用
  // 2. await 后面跟的是一个 Promise 对象
  async freshTree() {
    const res = await get('server/getserverandcmd')
    return res
  }

  async deleteCmd(cmdId, serverId) {
    const res = await get('cmd/delete', {
      cmdId,
      serverId
    })
    return res
  }

  async addCmd(name, value, describtion, cmdType, serverId) {
    const res = await post('cmd/add', {
      name, value, describtion, cmdType, serverId
    })
    return res
  }

  async deleteServer(serverId) {
    const res = await get('server/delete', {
      serverId
    })
    return res
  }

  async addServer(serverName, serverValue) {
    const res = await get('server/add', {
      serverName,
      serverValue
    })
    return res
  }

  async fileDownload(fileName) {
    const responseType = 'blob'
    const res = await get('/file/download', {
      fileName,
      responseType
    })
    return res
  }
}

export default new WilkTerm()

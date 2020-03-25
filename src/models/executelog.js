/* eslint-disable class-methods-use-this */
import { get } from '@/lin/plugins/axios'

class ExecuteLog {
  name = null

  userId = null

  start = null

  end = null

  keyword = null

  dateSorterDesc = true

  constructor({
    uPage = 0,
    uCount = 5,

    lPage = 0,
    lCount = 15,

    sPage = 0,
    sCount = 15,
  }) {
    if (uPage === 0) {
      this.uPage = uPage
    }
    if (uCount) {
      this.uCount = uCount
    }
    if (lPage === 0) {
      this.lPage = lPage
    }
    if (lCount) {
      this.lCount = lCount
    }
    if (sPage === 0) {
      this.sPage = sPage
    }
    if (sCount) {
      this.sCount = sCount
    }
    // lCount && this.lCount = lCount
  }

  async increseUpage() {
    this.uPage += 1
  }

  async increseLpage() {
    this.lPage += 1
  }

  increseSpage() {
    this.sPage += 1
  }

  init() {
    this.lPage = 0
    this.uPage = 0
    this.sPage = 0
  }

  setBaseInfo(name, userId, start, end) {
    this.name = name
    this.userId = userId
    this.start = start
    this.end = end
  }

  setKeyword(keyword) {
    this.keyword = keyword
  }

  /**
   * 查询已经被记录过命令记录的用户（分页）
   * @param {number} count 每页个数
   * @param {number} page 第几页
   */
  async getLoggedUsers({ count, page }) {
    const users = await get('cmd/execute/log/users', {
      page: page || this.uPage,
      size: count || this.uCount,
    })
    return users.result
  }

  /**
   * 查询日志信息（分页）
   * @param {number} count 每页个数
   * @param {number} page 第几页
   * @param {number} name 用户昵称
   * @param {number} userId 用户id
   * @param {number} start 起始时间 # 2018-11-01 09:39:35
   * @param {number} end 结束时间
   */
  async getLogs({ count, page, name, userId, start, end, dateSorterDesc, next = false }) {
    try {
      if (!next) {
        this.setBaseInfo(name, userId, start, end)
      }
      if (page === 0) {
        this.lPage = 0
      }
      let dateSorterDescTemp = true
      if (dateSorterDesc !== null && dateSorterDesc !== undefined) {
        dateSorterDescTemp = dateSorterDesc
      }
      const res = await get('cmd/execute/log/list', {
        page: page || this.lPage,
        size: count || this.lCount,
        userId: userId || this.userId,
        start: start || this.start,
        end: end || this.end,
        dateSorterDesc: dateSorterDescTemp
      })
      return res.result
    } catch (error) {
      console.log('error', error)
    }
  }

  /**
   * 所搜日志信息（分页）
   * @param {number} count 每页个数
   * @param {number} page 第几页
   * @param {number} keyword 搜索关键词
   * @param {number} name 用户昵称
   * @param {number} userId 用户id
   * @param {number} start 起始时间 # 2018-11-01 09:39:35
   * @param {number} end 结束时间
   */
  async searchLogs({ count, page, keyword, name, userId, start, end, dateSorterDesc, next = false }) {
    if (!next) {
      this.setBaseInfo(name, userId, start, end)
      this.setKeyword(keyword)
    }
    if (page === 0) {
      this.sPage = 0
    }
    try {
      let dateSorterDescTemp = true
      if (dateSorterDesc !== null && dateSorterDesc !== undefined) {
        dateSorterDescTemp = dateSorterDesc
      }
      const res = await get('cmd/execute/log/list', {
        size: count || this.sCount,
        page: page || this.sPage,
        keyword: keyword || this.keyword,
        userId: userId || this.userId,
        start: start || this.start,
        end: end || this.end,
        dateSorterDesc: dateSorterDescTemp
      })
      return res.result
    } catch (error) {
      console.log(error)
    }
  }

  async moreUserPage() {
    await this.increseUpage()
    return this.getLoggedUsers({})
  }

  async moreLogPage() {
    await this.increseLpage()
    return this.getLogs({ next: true })
  }

  async moreSearchPage() {
    this.increseSpage()
    return this.searchLogs({ next: true })
  }
}

export default new ExecuteLog({})

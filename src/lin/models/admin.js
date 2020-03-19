/* eslint-disable class-methods-use-this */
import md5 from 'js-md5'
import { post, get, _delete } from '@/lin/plugins/axios'

export default class Admin {
  constructor(uPage = 0, uCount = 10, gPage = 0, gCount = 5) {
    this.uPage = uPage
    this.uCount = uCount
    this.lPage = gPage
    this.gCount = gCount
  }

  async increseUpage() {
    this.uPage += 1
  }

  async increseGpage() {
    this.lPage += 1
  }

  async decreseUpage() {
    this.uPage -= 1
    if (this.uPage < 0) {
      this.uPage = 0
    }
  }

  async decreseGpage() {
    this.lPage -= 1
    if (this.lPage < 0) {
      this.lPage = 0
    }
  }

  static getAllAuths() {
    return get('admin/permission/all')
  }

  static async getAdminUsers({ group_id, count = this.uCount, page = this.uPag }) {
    let res
    if (group_id) {
      const groupId = group_id
      res = await get('admin/users', {
        count,
        page,
        groupId,
      })
    } else {
      res = await get('admin/users', {
        count,
        page,
      })
    }
    return res
  }

  async nextUsersPage() {
    await this.increseUpage()
    return this.getAdminUsers({})
  }

  async preUsersPage() {
    await this.decreseUpage()
    return this.getAdminUsers({})
  }

  async getGroupsWithAuths({ count = this.uCount, page = this.uPag }) {
    const res = await get('admin/groups', {
      count,
      page,
    })
    return res
  }

  async nextGroupsPage() {
    await this.increseGpage()
    return this.getGroupsWithAuths({})
  }

  async preGroupsPage() {
    await this.decreseGpage()
    return this.getGroupsWithAuths({})
  }

  static async getAllGroups() {
    const groups = await get('admin/group/all')
    return groups.result
  }

  static async getOneGroup(id) {
    const group = await get(`admin/group/${id}`)
    return group.result
  }

  static async createOneGroup(name, info, auths) {
    const res = await post('admin/group/save', {
      name,
      info,
      auths,
    })
    return res
  }

  static async updateOneGroup(name, info, id) {
    const res = await post(`admin/group/modify/${id}`, {
      name,
      info,
    })
    return res
  }

  static async deleteOneGroup(id) {
    const res = await _delete(`admin/group/delete/${id}`)
    return res
  }

  static async deleteOneUser(id) {
    const res = await _delete(`admin/user/delete/${id}`)
    return res
  }

  static async updateOneUser(email, group_id, id) {
    const groupId = group_id
    const res = await post(`admin/user/modify/${id}`, {
      email,
      groupId,
    })
    return res
  }

  static async changePassword(username, new_password, confirm_password, id) {
    const newPassword = md5(username + new_password)
    const confirmPassword = newPassword
    const res = await post(`admin/password/modify/${id}`, {
      newPassword,
      confirmPassword,
    })
    return res
  }

  // 更新、设置权限
  static async dispatchAuths(group_id, auths) {
    const groupId = group_id
    const res = await post('admin/group/auth/add', {
      groupId,
      auths,
    })
    return res
  }

  // 清某某些权限
  static async removeAuths(group_id, auths) {
    const groupId = group_id
    const res = await post('admin/group/auth/remove', {
      groupId,
      auths,
    })
    return res
  }
}

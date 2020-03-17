import md5 from 'js-md5'
import { post, get, put } from '@/lin/plugins/axios'
import { saveTokens } from '../utils/token'

export default class User {
  // 当前用户是否在激活状态
  isActive = null

  // 邮箱
  email = null

  // 权限分组id
  groupId = null

  // 用户名
  username = null

  // 是否为超级管理员
  isSuper = null

  // 拥有的权限
  auths = []

  // 昵称
  nickname = null

  // 分组名称
  groupName = null

  constructor(isActive, email, groupId, username, isSuper, avatar, auths, nickname, groupName) {
    this.isActive = isActive
    this.email = email
    this.groupId = groupId
    this.username = username
    this.avatar = avatar
    this.isSuper = isSuper
    this.auths = auths || []
    this.nickname = nickname
    this.groupName = groupName
  }

  /**
   * 分配用户
   * @param {object} data 注册信息
   */
  static register(data) {
    return post('cms/user/register', data, { handleError: true })
  }

  /**
   * 登陆获取tokens
   * @param {string} username 用户名
   * @param {string} password 密码
   */
  static async getToken(u, p) {
    const username = md5(u + p)
    const password = md5(p + u)
    const res = await post('loginUser', {
      username,
      password,
    })
    let { result } = res // eslint-disable-line
    let { accessToken, refreshToken} = result // eslint-disable-line
    saveTokens(accessToken, refreshToken)
    return result
  }

  /**
   * 获取当前用户信息，并返回User实例
   */
  static async getInformation() {
    const info = await get('cms/user/information')
    return new User(
      info.result.isActive,
      info.result.email,
      info.result.groupId,
      info.result.username,
      info.result.isAdmin,
      info.result.avatar,
      info.result.auths,
      info.result.nickname,
      info.result.groupName,
    )
  }

  // /**
  //  * 获取当前用户信息和所拥有的权限
  //  */
  // static async getAuths() {
  //   const info = await get('cms/user/auths')
  //   return new User(
  //     info.active,
  //     info.email,
  //     info.group_id,
  //     info.username,
  //     info.admin,
  //     info.avatar,
  //     info.auths,
  //     info.nickname,
  //     info.group_name,
  //   )
  // }

  /**
   * 用户修改密码
   * @param {string} newPassword 新密码
   * @param {string} confirmPassword 确认新密码
   * @param {string} oldPassword 旧密码
   */
  static updatePassword({ old_password, new_password, confirm_password }) {
    return put('cms/user/change_password', {
      new_password,
      confirm_password,
      old_password,
    })
  }
}

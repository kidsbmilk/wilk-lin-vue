<template>
  <div class="log">
    <sticky-top>
      <div class="log-header">
        <div class="header-left"><p class="title">命令执行记录信息</p></div>
        <div class="header-right" v-auth="'搜索记录'">
          <span>日期：</span>
          <el-switch size="medium"
            class="executeswitch"
            v-model="dateSorterDesc"
            active-color="#00A854"
            inactive-color="#BFBFBF"
            active-text="倒序"
            inactive-text="正序"
            @change="changeDateSorter"
          >
          </el-switch>
          <lin-search @query="onQueryChange" style="margin: 0 0 0 10px;" ref="searchKeyword" />
          <el-dropdown size="medium" style="margin: 0 10px;" @command="handleCommand" v-auth="'查询记录的用户'">
            <el-button size="medium">
              {{ searchUser ? searchUser : '全部人员' }} <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="['全部人员', 0]">全部人员</el-dropdown-item>
              <el-dropdown-item icon="el-icon-user-solid" v-for="(user, index) in users" :key="index" :command="[user.username, user.id]"
                >{{ user.username }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <lin-date-picker @dateChange="handleDateChange" ref="searchDate" class="date"> </lin-date-picker>
        </div>
      </div>
      <el-divider v-if="!keyword"></el-divider>
    </sticky-top>
    <transition name="fade">
      <div class="search" v-if="keyword">
        <p class="search-tip">
          搜索“<span class="search-keyword">{{ keyword }}</span
          >”， 找到 <span class="search-num">{{ totalCount }}</span> 条记录信息
        </p>
        <button class="search-back" @click="backInit">返回全部记录</button>
      </div>
    </transition>
    <div class="content" v-loading="loading">
      <article>
        <section v-for="log in logs" :key="log.id">
          <span class="point-time"></span>
          <aside>
            <p class="things" v-html="log.cmdValue"></p>
            <p class="brief">
              <span class="text-yellow" v-if="log.serverValue !== log.cmdValue">{{ log.serverValue }}</span> <span class="text-yellow">{{ log.userId }}</span> {{ log.createTime | dateTimeFormatter }}
            </p>
          </aside>
        </section>
      </article>

      <el-divider></el-divider>
      <div class="more" :class="{ nothing: finished }">
        <i v-if="more" class="iconfont icon-loading"></i>
        <div v-show="!more && !finished" @click="nextPage">
          <span>查看更多</span> <i class="iconfont icon-gengduo" style="font-size:14px"></i>
        </div>
        <div v-if="finished">
          <span>{{ totalCount === 0 ? '暂无数据' : '没有更多数据了' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { searchLogKeyword } from 'lin/utils/search'
import LinSearch from '@/components/base/search/lin-search'
import LinDatePicker from '@/components/base/date-picker/lin-date-picker'
import log from '@/models/executelog'

export default {
  components: {
    LinSearch,
    LinDatePicker,
  },
  data() {
    return {
      dateSorterDesc: true,
      log: null,
      value: '',
      logs: [],
      users: [],
      searchUser: '',
      searchUserId: 0,
      more: false,
      loading: false,
      finished: false,
      isSearch: false,
      error: false,
      searchKeyword: '',
      searchDate: [],
      keyword: null,
      totalCount: 0,
    }
  },
  computed: {
    ...mapGetters(['auths', 'user']),
  },
  async created() {
    this.loading = true
    await this.initPage()
    this.loading = false
  },
  watch: {
    // 用户搜索
    searchUser(username) {
      this.keyword = username
      if (this.searchKeyword) {
        this.keyword = `${username} ${this.searchKeyword}`
      }
      if (this.searchDate.length) {
        this.keyword = `${username} ${this.searchKeyword} ${this.searchDate}`
      }
      this.searchPage()
    },
    // 关键字搜索
    searchKeyword(newVal) {
      if (newVal) {
        this.keyword = newVal
        if (this.searchUser) {
          this.keyword = `${this.searchUser} ${newVal}`
        }
        if (this.searchDate.length) {
          this.keyword = `${this.searchUser} ${newVal} ${this.searchDate}`
        }
      } else {
        this.keyword = ''
        if (this.searchUser) {
          this.keyword = `${this.searchUser}`
        }
        if (this.searchDate.length) {
          this.keyword = `${this.searchUser} ${this.searchDate}`
        }
        this.$refs.searchKeyword.clear()
      }
      this.searchPage()
    },
    // 日期搜索
    searchDate(newDate) {
      if (newDate && newDate.length) {
        this.keyword = `${newDate[0]}至${newDate[1]}`
        if (this.searchUser) {
          this.keyword = `${this.searchUser} ${newDate[0]}至${newDate[1]}`
        }
        if (this.searchKeyword) {
          this.keyword = `${this.searchUser} ${this.searchKeyword} ${newDate[0]}至${newDate[1]}`
        }
      } else {
        this.keyword = ''
        this.isSearch = false
        if (this.searchUser) {
          this.keyword = `${this.searchUser}`
        }
        if (this.searchKeyword) {
          this.keyword = `${this.searchUser} ${this.searchKeyword}`
        }
        this.$refs.searchDate.clear()
      }
      this.searchPage()
    },
  },
  methods: {
    changeDateSorter(value) {
      this.dateSorterDesc = value
      // console.log(value)
      this.searchPage()
    },
    // 下拉框
    handleCommand(userItem) {
      this.searchUserId = userItem[1] // eslint-disable-line
      this.searchUser = userItem[0] // eslint-disable-line
    },
    // 页面初始化
    async initPage() {
      try {
        if (this.user.isSuper || this.auths.includes('查询日志记录的用户')) {
          const res = await log.getLoggedUsers({})
          this.users = res.content
        }
        const res = await log.getLogs({ page: 0, dateSorterDesc: this.dateSorterDesc })
        this.logs = res.content
      } catch (err) {
        console.error(err)
      }
    },
    // 条件检索
    async searchPage() {
      this.totalCount = 0
      this.logs = []
      this.loading = true
      this.finished = false
      const name = this.searchUser === '全部人员' ? '' : this.searchUser
      const userId = this.searchUserId
      const res = await log.searchLogs({
        page: 0, // 初始化
        keyword: this.searchKeyword,
        name,
        userId,
        start: this.searchDate[0],
        end: this.searchDate[1],
        dateSorterDesc: this.dateSorterDesc
      })
      if (res) {
        let logs = res.content
        this.totalCount = res.totalElements
        if (this.searchKeyword) {
          logs = await searchLogKeyword(this.searchKeyword, logs)
        }
        this.logs = logs
      } else {
        this.finished = true
      }
      this.isSearch = true
      this.loading = false
    },
    // 下一页
    async nextPage() {
      this.more = true
      let res
      if (this.isSearch) {
        res = await log.moreSearchPage()
      } else {
        res = await log.moreLogPage()
      }
      if (res.content.length > 0) {
        let moreLogs = res.content
        if (this.isSearch && this.searchKeyword) {
          moreLogs = await searchLogKeyword(this.searchKeyword, moreLogs)
        }
        this.logs = this.logs.concat(moreLogs)
      } else {
        this.finished = true
      }
      this.more = false
    },
    onQueryChange(query) {
      // 处理带空格的情况
      this.searchKeyword = query.trim()
    },
    handleDateChange(date) {
      this.searchDate = date
    },
    // 清空检索
    async backInit() {
      this.dateSorterDesc = true
      this.searchUser = ''
      this.searchUserId = 0
      this.searchKeyword = ''
      this.searchDate = []
      this.keyword = ''
      this.logs = []
      this.isSearch = false
      this.loading = true
      await this.initPage()
      this.loading = false
    },
  },
  destroyed() {
    log.init()
  },
}
</script>

<style lang="scss" scoped>
.log /deep/ .el-button {
  padding-top: 10px;
  padding-bottom: 10px;
}
.log {
  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    margin-bottom: -24px;

    .header-left {
      float: left;

      .title {
        height: 59px;
        line-height: 59px;
        color: #4c76af;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .header-right {
      float: right;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .search {
    height: 52px;
    width: 100%;
    background: rgba(57, 99, 188, 0.1);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 24px;

    .search-tip {
      margin-left: 40px;
      height: 52px;
      line-height: 52px;
      color: #354058;
      font-size: 14px;

      .search-keyword {
        color: $theme;
      }

      .search-num {
        color: #f4516c;
      }
    }

    .search-back {
      margin: 8px 20px;
      height: 32px;
      background: #f4516c;
      border: none;
      border-radius: 2px;
      color: #fff;
      padding: 0 13px;
      font-size: 14px;
      cursor: pointer;
    }
  }

  .content {
    padding: 40px 60px;

    article {
      position: relative;
      margin-bottom: -24px;

      section {
        padding: 0 0 36px;
        position: relative;

        &:before {
          content: '';
          width: 1px;
          top: 7px;
          bottom: -17px;
          left: 10.5px;
          background: #f3f3f3;
          position: absolute;
        }

        &:last-child:before {
          display: none;
        }

        .point-time {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          top: 2px;
          left: 10px;
          background: $theme;
          margin-left: -4px;
          border-radius: 50%;
        }

        time {
          width: 15%;
          display: block;
          position: absolute;

          span {
            display: block;
            text-align: right;
          }
        }

        aside {
          color: #45526b;
          margin-left: 30px;

          .things {
            font-size: 14px;
            color: #45526b;
            margin-bottom: 15px;
          }
        }

        .text-yellow {
          color: #8c98ae;
          font-size: 14px;
          line-height: 20px;
          padding-right: 30px;
          float: left;
        }

        .brief {
          font-size: 14px;
          color: #c4c9d2;
          height: 20px;
          line-height: 20px;
        }
      }
    }
  }

  .more {
    height: 40px;
    line-height: 40px;
    color: $theme;
    font-size: 14px;
    margin-left: 28px;
    cursor: pointer;
    &.nothing {
      cursor: text;
    }

    .icon-gengduo {
      display: inline;
      margin-left: 6px;
    }

    .icon-loading {
      &:before {
        display: inline-block;
        animation: spin 1s linear infinite;
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 1000px) {
  .date {
    display: none;
  }
}
</style>
<style>
.executeswitch .el-switch__label {
  position: absolute;
  display: none;
  color: #fff!important;
}
/*打开时文字位置设置*/
.executeswitch .el-switch__label--right {
  z-index: 1;
  right: -3px;
}
/*关闭时文字位置设置*/
.executeswitch .el-switch__label--left {
  z-index: 1;
  left: 19px;
}
/*显示文字*/
.executeswitch .el-switch__label.is-active {
  display: block;
}
.executeswitch.el-switch .el-switch__core,
.el-switch .el-switch__label {
  width: 50px !important;
}
.strong {
  color: #464dd5;
}
</style>

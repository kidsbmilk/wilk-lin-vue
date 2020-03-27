<template>
    <el-drawer
      title="笔记"
      :visible.sync="drawer"
      :with-header="false"
      size="60%"
    >
      <div class="lin-container">
        <div>
          <div style="display: inline; float: left; margin-left: 5%; line-height: 59px;">
            <span class="demonstration">选择笔记：</span>
            <el-cascader
              :key="isResouceShow"
              :disabled="optionsIsDisabled"
              v-model="cascaderValue"
              placeholder="搜一搜"
              :options="noteOptions"
              :props="{ expandTrigger: 'hover' }"
              @change="handleOptionChange"
              clearable
              filterable>
              <template slot-scope="{ node, data }">
                <span>{{ data.label }}</span>
                <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
              </template>
            </el-cascader>
          </div>
          <div class="lin-title" style="display: inline; border-bottom: none;">随手记</div>
          <el-button type="primary" plain v-if="noteId !== ''" @click="openEditNote"
                     style="margin-left: 15%">修改笔记信息</el-button>
          <el-dialog
            title = '修改笔记信息'
            :append-to-body="true"
            :visible.sync="showChangeNoteInfo"
            :before-close="handleClose"
            class="groupListInfoDialog"
          >
            <el-form
              status-icon
              ref="formChangeNoteInfo"
              label-width="120px"
              :model="formChangeNoteInfo"
              label-position="labelPosition"
              style="margin-left:-35px;margin-bottom:-35px;margin-top:15px;"
            >
              <el-form-item label="笔记名" prop="name">
                <el-input size="medium" clearable
                          v-model="formChangeNoteInfo.noteTitle"></el-input>
              </el-form-item>
              <el-form-item label="笔记标签" prop="value">
                <el-tag
                  :key="tag"
                  v-for="tag in formChangeNoteInfo.noteTag"
                  closable
                  :disable-transitions="false"
                  @close="handleCloseTag(tag)">
                  {{tag}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm"
                  @blur="handleInputConfirm"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" style="width: 60px; padding: unset;" @click="showInput">+</el-button>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" style="padding-left:5px;">
              <el-button type="primary" @click="changeNoteInfo">确 定</el-button>
              <el-button @click="cancelChangeNote">取消</el-button>
            </div>
          </el-dialog>
        </div>
        <div class="lin-wrap">
          <tinymce @change="change"
                   :height="height"
                   :defaultContent="defaultContent" />
        </div>
      </div>
    </el-drawer>
</template>

<script>
import Tinymce from '@/components/base/tinymce'
import note from '@/models/note'

export default {
  inject: ['eventBus'],
  data() {
    return {
      cascaderValue: [],
      isResouceShow: 0,
      optionsIsDisabled: false,
      showChangeNoteInfo: false,
      inputVisible: false,
      inputValue: '',
      formChangeNoteInfo: {
        noteTitle: '',
        noteTag: []
      },
      noteId: '',
      lastSavedContent: '',
      height: 700,
      tinymceContent: '',
      drawer: false,
      defaultContent: '',
      noteOptions: [],
    }
  },
  components: {
    Tinymce,
  },
  mounted() {
    this.initContent()
    this.eventBus.$on('noteTap', () => {
      this.drawer = true
    })
  },
  watch: {
    async drawer(newVal) {
      if (!newVal && this.tinymceContent !== this.lastSavedContent) {
        let res = null
        if (this.noteId !== '') {
          res = await note.modify(this.noteId, this.tinymceContent, null, null)
        } else {
          res = await note.save(this.tinymceContent, null, null)
          if (res.code === 0) {
            this.noteId = res.result.toString()
            res = await note.list()
            if (res.code === 0) {
              this.cascaderValue = []
              ++this.isResouceShow
              this.optionsIsDisabled = true
              this.noteOptions = res.result
              this.optionsIsDisabled = false
              const valueTemp = []
              if (this.noteOptions.length > 0 && this.noteOptions[0].children !== null
                  && this.noteOptions[0].children !== undefined && this.noteOptions[0].children.length > 0) {
                valueTemp.push('0')
              }
              valueTemp.push(this.noteId)
              this.cascaderValue = valueTemp
            }
          }
        }
        this.lastSavedContent = this.tinymceContent
        if (res.code === 0) {
          this.$message.success('保存成功')
          // console.log('保存成功')
        }
      }
    }
  },
  methods: {
    openEditNote() {
      this.showChangeNoteInfo = true
    },
    // 弹框 右上角 X
    handleClose(done) {
      done()
    },
    handleCloseTag(tag) {
      this.formChangeNoteInfo.noteTag.splice(this.formChangeNoteInfo.noteTag.indexOf(tag), 1)
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => { // eslint-disable-line
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      if (this.inputValue.indexOf(',') !== -1 || this.inputValue.indexOf('，') !== -1) {
        this.$message.error('标签不能包含逗号！')
        return
      }
      const inputValue = this.inputValue // eslint-disable-line
      if (inputValue) {
        this.formChangeNoteInfo.noteTag.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    async changeNoteInfo() {
      const res = await note.modify(this.noteId, null,
        this.formChangeNoteInfo.noteTitle, this.formChangeNoteInfo.noteTag)
      if (res.code === 0) {
        const oldValue = this.cascaderValue
        this.cascaderValue = []
        ++this.isResouceShow
        this.optionsIsDisabled = true
        this.noteOptions = res.result
        this.optionsIsDisabled = false
        this.cascaderValue = oldValue
        this.showChangeNoteInfo = false
      }
    },
    cancelChangeNote() {
      this.showChangeNoteInfo = false
    },
    async handleOptionChange(value) {
      // console.log(value)
      if (value.length === 0) {
        this.noteId = ''
        this.lastSavedContent = ''
        this.tinymceContent = ''
        this.defaultContent = ''
        this.formChangeNoteInfo = {
          noteTitle: '',
          noteTag: []
        }
        return
      }
      const newNoteId = value[value.length - 1]
      if (this.noteId !== newNoteId) {
        if (this.tinymceContent !== this.lastSavedContent) { // eslint-disable-line
          let res = null
          if (this.noteId !== '') {
            res = await note.modify(this.noteId, this.tinymceContent, null, null)
          } else {
            res = await note.save(this.tinymceContent, null, null)
          }
          if (res.code !== 0) {
            console.log('保存失败！')
          }
        }
        const res = await note.detail(newNoteId)
        if (res.code === 0) {
          this.noteId = res.result.id.toString()
          this.lastSavedContent = res.result.content
          this.tinymceContent = res.result.content
          this.defaultContent = res.result.content
          this.formChangeNoteInfo.noteTitle = res.result.title
          this.formChangeNoteInfo.noteTag = res.result.tag
        }
      }
    },
    async initContent() {
      let res = await note.getTodayNote()
      if (res.code === 0) {
        if (res.result.id) {
          this.noteId = res.result.id.toString()
        }
        this.lastSavedContent = res.result.content
        this.tinymceContent = res.result.content
        this.defaultContent = res.result.content
        this.formChangeNoteInfo.noteTitle = res.result.title
        this.formChangeNoteInfo.noteTag = res.result.tag
      }
      res = await note.list()
      if (res.code === 0) {
        this.noteOptions = res.result
        if (this.noteId !== '') {
          const valueTemp = []
          if (this.noteOptions.length > 0 && this.noteOptions[0].children !== null
              && this.noteOptions[0].children !== undefined && this.noteOptions[0].children.length > 0) {
            valueTemp.push('0')
          }
          valueTemp.push(this.noteId)
          // console.log(valueTemp)
          this.cascaderValue = valueTemp
        }
      }
    },
    change(val) {
      this.tinymceContent = val
      // console.log(val)
    },
  },
}
</script>

<style scoped lang="scss">
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.el-drawer {
  width: 60%;
}
</style>

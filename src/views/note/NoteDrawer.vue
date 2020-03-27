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
              placeholder="搜一搜"
              :options="noteOptions"
              :props="{ expandTrigger: 'hover' }"
              @change="handleOptionChange"
              filterable></el-cascader>
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
                <el-input size="medium"
                          clearable v-model="formChangeNoteInfo.noteTag" placeholder="多个标签以逗号分隔"></el-input>
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
      showChangeNoteInfo: false,
      formChangeNoteInfo: {
        noteTitle: '',
        noteTag: ''
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
            this.noteId = res.result
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
    async changeNoteInfo() {
      const res = await note.modify(this.noteId, null,
        this.formChangeNoteInfo.noteTitle, this.formChangeNoteInfo.noteTag)
      if (res.code === 0) {
        this.noteOptions = res.result
        this.showChangeNoteInfo = false
      }
    },
    cancelChangeNote() {
      this.showChangeNoteInfo = false
    },
    async handleOptionChange(value) {
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
        this.noteId = newNoteId
        const res = await note.detail(newNoteId)
        if (res.code === 0) {
          this.lastSavedContent = res.result.content
          this.tinymceContent = res.result.content
          this.defaultContent = res.result.content
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
      }
      res = await note.list()
      if (res.code === 0) {
        this.noteOptions = res.result
      }
    },
    change(val) {
      this.tinymceContent = val
      console.log(val)
    },
  },
}
</script>

<style scoped lang="scss">
.el-drawer {
  width: 60%;
}
</style>

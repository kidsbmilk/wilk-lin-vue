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

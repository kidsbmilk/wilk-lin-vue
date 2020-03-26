<template>
    <el-drawer
      title="笔记"
      :visible.sync="drawer"
      :with-header="false"
      size="60%"
    >
      <div class="lin-container">
        <div class="lin-title">随手记</div>
        <div class="lin-wrap">
          <tinymce @change="change"
                   :height="height"
                   :imgUploadUrl="imgUploadUrl"
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
      noteId: null,
      lastSavedContent: '',
      height: 700,
      imgUploadUrl: 'image/upload',
      tinymceContent: '',
      drawer: false,
      defaultContent: '',
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
        if (this.noteId) {
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
    async initContent() {
      const res = await note.getTodayNote()
      if (res.code === 0) {
        if (res.result.id) {
          this.noteId = res.result.id
        }
        this.lastSavedContent = res.result.content
        this.tinymceContent = res.result.content
        this.defaultContent = res.result.content
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

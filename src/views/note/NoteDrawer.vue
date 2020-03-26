<template>
    <el-drawer
      title="笔记"
      :visible.sync="drawer"
      :with-header="false"
      size="60%"
    >
      <div class="lin-container">
        <div class="lin-title">随手记</div>
        <div class="lin-wrap"><tinymce @change="change" :height="700" :upload_url="cms/file" /></div>
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
      tinymceContent: '',
      drawer: false,
      text: 'this is default content',
    }
  },
  components: {
    Tinymce,
  },
  mounted() {
    this.eventBus.$on('noteTap', () => {
      this.drawer = true
    })
  },
  watch: {
    async drawer(newVal) {
      if (!newVal) {
        const res = await note.save(this.tinymceContent)
        if (res.code === 0) {
          this.$message.success('保存成功')
          // console.log('保存成功')
        }
      }
    }
  },
  methods: {
    change(val) {
      this.tinymceContent = val
    },
  },
}
</script>

<style scoped lang="scss">
.el-drawer {
  width: 60%;
}
</style>

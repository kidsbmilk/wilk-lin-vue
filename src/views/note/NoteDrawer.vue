<template>
  <div>
    <el-drawer
      title="我是标题"
      :visible.sync="drawer"
      :with-header="false">
      <span>我来啦!</span>
    </el-drawer>
    <div class="lin-container">
      <div class="lin-title">富文本舞台页面</div>
      <div class="lin-wrap"><tinymce @change="change" upload_url="http://dev.lin.colorful3.com/cms/file/" /></div>
    </div>
  </div>
</template>

<script>
import Tinymce from '@/components/base/tinymce'

export default {
  inject: ['eventBus'],
  data() {
    return {
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
  methods: {
    change(val) {
      console.log(val)
    },
  },
}
</script>

<style scoped lang="scss"></style>

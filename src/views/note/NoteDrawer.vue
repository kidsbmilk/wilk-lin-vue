<template>
    <el-drawer
      title="笔记"
      :visible.sync="drawer"
      :with-header="false"
      size="60%"
    >
      <div class="lin-container">
        <div class="lin-title">随手记</div>
        <div class="lin-wrap"><tinymce @change="change" upload_url="http://dev.lin.colorful3.com/cms/file/" /></div>
      </div>
    </el-drawer>
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

<style scoped lang="scss">
.el-drawer {
  width: 60%;
}
</style>

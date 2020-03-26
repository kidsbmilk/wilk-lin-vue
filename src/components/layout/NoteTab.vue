<template>
  <div title="笔记" class="tab" @click="editTab">
    <i class="el-icon-edit-outline" style="height: 0px; font-size: 25px;"></i>
  </div>
</template>
<!--笔记-->
<script>
export default {
  name: 'NoteTab',
  // 浅谈vue中provide和inject 用法：https://www.jianshu.com/p/d34a7df4cd6a
  inject: ['eventBus'],
  methods: {
    editTab() {
      this.eventBus.$emit('noteTap')
    },
  },
}
</script>

<style lang="scss" scoped>
.tab {
  cursor: pointer;
  margin-right: 10px;
  i {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>

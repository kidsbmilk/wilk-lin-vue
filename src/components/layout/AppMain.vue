<template>
  <section class="container">
    <div class="wrapper" id="wrapper">
      <!--
      进入/离开 & 列表过渡：https://cn.vuejs.org/v2/guide/transitions.html
      Vue过渡mode属性踩坑：https://www.cnblogs.com/lhyxq/p/9643619.html
      vue之router-view组件的使用：https://blog.csdn.net/luoyu6/article/details/80098145
      各种内部页面间的跳转都是替换appMain里的内容，也是因为router-view的原因。
      在这个项目中，只有两外使用router-view了：App.vue以及这个AppMain.vue。
      -->
      <transition-group name="fade-transform" mode="out-in">
        <div key="keep">
          <keep-alive>
            <router-view v-if="$route.meta.keepAlive"></router-view>
          </keep-alive>
        </div>
        <div key="notkeep">
          <router-view v-if="!$route.meta.keepAlive"></router-view>
        </div>
      </transition-group>
    </div>
  </section>
</template>
<!--白底舞台-->
<script>
/*
vue 中 export 及 export default 的区别：https://www.cnblogs.com/linzhifen5/p/11904028.html
vue中，new vue({})与export default {} 两者的区别：https://blog.csdn.net/project_sun/article/details/90446609

watch '$route'(to,from)无效 解决方法：https://blog.csdn.net/qq_36913208/article/details/104170655
Vue 中使用watch监听$route 无效问题：https://blog.csdn.net/qq_42946917/article/details/90289777
*/
export default {
  name: 'AppMain',
  watch: {
    $route() {
      if (this.$previewInstance) {
        this.$previewInstance.destroy()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  .wrapper {
    width: 100%;
    height: 100%;
    text-align: left;
  }
}
</style>

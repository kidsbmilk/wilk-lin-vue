<template>
  <div class="nav-title">
    <!--
    VUE中演示v-for为什么要加key：https://www.jianshu.com/p/4bd5e745ce95
    -->
    <a class="item" v-for="(item, index) in titleArr" style="cursor: default;" :key="index">
      <!-- <i v-if="index===0"
         :class="item.meta.icon"></i> -->
      <p>{{ item }}</p>
    </a>
  </div>
</template>
<!--面包屑导航-->
<script>
export default {
  data() {
    return {}
  },
  /*
  Vue的computed和watch的细节全面分析：https://segmentfault.com/a/1190000012948175
  Vue中computed和watch的区别：https://www.cnblogs.com/jiajialove/p/11327945.html
   */
  computed: {
    stageInfo() {
      return this.$store.getters.getStageInfo(this.$route.name)
    },
    titleArr() {
      // js中的 !! 和 ! 的区别：https://blog.csdn.net/weixin_33739523/article/details/94700264
      return this.stageInfo.map(item => item.title).filter(item => !!item)
    },
  },
  // created() {},
  // mounted() {},
  // watch: {},
  // components: {},
}
</script>

<style lang="scss">
.nav-title {
  display: flex;
  align-items: center;
  font-size: 14px;

  .item {
    i {
      margin-right: 4px;
    }

    display: flex;
    align-items: center;
    padding-right: 18px;
    position: relative;
    color: $right-side-font-color;

    &:after {
      content: '/';
      position: absolute;
      top: 0;
      right: 6px;
    }
  }

  .item:last-child {
    color: $theme;
    padding-right: 0;

    &:after {
      content: '';
    }
  }
}
</style>

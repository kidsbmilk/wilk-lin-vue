<style>
body {
    font-family: Helvetica, sans-serif;
}
.iconClassRoot {
    width: 15px;
    height: 15px;
    display: inline-block;
    background: url("../../assets/img/ztree/root.png") no-repeat center/100% auto;
}
.iconClassNode {
    width: 15px;
    height: 15px;
    display: inline-block;
    background: url("../../assets/img/ztree/node.png") no-repeat center/100% auto;
}
.operate {
    display: flex;
}
.operate ul > li {
    float: left;
    margin: 10px 10px;
    list-style-type: none;
}
</style>
<template>
    <div v-if='ztreeDataSourceList.length>0' @contextmenu="showMenu">
        <vue-context-menu :contextMenuData="contextMenuData" @newServer="newServer" @freshTreeHere="freshTreeHere"></vue-context-menu>
        <vue-ztree :list.sync='ztreeDataSourceList' :contextmenu='contextmenuClick' :addNode2="addNode2" :delNode2="delNode2" :func='nodeClick' :is-open='true'
            :is-check='false' ></vue-ztree>
    </div>
</template>

<script>
import vueZtree from './vue-ztree.vue'

export default {
  name: 'TreePage',
  data() {
    return {
      msg: 'Hello Vue-Ztree-2.0!',
      ztreeDataSource: [],
      dataList: [],
      treeDeepCopy: [],
      parentNodeModel: [], // 当前点击节点父亲对象
      nodeModel: null, // 当前点击节点对象
      contextMenuData: {
        // the contextmenu name(@1.4.1 updated)
        menuName: 'demo',
        // The coordinates of the display(菜单显示的位置)
        axis: {
          x: null,
          y: null
        },
        // Menu options (菜单选项)
        menulists: [
          {
            fnHandler: 'newServer', // Binding events(绑定事件)
            icoName: 'fa fa-home fa-fw', // icon (icon图标 )
            btnName: '新建环境' // The name of the menu option (菜单名称)
          },
          {
            fnHandler: 'freshTreeHere', // Binding events(绑定事件)
            icoName: 'fa fa-home fa-fw', // icon (icon图标 )
            btnName: '刷新' // The name of the menu option (菜单名称)
          },
        ]
      }
    }
  },
  props: {
    mytree: {
      type: Function,
      default: null
    },
    showAdd: {
      type: Function,
      default: null
    },
    showAddCmdFunc: {
      type: Function,
      default: null
    },
    delCmdFunc: {
      type: Function,
      default: null
    },
    ztreeDataSourceList: {
      type: Array,
      required: true
    },
    freshTree: {
      type: Function,
      default: null
    }
  },
  methods: {
    navigateClick(index, item) {
      // 递归
      // eslint-disable-next-line
      const recurFunc = (data, list) => {
        data.forEach(i => {
          if (i.id === item.id) {
            i.clickNode = true
            this.nodeModel = i
            this.parentNodeModel = data
          } else {
            i.clickNode = false
          }

          if (i.children) {
            recurFunc(i.children, i)
          }
        })
      }
      recurFunc(this.treeDeepCopy, this.treeDeepCopy)
      // 导航
      const self = this
      for (let i = 0; i < self.dataList.length; i++) {
        self.dataList[i].clickNode = index === i
      }
      self.dataList.splice(index + 1, self.dataList.length - (index + 1))
      this.ztreeDataSource = this.treeDeepCopy
    },
    findById(data, parentId) {
      const vm = this
      for (let i = 0; i < data.length; i++) {
        if (parentId === data[i].id) {
          vm.dataList.push(data[i])
          vm.findById(vm.ztreeDataSource, data[i].parentId)
          return data[i]
        }
        // eslint-disable-next-line
        if (data[i].hasOwnProperty('children')) {
          vm.findById(data[i].children, parentId)
        }
      }
    },
    // 点击节点
    // eslint-disable-next-line
    nodeClick(m, parent, trees) {
      this.showAdd(false)
      this.showAddCmdFunc(false, null)
      if (parent.name === undefined) {
        console.log('父节点')
        return
      }
      // console.log(parent.name)
      console.log(m.name)
      console.log(m.id)
      // eslint-disable-next-line
      this.mytree('ZTREE_CMD_' + m.id) // 这个一定要加this
    },
    // 右击事件
    // eslint-disable-next-line
    contextmenuClick(event) {
      console.log('右击')
      // console.log(event.target);
      // console.log("触发了自定义的contextmenuClick事件");
      // alert("触发了自定义");
      this.showAdd(false)
      this.showAddCmdFunc(false, null)
    },
    showMenu(event) {
      event.preventDefault()
      const x = event.clientX
      const y = event.clientY
      // Get the current location
      this.contextMenuData.axis = {
        x, y
      }
    },
    newServer() {
      this.showAdd(true)
    },
    addNode2(nodeModel) {
      console.log('addNode2')
      this.showAddCmdFunc(true, nodeModel)
    },
    delNode2(isChildren, nodeId, parentId) {
      console.log('delNode2')
      this.delCmdFunc(isChildren, nodeId, parentId)
    },
    freshTreeHere() {
      console.log('freshTreeHere')
      this.freshTree()
    }
  },
  components: {
    vueZtree
  }
}
</script>

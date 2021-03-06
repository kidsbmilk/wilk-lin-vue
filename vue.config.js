const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  lintOnSave: true,
  productionSourceMap: false,
  // assetsDir: 'static',
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('lin', resolve('src/lin'))
      .set('assets', resolve('src/assets'))
    config.module
      .rule('md')
      .test(/\.md$/)
      .use('vue-loader')
      .loader('vue-loader')
      .end()
      .use("vue-markdown-loader")
      .loader('vue-markdown-loader/lib/markdown-compiler')     
  },
  configureWebpack: {
    resolve: {
      alias: {
          vue$: "vue/dist/vue.esm.js", //加上这一句
      },
      extensions: ['.js', '.json', '.vue', '.scss', '.html'],
    },
  },
  css: {
    loaderOptions: {
      sass: {
        data: '@import "@/assets/styles/share.scss";',
      },
    },
  },
  devServer: {},
  // node_modules依赖项es6语法未转换问题
  transpileDependencies: [
    'vuex-persist',
  ],
}

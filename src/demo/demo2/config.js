const host = 'http://xxx.com/api'; // 测试地址

module.exports = {
  dev: {
    // proxy代理配置
    proxyTable: {
      '/api': {
        target: host, // 源地址
        changeOrigin: true, // 改变源
        logLevel: 'debug',
        ws: true,
        pathRewrite: {
          '^/api': '', // 路径重写
        },
      },
    },

    // 是否启用postcss-pxtorem插件 https://github.com/cuth/postcss-pxtorem
    // pxtorem: true
  },
  build: {
    // build输出路径
    assetsRoot: '',
    publichPath: '',
  },
};

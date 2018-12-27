'use strict'
const path = require('path')
const config = require('../config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const packageConfig = require('../package.json')
/* 这里以下是添加的部分 ----------------------------  */
const paths = require('../config/paths')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
/* 添加的部分结束 ----------------------------  */
exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader',
        publicPath:'../../' // 这里是添加的内容，用于处理css中对图片和字体的引用
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}


/* 这里以下是添加的部分 ----------------------------  */
exports.getEntry = () => {
  const entryPath = path.resolve(paths.projectPath, 'entry')
  const entryNames = fs
      .readdirSync(entryPath)
      .filter(n => /\.js$/g.test(n))
      .map(n => n.replace(/\.js$/g, ''))
  const entryMap = {}

  entryNames.forEach(
      name =>
      (entryMap[name] = [
          ...['babel-polyfill', path.resolve(entryPath, `${name}.js`)]
      ])
  )
  return entryMap
}

exports.getRewrites = baseWebpackConfig => {
  const rewrites = []
  const entryNames = Object.keys(baseWebpackConfig.entry)
  entryNames.forEach(name => {
      rewrites.push({
          from: entryNames.length > 1 ? new RegExp(`^\/${name}\/.*$`, '') : /.*/,
          to: path.posix.join(config.dev.assetsPublicPath, `${name}.html`)
      })
  })
  console.log('getRewrites',rewrites)
  return rewrites
}

exports.getHtmlWebpackPlugin = baseWebpackConfig => {
  const HtmlWebpackPluginList = []
  const entryNames = Object.keys(baseWebpackConfig.entry)
  entryNames.forEach(name => {
      HtmlWebpackPluginList.push(
          new HtmlWebpackPlugin(
              Object.assign({
                      filename: config.build.filename && process.env.NODE_ENV == 'production' ? config.build.filename : `${name}.html`,
                      template: config.build.template && process.env.NODE_ENV == 'production' ? path.resolve(
                          paths.projectPath, config.build.template) : path.resolve(
                          paths.projectPath,
                          `${name}.html`
                      ),
                      inject: true,
                      excludeChunks: entryNames.filter(n => n !== name)
                  },
                  process.env.NODE_ENV === 'production' ? {
                      minify: {
                          removeComments: true,
                          collapseWhitespace: true
                              // removeAttributeQuotes: true
                      },
                      chunksSortMode: 'dependency'
                  } : {}
              )
          )
      )
  })
  return HtmlWebpackPluginList
}

exports.getCopyWebpackPlugin = () => {
  const projectStaticPath = path.resolve(paths.projectPath, 'static')
  const assetsSubDirectory =
      process.env.NODE_ENV === 'production' ?
      config.build.assetsSubDirectory :
      config.dev.assetsSubDirectory
  const rootConfig = {
      from: paths.static,
      to: assetsSubDirectory,
      ignore: ['.*']
  }
  const projectConfig = {
      from: projectStaticPath,
      to: assetsSubDirectory,
      ignore: ['.*']
  }
  return [
      new CopyWebpackPlugin(
          fs.existsSync(projectStaticPath) ? [rootConfig, projectConfig] : [rootConfig]
      )
  ]
}
/* 添加的部分结束 ----------------------------  */

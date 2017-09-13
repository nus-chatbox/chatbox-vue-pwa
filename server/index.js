var config = require('../config')
var port = process.env.PORT || config.dev.port
var path = require('path')
var express = require('express')
var app = express()


if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development"
}

// for HTML5 history mode
app.use(require('connect-history-api-fallback')())

// Serving pre-built front-end in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static('dist'))
} else {
  var webpack = require('webpack')
  var webpackConfig = require('../build/webpack.dev.conf')
  var compiler = webpack(webpackConfig)

  var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
  })

  var hotMiddleware = require('webpack-hot-middleware')(compiler, {
    log: false,
    heartbeat: 2000
  })

  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
      hotMiddleware.publish({ action: 'reload' })
      cb()
    })
  })

  app.use(devMiddleware)
  app.use(hotMiddleware)

  var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
  app.use(staticPath, express.static('./static'))
}

var server = app.listen(port)
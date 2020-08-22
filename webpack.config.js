const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
// eslint-disable-next-line max-len
const MiniCssExtractPlugin = require('mini-css-extract-plugin') //переносит css из js

const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

const filename = ext => isDev ? `bundle.${ext}` : `bundle.[hash].${ext}`
const jsLoaders = () => { //функция добавляющая в use module лоадеры
  const loaders = [
    {
      loader: 'babel-loader', //лоадер babel
      options: {
        presets: ['@babel/preset-env']
      },
    }
  ]
  if (isDev) {
    loaders.push('eslint-loader')
  }

  return loaders
}

module.exports = {
  context: path.resolve(__dirname, 'src'), //указываем корневую папку
  mode: 'development', //Режим разработки
  // eslint-disable-next-line max-len
  entry: ['@babel/polyfill', './index.js'], //Точка входа приложения, babel/polyfill решает проблему с runtime assync
  output: {
    filename: filename('js'), //Выходящий Файл сборки
    path: path.resolve(__dirname, 'dist') //Файл попадает в dist
  },
  resolve: {
    extensions: ['.js'],
    alias: { // Пути до файлов
      // eslint-disable-next-line max-len
      '@': path.resolve(__dirname, 'src'), // @import - путь до корневой папки src
      '@core': path.resolve(__dirname, 'src'), //@core = src/core
    }
  },
  devtool: isDev ? 'source-map' : false, //добавление source-map к dev версии
  devServer: { // Dev Server для webpack
    port: 3002, //указываем стандартный порт
    hot: isDev
  },
  plugins: [
    new CleanWebpackPlugin(), // Отчистка папки dist
    new HTMLWebpackPlugin({
      template: 'index.html', // Указываем корневой файл index.html
      minify: {
        removeComments: isProd,
        collapseWhitespace: isProd
      }
    }),
    new CopyPlugin({ // Плагин копирует файлы из src в dist
      patterns: [
        {
          from: path.resolve(__dirname, 'src/favicon.ico'), //Копируем favicon
          to: path.resolve(__dirname, 'dist') //из src в dist
        }
      ],
    }),
    new MiniCssExtractPlugin({
      filename: filename('css') // Собирает css файлы в файл
    })
  ],
  module: { //Подключение лоадеров
    rules: [ //Добавлеие правил для лоадеров
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader, //подключение css лоадера
            options: {
              hmr: isDev,
              reloadAll: true
            }
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      }
    ],
  },
}

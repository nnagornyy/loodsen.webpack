const path = require('path');
const fs = require('fs');
const glob = require("glob");

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  resolve: {
    alias: {
      "component": path.resolve(__dirname, '../../src/components'),
      "script": path.resolve(__dirname, '../../src/scripts'),
      "style": path.resolve(__dirname, './src/style'),
      "img": path.resolve(__dirname, './src/img'),
    },
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules']
  },
  entry: {},
  output: {
    path: path.join(__dirname),
    filename: "[name]/script.js"
  },
  plugins: [
    new MiniCssExtractPlugin({filename: '[name]/style.css', chunkFilename: '[id].css'}),
    new VueLoaderPlugin(),
  ],
  optimization: {
    runtimeChunk: {
      name: 'build/js/runtime',
    },
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
      // `...`,
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: false,
          name: 'vendor',
          filename: 'build/js/vendor/[name]-bundle.js',
        },
        styles: {
          name: "build/css/",
          type: "css/mini-extract",
          chunks: 'all',
          enforce: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: false,
          filename: 'build/js/shared/[id]-bundle.js',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            'scss': 'vue-style-loader!css-loader!sass-loader',
            'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
          }
        }
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: ''
            }
          },
          {loader: "css-loader", options: {url: true}},
          {loader: "less-loader"}
        ]
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: ''
            }
          },
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: ''
            }
          },
          "css-loader", // translates CSS into CommonJS
          "sass-loader", // creates style nodes from JS strings
        ]
      },
      {
        test: /\.styl$/,
        use: [
          // {loader: MiniCssExtractPlugin.loader},
          "css-loader", // translates CSS into CommonJS
          "stylus-loader", // creates style nodes from JS strings
        ]
      },{
        test: /\.(woff(2)?|png|jpe?g|gif|svg|ttf)$/i,
        loader: 'file-loader',
        options: {
          publicPath: '/local/modules/loodsen.webpack/assets',
          outputPath: './assets',
          name: '[name].[contenthash:7].[ext]',
        },
      },
    ],
  }
}

const registerStyleExt = ['.sass', '.scss', '.styl', '.less'];
const result = {};
const srcPaths = glob.sync("../../**/source/",
    {
      "dot":true,
      ignore:
          [
            "../node_modules*/**",
            "**/node_modules/**",
            "../local/node_modules/**",
            "../local/vendor/**",
            "../local/js/**",
            "../../bitrix/**"
          ]
    });
console.log(srcPaths);

if(srcPaths.length){
  srcPaths.forEach(srcDir => {
    srcDir = './' + srcDir;
    let watchPaths = [];

    let parentPath = path.join(srcDir,'../');

    if(!fileExist(parentPath + 'bundle.config.js')){
      if(fileExist(srcDir + 'script.ts')){
        watchPaths.push(srcDir + 'script.ts');
      }else if(fileExist(srcDir + 'script.js')){
        watchPaths.push(srcDir + 'script.js');
      }

      registerStyleExt.forEach(ext => {
        let styleFileName = 'style' + ext;
        let styleCount = 0;
        if(fileExist(srcDir + styleFileName) && styleCount === 0){
          watchPaths.push(srcDir + styleFileName);
          styleCount++;
        }
      })

      //if any file exist
      if(watchPaths.length > 0){
        result[path.join(srcDir,'../')] = watchPaths;
        createIgnoreFile(path.join(srcDir,'../'));
      }

    }
  })
}
console.log(result);
module.exports.entry = result;

function createIgnoreFile(path){
  fs.writeFileSync(path + '.gitignore', 'script.js');
}

function fileExist(path){
  try {
    fs.accessSync(path);
    return true;
  }catch (err){
    return false;
  }
}

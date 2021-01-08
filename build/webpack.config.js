const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");


module.exports = {
    entry: ['@babel/polyfill', './src/index.js'],
    mode: 'development',
    // devtool: 'inline-source-map',
    devtool: 'eval-cheap-module-source-map',


    resolve: {

        extensions: ['.js', '.css'],
        alias: {
            '@': path.resolve(__dirname, '../src')
        }

    },

    output: {

        // 输出路径
        path: path.resolve(__dirname,'../dist'),
        // 输出文件名
        filename: 'bundle.js',
        // source map文件名
        sourceMapFilename: 'assets/[file].map',
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules\/(?!(three)\/).*/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            "@babel/plugin-proposal-class-properties",
                            "@babel/plugin-transform-classes"
                        ]
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            showErrors: true,
            inject: 'body',
            template: './src/demo1.html'
        }),
        new CopyPlugin({
            patterns: [
                { from: "./src/assets", to: "./assets" }
            ],
        }),
    ],

    // optimization: {
    //     minimize: true,
    //     minimizer: [new TerserPlugin({
    //     terserOptions: {
    //       format: {
    //         comments: false,
    //       },
    //     },
    //     extractComments: false,
    //   })]
    // },

};

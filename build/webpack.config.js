const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: './src/index.js',
    mode: 'development',
    devtool: 'inline-source-map',

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

    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()]
    },

};

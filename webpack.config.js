'use strict';

var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: [
      'webpack/hot/only-dev-server',
      path.resolve(__dirname, 'src', 'index.js')
    ],

    output: {
        path: path.resolve(__dirname, 'build'),
        filename: "bundle.js"
    },

    module: {
        loaders: [
            { test: /\.js?$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/ },
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
            { test: /\.css$/, loader: "style!css" }
        ]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],

    devServer: {
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: true,
	colors: true
    }
};

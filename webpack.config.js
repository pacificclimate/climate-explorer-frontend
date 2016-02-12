'use strict';

var path = require('path');
var webpack = require('webpack');

var ExtractTextPlugin = require('extract-text-webpack-plugin');


const GLOBALS = {
    'process.env.NODE_ENV': (process.env.NODE_ENV !== 'production') ? '"development"' : '"production"',
    'CE_BACKEND_URL': JSON.stringify(process.env.CE_BACKEND_URL || ((process.env.NODE_ENV !== 'production') ? 'http://localhost:8000/api' : 'http://tools.pacificclimate.org/climate-data')),
    'TILECACHE_URL': JSON.stringify(process.env.TILECACHE_URL || 'http://tiles.pacificclimate.org/tilecache/tilecache.py'),
    'NCWMS_URL': JSON.stringify(process.env.NCWMS_URL || 'http://tools.pacificclimate.org/ncWMS-PCIC/wms'),
    'CE_ENSEMBLE_NAME': JSON.stringify(process.env.CE_ENSEMBLE_NAME || 'ce')
};

const AUTOPREFIXER_BROWSERS = [
  'Chrome >= 35',
  'Firefox >= 31',
  'Explorer >= 9',
  'Opera >= 12',
  'Safari >= 7.1'
];

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
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }, {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader')
            }, {
                test: /\.(png|jpg)$/,
                loader: 'url-loader?limit=10000'
            }, {
                test: /\.woff$/,
                loader: 'file-loader?name=fonts/[name].[ext]'
            }
        ]
    },

    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.ProvidePlugin({$: "jquery", jQuery: "jquery"}),
        new webpack.DefinePlugin(GLOBALS),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin('style.css', { allChunks: true }),
    ],

    postcss: function plugins(bundler) {
        return [
            require('postcss-import')({ addDependencyTo: bundler }),
            require('postcss-cssnext')({ autoprefixer: AUTOPREFIXER_BROWSERS })
        ];
    },

    devServer: {
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: true,
	    colors: true
    },
    devtool: (process.env.NODE_ENV !== 'production') ? 'source-map' : '',
    // 'node' and 'externals' added as a fix to make xlsx.js work with Webpack. See: https://github.com/SheetJS/js-xlsx/issues/285
    node: {
            fs: 'empty'
    },
    externals: [
        {
            './cptable': 'var cptable'
        }
    ]
};

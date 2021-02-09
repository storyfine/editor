const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const isDev = process.env.NODE_ENV === 'development'

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    };
    if (!isDev) {
        config.minimizer = [
            new OptimizeCssAssetWebpackPlugin(),
            new TerserWebpackPlugin()
        ];
    }
    return config;
};
  
const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

const babelOptions = preset => {
    const opts = {
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    };
    if (preset) {
        opts.presets.push(preset);
    }
    return opts;
};

const jsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: babelOptions()
    }];
    if (isDev) {
        loaders.push('eslint-loader');
    }
    return loaders;
};

module.exports = {
    context: path.resolve(__dirname, 'src'),
    entry: './Main.js',
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js', '.json', '.vue', '.scss']
    },
    optimization: optimization(),
    devServer: {
      port: 4200,
      hot: isDev
    },
    devtool: isDev ? 'source-map' : '',
    plugins: [
        new HTMLWebpackPlugin({
            template: './static/index.html',
            minify: {
                collapseWhitespace: !isDev
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/static/favicon.ico'),
                    to: path.resolve(__dirname, 'dist')
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: filename('css')
        }),
        new VueLoaderPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                use: ['file-loader']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: jsLoaders()
            },
            {
                test: /\.vue$/,
                use: ['vue-loader']
            }
        ]
    }
}
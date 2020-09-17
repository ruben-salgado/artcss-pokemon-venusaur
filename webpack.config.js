const path                      = require('path');

const webpack                   = require('webpack');
const HtmlWebpackPlugin         = require('html-webpack-plugin');
const UglifyJsPlugin            = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin   = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin }    = require('clean-webpack-plugin');
const MiniCssExtractPlugin      = require('mini-css-extract-plugin');

const title                    = 'Pokemon CSS';
const publicPath               = 'pokemon/venusaur/';
const portServer               = 9000;

module.exports = function (env) {
    var isProd = false;

    if (env != null && env.production) {
        isProd = true;
    }

    var configUseCssDev = ["style-loader", "css-loader", 'sass-loader'];
    var configUseCssProd = [{
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: process.env.NODE_ENV === 'development',
                reloadAll: true,
            },
        },
        {
            loader: "css-loader",
            options: {
                sourceMap: true
            }
        },
        "sass-loader"
    ];

    var configUseCss = isProd ? configUseCssProd : configUseCssDev;

    return {
        context: path.resolve(__dirname, "src"),
        entry: {
            app: './app.js'
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: './[name].[hash].js'
        },
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            publicPath: '/'+publicPath,
            open: {
                app: ['chrome', '--incognito', '--other-flag']
            },
            openPage: publicPath,
            port: portServer
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    styles: {
                        name: 'styles',
                        test: /\.css$/,
                        chunks: 'all',
                        enforce: true,
                    },
                },
            },
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: false
                })
            ]
        },
        plugins: [
            new CleanWebpackPlugin({
                cleanAfterEveryBuildPatterns: ['dist']
            }),
            new HtmlWebpackPlugin({
                template: './template/index.pug',
                title: title,
                filename: 'index.html',
                minify: true,
                hash: true
            }),
            new MiniCssExtractPlugin({
                filename: isProd ? '[name].[hash:8].css' : '[name].css',
                chunkFilename: isProd ? '[id].[hash:8].css' : '[id].css',
            }),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.css$/g,
                cssProcessor: require('cssnano'),
                cssProcessorPluginOptions: {
                    preset: ['default', {
                        discardComments: {
                            removeAll: true
                        }
                    }],
                },
                canPrint: true
            }),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin()
        ],
        module: {
            rules: [{
                    test: /\.pug$/i,
                    use: ['pug-loader']
                },
                {
                    test: /\.(sa|sc|c)ss$/i,
                    use: configUseCss
                },
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    use: [
                        'file-loader',
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                mozjpeg: {
                                    progressive: true,
                                    quality: 65
                                },
                                optipng: {
                                    enabled: false,
                                },
                                pngquant: {
                                    quality: [0.50, 0.80],
                                    speed: 10,
                                    strip: true
                                },
                                gifsicle: {
                                    interlaced: false,
                                },
                                webp: {
                                    quality: 50
                                }
                            }
                        },
                    ],
                },
            ],
        }
    }
}
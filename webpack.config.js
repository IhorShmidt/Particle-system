module.exports = {
    entry: './js/main.js',
    output: {
        filename: 'main.js',
        path: __dirname + '/dist/',
    },
    devServer: {
        port: 8000,
    },
    // resolve: {
    //     extensions: ['.ts', '.js'],
    // },
    module: {
        rules: [
            {
                test: /\.coffee$/,
                use: [
                    {
                        loader: 'coffee-loader',
                        options: {
                            transpile: {
                                presets: ['env']
                            }
                        }
                    }
                ]
            }
        ]
    }
};

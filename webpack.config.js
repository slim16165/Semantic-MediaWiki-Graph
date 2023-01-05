const path = require('path');
const UpdateResourceLoaderConfig = require("update-resourceloader-config-plugin");

var conf = {
    // entry: {
    //     index: './includes/js/app.js',
    //     'resources/ext.gather.special.collection/init': './resources/ext.gather.special.collection/init.js'
    // },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: path.resolve(__dirname, 'includes/js')
            },
            // altri loaders...
        ],
        loaders: [
            // ...
        ],
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
    },
    plugins: [
        new UpdateResourceLoaderConfig({
            i18n: 'mw.msg'
        })
    ]
};
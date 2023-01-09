// Generated using webpack-cli https://github.com/webpack/webpack-cli
// see advice here: https://github.com/wikimedia/mediawiki-extensions-Popups/blob/master/webpack.config.js
// and here: https://www.mediawiki.org/wiki/User:Jdlrobson/Developing_with_Webpack_and_ResourceLoader

const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );
const path = require("path");
const webpack = require('webpack');

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: "./includes/js/app.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    open: true,
    host: "localhost",
  },
  // Accurate source maps at the expense of build time. The source map is intentionally exposed
  // to users via sourceMapFilename for prod debugging. This goes against convention as source
  // code is publicly distributed.
  devtool: 'source-map',
  plugins: [
    // Delete the output directory on each build.
    new CleanWebpackPlugin( {
      cleanOnceBeforeBuildPatterns: [ '**/*', '!.eslintrc.json' ]
    } ),
    new webpack.ProvidePlugin({
      identifier: 'select2',
    }),
  ],
    module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      }
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};

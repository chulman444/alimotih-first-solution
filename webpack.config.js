const CopyPlugin = require('copy-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = {
  entry: {
    popup: './src/popup.tsx',
    contentScript: './src/contentScript.ts',
    background: './src/background.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json' },
        { from: 'src/**/*.html', flatten: true },
        { from: 'src/**/*.css', flatten: true }
      ]
    }),
    new ProgressBarPlugin()
  ]
}
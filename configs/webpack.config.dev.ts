import webpack from 'webpack';
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import path from 'path';
import base from './webpack.config.base';

export default {
  ...base,
  mode: 'development',
  entry: [base.entry as string, 'webpack/hot/poll?100'],
  devtool: 'inline-source-map',
  watch: true,
  externals: [
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../node_modules'),
      allowlist: ['webpack/hot/poll?100', /^@white-rabbit\//],
    }),
  ],
  plugins: [new webpack.HotModuleReplacementPlugin(), new RunScriptWebpackPlugin({ name: 'index.js' })],
} as webpack.Configuration;

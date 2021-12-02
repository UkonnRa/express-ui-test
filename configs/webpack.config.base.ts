import webpack from 'webpack';
import path from 'path';
import process from 'process';
import TerserPlugin from 'terser-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import nodeExternals from 'webpack-node-externals';

const config: webpack.Configuration = {
  target: 'node',
  entry: path.resolve(process.cwd(), './src/index.ts'),
  module: {
    rules: [
      {
        test: /.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  output: {
    path: path.resolve(process.cwd(), './dist'),
    libraryTarget: 'commonjs',
    filename: 'index.js',
  },
  externals: [
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../node_modules'),
      allowlist: [/^@white-rabbit\//],
    }),
  ],
  externalsPresets: {
    node: true,
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
          compress: {
            keep_classnames: true,
            keep_fnames: true,
          },
        },
      }),
    ],
  },
};

export default config;

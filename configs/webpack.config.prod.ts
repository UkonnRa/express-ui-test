import webpack from 'webpack';
import base from './webpack.config.base';

export default {
  ...base,
  mode: 'production',
} as webpack.Configuration;

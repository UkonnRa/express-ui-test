import webpack from 'webpack';
import base from './webpack.config.base';

const config: webpack.Configuration = {
  ...base,
  mode: 'production',
};
export default config;

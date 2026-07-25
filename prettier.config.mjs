// Single prettier config for this package.
//
// Previously the package carried BOTH a `prettier` key in package.json (pointing at
// @ionic/prettier-config) AND a .prettierrc that registered prettier-plugin-java. The
// package.json key wins prettier's resolution order, so .prettierrc was dead config: the
// Java plugin never loaded and `yarn lint` failed with "No parser could be inferred" on
// every android/**/*.java file. One config, and the plugin is registered on the winner.
import ionic from '@ionic/prettier-config';

export default {
  ...ionic,
  plugins: ['prettier-plugin-java'],
};

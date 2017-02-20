/**
 * Created by Amg on 2017/2/20.
 */

module.exports = (props) => {
  let cfg = {
    "presets": [
      "react",
      "stage-1"
    ],
    "plugins": [
      "transform-decorators-legacy"
    ]
  };

  if (props.ie8) {
    cfg.presets.unshift(["es2015", { "loose": true }])
  } else {
    cfg.presets.unshift(["es2015", { "modules": false }])
  }

  if (props.testing) {
    cfg = Object.assign({}, cfg, {
      "env": {
        "test": {
          "plugins": [
            "istanbul"
          ]
        }
      },
    })
  }

  return cfg;

};
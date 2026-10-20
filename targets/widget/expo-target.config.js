/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  name: 'GlycoStepWidget',
  bundleIdentifier: 'com.buildingcoolstuff.glycostep.widget',
  entitlements: {
    'com.apple.security.application-groups': [
      'group.com.buildingcoolstuff.glycostep',
    ],
  },
  frameworks: [
    'WidgetKit',
    'SwiftUI',
    'AppIntents',
    'ActivityKit',
  ],
};

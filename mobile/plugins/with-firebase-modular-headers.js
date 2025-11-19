const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

function addFirebaseModularPods(podfile) {
  // we’ll inject these inside the target block
  const snippet = `
  # Firebase / Google pods need modules when using static frameworks
  pod 'GoogleUtilities', :modular_headers => true
  pod 'FirebaseCore', :modular_headers => true
  pod 'FirebaseCoreInternal', :modular_headers => true
  pod 'FirebaseMessaging', :modular_headers => true
`;

  // find the main target start, usually: target 'App' do / target 'Yoroi' do
  const targetRegex = /target\s+'[^']+'\s+do/;
  const match = podfile.match(targetRegex);
  if (!match) return podfile; // do nothing if structure is unexpected

  const idx = match.index + match[0].length;
  return podfile.slice(0, idx) + snippet + podfile.slice(idx);
}

module.exports = function withFirebaseModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      const contents = fs.readFileSync(podfilePath, "utf-8");
      const newContents = addFirebaseModularPods(contents);
      fs.writeFileSync(podfilePath, newContents);
      return config;
    },
  ]);
};

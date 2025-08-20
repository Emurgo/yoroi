#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Standard versions to use across all packages
const STANDARD_VERSIONS = {
  // Core dependencies
  immer: "10.1.1",
  axios: "1.10.0",
  "bignumber.js": "9.3.0",
  rxjs: "7.8.2",
  zod: "3.25.17",
  react: "19.1.1",
  "react-native": "0.79.5",
  "@react-native-async-storage/async-storage": "2.1.2",
  "@tanstack/react-query": "5.81.5",
  "react-native-mmkv": "3.2.0",
  react: "19.0.0",
  "react-dom": "19.0.0",

  // Yoroi packages - use file references for local development
  "@yoroi/types": "file:../types",
  "@yoroi/common": "file:../common",
  "@yoroi/api": "file:../api",
  "@yoroi/portfolio": "file:../portfolio",
  "@yoroi/explorers": "file:../explorers",
  "@yoroi/blockchains": "file:../blockchains",
  "@yoroi/claim": "file:../claim",
  "@yoroi/exchange": "file:../exchange",
  "@yoroi/swap": "file:../swap",
  "@yoroi/staking": "file:../staking",
  "@yoroi/transfer": "file:../transfer",
  "@yoroi/resolver": "file:../resolver",
  "@yoroi/setup-wallet": "file:../setup-wallet",
  "@yoroi/theme": "file:../theme",
  "@yoroi/identicon": "file:../identicon",
  "@yoroi/links": "file:../links",
  "@yoroi/notifications": "file:../notifications",
  "@yoroi/dapp-connector": "file:../dapp-connector",

  // Dev dependencies
  "@babel/core": "7.26.0",
  "@babel/preset-env": "7.25.3",
  "@babel/runtime": "7.25.0",
  "@commitlint/config-conventional": "17.0.2",
  "@react-native-community/cli-platform-android": "18.0.0",
  "@react-native-community/cli-platform-ios": "18.0.0",
  "@react-native-community/cli": "18.0.0",
  "@react-native-community/eslint-config": "3.0.2",
  "@react-native/babel-preset": "0.79.2",
  "@react-native/eslint-config": "0.79.2",
  "@react-native/metro-config": "0.79.2",
  "@react-native/typescript-config": "0.79.2",
  "@release-it/conventional-changelog": "10.0.1",
  "@testing-library/jest-dom": "6.4.2",
  "@testing-library/react-native": "13.2.0",
  "@testing-library/react": "16.3.0",
  "@tsconfig/react-native": "3.0.3",
  "@types/jest": "29.5.12",
  "@types/react-test-renderer": "19.0.0",
  "@types/react-test-renderer": "19.0.0",
  "@types/react": "19.0.10",
  "axios-mock-adapter": "1.22.0",
  "babel-jest": "29.7.0",
  commitlint: "17.0.2",
  "del-cli": "6.0.0",
  "dependency-cruiser": "16.10.2",
  "eslint-config-prettier": "10.1.5",
  "eslint-plugin-ft-flow": "3.0.11",
  "eslint-plugin-prettier": "5.4.0",
  eslint: "8.57.0",
  flowgen: "1.21.0",
  "jest-expo": "53.0.9",
  jest: "29.7.0",
  "pod-install": "0.1.0",
  prettier: "3.5.3",
  "react-native-builder-bob": "0.40.11",
  "react-test-renderer": "19.0.0",
  "release-it": "19.0.2",
  typescript: "5.8.3",
  "eslint-config-prettier": "10.1.5",
  "eslint-plugin-import": "2.32.0",
};

// Packages to process - adjusted paths to work from root directory
const PACKAGES = [
  "apps/mobile",
  "packages/api",
  "packages/blockchains",
  "packages/claim",
  "packages/common",
  "packages/dapp-connector",
  "packages/exchange",
  "packages/explorers",
  "packages/identicon",
  "packages/links",
  "packages/notifications",
  "packages/portfolio",
  "packages/resolver",
  "packages/setup-wallet",
  "packages/staking",
  "packages/swap",
  "packages/theme",
  "packages/transfer",
  "packages/types",
];

function updateDependencies(dependencies, section) {
  if (!dependencies) return dependencies;

  const updated = { ...dependencies };
  let hasChanges = false;

  for (const [pkg, version] of Object.entries(STANDARD_VERSIONS)) {
    if (updated[pkg] && updated[pkg] !== version) {
      console.log(`  ${section}: ${pkg} ${updated[pkg]} → ${version}`);
      updated[pkg] = version;
      hasChanges = true;
    }
  }

  return hasChanges ? updated : dependencies;
}

function processPackage(packagePath) {
  const packageJsonPath = path.join(packagePath, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  Package.json not found: ${packageJsonPath}`);
    return;
  }

  console.log(`\n📦 Processing: ${packagePath}`);

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    let hasChanges = false;

    // Update dependencies
    if (packageJson.dependencies) {
      const updatedDeps = updateDependencies(
        packageJson.dependencies,
        "dependencies"
      );
      if (updatedDeps !== packageJson.dependencies) {
        packageJson.dependencies = updatedDeps;
        hasChanges = true;
      }
    }

    // Update devDependencies
    if (packageJson.devDependencies) {
      const updatedDevDeps = updateDependencies(
        packageJson.devDependencies,
        "devDependencies"
      );
      if (updatedDevDeps !== packageJson.devDependencies) {
        packageJson.devDependencies = updatedDevDeps;
        hasChanges = true;
      }
    }

    // Update peerDependencies
    if (packageJson.peerDependencies) {
      const updatedPeerDeps = updateDependencies(
        packageJson.peerDependencies,
        "peerDependencies"
      );
      if (updatedPeerDeps !== packageJson.peerDependencies) {
        packageJson.peerDependencies = updatedPeerDeps;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      // Write back the updated package.json
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + "\n"
      );
      console.log(`✅ Updated: ${packageJsonPath}`);
    } else {
      console.log(`✅ No changes needed`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${packagePath}:`, error.message);
  }
}

function main() {
  console.log("🚀 Standardizing package versions across Yoroi monorepo...\n");

  for (const pkg of PACKAGES) {
    processPackage(pkg);
  }

  console.log("\n✨ Version standardization complete!");
  console.log("\n📋 Summary of standardizations:");
  console.log(
    "- All packages now use consistent versions for shared dependencies"
  );
  console.log("- Local Yoroi packages use file references for development");
  console.log("- React Query standardized to 5.81.5 across all packages");
  console.log(
    "- All core dependencies (immer, axios, bignumber.js, etc.) standardized"
  );
}

if (require.main === module) {
  main();
}

module.exports = { STANDARD_VERSIONS, processPackage };

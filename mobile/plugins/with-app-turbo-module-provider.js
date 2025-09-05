const { withPodfile, withAppBuildGradle, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function findLatestNDK() {
  try {
    const sdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || path.join(process.env.HOME, 'Library/Android/sdk');
    const ndkDir = path.join(sdkRoot, 'ndk');

    if (!fs.existsSync(ndkDir)) {
      throw new Error(`NDK directory not found at ${ndkDir}`);
    }

    // Get list of installed NDK versions
    const versions = fs.readdirSync(ndkDir)
      .filter(dir => {
        const fullPath = path.join(ndkDir, dir);
        return fs.statSync(fullPath).isDirectory() && !dir.includes('rc');
      })
      .sort((a, b) => {
        const [a1, a2, a3] = a.split('.').map(Number);
        const [b1, b2, b3] = b.split('.').map(Number);
        return (b1 - a1) || (b2 - a2) || (b3 - a3);
      });

    if (versions.length === 0) {
      throw new Error('No NDK versions found');
    }

    const latestVersion = versions[0];
    const ndkPath = path.join(ndkDir, latestVersion);

    if (!fs.existsSync(ndkPath)) {
      throw new Error(`NDK version ${latestVersion} not found at ${ndkPath}`);
    }

    console.log(`Found NDK at: ${ndkPath}`);
    return ndkPath;
  } catch (error) {
    console.warn('Failed to find NDK path:', error.message);
    return null;
  }
}

function withAppTurboModuleProvider(config) {
  // Add pod dependency to Podfile
  config = withPodfile(config, async (config) => {
    const podfilePath = config.modResults;

    // Add the pod dependency after use_react_native!
    const podDependency = `  pod 'AppTurboModuleProvider', :path => '../cpp/AppTurboModuleProvider.podspec'`;

    // Find the use_react_native! block and add the pod after it
    // This regex handles multiline blocks with parentheses
    const useReactNativeRegex = /(\s+use_react_native!\([\s\S]*?\))/;

    if (!podfilePath.contents.includes("pod 'AppTurboModuleProvider'")) {
      const match = podfilePath.contents.match(useReactNativeRegex);
      if (match) {
        const replacement = match[1] + '\n\n' + podDependency;
        podfilePath.contents = podfilePath.contents.replace(useReactNativeRegex, replacement);
      }
    }

    return config;
  });

  // Add externalNativeBuild to Android build.gradle and set NDK path
  config = withAppBuildGradle(config, async (config) => {
    const buildGradleContent = config.modResults.contents;

    // Find latest NDK path
    const ndkPath = findLatestNDK();
    if (!ndkPath) {
      console.warn('Could not find NDK path. Please install NDK using Android Studio or sdkmanager.');
      return config;
    }

    // Add NDK path to gradle.properties
    const gradlePropsPath = path.join(config.modRequest.platformProjectRoot, 'gradle.properties');
    let gradleProps = '';
    if (fs.existsSync(gradlePropsPath)) {
      gradleProps = fs.readFileSync(gradlePropsPath, 'utf8');
    }

    // Update or add NDK path
    // const ndkDirLine = `ndk.dir=${ndkPath.replace(/\\/g, '/')}`;
    // if (gradleProps.includes('ndk.dir=')) {
    //   gradleProps = gradleProps.replace(/ndk\.dir=.*$/m, ndkDirLine);
    // } else {
    //  gradleProps += `\n${ndkDirLine}`;
    //}
    //fs.writeFileSync(gradlePropsPath, gradleProps);

    // Set ANDROID_NDK_HOME environment variable
    // process.env.ANDROID_NDK_HOME = ndkPath;

    // Add NDK configuration to build.gradle
    const ndkConfig = `
    ndkVersion "${path.basename(ndkPath)}"
    ndk {
        path "${ndkPath.replace(/\\/g, '/')}"
    }`;

    // Add externalNativeBuild configuration before buildTypes
    /*
        defaultConfig {
        externalNativeBuild {
            cmake {
                cppFlags  "-std=c++20", "-fexceptions", "-frtti"
                cFlags    "-fexceptions"
                arguments "-DANDROID_STL=c++_shared",
                          "-DANDROID_TOOLCHAIN=clang"
            }
        }
    }
     */
    const externalNativeBuildConfig = `
    externalNativeBuild {
        cmake {
            path "src/main/jni/CMakeLists.txt"
        }
    }`;

    // Find the android block and add NDK config
    const androidBlockRegex = /(\s+android\s*{)/;
    if (!buildGradleContent.includes('ndkVersion')) {
      config.modResults.contents = buildGradleContent.replace(
        androidBlockRegex,
        '$1' + ndkConfig
      );
    }

    // Find the buildTypes block and add externalNativeBuild before it
    const buildTypesRegex = /(\s+buildTypes\s*{)/;
    if (!buildGradleContent.includes('externalNativeBuild')) {
      config.modResults.contents = config.modResults.contents.replace(
        buildTypesRegex,
        externalNativeBuildConfig + '$1'
      );
    }

    return config;
  });

  // Copy JNI content from plugins/android_jni to android/app/src/main/jni
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const sourceDir = path.join(__dirname, 'android_jni');
      const targetDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/jni');

      // Create target directory if it doesn't exist
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Copy all files from source to target
      const copyDir = (src, dest) => {
        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);

          if (entry.isDirectory()) {
            if (!fs.existsSync(destPath)) {
              fs.mkdirSync(destPath, { recursive: true });
            }
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };

      if (fs.existsSync(sourceDir)) {
        copyDir(sourceDir, targetDir);
      }

      return config;
    },
  ]);

  return config;
}

module.exports = withAppTurboModuleProvider;

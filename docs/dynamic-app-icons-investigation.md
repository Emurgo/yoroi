# Dynamic App Icons Investigation

## Overview

This document investigates how to implement customizable app icons that can be changed from within the app on both iOS and Android platforms. This feature allows users to choose between multiple icon variants without requiring an app update.

## Platform-Specific Implementation

### iOS Implementation

#### Native iOS API

iOS provides native support for alternate app icons through the `UIApplication.setAlternateIconName()` API (available since iOS 10.3).

**Key Requirements:**

- Icons must be included in the app bundle at build time
- Icons need to be declared in `Info.plist` under `CFBundleAlternateIcons`
- Each alternate icon requires a complete icon set (all required sizes)
- User permission is required (iOS shows a confirmation dialog)

**Implementation Steps:**

1. **Prepare Icon Assets:**

   - Create icon sets in Xcode's Asset Catalog (`Assets.xcassets`)
   - Each alternate icon needs its own App Icon set (e.g., `AppIconRed`, `AppIconBlue`)
   - Include all required sizes (1024x1024 for modern Xcode, or full set for older versions)

2. **Configure Info.plist:**

   ```xml
   <key>CFBundleIcons</key>
   <dict>
     <key>CFBundlePrimaryIcon</key>
     <dict>
       <key>CFBundleIconFiles</key>
       <array>
         <string>AppIcon</string>
       </array>
     </dict>
     <key>CFBundleAlternateIcons</key>
     <dict>
       <key>red</key>
       <dict>
         <key>CFBundleIconFiles</key>
         <array>
           <string>AppIconRed</string>
         </array>
         <key>UIPrerenderedIcon</key>
         <false/>
       </dict>
       <key>blue</key>
       <dict>
         <key>CFBundleIconFiles</key>
         <array>
           <string>AppIconBlue</string>
         </array>
         <key>UIPrerenderedIcon</key>
         <false/>
       </dict>
     </dict>
   </dict>
   ```

3. **Swift/Objective-C Code:**

   ```swift
   // Check if alternate icons are supported
   guard UIApplication.shared.supportsAlternateIcons else {
       return
   }

   // Set alternate icon
   UIApplication.shared.setAlternateIconName("red") { error in
       if let error = error {
           print("Error: \(error.localizedDescription)")
       } else {
           print("Icon changed successfully")
       }
   }

   // Reset to default
   UIApplication.shared.setAlternateIconName(nil) { error in
       // Handle error
   }
   ```

**Limitations:**

- Icons must be bundled with the app (cannot be downloaded dynamically)
- User sees a confirmation dialog before icon changes
- Limited number of alternate icons (practical limit ~10-20)
- Requires app restart on first change (subsequent changes are instant)

### Android Implementation

#### Activity Alias Method

Android uses `activity-alias` entries in `AndroidManifest.xml` to provide multiple launcher icons. Only one alias can be enabled at a time.

**Key Requirements:**

- Each icon variant needs its own `activity-alias` entry
- Icons must be included in the app bundle at build time
- Only one alias can be enabled at a time
- Uses `PackageManager.setComponentEnabledSetting()` to switch

**Implementation Steps:**

1. **Prepare Icon Assets:**

   - Create icon resources in `res/mipmap-*` directories
   - For adaptive icons, provide foreground and background layers
   - Include all density variants (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)

2. **Configure AndroidManifest.xml:**

   ```xml
   <application
       android:icon="@mipmap/ic_launcher"
       android:roundIcon="@mipmap/ic_launcher_round">

       <!-- Main Activity (no launcher intent-filter) -->
       <activity
           android:name=".MainActivity"
           android:label="@string/app_name"
           android:theme="@style/AppTheme">
       </activity>

       <!-- Default Icon Alias -->
       <activity-alias
           android:name=".DefaultIconAlias"
           android:icon="@mipmap/ic_launcher"
           android:roundIcon="@mipmap/ic_launcher_round"
           android:enabled="true"
           android:targetActivity=".MainActivity">
           <intent-filter>
               <action android:name="android.intent.action.MAIN" />
               <category android:name="android.intent.category.LAUNCHER" />
           </intent-filter>
       </activity-alias>

       <!-- Red Icon Alias -->
       <activity-alias
           android:name=".RedIconAlias"
           android:icon="@mipmap/ic_launcher_red"
           android:roundIcon="@mipmap/ic_launcher_red_round"
           android:enabled="false"
           android:targetActivity=".MainActivity">
           <intent-filter>
               <action android:name="android.intent.action.MAIN" />
               <category android:name="android.intent.category.LAUNCHER" />
           </intent-filter>
       </activity-alias>

       <!-- Blue Icon Alias -->
       <activity-alias
           android:name=".BlueIconAlias"
           android:icon="@mipmap/ic_launcher_blue"
           android:roundIcon="@mipmap/ic_launcher_blue_round"
           android:enabled="false"
           android:targetActivity=".MainActivity">
           <intent-filter>
               <action android:name="android.intent.action.MAIN" />
               <category android:name="android.intent.category.LAUNCHER" />
           </intent-filter>
       </activity-alias>
   </application>
   ```

3. **Kotlin/Java Code:**

   ```kotlin
   fun setAppIcon(context: Context, aliasName: String) {
       val packageManager = context.packageManager

       // List of all icon aliases
       val aliases = listOf(
           "com.emurgo.yoroi.DefaultIconAlias",
           "com.emurgo.yoroi.RedIconAlias",
           "com.emurgo.yoroi.BlueIconAlias"
       )

       // Disable all aliases first
       for (alias in aliases) {
           val componentName = ComponentName(context, alias)
           val enabled = alias == aliasName
           packageManager.setComponentEnabledSetting(
               componentName,
               if (enabled) {
                   PackageManager.COMPONENT_ENABLED_STATE_ENABLED
               } else {
                   PackageManager.COMPONENT_ENABLED_STATE_DISABLED
               },
               PackageManager.DONT_KILL_APP
           )
       }
   }

   // Usage
   setAppIcon(context, "com.emurgo.yoroi.RedIconAlias")
   ```

**Limitations:**

- Icons must be bundled with the app (cannot be downloaded dynamically)
- First icon change may cause app restart
- Some launchers cache icons, requiring device/launcher restart
- Only one alias can be enabled at a time
- Requires careful management to prevent multiple icons appearing

## React Native/Expo Libraries

### 1. `expo-alternate-app-icons` ⭐ Recommended

- **Platform Support:** iOS and Android
- **Expo Compatibility:** Full Expo SDK support
- **Maintenance:** Active
- **Features:**
  - Simple API
  - Supports both platforms
  - Well-documented

**Installation:**

```bash
npx expo install expo-alternate-app-icons
```

**Configuration (app.json):**

```json
{
  "expo": {
    "plugins": [
      [
        "expo-alternate-app-icons",
        {
          "icons": {
            "red": {
              "ios": "./assets/icons/ios-red.png",
              "android": "./assets/icons/android-red.png"
            },
            "blue": {
              "ios": "./assets/icons/ios-blue.png",
              "android": "./assets/icons/android-blue.png"
            }
          }
        }
      ]
    ]
  }
}
```

**Usage:**

```typescript
import {
  getAlternateAppIcon,
  setAlternateAppIcon,
} from 'expo-alternate-app-icons'

// Set icon
await setAlternateAppIcon('red')

// Get current icon
const currentIcon = await getAlternateAppIcon()

// Reset to default
await setAlternateAppIcon(null)
```

### 2. `@howincodes/expo-dynamic-app-icon`

- **Platform Support:** iOS and Android
- **Expo Compatibility:** Full Expo SDK support
- **Features:**
  - Supports round icons
  - Dynamic icon variants for iOS (light/dark/tinted)
  - More configuration options

**Installation:**

```bash
npx expo install @howincodes/expo-dynamic-app-icon
```

**Configuration:**

```json
{
  "expo": {
    "plugins": [
      [
        "@howincodes/expo-dynamic-app-icon",
        {
          "red": {
            "ios": "./assets/icons/ios-red.png",
            "android": "./assets/icons/android-red.png"
          },
          "blue": {
            "ios": "./assets/icons/ios-blue.png",
            "android": "./assets/icons/android-blue.png"
          }
        }
      ]
    ]
  }
}
```

**Usage:**

```typescript
import ExpoDynamicAppIcon from '@howincodes/expo-dynamic-app-icon'

await ExpoDynamicAppIcon.setAppIcon('red')
await ExpoDynamicAppIcon.resetAppIcon()
```

### 3. `@variant-systems/expo-dynamic-app-icon`

- **Platform Support:** iOS, Android, Web (no-op)
- **Expo Compatibility:** Expo SDK 52+
- **Features:**
  - Modern implementation
  - Web support (no-op)

**Installation:**

```bash
npx expo install @variant-systems/expo-dynamic-app-icon
```

### 4. `react-native-dynamic-app-icon` (iOS Only)

- **Platform Support:** iOS only
- **Expo Compatibility:** Requires custom native code
- **Note:** Not recommended for Expo projects

## Implementation Considerations

### Icon Asset Requirements

**iOS:**

- Single 1024x1024 PNG (Xcode 13+)
- Or full icon set: 20pt@2x, 20pt@3x, 29pt@2x, 29pt@3x, 40pt@2x, 40pt@3x, 60pt@2x, 60pt@3x, 1024x1024
- No transparency
- Square format

**Android:**

- Adaptive icon: foreground (108x108dp) + background (108x108dp)
- Or legacy icon: mdpi (48x48), hdpi (72x72), xhdpi (96x96), xxhdpi (144x144), xxxhdpi (192x192)
- Round icon variants for round launchers

### User Experience Considerations

1. **First Change Behavior:**

   - iOS: Shows confirmation dialog, may restart app
   - Android: May restart app on first change

2. **Subsequent Changes:**

   - iOS: Instant, no restart needed
   - Android: Usually instant, but launcher caching may delay

3. **Icon Persistence:**

   - Both platforms persist icon choice across app restarts
   - Need to store preference in app state (AsyncStorage/MMKV)

4. **Error Handling:**
   - Handle cases where icon change fails
   - Provide fallback to default icon
   - Show user feedback during icon change

### Storage Strategy

Store the selected icon preference:

```typescript
import * as SecureStore from 'expo-secure-store'

const ICON_PREFERENCE_KEY = 'app_icon_preference'

// Save preference
await SecureStore.setItemAsync(ICON_PREFERENCE_KEY, 'red')

// Load preference on app start
const savedIcon = await SecureStore.getItemAsync(ICON_PREFERENCE_KEY)
if (savedIcon) {
  await setAlternateAppIcon(savedIcon)
}
```

## Recommended Implementation Plan

### Phase 1: Setup

1. Choose library: `expo-alternate-app-icons` (simplest, well-maintained)
2. Design/create icon variants (3-5 options initially)
3. Prepare icon assets for both platforms

### Phase 2: Configuration

1. Install library: `npx expo install expo-alternate-app-icons`
2. Add plugin configuration to `app.json`/`app.config.js`
3. Add icon assets to `assets/icons/` directory
4. Run `npx expo prebuild` to generate native code

### Phase 3: Implementation

1. Create icon selection UI component
2. Implement icon change logic with error handling
3. Add preference persistence (SecureStore)
4. Restore icon preference on app launch

### Phase 4: Testing

1. Test on iOS devices (simulator + physical device)
2. Test on Android devices (multiple launchers)
3. Test icon persistence across app restarts
4. Test error scenarios

## Example Implementation

```typescript
// src/services/appIconService.ts
import {
  getAlternateAppIcon,
  setAlternateAppIcon,
} from 'expo-alternate-app-icons'
import * as SecureStore from 'expo-secure-store'

const ICON_PREFERENCE_KEY = 'app_icon_preference'

export const AVAILABLE_ICONS = [
  {id: null, name: 'Default', icon: require('../../assets/icons/default.png')},
  {id: 'red', name: 'Red', icon: require('../../assets/icons/red.png')},
  {id: 'blue', name: 'Blue', icon: require('../../assets/icons/blue.png')},
  {id: 'green', name: 'Green', icon: require('../../assets/icons/green.png')},
] as const

export type AppIconId = (typeof AVAILABLE_ICONS)[number]['id']

export async function changeAppIcon(iconId: AppIconId): Promise<void> {
  try {
    await setAlternateAppIcon(iconId)
    await SecureStore.setItemAsync(ICON_PREFERENCE_KEY, iconId || '')
  } catch (error) {
    console.error('Failed to change app icon:', error)
    throw error
  }
}

export async function getCurrentAppIcon(): Promise<AppIconId> {
  try {
    const currentIcon = await getAlternateAppIcon()
    return currentIcon as AppIconId
  } catch (error) {
    console.error('Failed to get current app icon:', error)
    return null
  }
}

export async function restoreAppIconPreference(): Promise<void> {
  try {
    const savedIcon = await SecureStore.getItemAsync(ICON_PREFERENCE_KEY)
    if (savedIcon) {
      await setAlternateAppIcon(savedIcon as AppIconId)
    }
  } catch (error) {
    console.error('Failed to restore app icon preference:', error)
  }
}
```

```typescript
// src/features/Settings/ui/components/AppIconSelector.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { changeAppIcon, getCurrentAppIcon, AVAILABLE_ICONS, AppIconId } from '@/services/appIconService';

export const AppIconSelector: React.FC = () => {
  const [currentIcon, setCurrentIcon] = useState<AppIconId>(null);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    loadCurrentIcon();
  }, []);

  const loadCurrentIcon = async () => {
    const icon = await getCurrentAppIcon();
    setCurrentIcon(icon);
  };

  const handleIconChange = async (iconId: AppIconId) => {
    if (iconId === currentIcon || isChanging) return;

    setIsChanging(true);
    try {
      await changeAppIcon(iconId);
      setCurrentIcon(iconId);
    } catch (error) {
      console.error('Failed to change icon:', error);
      // Show error toast
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose App Icon</Text>
      <View style={styles.iconGrid}>
        {AVAILABLE_ICONS.map((icon) => (
          <TouchableOpacity
            key={icon.id || 'default'}
            style={[
              styles.iconOption,
              currentIcon === icon.id && styles.iconOptionSelected,
              isChanging && styles.iconOptionDisabled,
            ]}
            onPress={() => handleIconChange(icon.id)}
            disabled={isChanging}
          >
            <View style={styles.iconPreview}>
              {/* Render icon preview */}
            </View>
            <Text style={styles.iconName}>{icon.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  iconOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    borderColor: '#007AFF',
  },
  iconOptionDisabled: {
    opacity: 0.5,
  },
  iconPreview: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconName: {
    fontSize: 14,
  },
});
```

## Resources

- [expo-alternate-app-icons GitHub](https://github.com/pchalupa/expo-alternate-app-icons)
- [iOS Alternate App Icons Documentation](https://developer.apple.com/documentation/uikit/uiapplication/2806818-setalternateiconname)
- [Android Activity Alias Documentation](https://developer.android.com/guide/topics/manifest/activity-alias-element)
- [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)

## Conclusion

Dynamic app icons are feasible on both iOS and Android, but require:

- Icons to be bundled at build time
- Native configuration in both platforms
- Careful UX consideration for first-time changes
- Preference persistence for user choice

The recommended approach is to use `expo-alternate-app-icons` for a clean, cross-platform solution that integrates well with the Expo workflow.

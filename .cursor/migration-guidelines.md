# Yoroi Migration Guidelines

This document provides comprehensive guidelines for migrating Yoroi components from the legacy architecture to the new v2 architecture.

## Overview

The migration involves moving from a monolithic architecture to a modular package-based system with atomic design tokens and improved component organization. The project is transitioning from `apps/wallet-mobile` (legacy) to `apps/mobile` (yoroi-v2) with Expo-based development.

## Key Migration Steps

### 1. Use Absolute Path Aliases ✅

**New Feature**: Absolute path aliases have been configured to eliminate relative path issues.

**Available Aliases:**

```typescript
// ✅ Use these instead of relative paths
import { Button } from "~/ui/Button";
import { Space } from "~/ui/Space/Space";
import { usePrivacyMode } from "~/features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode";
import { useCurrencyPairing } from "~/features/Settings/useCases/changeAppSettings/Currency/CurrencyContext";
```

**Alias Mappings:**

- `~/ui/*` → `./src/ui/*`
- `~/features/*` → `./src/features/*`
- `~/hooks/*` → `./src/hooks/*`
- `~/kernel/*` → `./src/kernel/*`
- `~/wallets/*` → `./src/wallets/*`
- `~/wallets/*` → `./src/wallets/*`
- `~/components/*` → `./src/ui/*` (legacy compatibility)

**Before (Relative Paths):**

```typescript
import { Button } from "../../../../../ui/Button";
import { Space } from "../../../../../ui/Space/Space";
import { usePrivacyMode } from "../../../../Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode";
```

**After (Absolute Paths):**

```typescript
import { Button } from "~/ui/Button";
import { Space } from "~/ui/Space/Space";
import { usePrivacyMode } from "~/features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode";
```

### 2. Remove `useStyles` Hook and `StyleSheet.create`

**❌ Avoid StyleSheet.create:** All styles should be inline using atomic design tokens.

**Before:**

```typescript
const useStyles = () => {
  const { color, atoms } = useTheme();
  const styles = StyleSheet.create({
    container: {
      ...atoms.p_lg,
      backgroundColor: color.bg_color_max,
    },
  });
  return { styles, color };
};

// Usage
<View style={styles.container} />;
```

**After:**

```typescript
// Remove useStyles and StyleSheet.create completely
// Inline all styles directly in the component
const { atoms: ta, palette: p } = useTheme();

// Usage
<View style={[{ ...ta.p_lg }, { backgroundColor: p.bg_color_max }]} />;
```

### 3. Use Correct Type Imports

**❌ Avoid `~/types/` imports:** The `~/types/*` alias has been removed to avoid conflicts with `@yoroi/types` package.

**Before:**

```typescript
import { RawUtxo, YoroiUnsignedTx } from "~/types/other";
import { StakingStatus } from "~/types/staking";
import { YoroiEntry } from "~/types/yoroi";
```

**After:**

```typescript
import {
  RawUtxo,
  YoroiUnsignedTx,
  StakingStatus,
  YoroiEntry,
} from "@yoroi/types";
```

**Note:** All types should be imported from `@yoroi/types` package, not from local `~/types/` directory.

### 4. Remove Storybook Files

**❌ Avoid Storybook:** All Storybook files have been removed to reduce clutter.

**Removed:**

- All `*.stories.tsx` and `*.stories.ts` files (140 files)
- All `@storybook/*` imports
- All storybook-related comments and error messages
- All storybook device props and configurations

**Impact:** Cleaner codebase with 140 fewer files and no Storybook dependencies.

### 5. Adopt Atomic Design System

**Static Atoms (`a`):** For styles that don't change with theme

```typescript
import {atoms as a} from '@yoroi/theme'

// ✅ Correct Usage - Use directly in style array
style={[a.p_lg, a.rounded_sm, a.flex_col]}

// ❌ Incorrect - Don't wrap in objects unnecessarily
style={[{...a.p_lg}, {...a.rounded_sm}]}
```

**Theme-Aware Atoms (`ta`) and Palette (`p`):** For theme-dependent styles

```typescript
const {atoms: ta, palette: p} = useTheme()

// Theme atoms (style objects) - must be spread with ...
style={[...ta.bg_color_max, a.p_lg]}

// Palette (raw colors) - used directly
style={{color: p.gray_max}}

// ✅ Correct combined usage
style={[a.flex_row, a.gap_lg, {color: p.text_gray_low}]}
```

### 4. Update Component Imports

**Migration from `components/` to `ui/`:**

```typescript
// ❌ Old imports
import { Icon } from "../../../../components/Icon";
import { Button } from "../../../../components/Button/Button";
import { Space } from "../../../../components/Space/Space";
import { Boundary } from "../../../../components/Boundary/Boundary";
import { Copiable } from "../../../../components/Clipboard/Copiable";

// ✅ New imports with absolute paths
import { Icon } from "~/ui/Icon";
import { Button } from "~/ui/Button";
import { Space } from "~/ui/Space/Space";
import { Boundary } from "~/ui/Boundary";
import { Copiable } from "~/ui/Copiable";
```

### 5. Style Composition Patterns

**Combining Static and Theme Atoms:**

```typescript
// ✅ Correct pattern
style={[
  a.p_lg,           // Static atom
  a.rounded_sm,     // Static atom
  ...ta.bg_color_max, // Theme atom (spread)
  {borderColor: p.gray_300} // Palette (direct)
]}
```

**Text Styles:**

```typescript
// ✅ Correct text styling
style={[
  a.body_2_md_medium,
  a.font_semibold,
  {color: p.gray_max, textTransform: 'uppercase'}
]}
```

## 🚨 Handling Migration Conflicts

### **Using the Conflicts File**

When you encounter issues that can't be resolved immediately, document them in `.cursor/conflicts.md`:

**What to Document:**

- Missing files that weren't migrated
- Import path issues
- Configuration problems
- Blocking dependencies

**Example Conflict Entry:**

```markdown
### Missing CurrencyContext.tsx

**Location**: `apps/mobile/src/features/Settings/useCases/changeAppSettings/Currency/CurrencyContext.tsx`
**Status**: ❌ **NOT MIGRATED**
**Impact**: Currency functionality broken
**Files Affected**: [list of files]
**Required Action**: Create the missing file
```

**When to Check Conflicts:**

- Before starting a new migration
- When encountering import errors
- When components are missing
- After completing a migration batch

**How to Resolve Conflicts:**

1. **Check the conflicts file** first when encountering issues
2. **Add new conflicts** if you find missing files
3. **Update status** when conflicts are resolved
4. **Remove resolved conflicts** from the list

### **Conflict Resolution Workflow**

```bash
# 1. Check for existing conflicts
cat .cursor/conflicts.md

# 2. If you find a new issue, add it to conflicts.md
# 3. Try to resolve the conflict
# 4. Update the conflicts file with resolution status
# 5. Remove resolved conflicts
```

## Architecture Migration

### **Legacy App**: `apps/wallet-mobile` (v5.3.3) → **New App**: `apps/mobile` (yoroi-v2)

- **Expo-based development** with modern tooling
- **Package dependencies** at v2.0.0+ with some at v3.0.0

### **Storage Migration System**

- **Versioned migrations** (currently at version 3)
- **Migration steps**: `4_9_0` → `4_26_0` → `4_28_0`
- **Each migration** handles wallet metadata updates and storage structure changes

### **Package Modularization**

- Breaking down monolithic codebase into focused packages:
  - `@yoroi/api` - API interactions
  - `@yoroi/portfolio` - Portfolio management
  - `@yoroi/theme` - Design system
  - `@yoroi/types` - Type definitions
  - And many more specialized packages

## Common Migration Patterns

### **Component Migration Example:**

```typescript
// Before
const useStyles = () => {
  const { color, atoms } = useTheme();
  const styles = StyleSheet.create({
    container: {
      ...atoms.p_lg,
      backgroundColor: color.bg_color_max,
      borderRadius: atoms.rounded_sm.borderRadius,
    },
  });
  return { styles, color };
};

export const MyComponent = () => {
  const { styles, color } = useStyles();
  return (
    <View style={styles.container}>
      <Text style={{ color: color.text_color_max }}>Hello</Text>
    </View>
  );
};

// After
export const MyComponent = () => {
  const { atoms: ta, palette: p } = useTheme();
  return (
    <View style={[a.p_lg, ...ta.bg_color_max, a.rounded_sm]}>
      <Text style={{ color: p.text_color_max }}>Hello</Text>
    </View>
  );
};
```

## Troubleshooting

### **Import Path Issues:**

- Use absolute paths with `~/` prefix
- Check that the component exists in the `ui/` directory
- Verify TypeScript path mapping in `tsconfig.json`
- **Check conflicts.md** for known missing files

### **Style Issues:**

- Remember to spread theme atoms: `[...ta.bg_color_max]`
- Use palette directly: `{color: p.gray_max}`
- Combine static and theme atoms in arrays

### **Metro Cache Issues:**

```bash
# Clear Metro cache if imports aren't working
npx expo start --clear
```

### **Missing Files:**

1. **Check conflicts.md** first
2. **Search in legacy app** (`apps/wallet-mobile`)
3. **Create the file** if it doesn't exist
4. **Add to conflicts.md** if you can't resolve it

## Best Practices

1. **Always use absolute paths** with `~/` prefix for internal imports
2. **Prefer static atoms** (`a`) when possible for better performance
3. **Use theme atoms** (`ta`) only for theme-dependent styles
4. **Keep style arrays** organized: static atoms first, then theme atoms, then palette
5. **Test both light and dark themes** after migration
6. **Update all relative imports** to use the new absolute path system
7. **Check conflicts.md** before starting new migrations
8. **Document new issues** in conflicts.md when found

## Migration Checklist

- [ ] Remove `useStyles` hook
- [ ] Replace relative imports with absolute paths (`~/`)
- [ ] Update component imports from `components/` to `ui/`
- [ ] Convert styles to atomic design system
- [ ] Test in both light and dark themes
- [ ] Verify all imports resolve correctly
- [ ] Clear Metro cache and restart development server
- [ ] Check conflicts.md for known issues
- [ ] Document any new conflicts found

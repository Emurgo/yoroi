# Migration Guidelines

## Overview

This document tracks components that need to be migrated from `apps/wallet-mobile/src/components` to `apps/mobile/src/ui`.

## Missing Components

### Core Components (High Priority)

These components are actively used and should be migrated first:

1. **Accordion** - `apps/wallet-mobile/src/components/Accordion/`
2. **CameraCodeScanner** - `apps/wallet-mobile/src/components/CameraCodeScanner/`
3. **ChainWarning** - `apps/wallet-mobile/src/components/ChainWarning/`
4. **ConfirmTxWithHwModal** - `apps/wallet-mobile/src/components/ConfirmTxWithHwModal/`
5. **ConfirmTxWithOsModal** - `apps/wallet-mobile/src/components/ConfirmTxWithOsModal/`
6. **ConfirmTxWithSpendingPasswordModal** - `apps/wallet-mobile/src/components/ConfirmTxWithSpendingPasswordModal/`
7. **ErrorModal** - `apps/wallet-mobile/src/components/ErrorModal/`
8. **ErrorPanel** - `apps/wallet-mobile/src/components/ErrorPanel/`
9. **HideableText** - `apps/wallet-mobile/src/components/HideableText/`
10. **InfoBanner** - `apps/wallet-mobile/src/components/InfoBanner/`
11. **MediaPreview** - `apps/wallet-mobile/src/components/MediaPreview/`
12. **Modal** - `apps/wallet-mobile/src/components/Modal/`
13. **NftPreview** - `apps/wallet-mobile/src/components/NftPreview/`
14. **OfflineBanner** - `apps/wallet-mobile/src/components/OfflineBanner/`
15. **PressableIcon** - `apps/wallet-mobile/src/components/PressableIcon/`
16. **SomethingWentWrong** - `apps/wallet-mobile/src/components/SomethingWentWrong/`
17. **Spacer** - `apps/wallet-mobile/src/components/Spacer/`
18. **Tabs** - `apps/wallet-mobile/src/components/Tabs/`
19. **TwoActionView** - `apps/wallet-mobile/src/components/TwoActionView/`
20. **WarningBanner** - `apps/wallet-mobile/src/components/WarningBanner/`

### Individual Files (Medium Priority)

These individual files need to be migrated:

1. **DismissableView** - `apps/wallet-mobile/src/components/DismissableView.tsx`
2. **ErrorImage** - `apps/wallet-mobile/src/components/ErrorImage.tsx`
3. **FadeIn** - `apps/wallet-mobile/src/components/FadeIn.tsx`
4. **GradientWarning** - `apps/wallet-mobile/src/components/GradientWarning.tsx`
5. **KeyboardSpacer** - `apps/wallet-mobile/src/components/KeyboardSpacer.tsx`
6. **PleaseWaitModal** - `apps/wallet-mobile/src/components/PleaseWaitModal.tsx`
7. **ProgressStep** - `apps/wallet-mobile/src/components/ProgressStep.tsx`
8. **ValidatedTextInput** - `apps/wallet-mobile/src/components/ValidatedTextInput.tsx`

### Story Files (Removed)

Storybook story files have been removed from the project and should not be migrated.

### Number Components (Unknown Priority)

These appear to be step/sequence components:

1. **Number1** - `apps/wallet-mobile/src/components/Number1.tsx`
2. **Number2** - `apps/wallet-mobile/src/components/Number2.tsx`
3. **Number2Empty** - `apps/wallet-mobile/src/components/Number2Empty.tsx`
4. **Number3** - `apps/wallet-mobile/src/components/Number3.tsx`
5. **Number3Empty** - `apps/wallet-mobile/src/components/Number3Empty.tsx`
6. **Number4** - `apps/wallet-mobile/src/components/Number4.tsx`
7. **Number4Empty** - `apps/wallet-mobile/src/components/Number4Empty.tsx`

### String Files (Low Priority)

These are likely translation or string constant files:

1. **strings** - Multiple string files in various component directories

## Migration Process

### For Components with Directories:

1. Use `git mv` to preserve history:

   ```bash
   git mv apps/wallet-mobile/src/components/ComponentName apps/mobile/src/ui/ComponentName
   ```

2. Update imports in the moved component files
3. Update any imports in other files that reference the moved component
4. Run linting and TypeScript checks to ensure no issues

### For Individual Files:

1. Use `git mv` to preserve history:

   ```bash
   git mv apps/wallet-mobile/src/components/ComponentName.tsx apps/mobile/src/ui/ComponentName/ComponentName.tsx
   ```

2. Create the directory structure if it doesn't exist
3. Update imports and references

### For Story Files:

Storybook story files have been removed from the project and should not be migrated.

## Recently Completed Migrations

- ✅ **Tooltip/utils.ts** - Moved from `apps/wallet-mobile/src/components/Tooltip/utils.ts` to `apps/mobile/src/ui/Tooltip/utils.ts`

## Notes

- Always use `git mv` to preserve file history
- Test components after migration to ensure they work correctly
- Update any import paths that reference the old locations
- Consider the new mobile structure's organization when placing components
- Some components may need to be refactored to use the new theme system (@yoroi/theme)

# Migration Guidelines

## Overview

This document tracks components that need to be migrated from `apps/wallet-mobile/src/components` to `apps/mobile/src/ui`.

## Missing Components

### Core Components (High Priority) - STILL MISSING

These components are actively used and should be migrated first:

1. **Accordion** - `apps/wallet-mobile/src/components/Accordion/` ❌ **MISSING**
2. **CameraCodeScanner** - `apps/wallet-mobile/src/components/CameraCodeScanner/` ❌ **MISSING**
3. **ChainWarning** - `apps/wallet-mobile/src/components/ChainWarning/` ❌ **MISSING**
4. **ConfirmTxWithHwModal** - `apps/wallet-mobile/src/components/ConfirmTxWithHwModal/` ❌ **MISSING**
5. **ConfirmTxWithOsModal** - `apps/wallet-mobile/src/components/ConfirmTxWithOsModal/` ❌ **MISSING**
6. **ConfirmTxWithSpendingPasswordModal** - `apps/wallet-mobile/src/components/ConfirmTxWithSpendingPasswordModal/` ❌ **MISSING**
7. **ErrorModal** - `apps/wallet-mobile/src/components/ErrorModal/` ❌ **MISSING**
8. **ErrorPanel** - `apps/wallet-mobile/src/components/ErrorPanel/` ❌ **MISSING**
9. **HideableText** - `apps/wallet-mobile/src/components/HideableText/` ❌ **MISSING**
10. **InfoBanner** - `apps/wallet-mobile/src/components/InfoBanner/` ❌ **MISSING**
11. **MediaPreview** - `apps/wallet-mobile/src/components/MediaPreview/` ❌ **MISSING**
12. **Modal** - `apps/wallet-mobile/src/components/Modal/` ✅ **MIGRATED** (exists in `apps/mobile/src/ui/Modal/`)
13. **NftPreview** - `apps/wallet-mobile/src/components/NftPreview/` ❌ **MISSING**
14. **OfflineBanner** - `apps/wallet-mobile/src/components/OfflineBanner/` ❌ **MISSING**
15. **PressableIcon** - `apps/wallet-mobile/src/components/PressableIcon/` ❌ **MISSING**
16. **SomethingWentWrong** - `apps/wallet-mobile/src/components/SomethingWentWrong/` ❌ **MISSING**
17. **Spacer** - `apps/wallet-mobile/src/components/Spacer/` ✅ **MIGRATED** (replaced with Space component)
18. **Tabs** - `apps/wallet-mobile/src/components/Tabs/` ❌ **MISSING**
19. **TwoActionView** - `apps/wallet-mobile/src/components/TwoActionView/` ❌ **MISSING**
20. **WarningBanner** - `apps/wallet-mobile/src/components/WarningBanner/` ❌ **MISSING**

### Individual Files (Medium Priority) - STILL MISSING

These individual files need to be migrated:

1. **DismissableView** - `apps/wallet-mobile/src/components/DismissableView.tsx` ❌ **MISSING**
2. **ErrorImage** - `apps/wallet-mobile/src/components/ErrorImage.tsx` ❌ **MISSING**
3. **FadeIn** - `apps/wallet-mobile/src/components/FadeIn.tsx` ❌ **MISSING**
4. **GradientWarning** - `apps/wallet-mobile/src/components/GradientWarning.tsx` ❌ **MISSING**
5. **KeyboardSpacer** - `apps/wallet-mobile/src/components/KeyboardSpacer.tsx` ❌ **MISSING**
6. **PleaseWaitModal** - `apps/wallet-mobile/src/components/PleaseWaitModal.tsx` ❌ **MISSING**
7. **ProgressStep** - `apps/wallet-mobile/src/components/ProgressStep.tsx` ❌ **MISSING**
8. **ValidatedTextInput** - `apps/wallet-mobile/src/components/ValidatedTextInput.tsx` ❌ **MISSING**

### Story Files (Removed)

Storybook story files have been removed from the project and should not be migrated.

### Number Components (Unknown Priority) - STILL MISSING

These appear to be step/sequence components:

1. **Number1** - `apps/wallet-mobile/src/components/StepperProgress/Number1.tsx` ❌ **MISSING**
2. **Number2** - `apps/wallet-mobile/src/components/StepperProgress/Number2.tsx` ❌ **MISSING**
3. **Number2Empty** - `apps/wallet-mobile/src/components/StepperProgress/Number2Empty.tsx` ❌ **MISSING**
4. **Number3** - `apps/wallet-mobile/src/components/StepperProgress/Number3.tsx` ❌ **MISSING**
5. **Number3Empty** - `apps/wallet-mobile/src/components/StepperProgress/Number3Empty.tsx` ❌ **MISSING**
6. **Number4** - `apps/wallet-mobile/src/components/StepperProgress/Number4.tsx` ❌ **MISSING**
7. **Number4Empty** - `apps/wallet-mobile/src/components/StepperProgress/Number4Empty.tsx` ❌ **MISSING**

### String Files (Low Priority)

These are likely translation or string constant files:

1. **strings** - Multiple string files in various component directories

## Migration Process

### For Components with Directories:

1. Use `git mv` to preserve history:

   ```bash
   git mv apps/wallet-mobile/src/components/ComponentName apps/mobile/src/ui/ComponentName
   ```

2. Fix any broken relative imports in the moved component files
3. Update any remaining relative imports in other files that reference the moved component
4. Run linting and TypeScript checks to ensure no issues

### For Individual Files:

1. Use `git mv` to preserve history:

   ```bash
   git mv apps/wallet-mobile/src/components/ComponentName.tsx apps/mobile/src/ui/ComponentName/ComponentName.tsx
   ```

2. Create the directory structure if it doesn't exist
3. Fix any broken relative imports in the moved file
4. Update any remaining relative imports that reference the moved component

### For Story Files:

Storybook story files have been removed from the project and should not be migrated.

## Recently Completed Migrations

- ✅ **Tooltip/utils.ts** - Moved from `apps/wallet-mobile/src/components/Tooltip/utils.ts` to `apps/mobile/src/ui/Tooltip/utils.ts`
- ✅ **Modal** - Already migrated to `apps/mobile/src/ui/Modal/`
- ✅ **Spacer** - Replaced with Space component system

## Current Status Summary

**Total Components Listed:** 35
**Migrated:** 3 (Modal, Spacer, Tooltip/utils.ts)
**Still Missing:** 32 components

**Critical Missing Components (actively imported):**

- Accordion, ChainWarning, ConfirmTxWithHwModal, ConfirmTxWithOsModal, ConfirmTxWithSpendingPasswordModal
- ErrorModal, ErrorPanel, FadeIn, InfoBanner, MediaPreview, SomethingWentWrong, Tabs, WarningBanner

## Notes

- Always use `git mv` to preserve file history
- Test components after migration to ensure they work correctly
- Focus on fixing broken relative imports that reference moved components
- Most absolute path imports have already been converted, so focus on remaining relative imports
- Consider the new mobile structure's organization when placing components
- Some components may need to be refactored to use the new theme system (@yoroi/theme)
- **Priority:** Focus on the 12 critical missing components that are actively being imported

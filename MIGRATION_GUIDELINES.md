# Migration Guidelines

## Prerequisites

- Node.js and npm installed
- Android Studio with emulator set up
- Git access to the repository

## App Startup Process

1. Navigate to `/apps/mobile`
2. Run `npm start` to start the Metro bundler
3. In another terminal, run `npm run android --debug` to compile and serve to Android emulator
4. Use PIN "000000" to access wallet selection

## Reference Previous Working Version

- Use `git checkout rn71` to inspect the working `wallet-mobile` version
- Compare navigation and wallet selection logic
- Use as reference for missing functionality

## Systematic Error Fixing Process

1. **Start the server**: `cd apps/mobile && npm start`
2. **Monitor errors**: Watch the terminal output for "Unable to resolve" errors
3. **Fix errors**: Update import paths and dependencies
4. **Reload**: Use `curl -s "http://localhost:8081/reload" > /dev/null` to trigger reload
5. **Repeat**: Check for next error in Metro logs and fix
6. **Continue loop**: Fix → Reload → Check next error until no more errors

## Error Reading Process

- **Read errors directly**: The assistant can read errors directly from the Metro terminal where `npm start` is running
- **Direct access**: No need for user to paste logs - the assistant has direct access to the Metro process
- **Systematic approach**: Fix → Reload (curl) → Check next error
- **Cache issues**: If errors persist, clear Metro cache with `npm start --clear`

## Current Error Fixing Progress

### Completed Fixes

- ✅ **Tabs component migration**: Migrated from wallet-mobile to mobile app with atomic design tokens
- ✅ **Import path fixes**: Updated all Tabs imports to use `~/ui/Tabs` instead of `~/ui/Tabs/Tabs`
- ✅ **useBuyCryptoBanner**: Converted relative import to absolute path in TxHistory.tsx

### Current Error Status

- 🔄 **Tabs import still failing**: The error persists despite fixes, may need cache clearing
- 🔄 **useBuyCryptoBanner import**: Fixed but may need verification after restart

### Next Steps After Restart

1. Clear Metro cache: `npm start --clear`
2. Monitor for remaining import errors
3. Continue systematic fixing process
4. Test runtime functionality in emulator

## Debugging Instructions

- **Server interaction**: Use `curl -s "http://localhost:8081/reload" > /dev/null` to trigger reload
- **Error monitoring**: Watch Metro bundler output for "Unable to resolve" errors
- **Build testing**: Use `npm run android --debug` to test fixes
- **File search**: Use `file_search` to locate missing components
- **No tsc**: Do not run `tsc` directly - it will fail due to memory issues and many errors
- **Terminal workflow**:
  1. Start Metro: `npm start` (keep this terminal open)
  2. Build Android: `npm run android --debug` (close after success)
  3. Use Metro terminal for errors and reloads
- **Import patterns**:
  - Use `~/` for absolute imports from src directory
  - Use relative paths for image assets (e.g., `../../../../../assets/img/`)
  - Convert relative imports to absolute imports systematically

## Common Import Fixes

- **Image assets**: Use relative paths, not `~` alias
- **Components**: Use absolute paths with `~/` prefix
- **Tabs component**: Use `~/ui/Tabs` (migrated from wallet-mobile)
- **Navigation**: Use `~/kernel/navigation/navigation` not `~/kernel/navigation`
- **Strings**: Use `~/features/Transactions/common/strings` not `~/features/Transactions/common/useStrings`

## Error Resolution Workflow

1. **Identify error** from Metro bundler output
2. **Locate file** causing the error
3. **Fix import path** or add missing dependency
4. **Trigger reload** with `curl -s "http://localhost:8081/reload" > /dev/null`
5. **Check next error** and repeat
6. **Continue loop** until no more errors

## Testing Process

- **Build success**: Verify `npm run android --debug` completes successfully
- **Runtime testing**: Test app functionality in emulator
- **Error monitoring**: Watch Metro logs for runtime errors
- **Iterative fixing**: Fix one error at a time, reload (curl), repeat until no more errors

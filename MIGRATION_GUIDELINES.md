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
4. **Commit changes**: `git add . && git commit -m "fix: description"`
5. **Reload**: Send `a` to the Metro terminal to trigger Android reload
6. **Repeat**: Check for next error in Metro logs and fix

## Error Reading Process

- **Read errors directly**: Errors appear in the Metro terminal where `npm start` is running
- **No need to paste**: The assistant can read errors from the Metro logs provided
- **Systematic approach**: Fix → Commit → Reload → Check next error
- **Cache issues**: If errors persist, clear Metro cache with `npm start --clear`

## Debugging Instructions

- **Server interaction**: Send `a` to the running Expo server terminal to trigger Android reload
- **Error monitoring**: Watch Metro bundler output for "Unable to resolve" errors
- **Build testing**: Use `npm run android --debug` to test fixes
- **File search**: Use `file_search` to locate missing components
- **Import patterns**:
  - Use `~/` for absolute imports from src directory
  - Use relative paths for image assets (e.g., `../../../../../assets/img/`)
  - Convert relative imports to absolute imports systematically

## Common Import Fixes

- **Image assets**: Use relative paths, not `~` alias
- **Components**: Use absolute paths with `~/` prefix
- **Tabs component**: Use `~/features/Portfolio/ui/TabsGradient/Tabs` for Portfolio screens
- **Navigation**: Use `~/kernel/navigation/navigation` not `~/kernel/navigation`
- **Strings**: Use `~/features/Transactions/common/strings` not `~/features/Transactions/common/useStrings`

## Error Resolution Workflow

1. **Identify error** from Metro bundler output
2. **Locate file** causing the error
3. **Fix import path** or add missing dependency
4. **Commit changes** with descriptive message
5. **Trigger reload** with `a` in Metro terminal
6. **Check next error** and repeat

## Testing Process

- **Build success**: Verify `npm run android --debug` completes successfully
- **Runtime testing**: Test app functionality in emulator
- **Error monitoring**: Watch Metro logs for runtime errors
- **Iterative fixing**: Fix one error at a time, commit, reload, repeat

# Test Coverage Plan for Mobile Packages

## Current Status

- **Total implementation files**: 393
- **Total test files**: 233
- **Coverage gap**: ~160 files need tests
- **Current test suites**: 330 (305 passing, 25 failing)

## Package-by-Package Analysis

### ✅ `tx` Package (HIGH PRIORITY - COMPLETED)
- **Status**: Comprehensive test coverage added
- **Coverage**: ~95%+ for core functionality
- **Remaining**: Some integration tests may be needed for complex CSL interactions

### 🔴 `common` Package (HIGH PRIORITY)
- **Implementation files**: 52
- **Test files**: 51
- **Status**: Nearly complete, but needs review
- **Priority**: HIGH - Core utilities used across all packages
- **Focus areas**:
  - Logger utilities (already tested)
  - API utilities (already tested)
  - Number utilities (already tested)
  - React hooks (already tested)
  - Observer/Queue patterns (already tested)
  - Remaining edge cases

### 🟡 `portfolio` Package (MEDIUM-HIGH PRIORITY)
- **Implementation files**: 50
- **Test files**: 37
- **Status**: ~74% coverage
- **Priority**: MEDIUM-HIGH - Core portfolio management
- **Focus areas**:
  - Token management
  - Balance calculations
  - Portfolio aggregation
  - Token metadata handling

### 🟡 `api` Package (MEDIUM PRIORITY)
- **Implementation files**: 20
- **Test files**: 15
- **Status**: ~75% coverage
- **Priority**: MEDIUM - API integration layer
- **Focus areas**:
  - Cardano API endpoints
  - Error handling
  - Response parsing
  - Rate limiting

### 🟡 `staking` Package (MEDIUM PRIORITY)
- **Implementation files**: 18
- **Test files**: 8
- **Status**: ~44% coverage
- **Priority**: MEDIUM - Staking functionality
- **Focus areas**:
  - Pool selection
  - Delegation logic
  - Reward calculations
  - Certificate handling

### 🟡 `swap` Package (MEDIUM PRIORITY)
- **Implementation files**: 21
- **Test files**: 16
- **Status**: ~76% coverage
- **Priority**: MEDIUM - Token swapping
- **Focus areas**:
  - Swap calculations
  - Price calculations
  - Order management

### 🟡 `exchange` Package (MEDIUM PRIORITY)
- **Implementation files**: 17
- **Test files**: 12
- **Status**: ~71% coverage
- **Priority**: MEDIUM - Exchange integration
- **Focus areas**:
  - Exchange API integration
  - Rate fetching
  - Order execution

### 🟡 `resolver` Package (MEDIUM PRIORITY)
- **Implementation files**: 23
- **Test files**: 16
- **Status**: ~70% coverage
- **Priority**: MEDIUM - Domain name resolution
- **Focus areas**:
  - CNS resolution
  - ADAHandle resolution
  - Unstoppable Domains resolution

### 🟢 `blockchains` Package (LOW-MEDIUM PRIORITY)
- **Implementation files**: 8
- **Test files**: 8
- **Status**: ~100% coverage
- **Priority**: LOW - Already well tested

### 🟢 `claim` Package (LOW-MEDIUM PRIORITY)
- **Implementation files**: 9
- **Test files**: 6
- **Status**: ~67% coverage
- **Priority**: LOW-MEDIUM - Claim functionality
- **Focus areas**:
  - Claim validation
  - Claim API integration

### 🟢 `dapp-connector` Package (LOW-MEDIUM PRIORITY)
- **Implementation files**: 6
- **Test files**: 1
- **Status**: ~17% coverage
- **Priority**: LOW-MEDIUM - dApp connectivity
- **Focus areas**:
  - CIP-30 connector
  - Message handling
  - Security validation

### 🟢 `links` Package (LOW PRIORITY)
- **Implementation files**: 15
- **Test files**: 6
- **Status**: ~40% coverage
- **Priority**: LOW - Link generation/sharing
- **Focus areas**:
  - QR code generation
  - Link parsing
  - Address sharing

### 🟢 `p2p-communication` Package (LOW PRIORITY)
- **Implementation files**: 12
- **Test files**: 5
- **Status**: ~42% coverage
- **Priority**: LOW - P2P communication
- **Focus areas**:
  - WebRTC handling
  - Message routing
  - Connection management

### 🟢 `notifications` Package (LOW PRIORITY)
- **Implementation files**: 7
- **Test files**: 2
- **Status**: ~29% coverage
- **Priority**: LOW - Push notifications
- **Focus areas**:
  - Notification handling
  - Permission management

### 🟢 `identicon` Package (LOW PRIORITY)
- **Implementation files**: 5
- **Test files**: 3
- **Status**: ~60% coverage
- **Priority**: LOW - Visual identification
- **Focus areas**:
  - Icon generation
  - Color mapping

### 🟢 `explorers` Package (LOW PRIORITY)
- **Implementation files**: 2
- **Test files**: 1
- **Status**: ~50% coverage
- **Priority**: LOW - Blockchain explorers
- **Focus areas**:
  - Explorer API integration

### 🟢 `theme` Package (LOW PRIORITY)
- **Implementation files**: 12
- **Test files**: 0
- **Status**: ~0% coverage
- **Priority**: LOW - Theming system
- **Note**: Theme packages often don't need extensive tests

### 🟢 `setup-wallet` Package (LOW PRIORITY)
- **Implementation files**: 1
- **Test files**: 1
- **Status**: ~100% coverage
- **Priority**: LOW - Already tested

### 🟢 `transfer` Package (LOW PRIORITY)
- **Implementation files**: Unknown
- **Test files**: Unknown
- **Status**: Unknown
- **Priority**: LOW - Transfer functionality

## Recommended Testing Strategy

### Phase 1: Critical Path (Weeks 1-2)
1. **`common` package** - Complete remaining tests
   - Review existing tests for gaps
   - Add edge case tests
   - Ensure 100% coverage

2. **`portfolio` package** - Add missing tests
   - Token management functions
   - Balance aggregation
   - Portfolio calculations

### Phase 2: Core Features (Weeks 3-4)
3. **`api` package** - Complete API tests
   - All endpoint handlers
   - Error scenarios
   - Response validation

4. **`staking` package** - Add comprehensive tests
   - Pool operations
   - Delegation logic
   - Certificate handling

### Phase 3: Integration Features (Weeks 5-6)
5. **`swap` package** - Complete swap tests
   - Price calculations
   - Order execution
   - Error handling

6. **`exchange` package** - Complete exchange tests
   - API integration
   - Rate handling
   - Order management

7. **`resolver` Package** - Complete resolver tests
   - Domain resolution
   - Address parsing
   - Error handling

### Phase 4: Supporting Features (Weeks 7-8)
8. **`dapp-connector` package** - Add tests
   - CIP-30 connector
   - Security validation

9. **`claim` package** - Complete tests
   - Claim validation
   - API integration

10. **`links` package** - Add tests
    - QR generation
    - Link parsing

11. **`p2p-communication` package** - Add tests
    - WebRTC handling
    - Message routing

12. **`notifications` package** - Add tests
    - Notification handling
    - Permissions

13. **`identicon` package** - Complete tests
    - Icon generation

14. **`explorers` package** - Complete tests
    - Explorer integration

### Phase 5: Low Priority (As needed)
15. **`theme` package** - Consider if needed
    - Usually doesn't need extensive tests

## Testing Best Practices

1. **Test Structure**:
   - One test file per implementation file
   - Use descriptive test names
   - Group related tests with `describe` blocks

2. **Coverage Goals**:
   - Aim for 100% line coverage
   - 100% branch coverage
   - 100% function coverage
   - 100% statement coverage

3. **Test Types**:
   - Unit tests for pure functions
   - Integration tests for API interactions
   - Mock external dependencies (CSL, APIs, etc.)

4. **Common Patterns**:
   - Mock CSL using `CardanoMobileWrapped.cslScope` mocks
   - Use `jest.fn()` for function mocks
   - Test error cases and edge cases
   - Test both success and failure paths

5. **File Naming**:
   - Test files: `*.test.ts`
   - Place next to implementation files
   - Or in `__tests__` directories

## Estimated Timeline

- **Phase 1**: 2 weeks (Critical path)
- **Phase 2**: 2 weeks (Core features)
- **Phase 3**: 2 weeks (Integration features)
- **Phase 4**: 2 weeks (Supporting features)
- **Phase 5**: As needed (Low priority)

**Total**: ~8-10 weeks for comprehensive coverage

## Success Metrics

- ✅ All packages have >90% test coverage
- ✅ All tests pass consistently
- ✅ No linting errors
- ✅ No TypeScript errors
- ✅ CI/CD pipeline passes

## Notes

- Some packages may have files that don't need tests (pure type definitions, re-exports)
- Focus on testing business logic, not implementation details
- Prioritize tests that catch bugs and prevent regressions
- Consider integration tests for complex workflows


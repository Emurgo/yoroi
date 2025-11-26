# Test Coverage Plan for Mobile Packages

## Current Status (Based on Actual Coverage Metrics)

**Overall Coverage:**
- Statements: 25.23% (7,464/29,577)
- Branches: 20.89% (3,173/15,186)
- Functions: 25.63% (1,900/7,411)
- Lines: 25.17% (7,108/28,229)

**Target:** 100% coverage for all metrics

## Package Coverage Analysis (Sorted by Priority)

### 🔴 CRITICAL PRIORITY (< 50% Coverage)

#### 1. `p2p-communication` Package
- **Statements**: 22.4% (165/736)
- **Branches**: 12.7% (42/332)
- **Functions**: 23.5% (32/136)
- **Lines**: 22.1% (160/724)
- **Priority**: CRITICAL - Very low coverage
- **Focus**: WebRTC handling, message routing, connection management

#### 2. `tx` Package
- **Statements**: 39.8% (847/2,127)
- **Branches**: 34.7% (393/1,132)
- **Functions**: 60.3% (190/315)
- **Lines**: 40.3% (823/2,043)
- **Priority**: CRITICAL - Core transaction functionality
- **Status**: Recently added comprehensive tests, but still needs more
- **Focus**: Remaining untested functions, edge cases, integration tests

#### 3. `staking` Package
- **Statements**: 47.6% (182/382)
- **Branches**: 48.2% (81/168)
- **Functions**: 45.8% (49/107)
- **Lines**: 48.7% (181/372)
- **Priority**: CRITICAL - Core staking functionality
- **Focus**: Pool operations, delegation logic, certificate handling, reward calculations

### 🟡 HIGH PRIORITY (50-90% Coverage)

#### 4. `links` Package
- **Statements**: 62.5% (339/542)
- **Branches**: 42.7% (177/415)
- **Functions**: 85.9% (61/71)
- **Lines**: 64.7% (326/504)
- **Priority**: HIGH - Branch coverage needs improvement
- **Focus**: QR code generation, link parsing, address sharing edge cases

#### 5. `theme` Package
- **Statements**: 72.3% (60/83)
- **Branches**: 55.6% (15/27)
- **Functions**: 66.7% (16/24)
- **Lines**: 70.9% (56/79)
- **Priority**: MEDIUM - Theming system (usually doesn't need extensive tests)
- **Focus**: Theme validation, palette generation

#### 6. `swap` Package
- **Statements**: 84.3% (619/734)
- **Branches**: 80.1% (577/720)
- **Functions**: 87.1% (183/210)
- **Lines**: 86.1% (590/685)
- **Priority**: HIGH - Close to 100%, needs final push
- **Focus**: Remaining edge cases, error handling

### 🟢 MEDIUM PRIORITY (90-99% Coverage)

#### 7. `api` Package
- **Statements**: 93.2% (206/221)
- **Branches**: 86.8% (131/151)
- **Functions**: 95.7% (44/46)
- **Lines**: 92.6% (188/203)
- **Priority**: MEDIUM - Branch coverage needs improvement
- **Focus**: Error handling branches, edge cases

#### 8. `blockchains` Package
- **Statements**: 97.3% (72/74)
- **Branches**: 100.0% (19/19) ✅
- **Functions**: 92.9% (13/14)
- **Lines**: 97.3% (72/74)
- **Priority**: LOW - Nearly complete
- **Focus**: One function needs coverage

#### 9. `notifications` Package
- **Statements**: 97.8% (133/136)
- **Branches**: 100.0% (20/20) ✅
- **Functions**: 96.2% (50/52)
- **Lines**: 97.7% (125/128)
- **Priority**: LOW - Nearly complete
- **Focus**: Two functions need coverage

#### 10. `common` Package
- **Statements**: 98.4% (738/750)
- **Branches**: 95.0% (285/300)
- **Functions**: 95.4% (267/280)
- **Lines**: 98.5% (675/685)
- **Priority**: MEDIUM - Branch coverage needs improvement
- **Focus**: Remaining branches, edge cases

#### 11. `resolver` Package
- **Statements**: 98.5% (336/341)
- **Branches**: 92.5% (124/134)
- **Functions**: 98.6% (68/69)
- **Lines**: 98.7% (307/311)
- **Priority**: LOW - Nearly complete
- **Focus**: Branch coverage, one function

#### 12. `dapp-connector` Package
- **Statements**: 99.1% (233/235)
- **Branches**: 97.0% (161/166)
- **Functions**: 100.0% (54/54) ✅
- **Lines**: 99.5% (210/211)
- **Priority**: LOW - Nearly complete
- **Focus**: Branch coverage, 2 statements

### ✅ COMPLETE (100% Coverage)

- **claim** - 100% coverage ✅
- **exchange** - 100% coverage ✅
- **explorers** - 100% coverage ✅
- **identicon** - 100% coverage ✅
- **portfolio** - 100% coverage ✅
- **setup-wallet** - 100% coverage ✅
- **transfer** - 100% coverage ✅

## Recommended Testing Strategy

### Phase 1: Critical Path (Weeks 1-3)
**Goal**: Get critical packages to >80% coverage

1. **`tx` Package** (39.8% → 100%)
   - Focus on remaining untested functions
   - Add integration tests for complex CSL interactions
   - Test edge cases and error paths
   - **Estimated effort**: 1-2 weeks

2. **`staking` Package** (47.6% → 100%)
   - Pool operations
   - Delegation logic
   - Certificate handling
   - Reward calculations
   - **Estimated effort**: 1 week

3. **`p2p-communication` Package** (22.4% → 100%)
   - WebRTC handling
   - Message routing
   - Connection management
   - **Estimated effort**: 1 week

### Phase 2: High Priority (Weeks 4-5)
**Goal**: Complete high-priority packages

4. **`links` Package** (62.5% → 100%)
   - Focus on branch coverage (42.7% → 100%)
   - QR generation edge cases
   - Link parsing error handling
   - **Estimated effort**: 3-4 days

5. **`swap` Package** (84.3% → 100%)
   - Remaining edge cases
   - Error handling branches
   - **Estimated effort**: 2-3 days

### Phase 3: Polish (Weeks 6-7)
**Goal**: Complete remaining packages to 100%

6. **`api` Package** (93.2% → 100%)
   - Branch coverage (86.8% → 100%)
   - Error handling paths
   - **Estimated effort**: 1-2 days

7. **`common` Package** (98.4% → 100%)
   - Branch coverage (95.0% → 100%)
   - Remaining edge cases
   - **Estimated effort**: 1-2 days

8. **Remaining packages** (97%+ → 100%)
   - `blockchains` - 1 function
   - `notifications` - 2 functions
   - `resolver` - branches + 1 function
   - `dapp-connector` - branches + 2 statements
   - `theme` - if needed
   - **Estimated effort**: 2-3 days

## Testing Best Practices

1. **Focus on Coverage Metrics, Not File Count**
   - One test file can cover multiple implementation files
   - Integration tests can cover multiple units
   - Focus on actual coverage percentages

2. **Priority Order**:
   - Statements coverage (most important)
   - Branches coverage (error paths, conditionals)
   - Functions coverage (all functions called)
   - Lines coverage (all lines executed)

3. **Test Types**:
   - Unit tests for pure functions
   - Integration tests for API interactions
   - Mock external dependencies (CSL, APIs, etc.)

4. **Common Patterns**:
   - Mock CSL using `CardanoMobileWrapped.cslScope` mocks
   - Use `jest.fn()` for function mocks
   - Test error cases and edge cases
   - Test both success and failure paths

## Success Metrics

- ✅ All packages have 100% statement coverage
- ✅ All packages have 100% branch coverage
- ✅ All packages have 100% function coverage
- ✅ All packages have 100% line coverage
- ✅ All tests pass consistently
- ✅ No linting errors
- ✅ No TypeScript errors
- ✅ CI/CD pipeline passes

## Estimated Timeline

- **Phase 1**: 3 weeks (Critical packages)
- **Phase 2**: 2 weeks (High priority)
- **Phase 3**: 2 weeks (Polish)
- **Total**: ~7 weeks for comprehensive coverage

## Notes

- Coverage metrics are based on actual test runs, not file counts
- Some packages may have files that don't need tests (pure type definitions, re-exports)
- Focus on testing business logic, not implementation details
- Prioritize tests that catch bugs and prevent regressions
- Integration tests can provide coverage for multiple units

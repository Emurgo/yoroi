# Feature Restoration Guide

This document tracks the features that were temporarily removed from the TxHistoryNavigator and provides a systematic approach to restoring them.

## 🎯 **Restoration Strategy**

### **Phase 1: Core Dependencies**
- [ ] Resolve CSL (Cardano Serialization Library) version conflicts
- [ ] Update manager maker APIs to match new structure
- [ ] Fix type conflicts between different package versions
- [ ] Update provider hierarchies

### **Phase 2: Feature by Feature Restoration**
- [x] **Portfolio** (Current Priority)
- [ ] **Swap Features**
- [ ] **Exchange Features**
- [ ] **Send/Receive Features**
- [ ] **Scan Features**
- [ ] **Notifications**
- [ ] **Governance Features**

## 📊 **Removed Features Analysis**

### **Portfolio Features** (Priority 1)
**Status**: 🔄 **IN PROGRESS**

**Removed Components**:
- `PortfolioNavigator` - Main portfolio navigation
- `PortfolioTokensList` - Token list display
- `TotalTokensValue` - Total value calculation
- `TokenValueBalance` - Individual token balance
- `TokenValuePairedBalance` - Paired token balance

**Dependencies**:
- `@yoroi/portfolio` package
- Portfolio manager makers
- Token balance calculations
- Price feed integrations

**Issues to Resolve**:
- Portfolio manager API changes
- Token balance calculation updates
- Price feed integration updates

**Restoration Steps**:
1. ✅ Create restoration branch
2. 🔄 Add back PortfolioNavigator
3. 🔄 Restore portfolio components
4. 🔄 Fix portfolio manager integration
5. 🔄 Test portfolio functionality

### **Swap Features** (Priority 2)
**Status**: ⏳ **PENDING**

**Removed Components**:
- `SwapMainScreen` - Main swap interface
- `SelectTokenScreen` - Token selection
- `SelectProtocolScreen` - Protocol selection
- `ReviewSwap` - Swap review screen
- `SwapSettings` - Swap settings
- `ListOrders` - Order list
- `ShowPreprodNoticeScreen` - Preprod notice

**Dependencies**:
- `@yoroi/swap` package
- Swap manager makers
- CSL integration for swap operations

**Issues to Resolve**:
- CSL type conflicts
- Swap manager API changes
- Protocol integration updates

### **Exchange Features** (Priority 3)
**Status**: ⏳ **PENDING**

**Removed Components**:
- `CreateExchangeOrderScreen` - Order creation
- `SelectProviderFromListScreen` - Provider selection
- `ShowExchangeResultOrderScreen` - Order results

**Dependencies**:
- `@yoroi/exchange` package
- Exchange manager makers
- Provider integrations

**Issues to Resolve**:
- Exchange manager API changes
- Provider integration updates

### **Send/Receive Features** (Priority 4)
**Status**: ⏳ **PENDING**

**Removed Components**:
- `StartMultiTokenTxScreen` - Multi-token transactions
- `SelectTokenFromListScreen` - Token selection for sending
- `ListAmountsToSendScreen` - Amount selection
- `EditAmountScreen` - Amount editing
- `SendSubmittedTxScreen` - Transaction submission
- `SendFailedTxScreen` - Transaction failure
- `DescribeSelectedAddressScreen` - Address details
- `ListMultipleAddressesScreen` - Address list
- `RequestSpecificAmountScreen` - Specific amount requests

**Dependencies**:
- Send/Receive manager makers
- Address management
- Transaction building

**Issues to Resolve**:
- Transaction builder API changes
- Address management updates

### **Scan Features** (Priority 5)
**Status**: ⏳ **PENDING**

**Removed Components**:
- `ScanCodeScreen` - QR code scanning
- `ShowCameraPermissionDeniedScreen` - Camera permission

**Dependencies**:
- Camera permissions
- QR code processing

**Issues to Resolve**:
- Camera permission handling
- QR code processing updates

### **Notifications** (Priority 6)
**Status**: ⏳ **PENDING**

**Removed Components**:
- `ViewNotificationHistoryScreen` - Notification history

**Dependencies**:
- Notification manager
- Notification storage

**Issues to Resolve**:
- Notification manager API changes

### **Governance Features** (Priority 7)
**Status**: ⏳ **PENDING**

**Removed Components**:
- `GovernanceProvider` - Governance context
- Governance manager makers

**Dependencies**:
- `@yoroi/staking` package
- Governance manager makers

**Issues to Resolve**:
- Governance manager API changes

## 🛠️ **Restoration Process**

### **For Each Feature**:

1. **Create Feature Branch**
   ```bash
   git checkout -b fix/restore-[feature-name]
   ```

2. **Add Back Components**
   - Restore component files
   - Update import paths to absolute
   - Fix component dependencies

3. **Update Dependencies**
   - Update package versions if needed
   - Fix manager maker APIs
   - Resolve type conflicts

4. **Test Feature**
   - Test feature in isolation
   - Verify integration with main app
   - Fix any issues found

5. **Merge Back**
   ```bash
   git checkout fix/wallet-navigation-and-functionality
   git merge fix/restore-[feature-name]
   ```

## 📝 **Testing Checklist**

### **Portfolio Testing**
- [ ] Portfolio screen loads correctly
- [ ] Token list displays properly
- [ ] Total value calculation works
- [ ] Individual token balances show correctly
- [ ] Navigation to portfolio works
- [ ] No runtime errors in console

### **General Testing**
- [ ] Feature integrates with main navigation
- [ ] No TypeScript compilation errors
- [ ] No runtime errors
- [ ] UI components render correctly
- [ ] Theme integration works
- [ ] Navigation between screens works

## 🔧 **Debugging Tools**

### **TypeScript Check**
```bash
cd apps/mobile
npx tsc --noEmit --skipLibCheck
```

### **App Testing**
```bash
cd apps/mobile
npm run android --debug
```

### **Previous Working Version Reference**
```bash
git checkout rn71
# Check specific files for working implementations
git checkout fix/wallet-navigation-and-functionality
```

## 📊 **Progress Tracking**

| Feature | Status | Branch | Notes |
|---------|--------|--------|-------|
| Portfolio | 🔄 IN PROGRESS | `fix/restore-portfolio` | Starting with portfolio |
| Swap | ⏳ PENDING | - | Next priority |
| Exchange | ⏳ PENDING | - | After swap |
| Send/Receive | ⏳ PENDING | - | After exchange |
| Scan | ⏳ PENDING | - | After send/receive |
| Notifications | ⏳ PENDING | - | After scan |
| Governance | ⏳ PENDING | - | Last priority |

## 🎯 **Current Focus: Portfolio Restoration**

**Next Steps**:
1. ✅ Create restoration documentation
2. 🔄 Create portfolio restoration branch
3. 🔄 Add back PortfolioNavigator
4. 🔄 Restore portfolio components
5. 🔄 Fix portfolio manager integration
6. 🔄 Test portfolio functionality 
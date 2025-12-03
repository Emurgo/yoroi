import {CardanoWalletDependencies} from '@yoroi/cardano-wallet/dependencies'

import {toLedgerSignRequest} from '~/features/Discover/common/ledger'
import {buildPortfolioBalanceManager} from '~/features/Portfolio/common/helpers/build-balance-manager'
import {toBalanceManagerSyncArgs} from '~/features/Portfolio/common/transformers/toBalanceManagerSyncArgs'
import {createCollateralEntry} from '~/features/Settings/ui/screens/ChangeWalletSettingsScreen/ManageCollateralScreen/helpers'
import {makeMemosManager} from '~/features/Transactions/common/memos/memosManager'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'
import {rootStorage} from '~/kernel/storage/storages'

/**
 * Initialize Cardano wallet dependencies
 * This wires up all platform-specific implementations required by the wallet package
 */
export const createCardanoWalletDependencies =
  (): CardanoWalletDependencies => {
    return {
      rootStorage,
      makeWalletEncryptedStorage,
      buildPortfolioBalanceManager,
      toBalanceManagerSyncArgs,
      makeMemosManager,
      toLedgerSignRequest,
      createCollateralEntry,
    }
  }

import {CardanoWalletDependencies} from '@yoroi/cardano-wallet/dependencies'
import {App} from '@yoroi/types'

import {buildPortfolioBalanceManager} from '~/features/Portfolio/common/helpers/build-balance-manager'
import {toBalanceManagerSyncArgs} from '~/features/Portfolio/common/transformers/toBalanceManagerSyncArgs'
import {makeMemosManager} from '~/features/Transactions/common/memos/memosManager'
import {toLedgerSignRequest} from '~/features/Discover/common/ledger'
import {createCollateralEntry} from '~/features/Settings/ui/screens/ChangeWalletSettingsScreen/ManageCollateralScreen/helpers'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'
import {rootStorage} from '~/kernel/storage/storages'

/**
 * Initialize Cardano wallet dependencies
 * This wires up all platform-specific implementations required by the wallet package
 */
export const createCardanoWalletDependencies = (): CardanoWalletDependencies => {
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


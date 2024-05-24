import BuildConfig from 'react-native-config'

const getString = (key: string) => BuildConfig[key] ?? ''

export const sentryDsn = getString('SENTRY_DSN')
export const unstoppableApiKey = getString('UNSTOPPABLE_API_KEY')
export const commit = getString('COMMIT')

export const buildVariant = getString('BUILD_VARIANT')
export const isNightly = buildVariant === 'NIGHTLY'
export const isProduction = buildVariant === 'PROD'
export const isDev = __DEV__ // for dev BUILD_VARIANT must be set != prod/nighly

export const frontendFeeAddressMainnet = getString('FRONTEND_FEE_ADDRESS_MAINNET')
export const frontendFeeAddressPreprod = getString('FRONTEND_FEE_ADDRESS_PREPROD')

export const banxaTestWallet = getString('BANXA_TEST_WALLET')

export const dappExplorerEnabled = Boolean(BuildConfig['DAPP_EXPLORER_ENABLED'])
export const disableLogbox = Boolean(BuildConfig['DISABLE_LOGBOX'])

import Constants from 'expo-constants'

const getEnvString = (key: string) => Constants.expoConfig?.extra?.[key] ?? ''

export const sentryDsn = getEnvString('SENTRY_DSN')
export const unstoppableApiKey = getEnvString('UNSTOPPABLE_API_KEY')
export const commit = getEnvString('COMMIT')

export const buildVariant = getEnvString('BUILD_VARIANT')

export const frontendFeeAddressMainnet = getEnvString(
  'FRONTEND_FEE_ADDRESS_MAINNET',
)
export const frontendFeeAddressPreprod = getEnvString(
  'FRONTEND_FEE_ADDRESS_PREPROD',
)

export const banxaTestWallet = getEnvString('BANXA_TEST_WALLET')

export const disableLogbox = Boolean(
  Constants.expoConfig?.extra?.DISABLE_LOGBOX,
)

const envLoggerFilter = getEnvString('LOGGER_FILTER')
export const loggerFilter = envLoggerFilter ? new RegExp(envLoggerFilter) : null

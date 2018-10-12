// @flow

export const ASSURANCE_LEVELS = {
  NORMAL: {
    LOW: 3,
    MEDIUM: 9,
  },
  STRICT: {
    LOW: 5,
    MEDIUM: 15,
  },
}

export const CONFIG = {
  USE_MOCK_API: false,
  API_ROOT: 'https://iohk-staging.yoroiwallet.com/api',
  // TODO(ppershing): this should be configurable by user
  ASSURANCE_LEVELS: ASSURANCE_LEVELS.NORMAL,
}

import {freeze} from 'immer'

export const banxaApiGetBaseUrl = ({
  isProduction,
  partner,
}: {
  isProduction: boolean
  partner: string
}) => {
  return async () => {
    const domain =
      banxaApiConfig[isProduction ? 'production' : 'sandbox'].getBaseUrl

    const baseUrl = `https://${partner}.${domain}`

    return Promise.resolve(baseUrl)
  }
}

export const banxaApiConfig = freeze(
  {
    production: {
      getBaseUrl: 'banxa.com',
    },
    sandbox: {
      getBaseUrl: 'banxa-sandbox.com',
    },
  },
  true,
)

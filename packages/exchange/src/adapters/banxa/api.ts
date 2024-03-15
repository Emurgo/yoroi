export const banxaApiGetBaseUrl = () => {
  return async ({
    isProduction,
    partner,
  }: {
    isProduction: boolean
    partner: string
  }): Promise<string> => {
    const domain = isProduction
      ? banxaApiConfig.production.baseUrl
      : banxaApiConfig.sandbox.baseUrl
    const baseUrl = `https://${partner}.${domain}`

    return Promise.resolve(baseUrl)
  }
}

export const banxaApiConfig = {
  production: {
    baseUrl: 'banxa.com',
  },
  sandbox: {
    baseUrl: 'banxa-sandbox.com',
  },
} as const

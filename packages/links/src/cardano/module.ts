import {Links} from '@yoroi/types'
import {
  LinksCardanoUriConfig,
  LinksCardanoClaimV1,
  LinksCardanoLegacyTransfer,
} from './types'
import {preapareParams} from './params'
import {isArray} from '@yoroi/common'
import {isCardanoAddress} from './helpers'

export const cardanoScheme: Links.Scheme = 'web+cardano'
export const configCardanoClaimV1: Readonly<LinksCardanoClaimV1> = {
  scheme: cardanoScheme,
  authority: 'claim',
  version: 'v1',
  rules: {
    requiredParams: ['code', 'faucet_url'],
    optionalParams: [],
    forbiddenParams: ['address'],
    extraParams: 'include',
  },
} as const

export const configCardanoLegacyTransfer: Readonly<LinksCardanoLegacyTransfer> =
  {
    scheme: cardanoScheme,
    authority: '',
    version: '',
    rules: {
      requiredParams: ['address'],
      optionalParams: ['amount', 'memo', 'message'],
      forbiddenParams: [],
      extraParams: 'drop',
    },
  } as const

export const linksCardanoModuleMaker =
  (): Links.Module<LinksCardanoUriConfig> => {
    // NOTE: asking for the config is leaky, since is part of impl and its requesting it, later with more flavors it can add a facade for parse and proxy for create
    const create = ({
      config,
      params,
    }: {
      config: LinksCardanoUriConfig
      params: Links.Link<LinksCardanoUriConfig>['params']
    }) => {
      const sanitizedParams = preapareParams({config, params})
      let url: URL

      const addSearchParams = (
        urlToAdd: URL,
        paramsToAdd: Record<string, any>,
      ) => {
        Object.entries(paramsToAdd).forEach(([key, value]) => {
          // TODO: add support for records
          if (isArray(value)) {
            value.forEach((arrayValue) =>
              urlToAdd.searchParams.append(key, String(arrayValue)),
            )
          } else {
            urlToAdd.searchParams.append(key, value)
          }
        })
      }

      // legacy transfer
      if (config.authority === '') {
        const {address, ...restParams} = sanitizedParams
        // address for legacy needs to be validated here
        if (!isCardanoAddress(address)) {
          throw new Links.Errors.ParamsValidationFailed(
            `The param address on ${config.scheme} ${config.authority} ${config.version} must be a cardano address`,
          )
        }
        url = new URL(config.scheme + ':' + address)
        addSearchParams(url, restParams)
      } else {
        url = new URL(config.scheme + '://' + config.authority + '/')
        addSearchParams(url, sanitizedParams)
        url.pathname = config.version
      }

      return {
        config,
        params: sanitizedParams,
        link: url.href,
      } as const
    }

    const parse = (text: string) => {
      const url = new URL(text)
      const isCardano = url.protocol.startsWith(`${cardanoScheme}:`)
      if (!isCardano) return undefined

      let config: LinksCardanoUriConfig | undefined
      const params: Record<string, any> = {}

      url.searchParams.forEach((value, key) => {
        // TODO: add support for records
        if (params[key]) {
          if (isArray(params[key])) {
            params[key].push(value)
          } else {
            params[key] = [params[key], value]
          }
        } else {
          params[key] = value
        }
      })

      // NOTE: order matters
      if (isCardanoClaimV1(url)) {
        config = configCardanoClaimV1
      } else if (url.pathname !== '' && url.hostname === '') {
        // legacy transfer address is the authority but should be handled as a param
        if (!isCardanoAddress(url.pathname))
          throw new Links.Errors.ParamsValidationFailed(
            `The param address is an invalid cardano address`,
          )
        params.address = url.pathname
        // amount is transformed to number here
        if (params.amount) params.amount = Number(params.amount)
        config = configCardanoLegacyTransfer
      }

      if (!config) throw new Links.Errors.UnsupportedAuthority()

      return create({config, params})
    }

    return {
      create,
      parse,
    } as const
  }

const isCardanoClaimV1 = (url: URL) => {
  if (url.hostname === configCardanoClaimV1.authority) {
    if (url.pathname === `/${configCardanoClaimV1.version}`) return true
    throw new Links.Errors.UnsupportedVersion()
  }
  return false
}

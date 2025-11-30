import {isArray} from '@yoroi/common'
import {Links} from '@yoroi/types'

import {freeze} from 'immer'

import {
  cardanoScheme,
  configCardanoAddressV1,
  configCardanoBlockV1,
  configCardanoBrowseV1,
  configCardanoClaimV1,
  configCardanoConnectV1,
  configCardanoDrepV1,
  configCardanoLegacyTransfer,
  configCardanoPayV1,
  configCardanoPaymentV1,
  configCardanoStakeV1,
  configCardanoTransactionV1,
  configCardanoWalletV1,
} from './constants'
import {
  isCardanoAddress,
  isCardanoAddressV1,
  isCardanoBlockV1,
  isCardanoBrowseV1,
  isCardanoClaimV1,
  isCardanoConnectV1,
  isCardanoDrepV1,
  isCardanoPayV1,
  isCardanoPaymentV1,
  isCardanoStakeV1,
  isCardanoTransactionV1,
  isCardanoWalletV1,
  validateCardanoAddress,
} from './helpers'
import {preapareParams} from './params'
import {LinksCardanoUriConfig} from './types'
import {
  isValidBlockHeight,
  validateBlockHash,
  validateNamespacedDomain,
  validateScheme,
  validateTransactionHash,
} from './validators'

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
        paramsToAdd: Record<string, unknown>,
      ) => {
        Object.entries(paramsToAdd).forEach(([key, value]) => {
          // TODO: add support for records
          if (isArray(value)) {
            value.forEach((arrayValue) =>
              urlToAdd.searchParams.append(key, String(arrayValue)),
            )
          } else {
            urlToAdd.searchParams.append(key, String(value))
          }
        })
      }

      // legacy transfer
      if (config.authority === '') {
        const {address, ...restParams} = sanitizedParams
        // address for legacy needs to be validated here
        if (typeof address !== 'string' || !isCardanoAddress(address)) {
          throw new Links.Errors.ParamsValidationFailed(
            `The param address on ${config.scheme} ${config.authority} ${config.version} must be a cardano address`,
          )
        }
        url = new URL(config.scheme + ':' + address)
        addSearchParams(url, restParams)
      } else if (config.authority === 'browse') {
        // CIP-158 Browse: path-based authority
        const {
          scheme,
          namespaced_domain,
          app_path,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          url: _,
          ...queryParams
        } = sanitizedParams
        const pathSegments = [config.version, scheme, namespaced_domain]
        if (app_path && typeof app_path === 'string') {
          pathSegments.push(...app_path.split('/').filter(Boolean))
        }
        url = new URL(
          config.scheme +
            '://' +
            config.authority +
            '/' +
            pathSegments.join('/'),
        )
        addSearchParams(url, queryParams)
      } else if (config.authority === 'transaction') {
        // CIP-107 Transaction: path-based authority
        const {hash, ...restParams} = sanitizedParams
        url = new URL(
          config.scheme +
            '://' +
            config.authority +
            '/' +
            config.version +
            '/' +
            hash,
        )
        addSearchParams(url, restParams)
      } else if (config.authority === 'address') {
        // CIP-134 Address: path-based authority
        const {address, ...restParams} = sanitizedParams
        url = new URL(
          config.scheme +
            '://' +
            config.authority +
            '/' +
            config.version +
            '/' +
            address,
        )
        addSearchParams(url, restParams)
      } else if (config.authority === 'wallet') {
        // Wallet authority: query-based
        url = new URL(config.scheme + '://' + config.authority + '/')
        addSearchParams(url, sanitizedParams)
        url.pathname = config.version
      } else {
        // Query-based authorities (claim, pay, payment, stake, drep, block, connect)
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
      const params: Record<string, unknown> = {}

      // Extract query params
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

      // NOTE: order matters - check path-based authorities first
      if (isCardanoBrowseV1(url)) {
        // CIP-158 Browse: extract from path segments
        const pathParts = url.pathname.split('/').filter(Boolean)
        if (pathParts.length < 3) {
          throw new Links.Errors.ParamsValidationFailed(
            'Browse URI must have at least version, scheme, and namespaced_domain',
          )
        }
        const [, scheme, namespacedDomain, ...appPathParts] = pathParts
        if (!scheme || !validateScheme(scheme)) {
          throw new Links.Errors.ParamsValidationFailed('Invalid scheme format')
        }
        if (!namespacedDomain || !validateNamespacedDomain(namespacedDomain)) {
          throw new Links.Errors.ParamsValidationFailed(
            'Invalid namespaced domain format',
          )
        }
        const appPath = appPathParts.join('/')
        params.scheme = scheme
        params.namespaced_domain = namespacedDomain
        if (appPath) {
          params.app_path = appPath
        }
        // Reconstruct URL
        const reversedDomain = namespacedDomain.split('.').reverse().join('.')
        const queryString = url.searchParams.toString()
          ? `?${url.searchParams.toString()}`
          : ''
        params.url = `${scheme}://${reversedDomain}/${appPath}${queryString}`
        config = configCardanoBrowseV1
      } else if (isCardanoTransactionV1(url)) {
        // CIP-107 Transaction: extract hash from path
        const pathParts = url.pathname.split('/').filter(Boolean)
        if (pathParts.length < 2) {
          throw new Links.Errors.ParamsValidationFailed(
            'Transaction URI must have version and hash',
          )
        }
        const [, hash] = pathParts
        if (!hash || !validateTransactionHash(hash)) {
          throw new Links.Errors.ParamsValidationFailed(
            'Invalid transaction hash format',
          )
        }
        params.hash = hash
        // Handle fragment for output_index if present
        if (url.hash) {
          const outputIndex = Number(url.hash.slice(1))
          if (Number.isInteger(outputIndex) && outputIndex >= 0) {
            params.output_index = outputIndex
          }
        }
        config = configCardanoTransactionV1
      } else if (isCardanoAddressV1(url)) {
        // CIP-134 Address: extract address from path
        const pathParts = url.pathname.split('/').filter(Boolean)
        if (pathParts.length < 2) {
          throw new Links.Errors.ParamsValidationFailed(
            'Address URI must have version and address',
          )
        }
        const [, address] = pathParts
        if (!address || !validateCardanoAddress(address)) {
          throw new Links.Errors.ParamsValidationFailed(
            'Invalid Cardano address format',
          )
        }
        params.address = address
        config = configCardanoAddressV1
      } else if (isCardanoClaimV1(url)) {
        config = configCardanoClaimV1
      } else if (isCardanoPayV1(url)) {
        config = configCardanoPayV1
      } else if (isCardanoPaymentV1(url)) {
        config = configCardanoPaymentV1
      } else if (isCardanoStakeV1(url)) {
        config = configCardanoStakeV1
      } else if (isCardanoDrepV1(url)) {
        config = configCardanoDrepV1
      } else if (isCardanoBlockV1(url)) {
        // CIP-107 Block: validate either hash or height is present
        const hash = params.hash
        const height = params.height
        if (!hash && !height) {
          throw new Links.Errors.ParamsValidationFailed(
            'Block URI must have either hash or height',
          )
        }
        if (hash && height) {
          throw new Links.Errors.ParamsValidationFailed(
            'Cannot provide both block hash and height',
          )
        }
        if (hash && typeof hash === 'string' && !validateBlockHash(hash)) {
          throw new Links.Errors.ParamsValidationFailed(
            'Invalid block hash format',
          )
        }
        if (
          height &&
          typeof height === 'string' &&
          !isValidBlockHeight(height)
        ) {
          throw new Links.Errors.ParamsValidationFailed(
            'Invalid block height format',
          )
        }
        if (height) {
          params.height = Number(height)
        }
        config = configCardanoBlockV1
      } else if (isCardanoConnectV1(url)) {
        config = configCardanoConnectV1
      } else if (isCardanoWalletV1(url)) {
        config = configCardanoWalletV1
      } else if (url.pathname !== '' && url.hostname === '') {
        // LEGACY COMPATIBILITY: legacy transfer address is the authority but should be handled as a param
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

    return freeze(
      {
        create,
        parse,
      },
      true,
    )
  }

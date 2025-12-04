import {isArrayOfString, isString, isUrl} from '@yoroi/common'
import {Links, Writable} from '@yoroi/types'

import {validateCardanoAddress} from './helpers'
import {LinksCardanoUriConfig} from './types'
import {
  isValidBlockHeight,
  isValidHexKey,
  isValidMnemonic,
  validateBlockHash,
  validateNamespacedDomain,
  validateScheme,
  validateTransactionHash,
} from './validators'

/**
 * Prepares and validates parameters for a Cardano URI link based on a given configuration.
 *
 * This function takes a configuration object and a set of parameters, then performs several
 * operations including validation, checking for forbidden and required parameters, and handling
 * optional and extra parameters as per the configuration rules.
 *
 * It first checks for any forbidden parameters and throws an error if any are found.
 * It then ensures all required parameters are present, throwing an error if any are missing.
 * Optional parameters are validated if they are present.
 * Extra parameters are either dropped or retained based on the `extraParams` configuration.
 *
 * Finally, the function returns a frozen object containing the sanitized and validated parameters.
 *
 * @param {object} args - The arguments object.
 * @param {LinksCardanoUriConfig} args.config - The configuration object defining rules for parameters.
 * @param {Links.Link<LinksCardanoUriConfig>['params']} args.params - The parameters to be prepared and validated.
 *
 * @returns {Readonly<Links.Link<LinksCardanoUriConfig>['params']>} A frozen object containing the sanitized and validated parameters.
 *
 * @throws {Links.Errors.ForbiddenParamsProvided} If any forbidden parameters are provided.
 * @throws {Links.Errors.RequiredParamsMissing} If any required parameters are missing.
 *
 * @note maybe it can become part of config (.rules.validator: ({key, value}: {string, any}) => void)
 */
export const preapareParams = ({
  config,
  params,
}: {
  config: LinksCardanoUriConfig
  params: Links.Link<LinksCardanoUriConfig>['params']
}) => {
  const {forbiddenParams, requiredParams, optionalParams, extraParams} =
    config.rules
  const paramValidator = getParamValidator(config)
  const paramEntries = new Map(Object.entries(params))

  const allParams = new Set<string>([
    ...forbiddenParams,
    ...requiredParams,
    ...optionalParams,
  ])

  // drop extra params
  if (extraParams === 'drop') {
    paramEntries.forEach((_, key) => {
      if (!allParams.has(key)) {
        paramEntries.delete(key)
      }
    })
  }

  for (const forbidenParam of forbiddenParams) {
    if (paramEntries.has(forbidenParam)) {
      throw new Links.Errors.ForbiddenParamsProvided(
        `Please remove the param ${forbidenParam} on ${config.scheme} ${config.authority} ${config.version}`,
      )
    }
  }

  for (const requiredParam of requiredParams) {
    if (!paramEntries.has(requiredParam)) {
      throw new Links.Errors.RequiredParamsMissing(
        `Please include the param ${requiredParam} on ${config.scheme} ${config.authority} ${config.version}`,
      )
    }
    const value = paramEntries.get(requiredParam)
    if (value !== undefined) {
      // Check if param must be a string and value is not a string
      if (mustBeString(requiredParam) && typeof value !== 'string') {
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${requiredParam} on ${config.scheme} ${config.authority} ${config.version} must be a string`,
        )
      }
      // Convert to string for validation (validators expect strings)
      const stringValue = typeof value === 'string' ? value : String(value)
      paramValidator({
        key: requiredParam,
        value: stringValue,
      })
    }
  }

  for (const optionalParam of optionalParams) {
    if (paramEntries.has(optionalParam)) {
      const value = paramEntries.get(optionalParam)
      if (value !== undefined) {
        // Check if param must be a string and value is not a string
        if (mustBeString(optionalParam) && typeof value !== 'string') {
          throw new Links.Errors.ParamsValidationFailed(
            `The param ${optionalParam} on ${config.scheme} ${config.authority} ${config.version} must be a string`,
          )
        }
        // Convert to string for validation (validators expect strings)
        const stringValue = typeof value === 'string' ? value : String(value)
        paramValidator({
          key: optionalParam,
          value: stringValue,
        })
      }
    }
  }

  // Special validation for wallet authority: parameter combinations
  if (config.authority === 'wallet') {
    const type = paramEntries.get('type')
    if (type === 'full') {
      const hasMnemonic = paramEntries.has('mnemonic')
      const hasRootKey = paramEntries.has('rootKey')
      if (!hasMnemonic && !hasRootKey) {
        throw new Links.Errors.RequiredParamsMissing(
          `For type=full, either mnemonic or rootKey must be provided on ${config.scheme} ${config.authority} ${config.version}`,
        )
      }
      if (hasMnemonic && hasRootKey) {
        throw new Links.Errors.ParamsValidationFailed(
          `For type=full, cannot provide both mnemonic and rootKey on ${config.scheme} ${config.authority} ${config.version}`,
        )
      }
    } else if (type === 'readonly') {
      const hasAccountPubKey = paramEntries.has('accountPubKey')
      if (!hasAccountPubKey) {
        throw new Links.Errors.RequiredParamsMissing(
          `For type=readonly, accountPubKey must be provided on ${config.scheme} ${config.authority} ${config.version}`,
        )
      }
    } else if (type === 'multisig') {
      const hasMultisigSetup = paramEntries.has('multisigSetup')
      if (!hasMultisigSetup) {
        throw new Links.Errors.RequiredParamsMissing(
          `For type=multisig, multisigSetup must be provided on ${config.scheme} ${config.authority} ${config.version}`,
        )
      }
    }
  }

  return Object.freeze(
    Array.from(paramEntries).reduce(
      (sanitizedParams, [key, value]) => {
        sanitizedParams[key] = value
        return sanitizedParams
      },
      {} as Writable<Links.Link<LinksCardanoUriConfig>['params']>,
    ), // safe since is a subset of params
  )
}

/**
 * Checks if a parameter must be a string type based on its key.
 * This is used to validate type before converting to string.
 * Note: Some params like 'amount', 'memo', 'message' can accept other types
 * (numbers, arrays) so they are not included here.
 */
const mustBeString = (key: string): boolean => {
  const stringOnlyParams = [
    'code',
    'address',
    'dappPeer',
    'host',
    'port',
    'path',
    'scheme',
    'namespaced_domain',
    'app_path',
    'url',
    'hash',
  ]
  return stringOnlyParams.includes(key)
}

/**
 * Creates a parameter validator function based on a given configuration.
 *
 * This function takes a `LinksCardanoUriConfig` object and returns a new function
 * that is used for validating key-value pairs. The returned function takes two arguments,
 * `key` and `value`, representing the parameter to be validated. The validation logic
 * is determined by the structure and rules defined in the `LinksCardanoUriConfig`.
 *
 * If the validation fails, the validator function throws a `Links.Errors.ParamsValidationFailed` error.
 * By default, parameters are validated by name. To apply specific validation logic based on the authority,
 * a specific case can be added in the switch statement for that key; otherwise, the default validation for that name will be used,
 * this can affect your data if `optionalParams` since `extraParams = include` are not tested against the validator.
 *
 * @param {LinksCardanoUriConfig} config - The configuration object defining validation rules.
 *
 * @returns {(key: string, value: string) => void} A validator function that takes a `key` and `value`
 *          as arguments and performs validation based on the provided configuration. If the validation
 *          fails, it throws a `Links.Errors.ParamsValidationFailed` error.
 *
 * @throws {Links.Errors.ParamsValidationFailed} If the parameter fails validation during the execution
 *         of the returned validator function.
 *
 */
export const getParamValidator =
  (config: LinksCardanoUriConfig) =>
  ({key, value}: {key: string; value: string}) => {
    switch (key) {
      case 'amount': {
        if (/^\d{0,20}(\.\d{0,20})?$/.test(String(value))) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a number without thousand separators and using dot as decimal separator`,
        )
      }
      case 'address': {
        // Validate Cardano address format
        if (isString(value) && validateCardanoAddress(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a valid Cardano address`,
        )
      }
      case 'code': {
        // if other check besides `claim` authority is needed it should be added here conditionally
        if (isString(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a string`,
        )
      }
      case 'dappPeer': {
        if (isString(value) && value.length > 0) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a non-empty string`,
        )
      }
      case 'host': {
        if (isString(value) && value.length > 0) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a non-empty string`,
        )
      }
      case 'port': {
        if (isString(value) && /^\d+$/.test(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a numeric string`,
        )
      }
      case 'path': {
        if (isString(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a string`,
        )
      }
      case 'secure': {
        if (value === 'true' || value === 'false') break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be "true" or "false"`,
        )
      }
      case 'scheme': {
        if (isString(value) && validateScheme(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a valid URI scheme`,
        )
      }
      case 'namespaced_domain': {
        if (isString(value) && validateNamespacedDomain(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a valid namespaced domain`,
        )
      }
      case 'app_path': {
        if (isString(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a string`,
        )
      }
      case 'url': {
        // Reconstructed URL for browse authority
        if (isString(value) && isUrl(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a valid URL`,
        )
      }
      case 'hash': {
        // Transaction or block hash validation depends on authority
        if (config.authority === 'transaction') {
          if (isString(value) && validateTransactionHash(value)) break
          throw new Links.Errors.ParamsValidationFailed(
            `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a valid transaction hash`,
          )
        } else if (config.authority === 'block') {
          if (isString(value) && validateBlockHash(value)) break
          throw new Links.Errors.ParamsValidationFailed(
            `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a valid block hash`,
          )
        }
        // Fallback for other authorities
        if (isString(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a string`,
        )
      }
      case 'height': {
        // Height can be a string or number (converted during parsing)
        if (isString(value) && isValidBlockHeight(value)) break
        if (typeof value === 'number' && value >= 0 && Number.isInteger(value))
          break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a valid block height (non-negative integer)`,
        )
      }
      case 'pool': {
        if (isString(value) && value.length > 0) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a non-empty string`,
        )
      }
      case 'asset': {
        if (isString(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a string`,
        )
      }
      case 'faucet_url': {
        if (isUrl(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a valid url`,
        )
      }
      case 'memo': {
        if (isString(value) && value.length <= 255) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a string with max 255 chars`,
        )
      }
      // NOTE: we encode array: item=[1,2,3] item=1&item=2&item=3
      case 'message': {
        if (isString(value) && value.length <= 64) break
        if (isArrayOfString(value) && !value.some((str) => str.length > 64))
          break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a string or array of strings with max 64 chars`,
        )
      }
      // Wallet authority parameters
      case 'type': {
        if (
          isString(value) &&
          (value === 'full' || value === 'readonly' || value === 'multisig')
        )
          break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be either 'full', 'readonly', or 'multisig'`,
        )
      }
      case 'multisigSetup': {
        // Base64-encoded JSON string
        if (isString(value) && value.length > 0) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a non-empty base64-encoded string`,
        )
      }
      case 'mnemonic': {
        if (isString(value) && isValidMnemonic(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a valid BIP39 mnemonic phrase (12, 15, or 24 words)`,
        )
      }
      case 'rootKey': {
        if (isString(value) && isValidHexKey(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a valid hexadecimal root key`,
        )
      }
      case 'accountPubKey': {
        if (isString(value) && isValidHexKey(value)) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a valid hexadecimal account public key`,
        )
      }
      case 'encryption': {
        if (
          isString(value) &&
          (value === 'plain' ||
            value === 'chacha20poly1305' ||
            value === 'chacha20poly1305-csl') // Legacy format, accepted for decryption compatibility
        )
          break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be one of: 'plain' or 'chacha20poly1305'`,
        )
      }
      case 'name': {
        if (isString(value) && value.length > 0) break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a non-empty string`,
        )
      }
      case 'implementation': {
        if (
          isString(value) &&
          (value === 'cardano-cip1852' || value === 'cardano-bip44')
        )
          break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be either 'cardano-cip1852' or 'cardano-bip44'`,
        )
      }
      case 'addressMode': {
        if (isString(value) && (value === 'single' || value === 'multiple'))
          break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be either 'single' or 'multiple'`,
        )
      }
      case 'accountVisual': {
        const numValue = Number(value)
        if (
          isString(value) &&
          !Number.isNaN(numValue) &&
          Number.isInteger(numValue) &&
          numValue >= 0
        )
          break
        throw new Links.Errors.ParamsValidationFailed(
          `The param ${key} on ${config.scheme} ${config.authority} ${config.version} must be a non-negative integer`,
        )
      }
    }
  }

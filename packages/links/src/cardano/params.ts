import {Links, Writable} from '@yoroi/types'
import {LinksCardanoUriConfig} from './types'
import {isArrayOfString, isString, isUrl} from '@yoroi/common'

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
    paramValidator({
      key: requiredParam,
      value: paramEntries.get(requiredParam),
    })
  }

  for (const optionalParam of optionalParams) {
    if (paramEntries.has(optionalParam)) {
      paramValidator({
        key: optionalParam,
        value: paramEntries.get(optionalParam),
      })
    }
  }

  return Object.freeze(
    Array.from(paramEntries).reduce((sanitizedParams, [key, value]) => {
      sanitizedParams[key] = value
      return sanitizedParams
    }, {} as Writable<Links.Link<LinksCardanoUriConfig>['params']>), // safe since is a subset of params
  )
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
      case 'address':
      case 'code': {
        // if other check besides `claim` authority is needed it should be added here conditionally
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
    }
  }

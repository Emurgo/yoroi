import {RegionCode, REGIONS} from './languages'

/**
 * Extracts the region segment from a locale or region string, or returns 'US' as fallback.
 *
 * @param {string} localeOrRegion - A string representing a locale or region, typically in the format of "language_region" or "language-region".
 * @returns {string} The extracted region segment if found, otherwise returns 'US' as fallback.
 * @example getRegion('en-US') // 'US'
 * @example getRegion('pt_BR') // 'BR'
 * @example getRegion('po') // 'US'
 */
export const getRegion = (localeOrRegion: string) => {
  const match = /[_-](\w+)/.exec(localeOrRegion) ?? []
  const [, region] = match
  return isSupportedRegion(region) ? region : 'US'
}

export const isSupportedRegion = (region: string): region is RegionCode => {
  return Object.values(REGIONS).includes(region as RegionCode)
}

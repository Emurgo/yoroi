import { BanxaUnknownError } from '../adapters/errors';
import { banxaDomainProduction, banxaDomainSandbox } from './domains';
import { handleZodErrors } from '../adapters/zod-errors';
import { BanxaUrlReferralQueryStringParamsSchema } from '../adapters/zod-schema';
// -------
// FACTORY
/**
 * Creates an object that provides functionality to Banxa capabilities.
 *
 * @param {BanxaUrlReferralBuilderOptions} options - Configuration options for the referral link generation.
 * @param {string} [options.partner] - The partner name, e.g., "checkout".
 * @param {boolean} [options.isProduction=false] - Indicates if the function should generate production or sandbox URLs.
 *
 * @returns {BanxaModule} An object with methods to generate Banxa referral links.
 */
export const banxaModuleMaker = function (_ref) {
  let {
    partner,
    isProduction
  } = _ref;
  let {
    zodErrorTranslator = handleZodErrors
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const domain = isProduction ? banxaDomainProduction : banxaDomainSandbox;
  const baseUrl = `https://${partner}.${domain}`;

  /**
   * Create a Banxa referral URL based on query parameters.
   * @param queries - Query parameters for generating the Banxa referral URL.
   * @returns A URL object representing the generated Banxa referral link.
   * @throws {BanxaValidationError | BanxaUnknownError} Throws specific errors if validation fails or an unknown error occurs.
   */
  const createReferralUrl = queries => {
    try {
      const validatedQueries = BanxaUrlReferralQueryStringParamsSchema.parse(queries);
      const url = new URL(baseUrl);
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(validatedQueries)) {
        params.append(key, value.toString());
      }
      url.search = params.toString();
      return url;
    } catch (error) {
      zodErrorTranslator(error);
      throw new BanxaUnknownError(JSON.stringify(error)); // TS doesn't know that zodErrorTranslator will throw
    }
  };

  return {
    createReferralUrl
  };
};

// -----
// TYPES
// https://docs.banxa.com/docs/referral-method
//# sourceMappingURL=module.js.map
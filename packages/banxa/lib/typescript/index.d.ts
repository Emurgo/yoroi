export { banxaDomainProduction, banxaDomainSandbox, banxaSupportUrl, } from './translators/domains';
export { banxaModuleMaker } from './translators/module';
export { BanxaErrorMessages } from './adapters/errors';
import type { BanxaFiatType } from './helpers/fiat-types';
import type { BanxaCoinType } from './helpers/coin-types';
import type { BanxaModule, BanxaReferralUrlBuilderOptions, BanxaReferralUrlQueryStringParams } from './translators/module';
import { BanxaUnknownError, BanxaValidationError } from './adapters/errors';
export declare namespace Banxa {
    type CoinType = BanxaCoinType;
    type FiatType = BanxaFiatType;
    type ReferralUrlBuilderOptions = BanxaReferralUrlBuilderOptions;
    type ReferralUrlQueryStringParams = BanxaReferralUrlQueryStringParams;
    type Module = BanxaModule;
    interface UnknownError extends BanxaUnknownError {
    }
    interface ValidationError extends BanxaValidationError {
    }
}
//# sourceMappingURL=index.d.ts.map
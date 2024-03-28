import {freeze} from 'immer'

import {banxaLogo, encryptusLogo} from './logos'

// TODO: move to yoroi configuration manager
export const trustedApps: Readonly<
  Map<string, {name: string; xpub: string | undefined; logo: string; provider: string}>
> = freeze(
  new Map(
    __DEV__
      ? [['yoroi', {name: 'Yoroi Test', provider: 'EMURGO', xpub: '', logo: ''}]]
      : [
          [
            '18d1545a-a59b-45cb-a180-157b110c77fe',
            {
              name: 'Encryptus Exchange',
              provider: 'Encryptus',
              xpub: '',
              logo: encryptusLogo,
            },
          ],
          [
            '160e2963-e5fa-4d20-b406-4c91c13f1d5c',
            {
              name: 'Banxa Ramp On',
              provider: 'Banxa',
              xpub: '',
              logo: banxaLogo,
            },
          ],
        ],
  ),
  true,
)

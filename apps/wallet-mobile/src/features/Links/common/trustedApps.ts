import {freeze} from 'immer'

import {anzensLogo, banxaLogo, cardanoSpotLogo, encryptusLogo} from './logos'

// TODO: move to yoroi configuration manager
export const trustedApps: Readonly<
  Map<string, {name: string; vkey: string | undefined; logo: string; provider: string}>
> = freeze(
  new Map(
    __DEV__
      ? [['yoroi', {name: 'Yoroi Test', provider: 'EMURGO', vkey: '', logo: ''}]]
      : [
          [
            '18d1545a-a59b-45cb-a180-157b110c77fe',
            {
              name: 'Encryptus Exchange',
              provider: 'Encryptus',
              vkey: '',
              logo: encryptusLogo,
            },
          ],
          [
            '160e2963-e5fa-4d20-b406-4c91c13f1d5c',
            {
              name: 'Banxa Ramp On',
              provider: 'Banxa',
              vkey: '',
              logo: banxaLogo,
            },
          ],
          [
            '388c75fd-6820-4202-a4a6-9ea9038e2e35',
            {
              name: 'Cardano Spot',
              provider: 'EMURGO',
              vkey: '',
              logo: cardanoSpotLogo,
            },
          ],
          [
            '388c75fd-6820-4202-a4a6-9ea9038e2e35',
            {
              name: 'Anzens',
              provider: 'Anzens',
              vkey: '',
              logo: anzensLogo,
            },
          ],
        ],
  ),
  true,
)

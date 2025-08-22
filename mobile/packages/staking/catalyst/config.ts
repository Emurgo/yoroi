import {freeze} from 'immer'

import {Catalyst} from '../types'

export const catalystConfig: Catalyst.Config = freeze({
  api: {
    fund: 'https://core.projectcatalyst.io/api/v0/fund',
  },
  apps: {
    ios: 'https://apps.apple.com/fr/app/catalyst-voting/id1517473397',
    android: 'https://play.google.com/store/apps/details?id=io.iohk.vitvoting',
  },
  groups: {
    community: 'https://t.me/ProjectCatalystChat',
    announcements: 'https://t.me/cardanocatalyst',
  },
  media: {
    townhall:
      'https://www.youtube.com/playlist?list=PLnPTB0CuBOByRhpTUdALq4J89m_h7QqLk',
  },
  newsletter: 'https://mpc.projectcatalyst.io/newsletter-signup',
  others: {
    ideascale: 'https://cardano.ideascale.com/',
  },
})

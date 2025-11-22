import {catalystConfig} from './config'

describe('catalyst config', () => {
  it('should have correct API configuration', () => {
    expect(catalystConfig.api.fund).toBe(
      'https://core.projectcatalyst.io/api/v0/fund',
    )
  })

  it('should have correct apps configuration', () => {
    expect(catalystConfig.apps.ios).toBe(
      'https://apps.apple.com/fr/app/catalyst-voting/id1517473397',
    )
    expect(catalystConfig.apps.android).toBe(
      'https://play.google.com/store/apps/details?id=io.iohk.vitvoting',
    )
  })

  it('should have correct groups configuration', () => {
    expect(catalystConfig.groups.community).toBe(
      'https://t.me/ProjectCatalystChat',
    )
    expect(catalystConfig.groups.announcements).toBe(
      'https://t.me/cardanocatalyst',
    )
  })

  it('should have correct media configuration', () => {
    expect(catalystConfig.media.townhall).toBe(
      'https://www.youtube.com/playlist?list=PLnPTB0CuBOByRhpTUdALq4J89m_h7QqLk',
    )
  })

  it('should have correct newsletter URL', () => {
    expect(catalystConfig.newsletter).toBe(
      'https://mpc.projectcatalyst.io/newsletter-signup',
    )
  })

  it('should have correct others configuration', () => {
    expect(catalystConfig.others.ideascale).toBe(
      'https://cardano.ideascale.com/',
    )
  })

  it('should be frozen', () => {
    expect(Object.isFrozen(catalystConfig)).toBe(true)
  })
})


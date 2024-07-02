import {Catalyst} from '../types'

export const mockFundInfo: Catalyst.FundInfo = {
  id: 12,
  fundName: 'Fund12',
  fundStartTime: new Date('2024-06-27T12:00:00Z'),
  fundEndTime: new Date('2024-07-11T11:00:00Z'),
  registrationSnapshotTime: new Date('2024-06-18T21:45:00Z'),
  challenges: [
    {
      id: 1,
      challengeType: 'simple',
      title: 'Cardano Open: Developers',
      description:
        'Cardano Open: Developers supports developers and engineers to contribute to or develop open source technology centered around enabling and improving the Cardano developer experience. \n\n  \n\n\nThe goal here is to create Cardano developer-friendly tooling and approaches that streamline an integrated development environment.',
      rewardsTotal: 10500000,
      proposersRewards: 10500000,
      challengeUrl:
        'https://projectcatalyst.io/funds/12/f12-cardano-open-developers',
    },
    {
      id: 2,
      challengeType: 'simple',
      title: 'Cardano Open: Ecosystem',
      description:
        'Cardano Open: Ecosystem helps drive ecosystem growth, foster education and community initiatives, expand Cardano’s global footprint and onboard more Cardano users.\n\n  \n\n\nAccepting submissions for a broad range of initiatives that help drive such goals through marketing, education, Cardano governance, and regional community building.',
      rewardsTotal: 5500000,
      proposersRewards: 5500000,
      challengeUrl:
        'https://projectcatalyst.io/funds/12/f12-cardano-open-ecosystem',
    },
    {
      id: 3,
      challengeType: 'simple',
      title: 'Cardano Use Cases: Concept',
      description:
        'Cardano Use Cases: Concept will accept early stage ideas to deliver proof of concept, design research and basic prototyping for innovative Cardano-based products, services, and business models.',
      rewardsTotal: 7500000,
      proposersRewards: 7500000,
      challengeUrl:
        'https://projectcatalyst.io/funds/12/f12-cardano-use-cases-concept',
    },
    {
      id: 4,
      challengeType: 'simple',
      title: 'Cardano Use Cases: MVP',
      description:
        'Cardano Use Cases: MVP is for projects seeking to develop and test the technical feasibility of solutions and prepare early prototypes to a minimum viable product (MVP) stage of readiness.',
      rewardsTotal: 7500000,
      proposersRewards: 7500000,
      challengeUrl:
        'https://projectcatalyst.io/funds/12/f12-cardano-use-cases-mvp',
    },
    {
      id: 5,
      challengeType: 'simple',
      title: 'Cardano Use Cases: Product',
      description:
        'Cardano Use Cases: Product is for blockchain projects and teams looking to enhance established products, services, or innovative propositions by significantly extending the existing features and capabilities for the benefit of the Cardano ecosystem. \n\n  \n\n\nApplications must include evidence of a working product in a mature state and has either already deployed on Cardano or will be achieved as the result of the proposal.',
      rewardsTotal: 7500000,
      proposersRewards: 7500000,
      challengeUrl:
        'https://projectcatalyst.io/funds/12/f12-cardano-use-cases-product',
    },
    {
      id: 6,
      challengeType: 'simple',
      title: 'Cardano Partners and Real World Integrations',
      description:
        'Cardano Partners will fuel the fly-wheels of innovation and growth to ignite premium partnerships that benefit Cardano with exceptionally well-recognised leaders of industry.  \n\n  \n\n\nThis category will accept proposals from or involving Tier-1 partners to address one or more of the following objectives: Piloting Cardano blockchain technology, advertising, media, and marketing collaborations, accelerating high potential early stage and start up businesses.',
      rewardsTotal: 8000000,
      proposersRewards: 8000000,
      challengeUrl:
        'https://projectcatalyst.io/funds/12/cardano-partners-and-real-world-integrations',
    },
  ],
  snapshotStart: new Date('2024-06-18T21:45:00Z'),
  votingStart: new Date('2024-06-27T12:00:00Z'),
  votingEnd: new Date('2024-07-11T11:00:00Z'),
  tallyingEnd: new Date('2024-07-24T09:00:00Z'),
  resultsUrl: 'https://projectcatalyst.io/funds/12',
  surveyUrl:
    'https://docs.google.com/forms/d/e/1FAIpQLSdg76N8zAtZn35hclY2pEDf9mY0wUb-vsejfaYZJqoW-CZDrg/viewform?usp=sf_link',
}

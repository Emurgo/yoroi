import {Catalyst} from '../../types'

export const mockCatalystApiFundInfo: Catalyst.CatalystApiFundInfo = {
  id: 12,
  fund_name: 'Fund12',
  fund_goal:
    "{'timestamp': '2024-06-25T17:29:31Z', 'themes': ['API', 'DAO', 'DApp', 'Data tools', 'DeFi', 'Education', 'Events', 'Exchanges', 'Explorers', 'Gaming', 'Governance', 'Identity solutions', 'NFTs', 'RealFi', 'SDK', 'Wallet', 'Cardano Ambassadors', 'Marketing', 'Hackathon', 'Incubation', 'Regional expansion', 'Standards and regulation', 'Translation', 'Dev ecosystem collaboration', 'Dev team', 'Developer tools', 'SPOs', 'Node', 'Other']}",
  voting_power_threshold: 25000000,
  fund_start_time: '2024-06-27T12:00:00Z',
  fund_end_time: '2024-07-11T11:00:00Z',
  next_fund_start_time: '1970-01-01T00:00:00Z',
  registration_snapshot_time: '2024-06-18T21:45:00Z',
  next_registration_snapshot_time: '1970-01-01T00:00:00Z',
  chain_vote_plans: [
    {
      id: -658671521,
      chain_voteplan_id:
        '25e329578f5935fcb687490b97723113dd2c64483a3574c465a9f4a1fe5a8e2c',
      chain_vote_start_time: '2024-06-27T12:00:00Z',
      chain_vote_end_time: '2024-07-11T11:00:00Z',
      chain_committee_end_time: '2024-07-24T09:00:00Z',
      chain_voteplan_payload: 'private',
      chain_vote_encryption_key:
        'ristretto255_votepk1z3xaee2wu8xv9zjfcuc0vetaan7m2zxqd8wwn4e6y4288z9j6ewqky7ahc',
      fund_id: 12,
    },
    {
      id: 67401484,
      chain_voteplan_id:
        '56fb15789a9ed4133411953264c73e256e2c7d6d1a2c06f3a415a9a514dc734d',
      chain_vote_start_time: '2024-06-27T12:00:00Z',
      chain_vote_end_time: '2024-07-11T11:00:00Z',
      chain_committee_end_time: '2024-07-24T09:00:00Z',
      chain_voteplan_payload: 'private',
      chain_vote_encryption_key:
        'ristretto255_votepk1mfv92mw78ejvjf3l3mx06t0yt7a3jnzhs59wh67eqygcphfnguxsmseujk',
      fund_id: 12,
    },
    {
      id: 492456865,
      chain_voteplan_id:
        '126a91795fd0b5a142c4f6d145f453a88457302d447874b7a72ad161eefbb3c6',
      chain_vote_start_time: '2024-06-27T12:00:00Z',
      chain_vote_end_time: '2024-07-11T11:00:00Z',
      chain_committee_end_time: '2024-07-24T09:00:00Z',
      chain_voteplan_payload: 'private',
      chain_vote_encryption_key:
        'ristretto255_votepk1mrydsh7znhkk6dft742esadq9jt0pszf0ut630rh92l9m398vq6q2rttrp',
      fund_id: 12,
    },
    {
      id: 776880069,
      chain_voteplan_id:
        'fbe3a0768719295afefde2f80769207364408d3a76a8cf1e31f3fa1881eecc6c',
      chain_vote_start_time: '2024-06-27T12:00:00Z',
      chain_vote_end_time: '2024-07-11T11:00:00Z',
      chain_committee_end_time: '2024-07-24T09:00:00Z',
      chain_voteplan_payload: 'private',
      chain_vote_encryption_key:
        'ristretto255_votepk1239mjl3g8cdglwfplfv6avtpm2y5x00kgp060azq4vxvatyjreaqw0usej',
      fund_id: 12,
    },
    {
      id: 2056560092,
      chain_voteplan_id:
        '02a9646ca3a2f547580cee1df3f6432093e0f608dbb0995f4a13dabec28cbfbc',
      chain_vote_start_time: '2024-06-27T12:00:00Z',
      chain_vote_end_time: '2024-07-11T11:00:00Z',
      chain_committee_end_time: '2024-07-24T09:00:00Z',
      chain_voteplan_payload: 'private',
      chain_vote_encryption_key:
        'ristretto255_votepk1564r7wv3kjqvmhkcpqg2pvm9pmqrd5u0nu97yrf9f60rs8quescshxt4rw',
      fund_id: 12,
    },
  ],
  challenges: [
    {
      internal_id: 1,
      id: 1,
      challenge_type: 'simple',
      title: 'Cardano Open: Developers',
      description:
        'Cardano Open: Developers supports developers and engineers to contribute to or develop open source technology centered around enabling and improving the Cardano developer experience. \n\n  \n\n\nThe goal here is to create Cardano developer-friendly tooling and approaches that streamline an integrated development environment.',
      rewards_total: 10500000,
      proposers_rewards: 10500000,
      fund_id: 12,
      challenge_url:
        'https://projectcatalyst.io/funds/12/f12-cardano-open-developers',
      highlights: null,
    },
    {
      internal_id: 2,
      id: 2,
      challenge_type: 'simple',
      title: 'Cardano Open: Ecosystem',
      description:
        'Cardano Open: Ecosystem helps drive ecosystem growth, foster education and community initiatives, expand Cardano’s global footprint and onboard more Cardano users.\n\n  \n\n\nAccepting submissions for a broad range of initiatives that help drive such goals through marketing, education, Cardano governance, and regional community building.',
      rewards_total: 5500000,
      proposers_rewards: 5500000,
      fund_id: 12,
      challenge_url:
        'https://projectcatalyst.io/funds/12/f12-cardano-open-ecosystem',
      highlights: null,
    },
    {
      internal_id: 3,
      id: 3,
      challenge_type: 'simple',
      title: 'Cardano Use Cases: Concept',
      description:
        'Cardano Use Cases: Concept will accept early stage ideas to deliver proof of concept, design research and basic prototyping for innovative Cardano-based products, services, and business models.',
      rewards_total: 7500000,
      proposers_rewards: 7500000,
      fund_id: 12,
      challenge_url:
        'https://projectcatalyst.io/funds/12/f12-cardano-use-cases-concept',
      highlights: null,
    },
    {
      internal_id: 4,
      id: 4,
      challenge_type: 'simple',
      title: 'Cardano Use Cases: MVP',
      description:
        'Cardano Use Cases: MVP is for projects seeking to develop and test the technical feasibility of solutions and prepare early prototypes to a minimum viable product (MVP) stage of readiness.',
      rewards_total: 7500000,
      proposers_rewards: 7500000,
      fund_id: 12,
      challenge_url:
        'https://projectcatalyst.io/funds/12/f12-cardano-use-cases-mvp',
      highlights: null,
    },
    {
      internal_id: 5,
      id: 5,
      challenge_type: 'simple',
      title: 'Cardano Use Cases: Product',
      description:
        'Cardano Use Cases: Product is for blockchain projects and teams looking to enhance established products, services, or innovative propositions by significantly extending the existing features and capabilities for the benefit of the Cardano ecosystem. \n\n  \n\n\nApplications must include evidence of a working product in a mature state and has either already deployed on Cardano or will be achieved as the result of the proposal.',
      rewards_total: 7500000,
      proposers_rewards: 7500000,
      fund_id: 12,
      challenge_url:
        'https://projectcatalyst.io/funds/12/f12-cardano-use-cases-product',
      highlights: null,
    },
    {
      internal_id: 6,
      id: 6,
      challenge_type: 'simple',
      title: 'Cardano Partners and Real World Integrations',
      description:
        'Cardano Partners will fuel the fly-wheels of innovation and growth to ignite premium partnerships that benefit Cardano with exceptionally well-recognised leaders of industry.  \n\n  \n\n\nThis category will accept proposals from or involving Tier-1 partners to address one or more of the following objectives: Piloting Cardano blockchain technology, advertising, media, and marketing collaborations, accelerating high potential early stage and start up businesses.',
      rewards_total: 8000000,
      proposers_rewards: 8000000,
      fund_id: 12,
      challenge_url:
        'https://projectcatalyst.io/funds/12/cardano-partners-and-real-world-integrations',
      highlights: null,
    },
  ],
  insight_sharing_start: '2024-04-17T11:00:00Z',
  proposal_submission_start: '2024-04-17T11:00:00Z',
  refine_proposals_start: '2024-04-17T11:00:00Z',
  finalize_proposals_start: '2024-04-17T11:00:00Z',
  proposal_assessment_start: '2024-04-17T11:00:00Z',
  assessment_qa_start: '2024-04-17T11:00:00Z',
  snapshot_start: '2024-06-18T21:45:00Z',
  voting_start: '2024-06-27T12:00:00Z',
  voting_end: '2024-07-11T11:00:00Z',
  tallying_end: '2024-07-24T09:00:00Z',
  goals: [],
  results_url: 'https://projectcatalyst.io/funds/12',
  survey_url:
    'https://docs.google.com/forms/d/e/1FAIpQLSdg76N8zAtZn35hclY2pEDf9mY0wUb-vsejfaYZJqoW-CZDrg/viewform?usp=sf_link',
  next: {
    id: 13,
    fund_name: 'Fund13',
    insight_sharing_start: '1970-01-01T00:00:00Z',
    proposal_submission_start: '1970-01-01T00:00:00Z',
    refine_proposals_start: '1970-01-01T00:00:00Z',
    finalize_proposals_start: '1970-01-01T00:00:00Z',
    proposal_assessment_start: '1970-01-01T00:00:00Z',
    assessment_qa_start: '1970-01-01T00:00:00Z',
    snapshot_start: '1970-01-01T00:00:00Z',
    voting_start: '1970-01-01T00:00:00Z',
    voting_end: '1970-01-01T00:00:00Z',
    tallying_end: '1970-01-01T00:00:00Z',
  },
}

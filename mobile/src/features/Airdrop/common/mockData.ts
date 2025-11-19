import type {AddressAllocation, ThawScheduleResponse} from '../types'

// Mock data for UI testing
export const MOCK_THAW_SCHEDULE: ThawScheduleResponse = {
  number_of_claimed_allocations: 1,
  thaws: [
    {
      amount: 1000000, // 1 NIGHT (6 decimals)
      status: 'redeemable',
      thawing_period_start: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 7 days ago
    },
    {
      amount: 1000000,
      status: 'upcoming',
      thawing_period_start: new Date(
        Date.now() + 83 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 83 days from now
    },
    {
      amount: 1000000,
      status: 'upcoming',
      thawing_period_start: new Date(
        Date.now() + 173 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 173 days from now
    },
    {
      amount: 1000000,
      status: 'confirmed',
      thawing_period_start: new Date(
        Date.now() - 100 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 100 days ago
      transaction_id: 'abc123def456',
    },
  ],
}

export const MOCK_ADDRESS_ALLOCATION: AddressAllocation = {
  address:
    'addr1qy7rqeu2t0f463akeq3zcyg8cjw0qguhevf6ypx2s8tftwf627hhjyls27xwmke4e4ewn27rv3qcntakvp7wd53dqahqkzkj85',
  schedule: MOCK_THAW_SCHEDULE,
  redeemableAmount: 1000000, // 1 NIGHT
  totalAllocation: 4000000, // 4 NIGHT
  redeemedSoFar: 1000000, // 1 NIGHT
  totalLeftToRedeem: 3000000, // 3 NIGHT
}

export const MOCK_ADDRESS_ALLOCATIONS: AddressAllocation[] = [
  MOCK_ADDRESS_ALLOCATION,
  {
    address:
      'addr1qxgj7uns5arz7mc3gr2lcah6n4fcjzz7skxxrjpyj78alwe627hhjyls27xwmke4e4ewn27rv3qcntakvp7wd53dqahq8caghr',
    schedule: {
      number_of_claimed_allocations: 2,
      thaws: [
        {
          amount: 2000000,
          status: 'redeemable',
          thawing_period_start: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          amount: 2000000,
          status: 'upcoming',
          thawing_period_start: new Date(
            Date.now() + 85 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          amount: 2000000,
          status: 'upcoming',
          thawing_period_start: new Date(
            Date.now() + 175 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          amount: 2000000,
          status: 'upcoming',
          thawing_period_start: new Date(
            Date.now() + 265 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      ],
    },
    redeemableAmount: 2000000,
    totalAllocation: 8000000,
    redeemedSoFar: 0,
    totalLeftToRedeem: 8000000,
  },
]

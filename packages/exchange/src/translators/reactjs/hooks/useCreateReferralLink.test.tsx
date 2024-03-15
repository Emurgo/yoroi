import * as React from 'react'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'
import {useCreateReferralLink} from './useCreateReferralLink'
import {Exchange} from '@yoroi/types'
import {wrapperFixture} from '../../../fixtures/wrapper'
import {QueryClient} from 'react-query'
import {queryClientFixture} from '../../../fixtures/query-client'

describe('useCreateReferralLink', () => {
  let queryClient: QueryClient
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    const TestReferralLing = () => {
      const getBaseUrl = jest.fn(
        () => 'base-url',
      ) as unknown as Exchange.Api['getBaseUrl']
      const createReferralUrl = jest.fn(
        () => 'referral-url',
      ) as unknown as Exchange.Manager['createReferralUrl']
      const isProduction = true
      const partner = 'yoroi'
      const queries: Exchange.ReferralUrlQueryStringParams = {
        orderType: 'buy',
        fiatType: 'USD',
        coinType: 'ADA',
        walletAddress: 'address',
      }

      const {referralLink} = useCreateReferralLink({
        getBaseUrl,
        createReferralUrl,
        isProduction,
        partner,
        queries,
      })

      return (
        <View>
          <Text testID="link">{JSON.stringify(referralLink)}</Text>
        </View>
      )
    }

    const wrapper = wrapperFixture({
      queryClient,
    })
    const {getByTestId} = render(<TestReferralLing />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('link')).toBeDefined()
    })
    expect(getByTestId('link').props.children).toEqual(
      JSON.stringify('referral-url'),
    )
  })
})

import {SwapOpenOrder} from '@yoroi/types/lib/swap/order'
import React from 'react'

import {getMockOrders} from './mocks'

export type OrderProps = {
  tokenPrice: string
  tokenAmount: string
  assetFromLabel: string
  assetFromIcon: React.ReactNode
  assetToLabel: string
  assetToIcon: React.ReactNode
  navigateTo?: () => void
  onPress?: () => void
  buttonText?: string
  withBoxShadow?: boolean
  date: string
  liquidityPoolIcon: React.ReactNode
  liquidityPoolName: string
  txId: string
  total: string
  poolUrl: string
  txLink: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const mapOrders = (orders: Array<SwapOpenOrder>): Array<OrderProps> => {
  return getMockOrders()
}

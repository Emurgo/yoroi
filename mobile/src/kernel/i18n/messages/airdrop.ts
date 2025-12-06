import {defineMessages} from 'react-intl'

export const airdropMessages = defineMessages({
  bannerTitle: {
    id: 'airdrop.bannerTitle',
    defaultMessage: '!!!NIGHT Tokens Available',
  },
  bannerBody: {
    id: 'airdrop.bannerBody',
    defaultMessage: '!!!You have {amount} redeemable NIGHT tokens',
  },
  title: {
    id: 'airdrop.title',
    defaultMessage: '!!!Redeem NIGHT',
  },
  noAllocations: {
    id: 'airdrop.noAllocations',
    defaultMessage: '!!!No allocations found',
  },
  noAllocationsDescription: {
    id: 'airdrop.noAllocationsDescription',
    defaultMessage: "!!!This wallet doesn't have any NIGHT token allocations.",
  },
  loading: {
    id: 'airdrop.loading',
    defaultMessage: '!!!Loading allocations...',
  },
  error: {
    id: 'airdrop.error',
    defaultMessage: '!!!Failed to load allocations',
  },
  address: {
    id: 'airdrop.address',
    defaultMessage: '!!!Address',
  },
  destinationAddress: {
    id: 'airdrop.destinationAddress',
    defaultMessage: '!!!Destination address',
  },
  totalAllocation: {
    id: 'airdrop.totalAllocation',
    defaultMessage: '!!!Your total allocation size',
  },
  redeemedSoFar: {
    id: 'airdrop.redeemedSoFar',
    defaultMessage: '!!!Redeemed so far',
  },
  totalLeftToRedeem: {
    id: 'airdrop.totalLeftToRedeem',
    defaultMessage: '!!!Total left to redeem',
  },
  redeemableNow: {
    id: 'airdrop.redeemableNow',
    defaultMessage: '!!!Redeemable now',
  },
  currentThaw: {
    id: 'airdrop.currentThaw',
    defaultMessage: '!!!Current thaw',
  },
  endsIn: {
    id: 'airdrop.endsIn',
    defaultMessage: '!!!Ends in',
  },
  startsIn: {
    id: 'airdrop.startsIn',
    defaultMessage: '!!!Starts in',
  },
  active: {
    id: 'airdrop.active',
    defaultMessage: '!!!Active',
  },
  thawInfo: {
    id: 'airdrop.thawInfo',
    defaultMessage: '!!!Each thaw is 25% of your claimed NIGHT allocation',
  },
  numberOfClaimedAllocations: {
    id: 'airdrop.numberOfClaimedAllocations',
    defaultMessage: '!!!No. of claimed allocations',
  },
  redeem: {
    id: 'airdrop.redeem',
    defaultMessage: '!!!Redeem',
  },
  redeeming: {
    id: 'airdrop.redeeming',
    defaultMessage: '!!!Redeeming...',
  },
  viewTransactions: {
    id: 'airdrop.viewTransactions',
    defaultMessage: '!!!View transactions in explorer',
  },
  details: {
    id: 'airdrop.details',
    defaultMessage: '!!!Details',
  },
  enterPassword: {
    id: 'airdrop.enterPassword',
    defaultMessage: '!!!Enter your password to sign the redemption transaction',
  },
  redeemSuccess: {
    id: 'airdrop.redeemSuccess',
    defaultMessage: '!!!Redemption transaction submitted successfully',
  },
  redeemError: {
    id: 'airdrop.redeemError',
    defaultMessage: '!!!Failed to redeem tokens',
  },
  insufficientFunds: {
    id: 'airdrop.insufficientFunds',
    defaultMessage: '!!!Insufficient funds to cover transaction fees',
  },
  statusUpcoming: {
    id: 'airdrop.status.upcoming',
    defaultMessage: '!!!Upcoming',
  },
  statusRedeemable: {
    id: 'airdrop.status.redeemable',
    defaultMessage: '!!!Redeemable',
  },
  statusSubmitted: {
    id: 'airdrop.status.submitted',
    defaultMessage: '!!!Submitted',
  },
  statusConfirming: {
    id: 'airdrop.status.confirming',
    defaultMessage: '!!!Confirming',
  },
  statusConfirmed: {
    id: 'airdrop.status.confirmed',
    defaultMessage: '!!!Confirmed',
  },
  statusFailed: {
    id: 'airdrop.status.failed',
    defaultMessage: '!!!Failed',
  },
  statusQueued: {
    id: 'airdrop.status.queued',
    defaultMessage: '!!!Queued',
  },
  statusSkipped: {
    id: 'airdrop.status.skipped',
    defaultMessage: '!!!Skipped',
  }, // Add these to the existing airdropMessages in airdrop.ts
  destinationAddressTitle: {
    id: 'airdrop.destinationAddressTitle',
    defaultMessage: '!!!Destination address',
  },
  destinationAddressNumber: {
    id: 'airdrop.destinationAddressNumber',
    defaultMessage: '!!!Destination address {number}',
  },
  apply: {
    id: 'airdrop.apply',
    defaultMessage: '!!!Apply',
  },
  thawSchedule: {
    id: 'airdrop.thawSchedule',
    defaultMessage: '!!!Thaw schedule',
  },
  thawScheduleDescription: {
    id: 'airdrop.thawScheduleDescription',
    defaultMessage:
      '!!!Use this page as a baseline for further top performance activities.',
  },
  thawNumber: {
    id: 'airdrop.thawNumber',
    defaultMessage: '!!!Thaw {current}/{total}',
  },
  phaseAnnouncement: {
    id: 'airdrop.phaseAnnouncement',
    defaultMessage:
      '!!!Phase 3. Lost and Found NIGHT of midnight airdrop has started.',
  },
  moreDetails: {
    id: 'airdrop.moreDetails',
    defaultMessage: '!!!More Midnight airdrop details',
  },
  allocationSize: {
    id: 'airdrop.allocationSize',
    defaultMessage: '!!!Allocation size',
  },
  noAvailableYet: {
    id: 'airdrop.noAvailableYet',
    defaultMessage: '!!!No available yet',
  },
  redeemed: {
    id: 'airdrop.redeemed',
    defaultMessage: '!!!Redeemed',
  },
  detailsOn: {
    id: 'airdrop.detailsOn',
    defaultMessage: '!!!Details on',
  },
  redeemableThaws: {
    id: 'airdrop.redeemableThaws',
    defaultMessage: '!!!Redeemable thaws',
  },
  readOnlyWallet: {
    id: 'airdrop.readOnlyWallet',
    defaultMessage: '!!!Read-only wallets cannot redeem tokens',
  },
  noRedeemableThaws: {
    id: 'airdrop.noRedeemableThaws',
    defaultMessage: '!!!No thaws are currently redeemable',
  },
})

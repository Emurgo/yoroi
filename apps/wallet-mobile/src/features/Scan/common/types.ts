// TODO: migrate to yoroi types after fully implemented
export class ScanErrorUnknownContent extends Error {}
export class ScanErrorUnknown extends Error {}

export type ScanActionSendOnlyReceiver = Readonly<{
  action: 'send-only-receiver'
  receiver: string
}>
export type ScanActionSendSinglePt = Readonly<{
  action: 'send-single-pt'
  receiver: string
  params:
    | {
        amount: number | undefined
        memo: string | undefined
        message: string | undefined
      }
    | undefined
}>
export type ScanActionClaim = Readonly<{
  action: 'claim'
  url: string
  code: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any> | undefined
}>
export type ScanAction = ScanActionSendOnlyReceiver | ScanActionSendSinglePt | ScanActionClaim

export type ScanFeature = 'send' | 'scan'

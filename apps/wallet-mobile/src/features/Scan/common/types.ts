// TODO: migrate to yoroi types after full implemented
export class ScanErrorUnknownContent extends Error {}
export class ScanErrorUnknown extends Error {}
export type ScanAction = Readonly<
  | {
      action: 'send-only-receiver'
      receiver: string
    }
  | {
      action: 'send-single-pt'
      receiver: string
      params:
        | {
            amount: number | undefined
            memo: string | undefined
            message: string | undefined
          }
        | undefined
    }
  | {
      action: 'claim'
      url: string
      code: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: Record<string, any> | undefined
    }
>

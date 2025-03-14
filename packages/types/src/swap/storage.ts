import {SwapManagerConfig} from './manager'

export type SwapStorage = {
  slippage: {
    read(): Promise<number>
    remove(): Promise<void>
    save(slippage: number): Promise<void>
    key: string
  }

  config: {
    read(): Promise<SwapManagerConfig>
    remove(): Promise<void>
    save(routing: SwapManagerConfig): Promise<void>
    key: string
  }

  clear(): Promise<void>
}

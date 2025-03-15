import {SwapManagerConfig} from './manager'

export type SwapStorage = {
  config: {
    read(): Promise<SwapManagerConfig>
    remove(): Promise<void>
    save(routing: SwapManagerConfig): Promise<void>
    key: string
  }

  clear(): Promise<void>
}

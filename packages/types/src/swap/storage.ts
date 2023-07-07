export type SwapStorage = {
  slippage: {
    read(): Promise<number>
    remove(): Promise<void>
    save(slippage: number): Promise<void>
  }
}

export type AppProtocolParamsResponse = Readonly<{
  epoch: number
  min_fee_a: number
  min_fee_b: number
  max_block_size: number
  max_tx_size: number
  max_block_header_size: number
  key_deposit: string
  pool_deposit: string
  min_utxo: string
  min_pool_cost: string
  price_mem: number
  price_step: number
  max_tx_ex_mem: string
  max_tx_ex_steps: string
  max_block_ex_mem: string
  max_block_ex_steps: string
  max_val_size: string
  collateral_percent: number
  max_collateral_inputs: number
  coins_per_utxo_size: string
  coins_per_utxo_word: string
}>

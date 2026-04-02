import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'

import {Buffer} from 'buffer'

import type {EscrowDatum} from './types'

/**
 * Parse an escrow inline datum from CBOR hex.
 *
 * Datum structure:
 * Constr(0, [
 *   address: Constr(0, [payment_cred: Constr(0, [ByteString(28)]), staking_cred]),
 *   night_per_thaw: Integer,
 *   next_thaw_time: Integer (ms),
 *   thaws_remaining: Integer,
 *   interval: Integer (ms)
 * ])
 */
export function parseEscrowDatum(datumHex: string): EscrowDatum {
  return CardanoMobileWrapped.cslScope((csl) => {
    const plutusData = csl.PlutusData.fromHex(datumHex)
    const constr = plutusData.asConstrPlutusData()
    if (!constr || constr.alternative().toStr() !== '0') {
      throw new Error('Invalid escrow datum: expected Constr(0, ...)')
    }

    const fields = constr.data()
    if (fields.len() !== 5) {
      throw new Error(
        `Invalid escrow datum: expected 5 fields, got ${fields.len()}`,
      )
    }

    // Field 0: address Constr(0, [payment_cred, staking_cred])
    const addrConstr = fields.get(0).asConstrPlutusData()
    if (!addrConstr) throw new Error('Invalid escrow datum: address field')
    const addrFields = addrConstr.data()

    // Payment credential: Constr(0, [ByteString(28)])
    const payCredConstr = addrFields.get(0).asConstrPlutusData()
    if (!payCredConstr) throw new Error('Invalid escrow datum: payment cred')
    const payCredBytes = payCredConstr.data().get(0).asBytes()
    if (!payCredBytes)
      throw new Error('Invalid escrow datum: payment cred bytes')
    const paymentCredHash = Buffer.from(payCredBytes).toString('hex')

    // Staking credential: Constr(0, [Constr(0, [Constr(0, [ByteString(28)])])]) or Constr(1, [])
    let stakingCredHash: string | null = null
    if (addrFields.len() >= 2) {
      const stakeConstr = addrFields.get(1).asConstrPlutusData()
      if (stakeConstr && stakeConstr.alternative().toStr() === '0') {
        // Just(StakingHash) — unwrap the nested constructors
        const inner1 = stakeConstr.data().get(0).asConstrPlutusData()
        if (inner1) {
          const inner2 = inner1.data().get(0).asConstrPlutusData()
          if (inner2) {
            const stakeBytes = inner2.data().get(0).asBytes()
            if (stakeBytes) {
              stakingCredHash = Buffer.from(stakeBytes).toString('hex')
            }
          }
        }
      }
      // If alternative is 1, it's Nothing (no staking cred) - leave null
    }

    // Field 1: night_per_thaw
    const nightPerThawInt = fields.get(1).asInteger()
    if (!nightPerThawInt)
      throw new Error('Invalid escrow datum: night_per_thaw is not an integer')
    const nightPerThaw = BigInt(nightPerThawInt.toStr())

    // Field 2: next_thaw_time (ms)
    const nextThawTimeInt = fields.get(2).asInteger()
    if (!nextThawTimeInt)
      throw new Error('Invalid escrow datum: next_thaw_time is not an integer')
    const nextThawTime = BigInt(nextThawTimeInt.toStr())

    // Field 3: thaws_remaining
    const thawsRemainingInt = fields.get(3).asInteger()
    if (!thawsRemainingInt)
      throw new Error('Invalid escrow datum: thaws_remaining is not an integer')
    const thawsRemaining = BigInt(thawsRemainingInt.toStr())

    // Field 4: interval (ms)
    const intervalInt = fields.get(4).asInteger()
    if (!intervalInt)
      throw new Error('Invalid escrow datum: interval is not an integer')
    const interval = BigInt(intervalInt.toStr())

    return {
      paymentCredHash,
      stakingCredHash,
      nightPerThaw,
      nextThawTime,
      thawsRemaining,
      interval,
    }
  })
}

/**
 * Build an updated escrow datum CBOR hex with decremented thaws and advanced next thaw time.
 */
export function buildUpdatedDatumHex(datum: EscrowDatum): string {
  return CardanoMobileWrapped.cslScope((csl) => {
    const fields = csl.PlutusList.new()

    // Field 0: address
    const addrFields = csl.PlutusList.new()

    // Payment cred: Constr(0, [ByteString])
    const payCredFields = csl.PlutusList.new()
    payCredFields.add(
      csl.PlutusData.newBytes(Buffer.from(datum.paymentCredHash, 'hex')),
    )
    addrFields.add(
      csl.PlutusData.newConstrPlutusData(
        csl.ConstrPlutusData.new(csl.BigNum.fromStr('0'), payCredFields),
      ),
    )

    // Staking cred
    if (datum.stakingCredHash) {
      // Just(StakingHash(PubKeyHash(bytes)))
      // Constr(0, [Constr(0, [Constr(0, [ByteString])])])
      const stakeBytes = csl.PlutusList.new()
      stakeBytes.add(
        csl.PlutusData.newBytes(Buffer.from(datum.stakingCredHash, 'hex')),
      )
      const inner2 = csl.PlutusData.newConstrPlutusData(
        csl.ConstrPlutusData.new(csl.BigNum.fromStr('0'), stakeBytes),
      )

      const inner1Fields = csl.PlutusList.new()
      inner1Fields.add(inner2)
      const inner1 = csl.PlutusData.newConstrPlutusData(
        csl.ConstrPlutusData.new(csl.BigNum.fromStr('0'), inner1Fields),
      )

      const justFields = csl.PlutusList.new()
      justFields.add(inner1)
      addrFields.add(
        csl.PlutusData.newConstrPlutusData(
          csl.ConstrPlutusData.new(csl.BigNum.fromStr('0'), justFields),
        ),
      )
    } else {
      // Nothing: Constr(1, [])
      addrFields.add(
        csl.PlutusData.newConstrPlutusData(
          csl.ConstrPlutusData.new(
            csl.BigNum.fromStr('1'),
            csl.PlutusList.new(),
          ),
        ),
      )
    }

    fields.add(
      csl.PlutusData.newConstrPlutusData(
        csl.ConstrPlutusData.new(csl.BigNum.fromStr('0'), addrFields),
      ),
    )

    // Field 1: night_per_thaw (unchanged)
    fields.add(
      csl.PlutusData.newInteger(
        csl.BigInt.fromStr(datum.nightPerThaw.toString()),
      ),
    )

    // Field 2: next_thaw_time + interval
    const newNextThawTime = datum.nextThawTime + datum.interval
    fields.add(
      csl.PlutusData.newInteger(csl.BigInt.fromStr(newNextThawTime.toString())),
    )

    // Field 3: thaws_remaining - 1
    const newThawsRemaining = datum.thawsRemaining - 1n
    fields.add(
      csl.PlutusData.newInteger(
        csl.BigInt.fromStr(newThawsRemaining.toString()),
      ),
    )

    // Field 4: interval (unchanged)
    fields.add(
      csl.PlutusData.newInteger(csl.BigInt.fromStr(datum.interval.toString())),
    )

    // Wrap in Constr(0, [...])
    const datumConstr = csl.ConstrPlutusData.new(
      csl.BigNum.fromStr('0'),
      fields,
    )
    const datumPlutus = csl.PlutusData.newConstrPlutusData(datumConstr)
    return datumPlutus.toHex()
  })
}

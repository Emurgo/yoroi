# Escrow Client-Side Redeem

## Overview

NIGHT token airdrops are distributed in multiple **thaws** (e.g. 4 thaws, ~90 days apart). Thaw #1 requires a Merkle proof from the Midnight API, but thaws #2+ are locked on-chain in a PlutusV3 escrow contract. This means subsequent thaws can be redeemed directly from the client without depending on the API.

The client-side escrow path acts as a fallback for thaws #2+ when the Midnight API fails to build the transaction.

## How it works

### Thaw #1 vs Thaw #2+ (Escrow)

| | Thaw #1 | Thaw #2+ |
|---|---|---|
| **Proof** | Merkle proof (from Midnight API) | None needed — already on-chain |
| **Where tokens live** | Released to eligible address via API tx | Locked at escrow script address |
| **Transaction built by** | Midnight API (`redemptionApi.buildTransaction`) | Client (`buildRedeemTx.ts`) |
| **Submitted via** | Midnight API (witness extraction) | Direct to Cardano network |
| **Script involved** | None | PlutusV3 escrow validator |

### End-to-end flow

```
User taps "Redeem"
  │
  ├─ Try Midnight API first
  │    └─ If API succeeds → sign → submit via API (extract witness set)
  │
  └─ If API fails AND canUseClientSideRedeem(allocation) → escrow path:
       │
       1. Derive escrow address
       │   eligibleAddress → extract staking credential
       │   → combine with ESCROW_SCRIPT_HASH as payment credential
       │   → escrow address (e.g. addr1w<script-hash>...)
       │
       2. Discover escrow UTxO
       │   POST /api/txs/utxoForAddresses with escrow address
       │   → find UTxO with NIGHT tokens + inline datum
       │   → convert JSON datum to CBOR hex via CSL
       │   → parse into EscrowDatum
       │
       3. Validate timing
       │   datum.nextThawTime must be ≤ now
       │
       4. Select wallet UTxOs
       │   → funding UTxOs (~5 ADA for fees + min UTxO)
       │   → collateral UTxO (pure ADA, ≤5 ADA, separate from funding)
       │
       5. Build transaction
       │   → script input (escrow UTxO, redeemer, execution units)
       │   → reference input (known UTxO containing the PlutusV3 script)
       │   → output to eligible address (nightPerThaw NIGHT + min ADA)
       │   → if thawsRemaining > 1: escrow change output with updated datum
       │   → validity interval [max(thawSlot, currentSlot), currentSlot + 7200]
       │   → collateral input
       │
       6. Sign → submit directly to Cardano network
```

## Datum structure

Each escrow UTxO carries an inline datum encoding the full unlock schedule:

```
Constr(0, [
  address:         Constr(0, [paymentCred, stakingCred]),  -- eligible address
  nightPerThaw:    Integer,    -- NIGHT tokens released per thaw
  nextThawTime:    Integer,    -- unix ms when next thaw unlocks
  thawsRemaining:  Integer,    -- number of thaws left (including current)
  interval:        Integer     -- ms between thaw dates (~90 days)
])
```

When a thaw is redeemed and thaws remain, the escrow change output carries an updated datum:
- `nextThawTime` → `nextThawTime + interval`
- `thawsRemaining` → `thawsRemaining - 1`
- Everything else unchanged

## Transaction anatomy

**Inputs:**
- Script input: the escrow UTxO (spent via PlutusV3 validator)
- Funding input(s): wallet UTxOs providing ADA for fees

**Reference input:**
- Known UTxO containing the compiled PlutusV3 script (~6KB)
- Avoids embedding the script in the transaction body

**Outputs:**
1. To eligible address: `nightPerThaw` NIGHT + 1,176,630 lovelace (min UTxO)
2. To escrow address (if thaws remain): remaining NIGHT + updated inline datum

**Redeemer:** `d87980` — CBOR for `Constr(0, [])` (unit / no data)

**Execution units:** 900,000 mem / 250,000,000 steps

**Validity interval:** `[max(thawSlot, currentSlot), currentSlot + 7200]` (~2 hour TTL)

**Collateral:** One pure-ADA UTxO for script failure guarantee

## Key constants

| Constant | Value |
|---|---|
| `ESCROW_SCRIPT_HASH` | `5986bfcc0cbfc60dec8df87715cc95d03817aac386b0e9d33da03b39` |
| `NIGHT_POLICY_ID` | `0691b2fecca1ac4f53cb6dfb00b7013e561d1f34403b957cbb5af1fa` |
| `NIGHT_ASSET_NAME_HEX` | `4e49474854` ("NIGHT") |
| `TREASURY_ADDRESS` | `addr1wxgp2xvmvh0lrfdeu2q3jtqp2lprej6hjvgjx2u5lcwqxlqfvty7h` |
| Script size | 6,278 bytes |

## File map

```
common/escrow/
  ├── constants.ts          # Script hash, token IDs, reference UTxOs, slot config
  ├── types.ts              # EscrowDatum, EscrowUtxo types
  ├── addressDerivation.ts  # Derive escrow address from eligible address
  ├── discovery.ts          # Query API for escrow UTxO, parse JSON datum → CBOR
  ├── datumParser.ts        # CBOR ↔ EscrowDatum (parse and rebuild)
  ├── buildRedeemTx.ts      # Assemble the Plutus transaction
  └── useEscrowRedeem.ts    # React hook: discover → build → submit

common/
  ├── useRedeemThaw.ts      # Orchestrator: tries API first, falls back to escrow
  └── utils.ts              # canUseClientSideRedeem() — eligibility check
```

## Eligibility (`canUseClientSideRedeem`)

Returns true when all of:
1. The allocation has ≥ 2 thaws in the schedule
2. Thaw #1 (index 0) status is `'confirmed'`, `'failed'`, or `'skipped'` — the Midnight API may misreport the status even when thaw #1 succeeded on-chain, so we accept all terminal states; the real check is whether an escrow UTxO exists (verified by `discoverEscrowUtxo`)
3. At least one subsequent thaw (index > 0) has a past `thaw_date` and is not `'confirmed'` or `'confirming'`

## API response note

The `/api/txs/utxoForAddresses` endpoint returns `inline_datum.plutus_data` as a **parsed JSON object** (`{constructor, fields}`), not CBOR hex. The discovery module converts this to CBOR hex using `PlutusData.fromJson()` before datum parsing.

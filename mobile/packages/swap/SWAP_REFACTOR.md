## Swap Refactor Plan: Protocol/Dex/Pool Handling and Limit Orders

### Context

The mobile app provides swap functionality via a package that wraps multiple Cardano swap aggregators: DexHunter, MuesliSwap, and Minswap. Each has unique API shapes and concepts (protocols, dexes, pools, routes, order protocols, orderbooks). Today we maintain per-aggregator adapters and transformers to normalize requests/responses. A manager orchestrates the enabled adapters and merges results.

We are encountering issues with limit orders and protocol/dex/pool drift when providers add or change identifiers. This can result in “unsupported” errors or creating/estimating against the wrong protocol/route.

This document records findings and decisions, plus a phased plan to refactor for resilience and correctness. It also proposes how to leverage MuesliSwap’s `/providers` and `/pools` endpoints to improve limitOptions even if other aggregators lack equivalent endpoints.

---

### Current Architecture (high-level)

- Adapters: One per aggregator with transformers to convert to/from `@yoroi/types`.
- Manager: Fan-in estimates across all enabled aggregators and fan-out create to all, selecting a “best” result.
- UI: Selects a single protocol for create but the manager still fans out to all aggregators.
- Protocol/Dex mapping: Multiple static switch maps scattered across helpers and transformers.

Key types in play (simplified):

```ts
// Proposed changes later in this doc will extend these
type SwapSplit = {
  amountIn: number
  batcherFee: number
  deposits: number
  protocol: Swap.Protocol
  expectedOutput: number
  expectedOutputWithoutSlippage: number
  fee: number
  finalPrice: number
  initialPrice: number
  poolFee: number
  poolId: string
  priceDistortion: number
  priceImpact: number
}

type SwapEstimateResponse = {
  splits: SwapSplit[]
  batcherFee: number
  deposits: number
  aggregatorFee: number
  frontendFee: number
  netPrice: number
  priceImpact: number
  totalFee: number
  totalOutput: number
  totalOutputWithoutSlippage?: number
  totalInput?: number
}

type SwapCreateRequest = {
  amountIn: number
  tokenIn: Portfolio.Token.Id
  tokenOut: Portfolio.Token.Id
  slippage?: number
  wantedPrice?: number // limit orders
  blockedProtocols?: Swap.Protocol[]
  protocol?: Swap.Protocol
  inputs?: unknown
}
```

---

### Problems Identified

- Fan-out create: The manager calls `create` on all enabled adapters even when a single protocol is selected in UI, increasing the chance of mismatches and flaky selections.
- Stale/static mappings: Protocol/Dex/Pool names and versions change upstream; our static maps drift and cause “unsupported” or wrong calls.
- Route loss: Aggregators expose route/pool details (e.g., `pool_id`, `source_id`, `route.pool.pool_id`), but our normalized types don’t carry sufficient metadata to guarantee route consistency between estimate and create.
- Inconsistent limit options: The system treats limit options generically, but aggregators differ substantially (orderbooks vs AMMs vs routed options). We underutilize provider-specific discovery endpoints where available.
- Minor type inconsistency: Typo in `SwapDex.Sundaeswap` value (should not end with `j`).

---

### Inconsistencies Found vs Aggregator Docs (actionable)

DexHunter

- Endpoints for limit orders differ from docs:
  - Docs: `POST /swap/limit` (build) and `POST /swap/limitEstimate`
  - Code: uses `/swap/limit/build` and `/swap/limit/estimate`
  - Fix: add endpoint compatibility layer and prefer docs endpoints with fallback to the legacy paths. Feature flag per environment to switch.
- Prefer explicit DEX selection over blacklist:
  - Docs support `single_preferred_dex` in estimate requests to target one DEX.
  - Code only uses `blacklisted_dexes`.
  - Fix: when a protocol is selected, populate `single_preferred_dex` instead of building a large blacklist; keep blacklist for exclusions.
- Reverse estimate:
  - Docs expose `/swap/reverseEstimate` and we map amountOut → reverse; OK. Ensure manager routes “amountOut” cases to reverse estimate for DexHunter.
- Pools discovery exists:
  - Docs expose `GET /stats/pools/{sell}/{buy}`; not implemented.
  - Fix: implement adapter.introspect pools for catalog and route quality scoring.
- Tokens endpoint accepts `query` and `verified`:
  - Code calls `/swap/tokens` without params.
  - Fix: send `query` and `verified` based on search context; default `verified=true`.

Minswap

- Include/exclude protocols:
  - Docs support both `include_protocols` and `exclude_protocols` on `/estimate` and carry them into `/build-tx` via the embedded `estimate`.
  - Code only uses `exclude_protocols`.
  - Fix: when the user selects a protocol, prefer `include_protocols=[that]` for clarity; otherwise preserve `exclude_protocols` behavior.
- Decimal flags and slippage units:
  - Docs use `amount_in_decimal` (boolean) and slippage as a numeric percentage.
  - Code sets `amount_in_decimal: true` and passes slippage as-is (percentage); OK. Confirm UI value is percent for Minswap.
- Post-build submit endpoint:
  - Docs add `/finalize-and-submit-tx`. We rely on wallet submission; OK. Document that we won’t use the submit endpoint.

MuesliSwap (AggregatorV2)

- Excluded sources must be “frontend options” (FOs):
  - Docs: `/quote` and `/order` expect `excluded_sources` values from `/providers` → `frontend_option`.
  - Code: computes `excluded_sources` from Dex values, not FOs.
  - Fix: integrate `/providers` to map normalized protocols/FOs; build `excluded_sources` with FO strings. If a protocol is selected, exclude all FOs except those mapped to that protocol/route.
- Limit orders require `order_contract` and optionally `pool_id`:
  - Docs: `/limit_order_quote` and `/limit_order` accept `order_contract` (order protocol) and optional `pool_id` (from `/pools`).
  - Code: sets `order_contract` from Dex mapping; does not pass `pool_id`.
  - Fix: resolve `order_contract` via `/providers.order_contract_info` and pass `pool_id` from selected route/pool(s) when available.
- Numbers formatting:
  - Docs use `numbers_have_decimals` booleans; code sets it to true; OK. Ensure consistent for all quote/order/limit requests.
- Orders APIs:
  - Docs include `/open_orders`, `/order_history`, `/estimate_cancel` and `/append_signature`.
  - Code uses `/order_history` and `/cancel`. OK. Optionally use `/estimate_cancel` to show cancel fee estimates.

Cross-cutting

- Slippage scaling is adapter-specific:
  - MuesliSwap expects slippage as a fraction (code divides by 100); Minswap expects percent (no scaling); DexHunter expects percent; Document and enforce per-adapter scaling.
- Route metadata fidelity:
  - DexHunter splits expose `pool_id` and `dex`.
  - Minswap estimate paths expose per-hop `pool_id` and `protocol`.
  - Muesli splits expose `source_id` and `route`/`liquidity_protocol`.
  - Fix: capture these into `Split` and `RouteHint` to stitch estimate→create consistently.

---

### Goals

1. Correct, resilient selection of protocol/dex/pool for both estimate and create.
2. Single-aggregator `create` with route “locking” to match the selected estimate route.
3. Dynamic catalog of aggregator capabilities and identifiers; graceful fallback when providers change.
4. Better, aggregator-specific limitOptions where possible (especially MuesliSwap), with safe fallbacks for others.
5. Improved observability, error taxonomy, and testability.

---

### Decisions (Target Architecture)

#### 1) Dynamic Swap Catalog

Introduce a module (SwapCatalog) that discovers and caches, per aggregator:

- Supported protocols/dex keys and synonym mappings.
- Known pools/route identifiers (when discoverable).
- Capability flags (limit orders, reverse quotes, pool discovery, route locking, etc.).

Characteristics:

- Versioned schema, TTL-based storage, on-demand refresh upon mapping errors.
- Adapters implement `capabilities()` and `introspect()` to populate the catalog.

#### 2) ProtocolResolver

Centralize mapping `Swap.Protocol` → aggregator’s native dex/source key(s). The resolver:

- Uses the catalog to resolve normalized protocols to provider-specific identifiers.
- Falls back gracefully to “no filter” with a degraded score when a mapping is missing.
- Eliminates hand-maintained switch maps across helpers/transformers.

#### 3) Route Metadata in Types

Extend normalized response and request types to preserve route identity:

```ts
// additions (all optional to keep backward compatible)
type RouteHint = {
  aggregator: Swap.Aggregator
  aggregatorDexKey?: string // provider-specific dex/source identifier
  poolIds?: string[] // one or many pool ids composing the route
  quoteId?: string // quote/route id when supported by provider
  // adapter-specific hints below (optional)
  // DexHunter
  singlePreferredDexKey?: string
  // MuesliSwap
  frontendOptions?: string[] // values from /providers.liquidity_source_info[...].frontend_option
  orderContract?: string // from /providers.order_contract_info
}

type SwapSplit = {
  // existing fields…
  aggregator?: Swap.Aggregator
  aggregatorDexKey?: string
  aggregatorPoolId?: string // primary pool id for the split (if single)
  quoteId?: string
}

type SwapCreateRequest = {
  // existing fields…
  routeHint?: RouteHint
}
```

Adapters populate these from their estimate responses (e.g., DexHunter `pool_id`, MuesliSwap `source_id`, Minswap `route[*].pool.pool_id`).

#### 4) Single-Aggregator Create with Route Lock

- Manager `create` will only invoke the adapter corresponding to the selected split’s `aggregator` and pass through `routeHint`.
- If provider supports a quote/route locking step, `create` performs it before building the tx.
- Remove fan-out `create` behavior (retain a temporary flag for rollback during rollout).

#### 5) Retry and Auto-Recovery

On `UnsupportedProtocol/Pool/StaleQuote` errors:

- Refresh catalog for the affected adapter.
- Re-run estimate (or lock) once with the updated mapping.
- If still failing, degrade that adapter for the session and surface a clear message.

#### 6) Limit Options Become Aggregator-Aware

- Manager exposes `limitOptions` that is a union of per-aggregator options.
- For aggregators lacking discovery endpoints, derive options from recent estimates, known capabilities, and last-seen pools.
- For MuesliSwap, use `/providers` and `/pools` to return richer, more accurate options (details below).

#### 7) Observability and Error Taxonomy

- Normalize errors into categories: `UnsupportedProtocol`, `UnsupportedPool`, `StaleQuote`, `RateLimited`, `PartnerRejected`, `InvalidSlippage`, `Unknown`.
- Structured logs include aggregator, dex key, pool ids, tokens, and retry outcome.
- Metrics for estimate/create attempts/success, catalog refreshes, mapping misses.

---

### Consistency & Viability Checklist

Scope and effort are feasible with incremental rollout. Below is a checklist mapping current code → change required → viability notes.

- Manager.create fan-out → single-adapter create

  - Change: remove fan-out, require selected split/routeHint.
  - Viability: Minimal surface change; UI already tracks selected protocol, extend to carry selected split. Keep feature flag.

- ProtocolResolver backed by SwapCatalog

  - Change: add module + adapter.introspect/capabilities.
  - Viability: Self-contained; adapters already encapsulate network calls. Start with protocol lists; add pools later.

- Route metadata propagation

  - Change: add optional fields to `Split` and `CreateRequest`.
  - Viability: Non-breaking type additions; adapters only append fields; UI unaffected initially.

- Slippage units per adapter

  - Change: enforce scaling at adapter boundary.
  - Viability: Localized to transformers; add tests.

- MuesliSwap FOs and pool_id usage

  - Change: call `/providers` (FOs) and `/pools`; build `excluded_sources` from FO strings; pass `order_contract` and `pool_id` for limits.
  - Viability: Optional improvements; fallback to current behavior if endpoints fail. Cache responses with TTL.

- DexHunter endpoint alignment and preferred dex

  - Change: use `POST /swap/limit` (+ `/swap/limitEstimate`) with fallback; add `single_preferred_dex` when pinning.
  - Viability: Straightforward; add try/fallback wrapper; feature flag configurable per env.

- Minswap include_protocols

  - Change: prefer `include_protocols` when pinning; fallback to `exclude_protocols`.
  - Viability: Simple request shape change; docs state Minswap protocols cannot be excluded, so prefer include.

- Reverse estimate (amountOut mode)

  - Change: manager routes output-mode quotes to adapter reverse methods where supported.
  - Viability: DexHunter supports `/swap/reverseEstimate`; Muesli `/quote` supports `buy_amount`; Minswap `/estimate` supports `buy_amount`. Implement per adapter.

- Partner requirements and gating
  - Change: gate DexHunter adapter behind configured partner key (`X-Partner-Id` required by docs).
  - Viability: Already partial; formalize in capabilities(); manager hides adapter if missing.

Rollout gates

- Per-adapter feature flags: `catalog_enabled`, `single_adapter_create`, `muesli_providers_enabled`, `dexhunter_limit_ep_v2`.
- Safe fallbacks: legacy endpoints, blacklist-based protocol exclusion, estimate-derived FO where providers unavailable.

Non-goals in this refactor

- Do not change wallet submission flows; adapters return CBOR, wallet signs/submits.
- Do not unify provider-specific terminology in UI beyond FO labels; keep provider parity minimal.
- Do not modify i18n strings; UI copy remains unchanged initially.

---

### MuesliSwap Enhancements: Using `/providers` and `/pools`

MuesliSwap’s API explicitly distinguishes concepts and offers two key endpoints:

- `/providers`: Maps between DEX, Order Protocol, Liquidity Source/Protocol, Route, and Frontend Option. Notes: A string like `"minswap"` may represent different concepts depending on context. The endpoint returns relationship mappings and which identifiers should be used in `excluded_sources` for `/quote` and `/order`.
- `/pools`: Returns current state of pools meeting given criteria.

We can leverage these to produce accurate limitOptions without guessing protocol versions or pools.

#### Proposed Data Flow for `limitOptions` (MuesliSwap)

1. Bootstrap (catalog/introspection)

   - On app/session start or first entry into Swap, call `/providers` once and cache:
     - All Frontend Options (FOs) suitable for UI selection (the level between Liquidity Protocol and DEX).
     - Mappings between FO → (order protocol(s), liquidity source(s), route(s)).
     - The identifiers to use for `excluded_sources` in `/quote` and `/order`.
   - Store under MuesliSwap section in SwapCatalog, with TTL (e.g., 6–24h).

2. Token Pair Scoping

   - When the user selects a token pair, query `/pools` with filters (token_in/out, optionally constrained by FO or liquidity source) to get live pools:
     - Record `pool_id`, fee tier, and any metadata (decimals, project names, etc.).
     - If pools span multiple routes (e.g., direct vs routed with different fees/deposits), keep them grouped by FO/Route.

3. Build `limitOptions`

   - Aggregate candidate options as a set of Frontend Options each with pool subsets:
     - optionId: stable id derived from FO (and route if needed)
     - label: FO-friendly name (e.g., “Minswap Direct”, “Minswap Routed”, “Orderbook”)
     - routeHint: `{ aggregator: Muesliswap, aggregatorDexKey: <liquidity source>, poolIds: [<pool_id>…] }`
     - expected fees/deposits where predictable by FO/Route; if not, compute by probing `/quote` once per FO at the target price to fill in deposit/batcher fee estimates.
   - De-duplicate where FO maps to the same effective route/pools.

4. UI Presentation

   - Present options grouped by FO (or by “Orderbook vs AMM vs Routed”).
   - Allow the user to exclude an FO (translated into `excluded_sources` for `/quote`/`/order`).

5. Create Flow

   - Once the user selects a limitOption, call MuesliSwap adapter’s `create` with the `routeHint` built from the FO and pools and pass the right `excluded_sources` for `/order`.
   - If `/order` requires a quote lock, execute it before building tx.

6. Fallback Behavior
   - If `/providers` or `/pools` fails, fall back to recent estimate-derived splits (which carry `source_id`/`pool_id`) and present minimal options.
   - Catalog marks MuesliSwap as “partial” and manager penalizes its options in scoring to avoid incorrect creates.

Notes:

- `/providers`’s “Frontend Option” is the exact abstraction we want to expose in UI for fine-grained yet provider-consistent control.
- Because identifiers may be contextual, we keep the original strings from `/providers` and only map them to normalized enums for filtering/grouping, never for calling the provider.

#### Why this is safe despite other aggregators lacking equivalents

- Manager’s `limitOptions` returns a union from all adapters. When an adapter lacks discovery endpoints, its contribution is smaller (or derived from estimates). MuesliSwap’s richer options do not force other adapters to provide the same shape; union is allowed.
- The normalized interface carries `routeHint` and optional `quoteId/poolIds`, which are optional for adapters that cannot provide them.

---

### Changes to Types and Interfaces

1. Extend normalized types (non-breaking):

```ts
declare module '@yoroi/types' {
  namespace Swap {
    type RouteHint = {
      aggregator: Swap.Aggregator
      aggregatorDexKey?: string
      poolIds?: string[]
      quoteId?: string
    }

    type Split = {
      // existing fields
      aggregator?: Swap.Aggregator
      aggregatorDexKey?: string
      aggregatorPoolId?: string
      quoteId?: string
    }

    type CreateRequest = {
      // existing fields
      routeHint?: RouteHint
    }
  }
}
```

2. Adapter additions:

````ts
type AdapterCapabilities = {
  supportsLimitOrders: boolean
  supportsReverseQuote: boolean
  supportsPools: boolean
  hasProtocolFilter: boolean
  canLockQuote: boolean
}

type AdapterIntrospection = {
  protocols: Array<{aggregatorDexKey: string; normalized?: Swap.Protocol}>
  pools?: Array<{
    id: string
    dexKey: string
    tokens: [string, string]
    feeBps?: number
  }>
}

interface SwapAdapter {
  capabilities(): AdapterCapabilities
  introspect(): Promise<AdapterIntrospection>
  resolveProtocol(p: Swap.Protocol): string | undefined // aggregator dex key
}

Mapping of normalized filters → provider params (for reference)

```ts
// Manager input
type NormalizedFilters = {
  blockedProtocols?: Swap.Protocol[]
  pinnedProtocol?: Swap.Protocol
}

// Adapters
// DexHunter
blacklisted_dexes = blockedProtocols?.map(fromSwapProtocol)
single_preferred_dex = pinnedProtocol ? fromSwapProtocol(pinnedProtocol) : undefined

// Minswap
exclude_protocols = blockedProtocols?.map(mapProtocolToDex)
include_protocols = pinnedProtocol ? [mapProtocolToDex(pinnedProtocol)] : undefined

// MuesliSwap
excluded_sources = pinnedProtocol
  ? allFrontendOptionsExceptThoseMappedTo(pinnedProtocol)
  : blockedProtocols?.flatMap(protocolToFrontendOptions)
````

````

3. Manager contract

- `estimate(request)` remains multi-aggregator but attaches `aggregator`, `aggregatorDexKey`, and pool/route info to each `Split`.
- `create(request)` accepts either an explicit aggregator (via `routeHint` or selected split id) and only calls that single adapter.
- `limitOptions(request)` returns a union of adapter-specific options. For MuesliSwap it uses `/providers` and `/pools`; for others it derives from estimates and catalog.

Adapter-specific rules

- DexHunter
  - Use `single_preferred_dex` for protocol pinning when present; otherwise honor `blacklisted_dexes`.
  - Align limit endpoints to `POST /swap/limit` and `POST /swap/limitEstimate` with fallback to legacy paths.
  - Implement pools discovery via `GET /stats/pools/{sell}/{buy}` for catalog.
- Minswap
  - Prefer `include_protocols` when protocol pinning is requested; fallback to `exclude_protocols`.
  - Ensure slippage units remain percent (no /100) and `amount_in_decimal=true`.
- MuesliSwap
  - Build `excluded_sources` from `/providers` Frontend Options, not Dex enums.
  - Resolve `order_contract` for limit orders from `/providers.order_contract_info`.
  - Pass `pool_id` for limit orders when user picked a specific pool.
  - Keep `numbers_have_decimals=true` across quote/order/limit.

---

### Implementation Plan (Phased)

Phase 0 — Safety & Types

- Fix `SwapDex.Sundaeswap` value (remove stray `j`).
- Add optional fields to `Swap.Split` and `Swap.CreateRequest` for route metadata.
- No logic changes yet.

Phase 1 — Catalog & Resolver

- Implement SwapCatalog with TTL storage and provider sections.
- Implement `capabilities()` and `introspect()` in adapters to feed catalog.
- Implement `ProtocolResolver` backed by catalog; migrate transformers to use it.
- Deprecate `helpers/getDexByProtocol.ts` (remove once all adapters updated).

Phase 2 — Estimate with Route Metadata

- Update transformer responses to populate `aggregator`, `aggregatorDexKey`, `poolId(s)`, `quoteId` where available.
- Update best-route scoring to prefer routes with concrete poolIds and resolved protocols.
- Add adapter-specific slippage scaling (MuesliSwap: percent → fraction; Minswap/DexHunter: percent passthrough).

Phase 3 — Single-Adapter Create

- Change manager `create` to only call the selected adapter with `routeHint`.
- For providers supporting quote lock, add a pre-build lock step.

Phase 4 — Retry/Recovery

- On mapping-related errors, refresh catalog → retry once.
- Mark adapter degraded if retry fails; surface messaging and metrics.

Phase 5 — MuesliSwap Limit Options

- Implement a MuesliSwap-specific `limitOptions` path:
  - Use `/providers` to enumerate Frontend Options and mapping to `excluded_sources`.
  - Use `/pools` filtered by token pair and FO/liquidity sources to propose pool-aware options.
  - Optionally probe `/quote` at target price once per FO to refine deposit/batcher fee.
  - Return `routeHint` populated for accurate create.
- For DexHunter/Minswap, provide minimal options derived from estimates and catalog.

Phase 5.1 — DexHunter endpoint compatibility

- Switch to documented `POST /swap/limit` and `POST /swap/limitEstimate`, with automatic fallback to legacy paths if 404/405.
- Add `single_preferred_dex` for protocol pinning and keep blacklist for exclusions.

Phase 6 — Tests & Observability

- Contract tests per adapter for `introspect()` and `resolveProtocol()`.
- Estimate→create round-trip tests ensuring route identity is preserved.
- Manager tests for best-route selection, single-adapter create, and retry logic.
- Metrics and structured logs.

Phase 7 — Cleanup & Docs

- Remove dead static maps.
- Document catalog schema, TTLs, retry policies, and troubleshooting.

---

### Algorithms (concise)

Estimate (Manager):

1. For each enabled adapter A:
   - Resolve protocol filter via ProtocolResolver; if unresolved, omit filter and mark degraded.
   - If `amountOut` is set, call reverse estimate for A; else call normal estimate.
   - Attach route metadata into each split.
2. Merge and score; choose best but retain all splits for UI.

Create (Manager):

1. Require selected split or explicit `routeHint`.
2. Call only the adapter indicated by `routeHint.aggregator`.
3. If supported, lock quote/route; then build tx.
4. On mapping errors, refresh catalog → retry once.

LimitOptions (Manager):

1. For each adapter:
   - If supports options discovery (MuesliSwap): use `/providers` + `/pools` to enumerate.
   - Else: derive from last estimates + catalog (recent pools and dex keys).
2. Union the results; annotate with aggregator to preserve identity in the UI.

Units & Slippage Matrix (for implementers)

```text
DexHunter: amounts in base units (numbers), slippage percentage (e.g., 1 = 1%)
Minswap: amounts accept decimal strings with amount_in_decimal=true (we use decimals), slippage percentage
MuesliSwap: amounts as decimal strings; set numbers_have_decimals=true; slippage is fraction (0.01 = 1%)
````

---

### MuesliSwap: Endpoint Usage Details

1. `/providers`

   - Fetch relationships between DEX, Order Protocol, Liquidity Source/Protocol, Route, Frontend Option.
   - Extract a list of Frontend Options (FOs) suitable for UI selection.
   - Persist raw identifiers for `excluded_sources` to be used in `/quote` and `/order`.
   - Record synonym mappings to help ProtocolResolver later.

2. `/pools`

   - Query with token pair and (optionally) FO/liquidity source constraints to retrieve eligible pools and fee tiers.
   - Produce candidate options with concrete `pool_id`s and associated FO.

3. `/quote` (probe for pricing details)

   - For each FO, probe once at the user’s wanted price (limit) to compute expected deposits/batcher fee if `/pools` doesn’t include them.
   - Use returned `source_id`/route ids to populate `routeHint.quoteId` if applicable.

4. `/order`
   - Use the selected FO and its mapped `excluded_sources` to target the intended liquidity protocol/route.
   - Pass `routeHint.poolIds` and any `quoteId` if supported.

Caching & TTLs:

- `/providers`: refresh daily or upon mapping error.
- `/pools`: cache per token pair briefly (e.g., 5–10 minutes) to avoid staleness.
- `/quote` probes: only on-demand and per FO; do not cache across pairs.

---

### UI/UX (minimal changes)

- Display the selected route summary (aggregator, protocol/dex, number of pools, fee tier).
- Allow excluding sources/protocols via a simple list derived from catalog (maps to `blockedProtocols` for non-Muesli and to `excluded_sources` for Muesli under the hood).
- For limit orders, if an adapter is degraded or catalog is refreshing, show a non-blocking banner.

---

### Observability

- Add structured logs for estimate/create/limitOptions including aggregator, dex key, pool ids, tokens, and retry results.
- Metrics: estimate latency/success, create latency/success, catalog refresh counts, mapping miss counts, error taxonomy counts.

---

### Risks & Mitigations

- Provider response breaking changes → Catalog refresh + permissive resolver + degraded scoring.
- Incomplete discovery (some providers lack `/providers`/`/pools`) → Derive options from estimates and keep optional fields.
- Route staleness between estimate and create → Quote locking where supported; otherwise detect `StaleQuote` and retry once.
- UI complexity → Hide provider-specific jargon behind Frontend Options and concise route summaries.

---

### Rollout Strategy

- Guard major changes behind feature flags per adapter.
- Ship Phase 0–2 first to stabilize estimate metadata and resolver.
- Ship single-adapter create (Phase 3) next with a kill switch.
- Enable MuesliSwap limitOptions (Phase 5) after catalog is stable.
- Monitor metrics and error taxonomy; gradually remove legacy mappings.

---

### Acceptance Criteria (high-level)

- Create calls exactly one adapter, matching the selected estimate route.
- Limit options for MuesliSwap list meaningful Frontend Options and eligible pools; selecting one leads to a consistent create.
- Error rates for `UnsupportedProtocol/Pool` decline measurably (>50%).
- Catalog refreshes auto-recover mapping changes without manual code edits.

---

### Appendix: Minimal API Surface Changes

No breaking changes; only optional fields added. Adapters gain optional capability/introspection methods; manager learns to consume them. UI passes back the selected split/routeHint for create and limit orders.

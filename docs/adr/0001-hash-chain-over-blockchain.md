# ADR 0001: A hash-chained ledger in Postgres instead of a blockchain

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

Origo has to prove that a pack's history (who registered it, every handover, who dispensed it) hasn't been quietly changed. The original project brief suggested Hyperledger Fabric or Polygon for this.

The participants are licensed organizations that already have to trust a regulator and, in our case, the platform operator: they sign up, get approved by an admin, and act through Origo's API. Nobody is anonymous, and there is no token or payment to settle.

## Decision

Keep the ledger in Postgres as an append-only table where each event stores the SHA-256 hash of the event before it, per pack:

```
hash = SHA-256( prevHash | packId | seq | type | actorOrgId | counterpartyOrgId | transferId | createdAt )
```

- A trigger rejects `UPDATE`, `DELETE` and `TRUNCATE` on `ledger_events`.
- Writers lock the packs before appending, and `UNIQUE (pack_id, seq)` backs that up, so chains can't fork.
- Every read of a pack's history recomputes the chain and reports the first broken link, to staff and, as a warning, to patients.

## Consequences

**What we get**

- Tampering by editing or deleting history is detected: changing one field breaks that event's hash and every link after it. This was tested by rewriting and deleting events directly in the database.
- One database, one transaction for "move the pack and record it": ownership and history can't disagree.
- Free to run, no consensus nodes, no gas fees, and the whole thing is a few hundred lines anyone can read.

**What we give up**

- The operator is trusted. Someone with full database control could rebuild a whole chain with new hashes. Mitigations, in order of effort:
  1. A migration role separate from the app's role, so the app can't drop the trigger (planned).
  2. A nightly root hash over the day's events, published somewhere Origo can't edit (a signed Git commit or a public timestamping service).
  3. Anchoring that daily root on a public blockchain: one transaction a day gets most of a blockchain's independence without putting operations on-chain.
- No independent copies held by participants. If that becomes a requirement (for example, regulators wanting their own node), revisit with option 3 first, then a permissioned ledger.

## Alternatives considered

- **Hyperledger Fabric:** strong fit for a consortium of independent organizations each running a peer. Heavy to operate and overkill while one operator runs the platform.
- **Polygon (public chain):** public verifiability, but per-write fees, latency, and pack movements visible to anyone. Anchoring a daily root (above) captures the useful part cheaply.
- **No chain, just an audit table:** simpler, but an edited row would go unnoticed.

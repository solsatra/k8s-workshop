# Agenda — full day (~6h content)

Single team, 5-8 players, one Supervisor Namespace each on a shared Supervisor
cluster. Times are guidance, not law — the chaos round and tournament are the
two blocks worth protecting if the day slips.

| # | Block | Time | Doc |
|---|---|---|---|
| 1 | Intro: VCF/Supervisor/All-Apps architecture, workshop goals | 25 min | — |
| 2 | Orientation: kubectl, explore your namespace/RBAC | 15 min | [01](01-orientation.md) |
| 3 | Core deploy: Deployment + Service + Ingress, first playable | 40 min | [02](02-first-deploy.md) |
| 4 | ConfigMap + Secret | 25 min | [03](03-config-and-secrets.md) |
| — | *Break* | 15 min | |
| 5 | Leaderboard wiring + kill-the-pod fault isolation demo | 55 min | [04](04-leaderboard-and-fault-isolation.md) |
| — | *Lunch* | 50 min | |
| 6 | PVC/PV/StorageClass — session state via Redis | 40 min | [05](05-persistent-storage.md) |
| 7 | Self-healing deep dive | 25 min | [06](06-self-healing.md) |
| 8 | **Chaos round** — diagnose a broken deployment | 35 min | [07](07-chaos-round.md) |
| — | *Break* | 15 min | |
| 9 | HPA — scale under load | 35 min | [08](08-autoscaling.md) |
| 10 | NetworkPolicy — lock down leaderboard-api | 30 min | [09](09-network-policy.md) |
| 11 | Tournament: live play, leaderboard on screen, prizes | 30 min | [10](10-tournament.md) |
| 12 | Retro / Q&A | 15 min | — |

Total content: ~6h05m, plus lunch and two breaks.

## Bonus / overflow cards

If a player finishes a block early, hand them one of these instead of letting
them idle:

- Add a liveness probe to `snake-core` that fails on purpose (bad path) and
  watch Kubernetes restart it in a loop — explain the difference from
  readiness.
- Add resource `requests`/`limits` to every container and explain what
  changes for scheduling.
- Try reaching another player's namespace with `kubectl` — confirm RBAC
  stops them.

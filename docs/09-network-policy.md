# 9. Network policy

**Concept:** by default, any pod in a namespace can talk to any other pod in
that namespace (and, depending on your Supervisor's default posture,
possibly across namespaces too) — NetworkPolicy is how you make that
explicit and restrictive instead of implicit and open.

> Your facilitator will tell you which of the two starting states below
> applies on this cluster — the two are opposites, and only one matches
> what you'll actually see.

## Steps

1. Before applying anything, run a throwaway pod and hit `leaderboard-api`
   directly, bypassing `snake-core` entirely, to see your namespace's
   starting posture:

   ```bash
   kubectl run probe --rm -it --image=busybox --restart=Never -- \
     wget -qO- leaderboard-api:8080/scores/top
   ```

   - **If this succeeds:** your cluster is open-by-default within a
     namespace — continue to step 2, you're about to lock that down.
   - **If this already fails/hangs:** your cluster enforces a default-deny
     posture before you've applied anything. Skip to step 2 anyway — you're
     now adding the policy that explicitly *allows* `snake-core` through,
     rather than one that blocks everyone else. Same manifest either way.

2. Fill in and apply `manifests/templates/09-networkpolicy.yaml`, scoping
   ingress to `leaderboard-api` so only pods labeled `app: snake-core` can
   reach it.

3. Repeat step 1's probe.

   - If you started open: it should now hang or be refused.
   - If you started closed: it stays refused — the policy didn't change
     this probe's outcome, only `snake-core`'s (next step).

4. Confirm `snake-core` itself still works — reload the game in your
   browser, leaderboard panel should still populate normally.

## Checkpoint

An arbitrary pod in your namespace can no longer reach `leaderboard-api`
directly, but `snake-core` still can.

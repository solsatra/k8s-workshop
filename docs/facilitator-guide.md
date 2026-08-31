# Facilitator guide — pre-workshop setup

Do this before the day starts. Nothing here is a participant exercise.

## 1. Build and push the images

Each player deploys the same two images; only their manifests differ.

```bash
docker build -t <registry>/snake-core:1.0 apps/snake-core
docker build -t <registry>/leaderboard-api:1.0 apps/leaderboard-api
docker push <registry>/snake-core:1.0
docker push <registry>/leaderboard-api:1.0
```

Use whatever registry your Supervisor cluster's namespaces can already pull
from (Harbor instance, project registry, etc.) — swap `<registry>` in every
manifest template accordingly. If it's a private registry, create an
`imagePullSecret` per namespace ahead of time so players don't have to.

## 2. Stand up the scoreboard VM (the "All Apps" piece)

Full steps in [db/vm-setup.md](../db/vm-setup.md). Summary:

1. Provision a VM through vSphere Supervisor's VM Service using
   [db/postgres-vm.yaml](../db/postgres-vm.yaml) — this creates a
   `VirtualMachine` plus a `VirtualMachineService` of type `LoadBalancer`, so
   it gets a stable IP reachable from every player's Namespace regardless of
   NSX per-namespace network segmentation.
2. Install Postgres on it, apply [db/schema.sql](../db/schema.sql).
3. Note the LB IP `kubectl get virtualmachineservice` gives you — you'll hand
   this out (or template it) as `DB_HOST` for every player's Secret in
   exercise 4.
4. Create one Postgres role/password for the whole workshop (all players
   share one DB, differentiated by a `player` column) — hand out the same
   credentials to everyone, or pre-stage each player's Secret for them if you
   want to skip that step in-session.

## 3. Provision one Supervisor Namespace per player

- One Namespace each, quota enough for ~4-6 small pods and a small PVC.
- Scope RBAC so each player can only see/edit their own Namespace (this is
  also what exercise 1 has them verify).
- Pre-create the `imagePullSecret` in each namespace if using a private
  registry.

## 4. Chaos round prep

[scripts/apply-chaos.sh](../scripts/apply-chaos.sh) applies one randomly
chosen broken manifest from `manifests/chaos/` into each player's namespace
mid-workshop. Before running it, replace the `<registry>` placeholder in
`bad-image-tag.yaml` and `missing-configmap-key.yaml` with your real
registry (same one from step 1) — otherwise every namespace looks
image-pull-broken regardless of which bug landed. Run it once everyone has
a healthy deployment from exercises 2-4, right before block 8. Keep the
"answer key" (which bug went where) for yourself — see comments at the top
of each file in `manifests/chaos/`.

## 5. Load generator for the HPA exercise

[scripts/load-gen.sh](../scripts/load-gen.sh) hits a player's Ingress/Service
URL repeatedly. Test it once against your own deploy beforehand so you know
roughly how many requests/sec it takes to trip the HPA threshold you set in
[manifests/templates/08-hpa.yaml](../manifests/templates/08-hpa.yaml).

## 6. Big screen for the tournament

Point a browser at a small dashboard hitting `leaderboard-api`'s
`/scores/top` endpoint (a simple auto-refreshing page is enough — see
[docs/10-tournament.md](10-tournament.md) for a one-file example you can
open directly).

## 7. Verify your NSX network policy default posture (for exercise 9)

Exercise 9 asks players to prove `leaderboard-api` is reachable *before* a
NetworkPolicy and blocked *after*. Both halves depend on facts about your
specific Supervisor cluster that I can't know from here — check them
yourself before the day, ideally in a scratch namespace rather than a
player's:

**a. Is anything blocked by default?** vSphere Supervisor's networking
(NSX, or Antrea depending on your VCF version) can be configured either way
— some environments allow all pod-to-pod traffic within and across
namespaces by default, others isolate namespaces from each other out of the
box. Test both directions before deciding what "before" looks like in the
exercise:

```bash
# same-namespace, no policy applied yet — should normally succeed
kubectl run probe --rm -it --image=busybox --restart=Never -n <ns> -- \
  wget -qO- leaderboard-api.<ns>.svc.cluster.local:8080/scores/top

# cross-namespace — result tells you your default posture
kubectl run probe --rm -it --image=busybox --restart=Never -n <other-ns> -- \
  wget -qO- leaderboard-api.<ns>.svc.cluster.local:8080/scores/top
```

- If **same-namespace succeeds** and **cross-namespace succeeds** — that's
  the "open by default" case exercise 9 assumes as written; no changes
  needed.
- If **same-namespace already fails** without any policy applied — your
  cluster enforces a default-deny posture already (common when Antrea's
  default NetworkPolicy tier is pre-configured, or an existing cluster-wide
  `NetworkPolicy`/`AntreaNetworkPolicy` is in place). In that case, flip the
  framing in [docs/09-network-policy.md](09-network-policy.md): the
  "before" state is *already* isolated, and the exercise becomes "add the
  policy that explicitly allows `snake-core` through" rather than
  "add the policy that blocks everyone else." Say this explicitly to the
  room — otherwise step 1 of the exercise as written won't reproduce what
  players see.

**b. Does `NetworkPolicy` actually get enforced at all?** The
`networking.k8s.io/v1` `NetworkPolicy` object only does anything if the CNI
implements it. Apply
[manifests/solutions/09-networkpolicy.yaml](../manifests/solutions/09-networkpolicy.yaml)
in a scratch namespace and confirm the cross-namespace probe above actually
changes behavior. If it doesn't, your cluster's default posture is being
enforced by something other than standard NetworkPolicy (e.g. NSX
Distributed Firewall rules managed outside Kubernetes) — in that case, swap
exercise 9 for a facilitator-led walkthrough of wherever that enforcement
actually lives instead of a hands-on `kubectl apply`.

## Day-of checklist

- [ ] Images pushed, pullable from every namespace
- [ ] Scoreboard VM up, schema applied, LB IP noted
- [ ] Per-player namespaces + RBAC + pull secrets in place
- [ ] Chaos manifests reviewed, answer key kept for yourself
- [ ] Load-gen script sanity-checked
- [ ] Leaderboard dashboard ready for the big screen
- [ ] Cross-namespace default posture tested, NetworkPolicy enforcement confirmed, exercise 9 framing adjusted if needed

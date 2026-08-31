# 6. Self-healing deep dive

**Concept:** the Deployment/ReplicaSet controller continuously reconciles
"how many pods should exist" against "how many exist" — it isn't watching
for crashes and reacting, it's just always closing that gap, which is why
self-healing looks automatic no matter how a pod goes away.

## Steps

1. Scale up so the effect is visible:

   ```bash
   kubectl scale deployment snake-core --replicas=3
   kubectl get pods -w
   ```

2. Kill one pod directly and watch a replacement appear within seconds:

   ```bash
   kubectl delete pod <one-of-the-three-pod-names>
   ```

3. Simulate a crash loop instead of a clean delete — exec into a pod and
   kill the process itself:

   ```bash
   kubectl exec -it <pod-name> -- kill 1
   ```

   Compare `kubectl get pods` restart count before/after — this goes
   through the container runtime's restart policy, not the Deployment
   controller directly, which is a useful distinction to point out.

4. Scale back down:

   ```bash
   kubectl scale deployment snake-core --replicas=1
   ```

## Checkpoint

You can explain, in one sentence, why a deleted pod comes back without
anyone writing "if pod dies, restart it" logic anywhere.

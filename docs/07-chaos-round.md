# 7. Chaos round

**Concept:** diagnosing failures with `kubectl describe`, `kubectl logs`,
and `kubectl get events` — the actual day-to-day skill, more than any single
manifest field.

Your facilitator has just applied one broken change to your `snake-core`
Deployment or Service. You don't know what it is. Find it and fix it.

## Diagnostic checklist

Work through these in order — most Kubernetes failures show up in the first
one or two:

1. **Is the pod even scheduled and running?**

   ```bash
   kubectl get pods
   ```

   Anything other than `Running`/`Ready` — note the status column exactly
   (`ImagePullBackOff`, `CrashLoopBackOff`, `CreateContainerConfigError`,
   `Pending`, ...). That string tells you which category you're in.

2. **What does the pod's event history say?**

   ```bash
   kubectl describe pod <pod-name>
   ```

   Read the `Events` section at the bottom — it's chronological and usually
   names the exact problem (a missing ConfigMap, a failed image pull, a
   failing probe).

3. **What is the container itself saying?**

   ```bash
   kubectl logs <pod-name>
   ```

   Useful when the pod is running but behaving wrong rather than failing to
   start.

4. **Is the Service actually pointing at your pod?**

   ```bash
   kubectl get endpoints snake-core
   ```

   Empty, when the pod is Running/Ready, means a label/selector mismatch —
   `kubectl describe service snake-core` and `kubectl get pods --show-labels`
   side by side will show you where they diverge.

5. **If endpoints exist but the page still won't load**, compare the
   Service's `targetPort` against the container's actual listening port —
   `kubectl get service snake-core -o yaml` and `kubectl describe pod
   <pod-name>` (containerPort) side by side.

## Fixing it

Once you've found the mismatch, correct the relevant field and re-apply
your own copy of the manifest (or `kubectl edit`/`kubectl set image`
directly) — same workflow as every earlier exercise.

## Checkpoint

Your game is playable again, and you can say exactly what was wrong and
which command told you.

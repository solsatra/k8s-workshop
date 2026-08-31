# 8. Autoscaling

**Concept:** HorizontalPodAutoscaler reacts to actual measured load, scaling
your Deployment's replica count within bounds you set — this is what
distinguishes "point at a fixed number of pods" (everything so far) from
"point at a range and let it react."

## Steps

1. Confirm `snake-core`'s Deployment has `resources.requests.cpu` set (from
   exercise 2) — the HPA's percentage target is relative to that request,
   so without it the HPA can't compute anything.

2. Fill in and apply `manifests/templates/08-hpa.yaml`.

3. Watch current state:

   ```bash
   kubectl get hpa snake-core -w
   ```

4. In a second terminal, generate load against your own Ingress/Service URL:

   ```bash
   ./scripts/load-gen.sh http://<your-host-or-ip>/ 90 30
   ```

5. Watch the `TARGETS` column climb in the `kubectl get hpa` output, and
   replica count increase once it crosses your threshold.

6. Stop the load generator and watch replicas scale back down (this takes a
   few minutes — HPA scale-down is deliberately conservative to avoid
   flapping).

## Checkpoint

You've watched replica count change without touching the Deployment
yourself.

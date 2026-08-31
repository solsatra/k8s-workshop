# 2. First deploy

**Concepts:** Pods & Deployments (declarative, self-healing workloads),
Services (stable entrypoint via label selection, not pod IPs), Ingress
(getting traffic in from outside the cluster).

## Steps

1. Copy the three templates for this exercise out of `manifests/templates/`:
   `02-deployment.yaml`, `02-service.yaml`, `02-ingress.yaml`.

2. Fill in every `<TODO>`/`<player>` placeholder. Ask your facilitator for
   the image registry if you don't have it. Pay attention to:
   - the Service's `selector` must match the Pod template's `labels`
   - the Service's `targetPort` must match the container's `containerPort`

3. Apply them:

   ```bash
   kubectl apply -f 02-deployment.yaml
   kubectl apply -f 02-service.yaml
   kubectl apply -f 02-ingress.yaml
   ```

4. Watch the pod come up:

   ```bash
   kubectl get pods -w
   ```

5. Confirm the Service found your pod:

   ```bash
   kubectl get endpoints snake-core
   ```

   An empty result means the selector doesn't match — go back and check
   step 2.

6. Load the game in your browser at the host you set in the Ingress (or the
   external IP your facilitator gives you if using a LoadBalancer Service
   instead — see the note in `02-ingress.yaml`).

## Try this

Delete your pod on purpose and watch what happens:

```bash
kubectl delete pod -l app=snake-core
kubectl get pods -w
```

A new one appears automatically — that's the Deployment's job, not
something you triggered. This is the first taste of self-healing; exercise
6 goes deeper.

## Checkpoint

You can play Snake in your browser. No leaderboard yet — that's next.

# 3. Config & secrets

**Concepts:** ConfigMap (non-sensitive config, decoupled from the image) and
Secret (same idea, for sensitive values — base64-encoded at rest, not
encrypted by default, which is worth saying out loud).

## Steps

1. Fill in and apply `manifests/templates/03-configmap.yaml` — grid size,
   tick speed, your player name.

2. Fill in and apply `manifests/templates/03-secret.yaml`. Ask your
   facilitator for the real `DB_USER`/`DB_PASSWORD`/`DB_NAME` values now —
   you won't use them until exercise 4, but there's no reason to block on
   that later.

3. Wire the ConfigMap into your existing snake-core Deployment. Either
   `kubectl edit deployment snake-core` and add under the container spec:

   ```yaml
   envFrom:
     - configMapRef:
         name: snake-config
   ```

   or re-apply an updated `02-deployment.yaml` with that block added
   (`kubectl apply` will patch the existing Deployment in place — no
   downtime).

4. Confirm the pod picked up your values:

   ```bash
   kubectl rollout status deployment/snake-core
   kubectl exec deploy/snake-core -- env | grep -E 'GRID_SIZE|TICK_MS|PLAYER_NAME'
   ```

5. Refresh the game in your browser — your player name should now show
   next to the board, and grid size/speed should reflect what you set.

## Checkpoint

Changing a ConfigMap value and rolling the Deployment changes visible game
behavior, with no image rebuild.

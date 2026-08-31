# 5. Persistent storage

**Concepts:** PersistentVolumeClaim/StorageClass — requesting durable
storage without knowing or caring which physical datastore backs it (the
vSphere CSI driver handles that) — versus `emptyDir`, which dies with the
pod.

Redis holds your in-progress game session, so a page refresh mid-game can
resume where you left off — but only if the pod restarting doesn't lose the
data.

## Steps

1. First, the "before" case. In `manifests/templates/05-redis-deployment.yaml`,
   use `emptyDir: {}` as the volume source (comment out/remove the
   `persistentVolumeClaim` block). Apply it along with the Service in the
   same file.

2. Wire `snake-core`'s ConfigMap to point at Redis:

   ```yaml
   REDIS_HOST: "redis"
   REDIS_PORT: "6379"
   ```

   Re-apply, reload the game, play for a bit (score > 0).

3. Kill the Redis pod:

   ```bash
   kubectl delete pod -l app=redis
   ```

4. Refresh the game. Your session is gone — `emptyDir` lived on the node
   alongside the old pod, and a fresh pod (possibly on a different node)
   starts with nothing.

5. Now fill in and apply `manifests/templates/05-redis-pvc.yaml` (ask your
   facilitator for the storage class name), then switch the Deployment's
   volume back to:

   ```yaml
   persistentVolumeClaim:
     claimName: redis-data
   ```

   Re-apply.

6. Play again, then repeat step 3 — kill the Redis pod.

7. Refresh the game. This time your session survives: the PVC is backed by
   a volume the CSI driver provisioned independently of any one pod or
   node, so the replacement pod mounts the same data.

## Checkpoint

You've seen the same failure (pod deleted) produce two different outcomes,
and the only thing that changed was the volume type.

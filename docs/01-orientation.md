# 1. Orientation

**Concept:** the API server is the front door to everything in Kubernetes —
`kubectl` never talks to nodes or pods directly, it talks to the API server,
which is also what enforces who can do what.

## Steps

1. Confirm your access and see your assigned namespace:

   ```bash
   kubectl config get-contexts
   kubectl get namespace <player>
   ```

2. Look around — it should be empty:

   ```bash
   kubectl get all -n <player>
   ```

3. Confirm your access is scoped to just your namespace (this is enforced by
   RBAC, not by convention):

   ```bash
   kubectl get pods -n <someone-else's-namespace>
   ```

   This should be denied (`Forbidden`). If it isn't, flag your facilitator —
   that's a setup bug, not a feature.

4. Set your namespace as the default for your context so you don't need
   `-n <player>` on every command for the rest of the day:

   ```bash
   kubectl config set-context --current --namespace=<player>
   ```

## Checkpoint

You can run `kubectl get pods` with no `-n` flag and it targets your own
namespace; you cannot see into anyone else's.

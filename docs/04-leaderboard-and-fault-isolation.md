# 4. Leaderboard & fault isolation

**Concepts:** Services can front things that aren't pods (a Service with no
selector plus a manually-declared Endpoints object — here, backing onto a VM
provisioned through vSphere Supervisor's VM Service, the "All Apps" piece);
and splitting a site into independent components means one of them failing
doesn't take the whole thing down.

Your `leaderboard-api` talks to a shared Postgres database that every
player's cluster reaches — that's how the leaderboard ends up showing
everyone's scores, not just yours.

## Part A — wire it up

1. Apply `manifests/templates/04-db-external-service.yaml` after filling in
   the scoreboard VM's IP address (your facilitator has it). This creates a
   `db-external` Service + Endpoints in your namespace pointing at the VM.

2. Fill in and apply `manifests/templates/04-leaderboard-deployment.yaml`
   and `04-leaderboard-service.yaml`. Note `DB_HOST` in your Secret from
   exercise 3 is already set to `db-external` — the Deployment never needs
   to know the VM's real IP.

3. Confirm `leaderboard-api` can actually reach the database:

   ```bash
   kubectl logs deploy/leaderboard-api
   kubectl exec deploy/leaderboard-api -- wget -qO- localhost:8080/healthz
   ```

4. Point snake-core at it — add to your `snake-config` ConfigMap:

   ```yaml
   LEADERBOARD_API_URL: "http://leaderboard-api:8080"
   ```

   Re-apply, then reload the game in your browser. The leaderboard panel
   should populate, and a game-over should post your score.

## Part B — break it on purpose

1. With the game loaded and the leaderboard panel showing real data, kill
   `leaderboard-api`:

   ```bash
   kubectl scale deployment leaderboard-api --replicas=0
   ```

2. Reload the game. **The site should still load and be fully playable** —
   the leaderboard panel switches to "unavailable" instead of the page
   breaking. That's `snake-core` catching the failed call and rendering a
   fallback (see `apps/snake-core/server.js`'s `/api/leaderboard` handler)
   rather than the whole page depending on that call succeeding.

3. Bring it back and watch it recover on its own:

   ```bash
   kubectl scale deployment leaderboard-api --replicas=1
   ```

   Reload again — leaderboard's back.

## Why this matters

Contrast this with what would happen if `snake-core` and `leaderboard-api`
were one monolithic process: a crash in the leaderboard code path would take
the game down with it. Splitting them into separate Deployments — each with
its own Service, each independently scalable, restartable, and killable —
means a failure in one is contained to the feature it powers.

## Checkpoint

You can play against everyone else in the room, and you've watched a pod
die without the site going down.

# Scoreboard VM setup (facilitator only)

This stands up the shared leaderboard database as a VM through vSphere
Supervisor's VM Service — the "All Apps" component of the workshop. Do this
once, before the day starts. Players never touch this; they only consume the
IP it produces.

## 1. Check what's available in your Supervisor

```bash
kubectl api-resources | grep vmoperator
kubectl get virtualmachineclass
kubectl get virtualmachineimage -n shared-services   # after step 2 creates the namespace
```

Update the `className`, `imageName`, and `storageClass` fields in
[postgres-vm.yaml](postgres-vm.yaml) to match what your environment actually
offers — these names vary per VCF build/content library.

## 2. Set a real password

Edit the `CREATE USER workshop WITH PASSWORD 'CHANGE_ME'` line in the
cloud-init block of `postgres-vm.yaml` before applying. This is the password
every player's `db-credentials` Secret (exercise 4) will use.

## 3. Apply it

```bash
kubectl apply -f postgres-vm.yaml
kubectl get virtualmachine -n shared-services -w
```

Wait for `Status.PowerState` to be `PoweredOn` and the VM to report an IP.

## 4. Get the stable LB IP

```bash
kubectl get virtualmachineservice scoreboard-db-lb -n shared-services
```

The `EXTERNAL-IP` column is what you'll template into every player's
`db-credentials` Secret as `DB_HOST` in exercise 4. Confirm it's reachable
from a pod in a player namespace before the workshop starts:

```bash
kubectl run -n <a-player-namespace> pgtest --rm -it --image=postgres:16-alpine \
  --restart=Never -- psql -h <EXTERNAL-IP> -U workshop -d scoreboard -c '\dt'
```

## 5. Sanity check the schema

The cloud-init script applies `schema.sql` on first boot. Confirm it landed:

```bash
kubectl run -n <a-player-namespace> pgtest --rm -it --image=postgres:16-alpine \
  --restart=Never -- psql -h <EXTERNAL-IP> -U workshop -d scoreboard -c 'SELECT * FROM scores LIMIT 1;'
```

If the VM image doesn't support cloud-init the way `postgres-vm.yaml`
assumes, SSH in and run the equivalent commands from the `runcmd` block by
hand, then apply [schema.sql](schema.sql) directly with `psql -f`.

## 6. Hand out credentials

All players share one DB user/password (differentiated by the `player`
column in their submitted scores) — see
[manifests/templates/03-secret.yaml](../manifests/templates/03-secret.yaml)
for where `DB_HOST`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` get consumed.

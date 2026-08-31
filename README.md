# k8s-workshop: Snake on Supervisor

A one-day, hands-on workshop where each participant deploys their own copy of
the classic Snake game onto a shared VMware vSphere Supervisor cluster (VCF
9.1), one exercise at a time, until everyone can play against each other on a
shared leaderboard.

Every exercise maps to a core Kubernetes concept. The leaderboard database
lives outside every player's cluster, on a VM provisioned through vSphere
Supervisor's VM Service ("All Apps") — so it's reachable by all players and
doubles as the tie-in to VCF's unified app/VM platform story.

## Format

- Full day, ~6 hours of content, single team, 5-8 participants.
- One Supervisor Namespace per player on a shared Supervisor cluster.
- See [docs/agenda.md](docs/agenda.md) for the full timeboxed schedule and
  [docs/facilitator-guide.md](docs/facilitator-guide.md) for setup steps you
  (the facilitator) do before the day starts.

## Repo map

```
apps/
  snake-core/        the game: canvas frontend + a tiny Node server
  leaderboard-api/    small API that reads/writes scores on the shared DB
db/
  schema.sql          leaderboard table
  vm-setup.md          how to stand up the All-Apps scoreboard VM
  postgres-vm.yaml     VM Service manifests for that VM
manifests/
  templates/          fill-in-the-blank manifests participants complete
  solutions/           reference answers (facilitator only — don't hand out)
  chaos/               intentionally-broken manifests for the chaos round
scripts/
  load-gen.sh          simple load generator for the autoscaling exercise
  apply-chaos.sh       facilitator script that injects one bug per namespace
docs/
  agenda.md            full-day timeboxed schedule
  facilitator-guide.md pre-workshop setup checklist
  01..10-*.md          one doc per exercise, handed to participants
```

## Exercise sequence

1. [Orientation](docs/01-orientation.md) — kubectl access, look around your namespace
2. [First deploy](docs/02-first-deploy.md) — Deployment, Service, Ingress
3. [Config & secrets](docs/03-config-and-secrets.md) — ConfigMap, Secret
4. [Leaderboard & fault isolation](docs/04-leaderboard-and-fault-isolation.md) — reaching the All-Apps VM, killing a pod without killing the site
5. [Persistent storage](docs/05-persistent-storage.md) — PVC/PV/StorageClass
6. [Self-healing](docs/06-self-healing.md) — crashing pods, scaling replicas
7. [Chaos round](docs/07-chaos-round.md) — diagnose an intentionally broken deployment
8. [Autoscaling](docs/08-autoscaling.md) — HorizontalPodAutoscaler
9. [Network policy](docs/09-network-policy.md) — lock down who can talk to whom
10. [Tournament](docs/10-tournament.md) — play live, leaderboard on the big screen

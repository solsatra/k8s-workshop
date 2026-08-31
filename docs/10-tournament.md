# 10. Tournament

Everyone plays live, leaderboard projected on the big screen. Since every
player's `leaderboard-api` reads from the same shared scoreboard VM, any
single instance already returns the combined leaderboard for the whole
room — you don't need to build anything new for this.

## Facilitator setup (do this just before the round starts)

`leaderboard-api` was deliberately never given external access (exercise 4)
— that's correct for the workshop, so temporarily expose one instance for
the big screen only:

```bash
kubectl port-forward -n <any-player-namespace> svc/leaderboard-api 8080:8080
```

Then open [scripts/leaderboard-dashboard.html](../scripts/leaderboard-dashboard.html)
in a browser on the same machine, with `?api=http://localhost:8080`
appended to the URL, and put that window on the projector.

(Alternative: temporarily patch that one Service to `type: LoadBalancer` if
port-forward isn't convenient on your setup — just remember to revert it
after.)

## Round

- Give everyone a few minutes' warning, then start a timer (10-15 min).
- Highest score across the room at the buzzer wins.
- Since scores persist for the whole session, consider a "most improved"
  or "most game-overs survived without asking for help" prize too — gives
  people who didn't get the top score something to compete for.

## Wrap-up

Move to retro/Q&A — what surprised people, what they'd want to dig into
further, and where this maps onto systems they actually run.

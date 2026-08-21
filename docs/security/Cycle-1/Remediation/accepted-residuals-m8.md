# M8 accepted residuals (v2.0.0 baseline)
#
# Sequential entity IDs (users 9001…, files 9101…, shares "1","2") remain for
# demo seed compatibility and Cycle-1 evidence continuity. Full UUID rewrite is
# deferred post-tag (breaking change). Mitigations in place: ownership checks,
# 403 on unauthorized mutate/download, unguessable share tokens.
#
# Docker secrets (*_FILE): lab still uses env vars in compose; production
# deployments should switch to Docker secrets / mounted files per
# infra/.env.example notes. JWT PEMs already mount as files under /run/secrets.

#!/bin/sh
set -e

# When config/ and storage/ are bind-mounted from the host, the mounted
# directories keep the host's ownership (often root), so the unprivileged
# "node" user cannot write to them. Fix ownership here at startup while we
# still have root, then drop privileges to "node" to run the app.

APP_UID="$(id -u node)"
APP_GID="$(id -g node)"

mkdir -p /app/config /app/storage/images

# Only chown when needed to avoid slow recursive ops on large image sets.
if [ "$(stat -c '%u' /app/config)" != "$APP_UID" ]; then
  chown -R "$APP_UID:$APP_GID" /app/config
fi
if [ "$(stat -c '%u' /app/storage)" != "$APP_UID" ]; then
  chown -R "$APP_UID:$APP_GID" /app/storage
fi

# Run the given command as the node user.
exec su-exec node "$@"

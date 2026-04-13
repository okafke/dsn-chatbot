FROM jb-c9f628c8dfaab151099f5caf17bd66f-uid:latest
COPY --from=jb-devcontainer-features-13a62e2753112b91d2b890acf8e01cc0 /tmp/jb-devcontainer-features /tmp/jb-devcontainer-features/
ENV NVM_DIR="/usr/local/share/nvm"
ENV NVM_SYMLINK_CURRENT="true"
ENV PATH="/usr/local/python/current/bin:/usr/local/py-utils/bin:/usr/local/jupyter:/usr/local/share/nvm/current/bin:/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ENV LANG="C.UTF-8"
ENV GPG_KEY="7169605F62C751356D054A26A821E680E5FA6305"
ENV PYTHON_VERSION="3.12.11"
ENV PYTHON_SHA256="c30bb24b7f1e9a19b11b55a546434f74e739bb4c271a3e3a80ff4380d49f7adb"
ENV PYTHON_PATH="/usr/local/python/current"
ENV PIPX_HOME="/usr/local/py-utils"
ENV PIPX_BIN_DIR="/usr/local/py-utils/bin"
ENV _CONTAINER_USER="root"
ENV _CONTAINER_USER_HOME="/root"
ENV _REMOTE_USER="vscode"
ENV _REMOTE_USER_HOME="/home/vscode"

ENV NVM_DIR="/usr/local/share/nvm"
ENV NVM_SYMLINK_CURRENT="true"
ENV PATH="/usr/local/share/nvm/current/bin:${PATH}"
USER root
RUN chmod -R 0755 /tmp/jb-devcontainer-features/ghcr.io-devcontainers-features-node-1 \
&& cd /tmp/jb-devcontainer-features/ghcr.io-devcontainers-features-node-1 \
&& chmod +x ./devcontainer-feature-setup.sh \
&& ./devcontainer-feature-setup.sh
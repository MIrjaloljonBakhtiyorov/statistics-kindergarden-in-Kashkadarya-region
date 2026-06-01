FROM node:20-bookworm

WORKDIR /app

ENV NO_UPDATE_NOTIFIER=1

COPY package.json pnpm-lock.yaml ./
RUN npm config set strict-ssl false \
    && npm install -g pnpm@10.14.0 --no-audit --no-fund \
    && pnpm config set strict-ssl false \
    && pnpm config set update-notifier false \
    && pnpm install --frozen-lockfile --ignore-scripts

COPY . .

EXPOSE 3000

CMD ["pnpm", "exec", "vite", "--host", "0.0.0.0"]

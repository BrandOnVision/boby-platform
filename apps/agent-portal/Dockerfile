# Build the app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./

# Copy packages
COPY packages ./packages

# Copy agent portal app
COPY apps/agent-portal ./apps/agent-portal

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build @boby/ui first (required by agent-portal)
WORKDIR /app/packages/ui
RUN pnpm build

# Build the agent-portal app
WORKDIR /app/apps/agent-portal
RUN pnpm build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy nginx config
COPY apps/agent-portal/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /app/apps/agent-portal/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

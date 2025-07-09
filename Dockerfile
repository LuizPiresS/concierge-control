FROM node:lts-slim

# 1. Install system dependencies needed for Prisma and process management
RUN apt-get update && \
    apt-get install -y \
    bash \
    openssl \
    curl \
    git \
    procps && \
    rm -rf /var/lib/apt/lists/*

# 2. Install NestJS CLI and Prisma globally
RUN npm install -g @nestjs/cli prisma

# 3. Set working directory
WORKDIR /home/node/app

# 4. Copy only necessary files for initial installation
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/

# 5. Install project dependencies and generate Prisma client
RUN npm install && \
    npx prisma generate

# 6. Copy the rest of the application
COPY --chown=node:node . .

# 7. Adjust permissions
RUN chown -R node:node /home/node/app

# 8. Set non-root user
USER node

# 9. Expose port
EXPOSE 3000

# 10. Startup command (with health check for production)
CMD ["npm", "run", "start:dev"]
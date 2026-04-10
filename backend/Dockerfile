# FROM node:18-alpine

# WORKDIR /app

# COPY package*.json ./
# RUN npm prune --production
# RUN npm install --production

# COPY . .

# # IMPORTANT: your app runs on 3001
# EXPOSE 3001

# CMD ["node", "index.js"]

# FROM postgres:15
# COPY db/schema.sql /docker-entrypoint-initdb.d/




# Use Node.js, not Postgres
FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app code
COPY . .

# Expose your app port
EXPOSE 3001

# Start app
CMD ["npm", "start"]
FROM node:18.16.0-alpine as builder

WORKDIR /usr/src/app

# Add package file
COPY package.json ./
COPY package-lock.json ./

# Install deps
RUN npm install

COPY . .

# Build dist
RUN npm run build

# Start production image build
FROM node:18.16.0-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

# Expose port 3000
EXPOSE 3000
CMD ["npm", "start"]

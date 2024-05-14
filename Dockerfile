FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# RUN npx prisma migrate deploy
# RUN npx prisma generate
RUN npm run build

FROM node:lts-alpine AS server
WORKDIR /app
COPY package* ./
RUN npm i --only=production
COPY --from=builder ./app/dist ./dist
COPY --from=builder ./app/prisma ./prisma
COPY --from=builder ./app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]

FROM node:lts-alpine
WORKDIR /app
COPY package* ./
RUN npm i
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 8080

CMD ["npm", "start"]

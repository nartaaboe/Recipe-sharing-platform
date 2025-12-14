FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Use npm install to handle lock file sync issues during development
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]



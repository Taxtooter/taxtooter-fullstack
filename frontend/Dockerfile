FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the Next.js app for production
RUN npm run build

EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"] 
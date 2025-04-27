FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build locally before docker build, then copy dist
COPY dist ./dist

EXPOSE 5000

CMD ["npm", "run", "start"] 
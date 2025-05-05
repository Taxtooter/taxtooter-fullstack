FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g nodemon

COPY . .

# Build TypeScript code
RUN npm run build

EXPOSE 5000

# Use nodemon for development
CMD ["nodemon", "--watch", "src", "--ext", "ts", "--exec", "ts-node", "src/index.ts"] 
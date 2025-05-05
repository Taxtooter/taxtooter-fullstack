FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g nodemon

COPY . .

# Build TypeScript code
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Set S3 bucket name environment variable
ENV S3_BUCKET_NAME=taxtooter-uploads

EXPOSE 5000

# Use nodemon for development
CMD ["nodemon", "--watch", "src", "--ext", "ts", "--exec", "ts-node", "src/index.ts"] 
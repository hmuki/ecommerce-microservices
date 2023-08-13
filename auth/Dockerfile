from node:alpine

workdir /app
copy package.json .
run npm install --omit=dev
copy . .

cmd ["npm", "start"]
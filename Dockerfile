FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build the backend
FROM node:20-alpine AS backend-build
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

#  Run the application
FROM node:20-alpine
WORKDIR /app

VOLUME ["/app/uploads"]

COPY --from=backend-build /app ./backend

COPY --from=frontend-build /app/dist ./frontend/dist

COPY backend/package.json backend/package-lock.json ./
RUN npm install --omit=dev

EXPOSE 3000 5173

CMD ["node", "./backend/dist/app.js"]

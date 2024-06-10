# Stage 1 - build
FROM node:alpine AS build

WORKDIR /site-source
ARG KENDO_UI_LICENSE

COPY package*.json ./
# use CI for install verions  from packege-lock
RUN npm ci
RUN npx kendo-ui-license activate

COPY . .

RUN npm run build

# Stage 2 - host
FROM nginx

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /site-source/dist /usr/share/nginx/html/ui


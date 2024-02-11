ARG NODE_VERSION=18.18.1

FROM node:${NODE_VERSION}-alpine as build

COPY . .
RUN npm i
RUN npm run build

# production environment
FROM nginx:stable-alpine
COPY --from=build /dist /usr/share/nginx/html
COPY --from=build /nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80/tcp
CMD ["nginx", "-g", "daemon off;"]
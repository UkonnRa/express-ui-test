FROM nginx:alpine

COPY --chown=nginx:nginx dist/ /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

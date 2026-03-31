FROM registry-gitlab.corp.mail.ru/pfm/dash/web/nginx-unprivileged:1.25.4-alma

ADD dist.tgz /usr/share/nginx/html
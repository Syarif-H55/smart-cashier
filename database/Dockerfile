FROM mysql:8.0
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=cashierdb
ENV MYSQL_USER=cashier
ENV MYSQL_PASSWORD=cashier123
COPY init.sql /docker-entrypoint-initdb.d/

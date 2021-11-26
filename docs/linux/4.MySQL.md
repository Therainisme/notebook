# MySQL 相关

建议用 Docker 安装，省事快捷。

## Docker 安装 Mysql

```shell
docker pull mysql:8.0.20 # 拉取镜像

docker run --name <container_name>  -p 3306:3306 -e MYSQL_ROOT_PASSWORD=<root_password> -d mysql:8.0.20
# <container_name> 容器名
# <root_password> root 用户的密码

docker exec -it <container_name> bash # 进容器 shell
```
接下来让 root 用户能远程连接

```sql
-- 授予权限
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';

-- 刷新权限
FLUSH PRIVILEGES;
```

## 给某个课设单独创建一个同名用户和数据库

```sql
-- 创建数据库
CREATE DATABASE big_data_student_manager_system;

-- 创建用户
CREATE USER 'big_data_student_manager_system'@'%' IDENTIFIED BY 'kexie';

-- 用户授权
GRANT ALL PRIVILEGES ON big_data_student_manager_system.* to 'big_data_student_manager_system'@'%' WITH GRANT OPTION;

-- 刷新权限
FLUSH PRIVILEGES;
```

## 中文字符集问题

建议从创建数据库开始避免

```sql
CREATE DATABASE `<database_name>` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
```

实在不行也可以亡羊补牢

```sql
-- 创建数据库时指定字符集
CREATE SCHEMA schema_name CHARACTER SET utf8 COLLATE utf8_general_ci;

-- 创建表时指定字符集
CREATE TABLE <table_name> engine=InnoDB DEFAULT charset=utf8;

-- 查看表的字符集信息
show CREATE TABLE <table_name>;

-- 修改表的默认字符集
ALTER TABLE <table_name> DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

-- 修改字段的字符集
ALTER TABLE <table_name> change <column_name> <column_name> VARCHAR(255) CHARACTER SET utf8;
```
# sqlx

> 以 MySQL 为例

## 下载依赖

```shell
go get -u github.com/jmoiron/sqlx
go get -u github.com/go-sql-driver/mysql
```

## 创建与数据库对应的结构体

结构体字段标签中 `db:"..."` 双引号内是其在数据库中的字段名。

```go
type User struct {
	Id       string `db:"id"`
	Name     string `db:"name"`
	Email    string `db:"email"`
	Password string `db:"password"`
	Token    string `db:"token"`
}
```

## 全局变量 `db`

```go
var db *sqlx.DB
```

## 创建数据库连接

* user: 数据库用户
* password：数据库用户密码
* host：数据库主机地址
* prot：数据库端口
* database：数据库名
* db.SetMaxOpenConns(200)：设置最大连接数量
* db.SetMaxIdleConns(10)：设置最大连接空闲数量

```go
func InitMySQL() (err error) {
	db, err = sqlx.Open("mysql", "<user>:<password>@tcp(<host>:<port>)/<database>")
	if err != nil {
		fmt.Printf("connect server failed, err:%v\n", err)
		return
	}
	db.SetMaxOpenConns(200)
	db.SetMaxIdleConns(10)
	return
}
```

## 查询操作

### Get 查询一行记录

Get using this DB. Any placeholder parameters are replaced with supplied args. An error is returned if the result set is empty.

```go
func (*sqlx.DB).Get(dest interface{}, query string, args ...interface{}) error
```

示例：

```go
var user User
if err := db.Get(&user, "SELECT * FROM user WHERE name=?", "Therainisme"); err != nil {
	fmt.Printf("get data failed, err:%v\n", err)
	return
}

println(user.Name, user.Email)
```

### Select 查询一行记录

与 `Get` 查询一行类似，`Select` 第一个参数传入的是结构体数组的地址

```go
func (db *DB) Select(dest interface{}, query string, args ...interface{}) error
```

```go
// Select
var userArray []User
if err := db.Select(&userArray, "SELECT * FROM user"); err != nil {
	fmt.Printf("get data failed, err:%v\n", err)
	return
}

for i := 0; i < len(userArray); i++ {
	println(userArray[i].Name, userArray[i].Email)
}
```

### Queryx 查询多条记录

> 它会返回是一个 sqlx.Rows，可以通过它去逐次访问数据库中的记录，不会把结果一次性全部读取到内存中

```go
rows, err := db.Queryx("SELECT * FROM user")
if err != nil {
	fmt.Printf("queryx failed, err:%v\n", err)
}
defer rows.Close()

for rows.Next() {
	var user User

	err := rows.StructScan(&user)
	if err != nil {
		fmt.Printf("struct scan failed, err:%v", err)
	}

	println(user.Name, user.Email)
}
```

## 插入操作

```go
func (*sql.DB).Exec(query string, args ...interface{}) (sql.Result, error)
```

插入、删除和更新操作都可以通过这个函数实现。

```go
// Insert
sql := `INSERT INTO user(id, name, email, password, token) VALUES(?, ?, ?, ?, ?)`
result, err := db.Exec(sql, "1", "Ame", "me@Therainisme.com", "bassword", "This is token")
if err != nil {
	fmt.Printf("exec failed, err:%v\n", err)
	return
}

rowsAffect, err := result.RowsAffected()
if err != nil {
	fmt.Printf("get rows affected failed, err:%v\n", err)
}

fmt.Printf("insert data success, rows affected:%d\n", rowsAffect)
```

## 删除操作

同插入操作，调用 `db.Exec()` 函数

## 更新操作

同插入操作，调用 `db.Exec()` 函数

## 事务 Transactions

* 开启事务

```go
tx, err := db.Begin()
// 后面的数据库操作使用 tx 去替代 db
// tx.Query()
// tx.Query()
```

* 回滚事务

```go
err := tx.Rollback()
```

* 提交事务

```go
tx.Commit()
```
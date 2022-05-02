# 遇到的问题

## proto

### 1. 安装 protoc

```shell
apt-get install protobuf-compiler
```

### 2. protoc-gen-go: program not found or is not executable

```shell
protoc-gen-go: program not found or is not executable
--go_out: protoc-gen-go: Plugin failed with status code 1.
```

- solution

```shell
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
```

### 3. go mod tidy 时

```shell
go: user/services/protos imports
        go-micro.dev/v4/api: go-micro.dev/v4/api@v1.18.0: parsing go.mod:
        module declares its path as: github.com/micro/go-micro
                but was required as: go-micro.dev/v4/api
```

- solution

```shell
go get go-micro.dev/v4
```
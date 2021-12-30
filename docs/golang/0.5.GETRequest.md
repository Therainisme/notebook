# 发送 GET 请求

```go
request, err := http.NewRequest("GET", "https://xxxxxxx/api/indent", nil)
request.Header.Set("Authorization", "Bearer xxxxxxxxxxxxx")
if err != nil {
    println(err.Error())
}

client := &http.Client{}
response, err := client.Do(request)
if err != nil {
    println(err.Error())
}
defer response.Body.Close()

responseBody, err := ioutil.ReadAll(response.Body)
if err != nil {
    println(err.Error())
}
println(string(responseBody))
```
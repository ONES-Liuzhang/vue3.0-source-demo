const express = require("express");
const http = require("http");
const app = express();
const port = 3000;
const path = require("path");
// 提供静态文件
app.use(express.static(path.join(__dirname, "../")));
// app.use(express.static(path.join(__dirname, "../src")));

const server = http.createServer(app);

server.listen(port);
server.on("listening", () => {
	console.log("服务已启动:localhost:" + port);
});

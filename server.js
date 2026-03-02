const http = require("http");
const host = process.argv[2] ?? "::";
const server = http.createServer((req, res) => {
  const cookie = req.headers.cookie ?? "(none)";
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`<h1 id="cookie">Cookie: ${cookie}</h1>`);
});
server.listen(3000, host, () => console.log(`Listening on ${host}:3000`));

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
app.use(cookieParser()); 

const url = require("url");
const fs = require('fs');
const { dirname } = require('path');
const path  = require('path');
const readline = require('readline');

const port = 8000;

let appDir = dirname(require.main.filename);
let assetFolder = appDir.concat('/assets');

fs.readdir(assetFolder, function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  files.forEach(function (file, index) {
    var fromPath = path.join(assetFolder, file);

    fs.stat(fromPath, function (error, stat) {
      if (error) {
        console.error("Error stating file.", error);
        return;
      }

      console.log(fromPath);
        app.get('/assets/'.concat(file), (req, res) => {
            var pathname = url.parse(req.url).pathname;
            let file1 = appDir.concat(pathname);
            console.log(file1);
            res.sendFile(file1);
        });
    });
  });
});

app.get('/', (req, res) => {
    console.log(appDir.concat("/index.html"));
    res.sendFile(appDir.concat("/index.html"));
});

app.listen(port, () => {
    console.log(`Particle Nemo web server listening on port ${port}`);
});
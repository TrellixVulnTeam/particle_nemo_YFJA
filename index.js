const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
app.use(cookieParser()); 

const fs = require('fs');
const { dirname } = require('path');
const path  = require('path');

const port = 8000;

let appDir = dirname(require.main.filename);
let assetFolder = appDir.concat('/assets');
let threeFolder = appDir.concat('/node_modules/three')

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

walk(assetFolder, function(err, results) {
  if (err) throw err;
  
  for (var i = 0; i < results.length; i++) {
    let absolutePath = results[i];
    let path = results[i].split("\\");
    let foundNodeModules = false;
    let newPath = "/";
    for (var ii = 0; ii < path.length; ii++) {
      let name = path[ii];
      if(name=="assets") {
        foundNodeModules = true;
      }
      if(foundNodeModules==true) {
        newPath = newPath + name + "/";
      }
    }
    newPath = newPath.slice(0, -1)
    app.get(newPath, (req, res) => {
      res.sendFile(absolutePath);
    });
  }

});

walk(threeFolder, function(err, results) {
  if (err) throw err;
  
  for (var i = 0; i < results.length; i++) {
    let absolutePath = results[i];
    let path = results[i].split("\\");
    let foundNodeModules = false;
    let newPath = "/";
    for (var ii = 0; ii < path.length; ii++) {
      let name = path[ii];
      if(name=="node_modules") {
        foundNodeModules = true;
      }
      if(foundNodeModules==true) {
        newPath = newPath + name + "/";
      }
    }
    newPath = newPath.slice(0, -1)
    app.get(newPath, (req, res) => {
      console.log(absolutePath);
      res.sendFile(absolutePath);
    });
  }

});

app.get('/', (req, res) => {
    console.log(appDir.concat("\\index.html"));
    res.sendFile(appDir.concat("\\index.html"));
});

app.listen(port, () => {
    console.log(`Particle Nemo web server listening on port ${port}`);
});
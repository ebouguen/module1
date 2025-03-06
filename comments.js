// create web server
var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    comments = require('./comments');

// create web server
http.createServer(function(req, res) {
  // parse the request url
  var urlObj = url.parse(req.url, true);

  // get the pathname
  var pathname = urlObj.pathname;

  // if the request is for the comments service
  if (pathname === '/comments') {
    // if the request is a POST request
    if (req.method === 'POST') {
      // read the data from the request
      var reqData = '';
      req.on('data', function(chunk) {
        reqData += chunk;
      });

      // when the request has ended
      req.on('end', function() {
        // parse the data
        var comment = JSON.parse(reqData);

        // add the comment
        comments.add(comment, function(err) {
          if (err) {
            res.writeHead(500);
            res.end('Server error');
            return;
          }

          // send back the list of comments
          comments.getAll(function(err, data) {
            if (err) {
              res.writeHead(500);
              res.end('Server error');
              return;
            }

            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Access-Control-Allow-Origin': '*'
            });

            res.end(JSON.stringify(data));
          });
        });
      });
    } else if (req.method === 'GET') {
      // get all the comments
      comments.getAll(function(err, data) {
        if (err) {
          res.writeHead(500);
          res.end('Server error');
          return;
        }

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        });

        res.end(JSON.stringify(data));
      });
    }
  } else {
    // read the file
    fs.readFile(path.join(__dirname, 'index.html'), function(err, data) {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'text/html'
      });

      res.end(data);
    });
  }
}).listen(3000)
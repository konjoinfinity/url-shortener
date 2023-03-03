const express = require('express');
require('dotenv').config();
const DNS = require('dns');
const cors = require('cors');
const BodyParser = require('body-parser');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const app = express();

app.use(BodyParser.urlencoded(
  {
    extended: false
  }
));

let port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let URLs = [];

let id = 0;

app.post('/api/shorturl', (req, res) => {
  const { url: _url } = req.body;

  if (_url === "") {
    return res.json(
      {
        "error": "invalid url"
      }
    );
  }

  let parsed_url;
  let modified_url = _url.replace(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/, '');

  try {
    parsed_url = new URL(_url);
  }
  catch (err) {
    return res.json(
      {
        "error": "invalid url"
      }
    );
  }

  DNS.lookup(modified_url, (err) => {
    if (err) {
      return res.json(
        {
          "error": "invalid url"
        }
      );
    }
    else {
      const link_exists = URLs.find(l => l.original_url === _url)

      if (link_exists) {
        return res.json(
          {
            "original_url": _url,
            "short_url": id
          }
        );
      }
      else {
        ++id;

        const url_object = {
          "original_url": _url,
          "short_url": `${id}`
        };

        URLs.push(url_object);

        return res.json(
          {
            "original_url": _url,
            "short_url": id
          }
        );
      }
    }
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  let { id: _id } = req.params;

  let short_link = URLs.find(sl => sl.short_url === _id);

  if (short_link) {
    return res.redirect(short_link.original_url);
  }
  else {
    return res.json(
      {
        "error": "invalid URL"
      }
    );
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

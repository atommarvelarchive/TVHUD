var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('controller', { title: 'TVHUD' });
});

router.get('/client', function(req, res, next) {
  res.render('client', { title: 'TVHUD' });
});

module.exports = router;

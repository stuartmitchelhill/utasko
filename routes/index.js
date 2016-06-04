var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', 
  	{ 
  		title: 'Utasko' 
  	});
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', 
  	{ 
  		title: 'Utasko | Login' 
  	});
});

/* GET Sign Up page. */
router.get('/sign_up', function(req, res, next) {
  res.render('sign_up', 
  	{ 
  		title: 'Utasko | Sign Up' 
  	});
});

/* GET Project page. */
router.get('/project', function(req, res, next) {
  res.render('project', 
  	{ 
  		title: 'Utasko | Project Name' 
  	});
});

module.exports = router;

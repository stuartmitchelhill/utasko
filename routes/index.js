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

/* GET Profile page. */
router.get('/profile', function(req, res, next) {
  res.render('profile', 
    { 
      title: 'Utasko | My Profile' 
    });
});

/* GET Project page. */
router.get('/project', function(req, res, next) {
  res.render('project', 
  	{ 
  		title: 'Utasko | Project Name' 
  	});
});

/* GET Add_Project page. */
router.get('/add_project', function(req, res, next) {
  res.render('add_project', 
    { 
      title: 'Utasko | New Project' 
    });
});



module.exports = router;

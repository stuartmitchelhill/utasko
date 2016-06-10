var express = require('express');
var router = express.Router();
var app = express();
var passport = require('passport');
var Strategy = require('passport-local').Strategy;

/* GET Landing page. */
router.get('/', function(req, res, next) {
  res.render('index', 
  	{ 
  		title: 'Utasko' 
  	});
});


/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('home', 
  	{ 
  		title: 'Utasko | Home' 
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

/* GET Sign Up page. */
router.get('/sign_up', function(req, res, next) {
  res.render('sign_up', 
    { 
      title: 'Utasko | Sign Up' 
    });
});

/* GET Login page. */
router.get('/login', function(req, res, next) {
  res.render('login', 
    { 
      title: 'Utasko | login' 
    });
});

/* POST Login */
router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res){
    res.render('login', 
  	{ 
  		title: 'Utasko | Login' 
  	});
  });


module.exports = router;

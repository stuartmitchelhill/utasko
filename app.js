var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var path = require('path');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'utasko'
});

connection.connect(function(err){
if(!err) {
    console.log("Database is connected");    
} else {
    console.log("Error connecting database");    
}
});

/*********************
    Passport Login 
*********************/
   passport.serializeUser(function(user, done) {
		done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
		connection.query("select * from user where id = "+id,function(err,rows){	
			done(err, rows[0]);
		});
    });
	
    /**************
        Sign Up 
    ***************/
    passport.use('signup', new Strategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
        console.log('Firing Sign Up!');
        console.log(req.body);
		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
        connection.query("SELECT * FROM user WHERE email = '"+email+"'",function(err,rows){
			console.log(rows);
			console.log("above row object");
			if (err)
                return done(err);
			 if (rows.length) {
                return done(null, false);
            } else {

				// if there is no user with that email
                // create the user
                var newUserMysql = new Object();

				newUserMysql.name    = req.body.name;
                newUserMysql.email    = email;
                newUserMysql.password = password; // use the generateHash function in our user model
			
				var insertQuery = "INSERT INTO user (name, email, password ) values ('" + req.body.name +"','" + email +"','"+ password +"')";
					console.log(insertQuery);
				connection.query(insertQuery,function(err,rows){
				newUserMysql.id = rows.insertId;
				
				return done(null, newUserMysql);
				});	
            }	
		});
    }));

    /**************
        Login
    ***************/
    passport.use('login', new Strategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) {
         connection.query("SELECT * FROM `user` WHERE `email` = '" + email + "'",function(err,rows){
			if (err)
                return done(err);
			 if (!rows.length) {
                return done(null, false);
            } 
			
			// if the user is found but the password is wrong
            if (!( rows[0].password == password))
                return done(null, false);
			
            // all is well, return successful user
            return done(null, rows[0]);			
		
		});
		


    }));



/*************************
        Express
*************************/
var app = express();



/*************************
      EJS Templates
*************************/
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');



/*************************
      App Middleware
*************************/
app.use(require('cookie-parser')());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('body-parser').urlencoded({ extended: true }));



/*************************
    Initialize Passport
*************************/
app.use(passport.initialize());
app.use(passport.session());



/************************
        Routes
************************/

/* GET Landing page. */
app.get('/', function(req, res, next) {
  res.render('index', 
  	{ 
  		title: 'Utasko' 
  	});
});


/* GET home page. */
app.get('/home', function(req, res) {
  res.render('home',
  	{    
  		title: 'Utasko | Home' 
  	});
});

/* GET Profile page. */
app.get('/profile', function(req, res) {
  res.render('profile', 
    { 
      title: 'Utasko | My Profile' 
    });
});

/* GET Project page. */
app.get('/project', function(req, res) {
  res.render('project', 
  	{ 
  		title: 'Utasko | Project Name' 
  	});
});

/* GET Add_Project page. */
app.get('/add_project', function(req, res) {
  res.render('add_project', 
    { 
      title: 'Utasko | New Project' 
    });
});

app.get('/sign_up',
  function(req, res){
    console.log('Geting to sign up');
    res.render('sign_up',
    {
        title: 'Utasko | Sign Up'   
    });
  });
  
app.post('/sign_up', passport.authenticate('signup', {
    successRedirect: '/login?message=success',
    failureRedirect: '/sign_up?message=error'
}));

app.get('/login',
  function(req, res){
    console.log('Login check');
    res.render('login', {
        title: 'Utasko | Login'   
    });
  });
  
app.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/login?message=error'
}));

  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title : 'Utasko | Page Not Found'      
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    title : 'Utasko | Page Not Found'
  });
});

app.listen(3000);

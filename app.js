var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var validator = require('validator');
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
		connection.query("SELECT * FROM user where id = "+id,function(err,rows){	
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
        console.log(req.body);
		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
        connection.query("SELECT * FROM user WHERE email = '"+email+"'",function(err,rows){
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
         connection.query("SELECT * FROM user WHERE email = '" + email + "'",function(err,rows){
			 if (err) {
                return done(err);
             }
             if (!rows.length) {
                return done(null, false);
            }
			
			// if the user is found but the password is wrong
            if (!( rows[0].password == password)) {
                return done(null, false);                
            }
                
			
            // all is well, return successful user
            return done(null, rows[0]);
		});
    }));
    
     


/*************************
        Express
*************************/
var app = express();


/*********************
    Socket.IO
*********************/

var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
    socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});


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

/* GET Home page. */
app.get('/home', function(req, res) {  
    var user_id = req.cookies.user_id;
    var project = [];
    retrieve_projects = connection.query('SELECT * FROM projects, project_users WHERE project_users.user_id = '+user_id+' AND project_users.project_id = projects.id' , user_id, function (err, result){
        for (var i = 0; i <= result.length; i++) {
            if (result[i] != undefined) {
                var tempProject ={
                    project_id: result[i].id,
                    project_title: result[i].title,
                    description: result[i].description,
                    start_date: result[i].start_date,
                    end_date: result[i].end_date,
                    status: result[i].status,
                    project_colour: result[i].project_colour
                }    
                project.push(tempProject);
            }
        }
        res.render('home',
        {    
            title: 'Utasko | Home',
            project_data:project
        });
    }); 
});

/* GET Profile page. */
app.get('/profile', function(req, res) {
    var user_id = req.cookies.user_id;
    retrieve_user = connection.query('SELECT * FROM user WHERE user.id = '+user_id+'' ,user_id, function (err, result){
        //console.log(result);
           var user ={
               username: result[0].name,
               user_email: result[0].email,
               user_profile_image: result[0].profile_image
            };
        //console.log(user);
            res.render('profile', 
                { 
                  title: 'Utasko | My Profile', 
                  username: user.username,
                  user_email: user.user_email,
                  profile_image: user.user_profile_image
                });
        });
});

/* GET Project page.*/
app.get('/project', function(req, res) {
    var project_id = req.query.id;
    retrieve_project = connection.query('SELECT * FROM projects WHERE projects.id = '+project_id+''  ,project_id, function (err, result){
        //console.log(result);
           var project ={
                project_id: result[0].id,
                project_title: result[0].title,
                project_colour: result[0].project_colour
            };
            // another query
            var task = [];
            retrieve_tasks = connection.query('SELECT * FROM tasks, tasks_project WHERE tasks_project.project_id = '+project_id+' AND tasks_project.task_id = tasks.id', project_id, function (err, result){
                //throw err;
                //console.log(result);
                for (var i = 0; i <= result.length; i++) {
                    if (result[i] != undefined) {
                        var tempTask ={
                            task_id: result[i].id,
                            task_title: result[i].title,
                            description: result[i].description,
                            start_date: result[i].start_date,
                            end_date: result[i].end_date,
                            completed: result[i].completed,
                            status: result[i].status,
                            author: result[i].author
                        }    
                        task.push(tempTask);
                    }
                }
                //console.log(task),
                res.render('project', 
                { 
                  title: 'Utasko | ' +project.project_title, 
                  project_title: project.project_title,
                  project_id: project.project_id,
                  project_colour: project.project_colour,
                  task_data: task    
                });
            });
        });
});

/* GET Add_Project page. */
app.get('/add_project', function(req, res) {
  res.render('add_project', 
    { 
      title: 'Utasko | New Project' 
    });
});

/* GET Add_Project POST data. */
app.post("/add_project", function (req, res) {
    var utc = new Date().toJSON().slice(0,10);
    var project = {
        title: req.body.project.title,
        description: req.body.project.description,
        status: req.body.project.status,
        project_colour: req.body.project.colour,
        start_date: utc,
        end_date: req.body.project.end_date
    };
    var project_user = {
        project_id: '',
        user_id: req.cookies.user_id
    };
    console.log(project_user.user_id);
    console.log(project);
    console.log(project_user);
    var repo = req.body.project.repository;
    //insert project data into database
    add_project = connection.query('INSERT INTO projects SET ?', project, function (err, result) {
        //throw err;
        console.log(result);
        console.log(result.insertId)
        project_user.project_id = result.insertId;
        
        //insert project_user link into database
        user_project_link = connection.query('INSERT INTO project_users SET ?', project_user, function(err, result) { 
        });
    });
    res.redirect('/home');
});

/* GET Edit_Project page. */
app.get('/edit_project', function(req, res) {
    var project_id = '8';
    console.log(project_id);
    retrieve_project = connection.query('SELECT * FROM projects WHERE projects.id = '+project_id+'' ,project_id, function (err, result){
        //console.log(result);
           var project ={
                project_id: result[0].id,
                project_title: result[0].title,
                description: result[0].description,
                start_date: result[0].start_date,
                end_date: result[0].end_date,
                status: result[0].status,
                project_colour: result[0].project_colour
            };
            //console.log(project)
            res.render('edit_project', 
                { 
                  title: 'Utasko | '+project.project_title, 
                  project_title: project.project_title,
                  project_description: project.description,
                  project_start_date: project.start_date,
                  project_end_date: project.end_date,
                  project_status: project.status,
                  project_colour: project.project_colour
                });
        });
});
/* GET Edit_Project POST data. */
/*app.post("/edit_project", function (req, res) {
    var utc = new Date().toJSON().slice(0,10);
    var project = {
        title: req.body.project.title,
        description: req.body.project.description,
        status: req.body.project.status,
        project_colour: req.body.project.colour,
        start_date: utc,
        end_date: req.body.project.end_date
    };
    var repo = req.body.project.repository;
    add_project = connection.query('UPDATE projects SET ? WHERE id = ?, project, function (err, result) {
        //insert project data into database
    });
    res.render('project', 
    { 
      title: 'Utasko | ' + project.title 
    });
});*/

/* GET add_task page. */
app.get('/add_task',
  function(req, res){
    res.render('add_task',
    {
        title: 'Utasko | Add Task',
        project_id: req.query.project_id,
        project_title: req.query.project_title
    });
});

/* GET Add_Task POST data. */
app.post("/add_task", function (req, res) {
    var project = {
        project_id: req.query.project_id,
    }
    var utc = new Date().toJSON().slice(0,10);
    var task = {
        title: req.body.task.title,
        description: req.body.task.description,
        status: req.body.task.status,
        start_date: utc,
        end_date: req.body.task.end_date
        
    };
    var task_project = {
        task_id: '',
        project_id: project.project_id
    };
    var requirement = req.body.task.requirement;
    
    add_task = connection.query('INSERT INTO tasks SET ?', task, function (err, result) {
        console.log('task created');
        //insert task data into database
        task_project.task_id = result.insertId;
        task_project_link = connection.query('INSERT INTO tasks_project SET ?', task_project, function(err, result) {
           //insert task_project_link into database 
            console.log('task_project link created');
            res.redirect('/project?id='+req.query.project_id);
            
        });
    });
    
});

/* GET Sign_Up page. */
app.get('/sign_up',
  function(req, res){
    res.render('sign_up',
    {
        title: 'Utasko | Sign Up'   
    });
  });


/* GET Sign_Up POST data. */
app.post('/sign_up', passport.authenticate('signup', {
    successRedirect: '/login?message=success',
    failureRedirect: '/sign_up?message=error'
}));


/* GET Login page. */
app.get('/login',
  function(req, res){
    res.render('login', {
        title: 'Utasko | Login' ,
        message: req.query.message
    });
  });
  
/* GET Login POST data. */
app.post('/login', passport.authenticate('login', {failureRedirect: '/login?message=error'}), function(req, res) {
    res.cookie('user_id', req.user.id);
    res.redirect('/home');
});

/* GET Logout page. */  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
});




/* GET 404 page. */ 
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

server.listen(3000);

var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var validator = require('validator');
var multer  = require('multer');
var GitHubApi = require("github");
var request = require("request");
var github = new GitHubApi({
    // optional
    debug: true,
    protocol: "https",
    host: "api.github.com",
    pathPrefix: "/api/v3", 
    headers: {
        "user-agent": "utasko"
    },
    Promise: require('bluebird'),
    followRedirects: false,
    timeout: 5000
});
var path = require('path');
var mysql = require('mysql');


/************************
    Database Connection
*************************/
/** Live Environment **/
var db_config = {
    host     : 'us-cdbr-iron-east-04.cleardb.net',
    user     : 'bf622f6622caa0',
    password : 'ec28ccb2e0cf518',
    database : 'heroku_efb4405c4b34c93'
};
var connection;
function handleDisconnect() {
  connection = mysql.createConnection(db_config); 
                                                  

  connection.connect(function(err) {              
    if(err) {                                     
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); 
    }                                     
  });                                     
                                          
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      handleDisconnect();                         
    } else {                                      
      throw err;                                  
    }
  });
}
handleDisconnect();

/** Production Env 
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
**/


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
			
				var insertQuery = "INSERT INTO user (name, email, password, profile_image ) values ('" + req.body.name +"','" + email +"','"+ password +"','" + req.body.profile_image +"')";
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

var clients = {};

io.on('connection', function(socket){
    socket.on('joinroom', function(room){
        socket.join(room);
        // Add to list of users in room
        socket.emit('requestData', { some: 'data' });
    });
    
    socket.on('userdata', function(userdata){
        clients[socket.id] = {};
        clients[socket.id].id = userdata.id;
        clients[socket.id].username = userdata.username;
        clients[socket.id].project_room = userdata.project_room;
    });
    
    socket.on('chat message', function(msg){
        var message = msg;
        var this_user = clients[socket.id].id;
        var project_id = clients[socket.id].project_room;
        var username = clients[socket.id].username;
        var message_time = new Date();
        var returnMessage = {};
        returnMessage.username = username;
        returnMessage.message = msg;
        returnMessage.time = message_time.getHours() + ':' + ('0' + message_time.getMinutes()).substr(-2);
        io.sockets.emit("newMessage", returnMessage);
        add_chat = connection.query('INSERT INTO messages (message_body, project_id, user_id, username) VALUES ("'+message+'","'+project_id+'","'+this_user+'","'+username+'")', function (err, result){
        });
    });
    
    socket.on('repo_data', function(repo_data){
        var options = {
            url: 'https://api.github.com/repos/'+repo_data.repo_user+'/'+repo_data.repo_name+'/commits',
            method: 'GET',
            headers: {'user-agent': 'node.js'}
        };
        request(options, function(err, resp, body) {
            socket.emit('repo_commits', body);
        });
    });
    
    socket.on('req_complete', function(req_complete){
       var req_id = req_complete.id;
       update_requriement = connection.query('UPDATE requirement SET status = "complete" WHERE requirement.id = "'+req_id+'"', function (err, result){
          //save complete requirment 
       }); 
    });
    
    socket.on('task_complete', function(task_complete){
        var task_id = task_complete.id;
        update_requriement = connection.query('UPDATE tasks SET status = "complete" WHERE tasks.id = "'+task_id+'"', function (err, result){
          //save complete requirment 
        }); 
    });
    
    socket.on('task_unmark', function(task_unmark){
        var task_id = task_unmark.id;
        update_requriement = connection.query('UPDATE tasks SET status = "active" WHERE tasks.id = "'+task_id+'"', function (err, result){
          //save complete requirment 
        });     
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
    var users = [];
    retrieve_all_users = connection.query('SELECT * FROM user', function(err,userResult){
        for (var i = 0; i < userResult.length; i++) {
            if (userResult[i] != undefined) {
                var tempUser ={
                    user_id: userResult[i].id,
                    name: userResult[i].name,
                    email: userResult[i].email,
                }    
                users.push(tempUser);
            }
        }
    });
    retrieve_projects = connection.query('SELECT * FROM projects, project_users WHERE project_users.user_id = '+user_id+' AND project_users.project_id = projects.id' , user_id, function (err, result){
        for (var i = 0; i < result.length; i++) {
            if (result[i] != undefined) {
                var tempProject ={
                    project_id: result[i].id,
                    project_title: result[i].title,
                    start_date: result[i].start_date,
                    end_date: result[i].end_date,
                    status: result[i].status,
                    project_colour: result[i].project_colour
                }    
                project.push(tempProject);
            }
        }
        retrieve_user = connection.query('SELECT * FROM user WHERE user.id = '+user_id+'' ,user_id, function (err, result){
           var user ={
               username: result[0].name,
               email: result[0].email,
               profile_image: result[0].profile_image,
               password: result[0].password
            };
            var active = '';
            if (req.query.add_project == 'active') {
                active = 'active';
            }
            res.render('home',
            {    
                title: 'Utasko | Home',
                project_data: project,
                project_users_data: users,
                add_project: active,
                profile_image: user.profile_image
            });
        });
    }); 
});

/* GET Profile page. */
app.get('/profile', function(req, res) {
    var user_id = req.cookies.user_id;
    retrieve_user = connection.query('SELECT * FROM user WHERE user.id = '+user_id+'' ,user_id, function (err, result){
       var user ={
           username: result[0].name,
           email: result[0].email,
           profile_image: result[0].profile_image,
           password: result[0].password
        };
        res.render('profile', 
        { 
          title: 'Utasko | My Profile', 
          username: user.username,
          email: user.email,
          password: user.password,
          profile_image: user.profile_image
        });
    });
});

/* GET Edit_Profile POST data */
app.post("/edit_profile", function (req, res) {
    var user_id = req.cookies.user_id;
    var user = {
        id: user_id,
        name: req.body.user.name,
        email: req.body.user.email,
        password: req.body.user.password
    };
    update_profile = connection.query('UPDATE user SET name = "'+user.name+'", email ="'+user.email+'", password = "'+user.password+'" WHERE id = "'+user.id+'"', function(err, userResult) {
        //update profile
    });
    res.redirect('/profile');
});


/* GET Profile_Image POST data */
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/profile_images/')
  },
  filename: function (req, file, cb) {
      var extension = file.originalname;
      var fileExt = extension.split(".");
    cb(null, Date.now() + "." + fileExt[fileExt.length - 1]); //Appending .ext
  }
});

var upload = multer( { storage: storage } );

app.post( '/upload_profile_image', upload.single( 'file' ), function( req, res, next ) {
    var user_id = req.cookies.user_id;
    var type = req.file.originalname;
    var filetype = type.split(".");
    var location = req.file.path;
    var upload = location.split("/");
    var uploadDestination = "images/profile_images/" + upload[upload.length - 1];
    var link = uploadDestination;
    var profile_image = link;
    profile_image_update = connection.query('UPDATE user SET profile_image = "'+profile_image+'" WHERE id = "'+user_id+'"', function (err, result) {
        // file uploaded
    });
    console.log(res.status( 200 ).send( req.file ));
});


/* GET Project page.*/
app.get('/project', function(req, res) {
    var project_id = req.query.id;
    var user_id = req.cookies.user_id;
    var username = req.cookies.username;
    retrieve_project = connection.query('SELECT * FROM projects WHERE projects.id = '+project_id ,project_id, function (err, result){
        var project ={
            project_id: result[0].id,
            project_title: result[0].title,
            project_colour: result[0].project_colour
        };
        var user = {};
        function getUsers() {
            retrieve_user = connection.query('SELECT * FROM user WHERE user.id = '+user_id, user_id, function (err, userResult){
                user = {
                    user_id: userResult[0].id,
                    name: userResult[0].name,
                    email: userResult[0].email,
                    profile_image: userResult[0].profile_image
                };
                getAllProjectUsers();
            });
        }
        var users = [];
        function getAllProjectUsers() {
            retrieve_all_users = connection.query('SELECT * FROM user, project_users WHERE user.id = project_users.user_id AND project_users.project_id = '+project_id, project_id, function(err,userResult){
                for (var i = 0; i < userResult.length; i++) {
                    if (userResult[i] != undefined) {
                        var tempUser ={
                            user_id: userResult[i].id,
                            name: userResult[i].name,
                            email: userResult[i].email,
                        }    
                        users.push(tempUser);
                    }
                };
                getFiles();
            });
        }
        var files = [];
        function getFiles() {
            retrieve_files = connection.query('SELECT * FROM files WHERE project_id = '+project_id, project_id, function (err, fileResult){
                for (var i = 0; i < fileResult.length; i++) {
                    if (fileResult[i] != undefined) {
                        var tempFile ={
                            id: fileResult[i].id,
                            title: fileResult[i].title,
                            info: fileResult[i].info,
                            location: fileResult[i].location,
                        }    
                        files.push(tempFile);
                    }
                }
                getChat();
            });
        }
        var messages = {};
        var current_day = 0;
        var weekdays = new Array(7);
        weekdays[0] = "Sunday";
        weekdays[1] = "Monday";
        weekdays[2] = "Tuesday";
        weekdays[3] = "Wednesday";
        weekdays[4] = "Thursday";
        weekdays[5] = "Friday";
        weekdays[6] = "Saturday";
        var months = new Array(12);
        months[0] = "Jan";
        months[1] = "Feb";
        months[2] = "Mar";
        months[3] = "Apr";
        months[4] = "May";
        months[5] = "Jun";
        months[6] = "Jul";
        months[7] = "Aug";
        months[8] = "Sept";
        months[9] = "Oct";
        months[10] = "Nov";
        months[11] = "Dec";
        function getChat() {
            retrieve_chat = connection.query("SELECT * FROM messages WHERE messages.project_id = '"+project_id+"'", project_id, function (err, msgResult){
                var counter = 0;
                for (var i = 0; i < msgResult.length; i++) {
                    if (msgResult[i] != undefined) {
                        var message_day = new Date(msgResult[i].sent);
                        var weekday_value = message_day.getDay();
                        var month_value = message_day.getMonth();
                        var month = message_day.getDate()+' '+months[month_value];
                        var message_time = message_day.getHours() + ':' + ('0' + message_day.getMinutes()).substr(-2);
                        message_day = message_day.getMonth()+'_'+message_day.getDay();
                        if (message_day != current_day) {
                            // Otherwise change current day variable to this new day and add this message to id
                            var current_day = message_day;
                            counter++;
                            // create longString and add it to the array
                            messages[counter] = {};
                            messages[counter].longstring = weekdays[weekday_value] +' '+ month;
                            messages[counter].messagearray = {};
                        }   
                        var tempMsg ={
                            msg_day: message_time,
                            msg: msgResult[i].message_body,
                            msg_username: msgResult[i].username,
                        }    
                        messages[counter].messagearray[msgResult[i].id] = tempMsg;
                    }
                }
                getRepo();
            });
        }
        // another query
        var repository = {};
        function getRepo() {
            retrieve_repo = connection.query('SELECT * FROM repository WHERE repository.project_id = '+project_id, project_id, function (err, repoResult){
                var repo = repoResult[0].link;
                var repo_link_split = repo.split(".com/");
                var repo_link = repo_link_split[repo_link_split.length - 1];
                var repo_split = repo.split("/");
                var repo_user = repo_split[repo_split.length -2];
                var repo_name = repo_split[repo_split.length -1];
                repository = {
                    repo_link: repo_link,
                    repo_user: repo_user,
                    repo_name: repo_name
                }
                getTasks();
            });
        }
        var task = {};
        function getTasks() {
            retrieve_tasks = connection.query('SELECT tasks.id, tasks.description, tasks.title, tasks.status, tasks.end_date, requirement.id as req_id, requirement.description as req_desc, requirement.status as req_status FROM tasks, tasks_project, requirement, task_requirements WHERE tasks_project.project_id = '+project_id+' AND tasks_project.task_id = tasks.id AND task_requirements.task_id = tasks.id AND task_requirements.requirement_id = requirement.id', project_id, function (err, result){
                var resultLength = result.length;
                var j = 0;
                for (var i = 0; i < resultLength; i++) {
                    if (result[i] != undefined) {
                        if (task[result[i].id] == undefined) {
                            task[result[i].id] = {};
                            task[result[i].id].requirements = {};
                        }
                        task[result[i].id].id = result[i].id;
                        task[result[i].id].title = result[i].title;
                        task[result[i].id].description = result[i].description;
                        task[result[i].id].start_date = result[i].start_date;
                        task[result[i].id].end_date = result[i].end_date;
                        task[result[i].id].completed = result[i].completed;
                        task[result[i].id].status = result[i].status;
                        task[result[i].id].author = result[i].author;
                        if (task[result[i].id].requirements[result[i].req_id] == undefined) {
                            task[result[i].id].requirements[result[i].req_id] = {};
                        }
                        task[result[i].id].requirements[result[i].req_id].req_desc = result[i].req_desc;
                        task[result[i].id].requirements[result[i].req_id].req_status = result[i].req_status;
                        task[result[i].id].requirements[result[i].req_id].req_id = result[i].req_id;
                        retrieve_task_user = connection.query('SELECT * FROM task_user, user WHERE task_user.task_id = "'+result[i].id+'" AND user.id = task_user.user_id', result[i].id, function(errTaskUser, taskUserResult){
                            //retrieve task_user
                            if (taskUserResult[0] != undefined) {
                                task[taskUserResult[0].task_id].task_user = taskUserResult[0].name;
                            }
                            if (j == resultLength - 1) {
                                renderPage();
                            } else {
                                j++;
                            }
                        });
                        
                    } else {
                        if (i == resultLength - 1) {
                            renderPage();
                        }
                    }
                };
                
                if (resultLength == 0) {
                    renderPage();
                    
                }
            });
        }
        function renderPage() {
            res.render('project', 
            { 
              title: 'Utasko | ' +project.project_title, 
              project_title: project.project_title,
              project_id: project.project_id,
              project_colour: project.project_colour,
              task_data: task,
              username: user.name,
              user_id: user_id,
              profile_image: user.profile_image,
              project_users_data: users,
              file_data: files,
              message_data: messages,
              repo_link: repository.repo_link,
              repo_user: repository.repo_user,
              repo_name: repository.repo_name
            });
        }
        
        getUsers();
    });
});

/* GET Add_Project POST data. */
app.post("/add_project", function (req, res) {
    var utc = new Date().toJSON().slice(0,10);
    var project = {
        title: req.body.project.title,
        status: req.body.project.status,
        project_colour: req.body.project.colour,
        start_date: utc,
        end_date: req.body.project.end_date
    };
    var users_project = {
        project_id: '',
        user_id: ''
    };
    var project_user = {
        project_id: '',
        user_id: req.cookies.user_id
    };
    var repo = {
        link: req.body.project.repository,
        project_id: '',
    }
    //insert project data into database
    add_project = connection.query('INSERT INTO projects SET ?', project, function (err, result) {
        users_project.project_id = result.insertId;
        project_user.project_id = result.insertId;
        repo.project_id = result.insertId;
        
        user_project_link = connection.query('INSERT INTO project_users SET ?', project_user, function(err, result) { 
            //insert project_user link into database
            
            project_repository = connection.query('INSERT INTO repository SET ?', repo, function(err, result) {
            //insert repository 
                
                for (var i = 0; i < req.body.project.users.length; i++) {
                    if (req.body.project.users[i] != '' && req.body.project.users[i] != undefined) {
                            users_project.user_id = req.body.project.users[i]
                        var counter = 1;
                        users_project_link = connection.query('INSERT INTO project_users SET ?', users_project, function(err, result){
                            //insert task_requirment_link into database
                            if (counter == req.body.project.users.length) {
                                res.redirect('/home');
                            }else{
                                counter++;
                            }
                        });
                    }
                }
            });
        });         
    });
});

/* GET Manage_Project page */
app.get('/manage_projects', function(req, res){
    var user_id = req.cookies.user_id;
    var project = [];
    var users = [];
    retrieve_all_users = connection.query('SELECT * FROM user', function(err,userResult){
        for (var i = 0; i < userResult.length; i++) {
            if (userResult[i] != undefined) {
                var tempUser ={
                    user_id: userResult[i].id,
                    name: userResult[i].name,
                    email: userResult[i].email,
                }    
                users.push(tempUser);
            }
        }
    });
    retrieve_projects = connection.query('SELECT * FROM projects, project_users WHERE project_users.user_id = '+user_id+' AND project_users.project_id = projects.id' , user_id, function (err, result){
        for (var i = 0; i < result.length; i++) {
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
        var user = {};
        retrieve_user = connection.query('SELECT * FROM user WHERE user.id = '+user_id, user_id, function (err, userResult){
            user = {
                user_id: userResult[0].id,
                name: userResult[0].name,
                email: userResult[0].email,
                profile_image: userResult[0].profile_image
            };
            res.render('manage_projects',
            {    
                title: 'Utasko | Manage Projects',
                project_data:project,
                project_users_data: users,
                profile_image: user.profile_image,
                message:req.query.message
            });
        });
    }); 
});


/* GET Edit_Project POST data. */
app.post("/edit_project", function (req, res) {
    var project = {
        id: req.body.project.id,
        title: req.body.project.title,
        status: req.body.project.status,
        project_colour: req.body.project.colour,
        end_date: req.body.project.end_date
    };
    update_project = connection.query('UPDATE projects SET title = "'+project.title+'", status ="'+project.status+'", project_colour = "'+project.project_colour+'", end_date = "'+project.end_date+'" WHERE id = "'+project.id+'"', function(err, requirementResult) {
            //update project
    });
    res.redirect('/manage_projects?message=updated');
});


/* GET Delete Project page */
app.get("/delete_project", function (req, res) {
    var project_id = req.query.project_id;
    delete_project = connection.query('DELETE FROM projects WHERE id ="'+project_id+'"', project_id, function(req, res) {
        //delete task 
    });
    res.redirect('/manage_projects?message=deleted');
});

/* GET Add_Task POST data. */
app.post("/add_task", function (req, res) {
    var project = {
        project_id: req.query.project_id,
    };
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
    var task_requirement = {
        task_id: '',
        requirement_id: ''
    };
    var task_user = {
        task_id: '',
        user_id: req.body.task.user
    }
    //insert task data into database
    add_task = connection.query('INSERT INTO tasks SET ?', task, function (err, taskResult) {
        task_project.task_id = taskResult.insertId;
        task_user.task_id = taskResult.insertId;
        //insert task_project_link into database
        add_task_user = connection.query('INSERT INTO task_user SET ?', task_user, function(err, taskUserResult){
            //insert task_user into databse
            //insert task_user into databse
            task_project_link = connection.query('INSERT INTO tasks_project (task_id,project_id) VALUES ("'+taskResult.insertId+'","'+project.project_id+'")', function(err, taskLinkResult) {
                //insert requirments into database
                for (var i = 0; i < req.body.task.requirement.length; i++) {
                    if (req.body.task.requirement[i] != '' && req.body.task.requirement[i] != undefined) {
                        var requirement = {
                            description: req.body.task.requirement[i]
                        }
                        var counter = 1;
                        add_task_requirements = connection.query('INSERT INTO requirement SET ?', requirement, function(err, requirementResult) {
                            task_requirement.requirement_id = requirementResult.insertId;
                            task_requirement.task_id = task_project.task_id;
                            //insert task_requirment_link into database
                            add_task_requirements = connection.query('INSERT INTO task_requirements SET ?', task_requirement, function(err, requirementLinkResult) {
                                if (counter == req.body.task.requirement.length) {
                                    res.redirect('/project?id='+req.query.project_id);
                                }else{
                                    counter++;
                                }
                            });
                        });
                    }
                }
            });
        });    
    });
});

/* GET Edit_Task POST data */
app.post("/edit_task", function (req, res) {
    var project = {
        project_id: req.query.project_id,
    }
    var task = {
        id: req.body.task.id,
        title: req.body.task.title,
        description: req.body.task.description,
        status: req.body.task.status,
        end_date: req.body.task.end_date
    };
    var task_user = {
        task_id: req.body.task.id,
        user_id: req.body.task.user
    }
    for (var i = 0; i < req.body.task.requirement.length; i++) {
        update_task_requirements = connection.query('UPDATE requirement SET description = "'+req.body.task.requirement[i]+'" WHERE id = "'+req.body.task.requirement_id[i]+'"', function(err, requirementResult) {
            //update requirements
        });
    }
    update_task_user = connection.query('UPDATE task_user SET user_id = "'+task_user.user_id+'", task_id = "'+task_user.task_id+'"', function(err, taskUserResult){
        //update task_user
    });
    //insert task data into database
    update_task = connection.query('UPDATE tasks SET title = "'+ task.title +'", description = "'+task.description+'", end_date = "'+task.end_date+'" WHERE id = "'+task.id+'"', function (err, taskResult) {
        //insert requirments into database
    });
    res.redirect('/project?id='+req.query.project_id);
});

/* GET Delete_Task page */
app.get("/delete_task", function (req, res) {
    var task_id = req.query.task_id;
    var project_id = req.query.project_id;
    delete_task = connection.query('DELETE FROM tasks WHERE id ="'+task_id+'"', task_id, function(req, res) {
        //delete task 
    });
     delete_task_requirement = connection.query('DELETE FROM tasks_project WHERE task_id = "'+task_id+'" AND project_id ="'+project_id+'"', function(req, res) {
        //delete task_project link 
    });
    res.redirect('/project?id='+req.query.project_id);
});

/* GET File_Uploads POST data */
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
      var extension = file.originalname;
      var fileExt = extension.split(".");
    cb(null, Date.now() + "." + fileExt[fileExt.length - 1]); //Appending .ext
  }
});

var upload = multer( { storage: storage } );

app.post( '/file_upload', upload.single( 'file' ), function( req, res, next ) {

    var type = req.file.originalname;
    var filetype = type.split(".");
    var filetypeExt = filetype[filetype.length - 1];
    switch (filetypeExt) {
        case 'jpg':
            filetypeExt = 'img'
            break;
        case 'jpeg':
            filetypeExt = 'img'
            break;
        case 'png':
            filetypeExt = 'img'
            break;
        case 'html':
            filetypeExt = 'code'
            break;
        case 'css':
            filetypeExt = 'code'
            break;
        case 'php':
            filetypeExt = 'code'
            break;
        case 'js':
            filetypeExt = 'code'
            break;
        case 'pdf':
            filetypeExt = 'pdf'
            break;
        case 'doc':
            filetypeExt = 'doc'
            break;
        case 'docx':
            filetypeExt = 'doc'
            break;
        case 'ppt':
            filetypeExt = 'ppt'
            break;
        case 'pptx':
            filetypeExt = 'ppt'
            break;
        case 'xls':
            filetypeExt = 'xls'
            break;
        case 'xlsx':
            filetypeExt = 'xls'
            break;
        case 'zip':
            filetypeExt = 'zip'
            break;
        case 'mp3':
            filetypeExt = 'mp3'
            break;
        case 'mp4':
            filetypeExt = 'mp4'
            break;
        default:
            filetypeExt = 'txt'
            break;
    }
    var location = req.file.path;
    var upload = location.split("/");
    var uploadDestination = "uploads/" + upload[upload.length - 1];
    var link = uploadDestination;
    var file = {
        title: req.file.originalname,
        info: filetypeExt,
        location: link,
        user_id: req.cookies.user_id,
        project_id: req.body.file.project_id
    }
    file_upload = connection.query('INSERT INTO files SET ?', file, function (err, taskResult) {
        // file uploaded
    });
    io.sockets.emit('uploadDestination', uploadDestination);
    console.log(res.status( 200 ).send( req.file ));
});

/* GET Delete File page */
app.get("/delete_file", function (req, res) {
    var project_id = req.query.project_id;
    var file_id = req.query.file_id;
    delete_file = connection.query('DELETE FROM files WHERE files.project_id ="'+project_id+'" AND files.id ="'+file_id+'"', project_id, function(req, res) {
        //delete file
    });
    res.redirect('/project?id='+req.query.project_id);
});

/* GET Sign_Up page. */
app.get('/sign_up',
  function(req, res){
    res.render('sign_up',
    {
        title: 'Utasko | Sign Up',
        message: req.query.message
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
    res.cookie('username', req.user.name);
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


server.listen(process.env.PORT || 5000);
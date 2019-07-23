(function() {
        const error_codes = {
            "MODULE_NOT_FOUND": {
                "status": 404
            }
        }

        const express = require('express')
        const path = require('path')
        const passport = require('passport');
        const GitHubStrategy = require('passport-github').Strategy;
        let fwk = require('../utils/fwk').fwk;

        const file_options = {
            root: path.join(__dirname, '../../client'),
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };

        passport.serializeUser(function(user, cb) {
            cb(null, user);
        });

        passport.deserializeUser(function(obj, cb) {
            cb(null, obj);
        });



        passport.use(new GitHubStrategy({
                clientID: "332941bd2172706cb52f",
                clientSecret: "3777b816330310526df039f38aaed508e19f665a",
                callbackURL: fwk.config.base_url + "/auth/github/callback"
            },
            function(accessToken, refreshToken, profile, cb) {
                let fwk = require('../utils/fwk').fwk;
                profile = profile._json;
                fwk.db.Users.checkAndCreateUser(profile, { github_id: profile.id }, fwk, function(err, user) {
                    if (user) {
                        if (user.value && user.value._id) {
                            return cb(err, { "user_id": user.value._id });
                        } else if (user.ok && user.lastErrorObject && user.lastErrorObject.upserted) {
                            return cb(err, { "user_id": user.lastErrorObject.upserted });
                        }
                    }
                })
            }
        ));


        function establishRoutes(app) {

            app.use(passport.initialize());
            app.use(passport.session());


            app.use(express.static(path.join(__dirname, '../../client')));

            let fwk = require('../utils/fwk').fwk;

            app.get('/url-config.js', function(req, res) {
                let contents = 'const REST_API_BASE_URL="' + fwk.config.base_url + '";';
                res.set('Content-Type', 'text/javascript; charset=UTF-8');
                res.status(200).send(new Buffer(contents));
            });

            app.get("/auth/is_logged_in", function(req, res) {
                if (!(req && req.user)) {
                    res.send({
                        "is_logged_in": false
                    });
                } else {
                    fwk.db.Users.getUsers({ _id: req.user.user_id }, {}, {}, fwk, function(err, users) {
                        res.send({
                            "is_logged_in": true,
                            "user": (!err && users && users.length) ? users[0] : null
                        });
                    })
                }
            })


            app.get('/auth/github',
                passport.authenticate('github'));



            app.get('/auth/github/callback',
                passport.authenticate('github', { failureRedirect: '/login' }),
                function(req, res) {
                    res.redirect('/posts');
                });


            app.get('/posts',
                require('connect-ensure-login').ensureLoggedIn(),
                function(req, res) {
                    res.sendFile('posts.html', file_options, function() {
                        res.end();
                    });
                });

            // Generic route handler            

            app.use('/api/:module_name/:api_name', (req, res, next) => {
                next();
            }, function(req, res, next) {
                console.log('APi Called with Module: ' + req.params.module_name + '/' + req.params.api_name);
                let api_object = {
                    module_name: req.params.module_name,
                    api_name: req.params.api_name
                };
                //let ip_address = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || req.socket.remoteAddress;
                handleApiCallWithModule(req.method, api_object.module_name, api_object.api_name, req, res, next);
            });

            app.use('/', function(req, res) {
                res.sendFile('login.html', file_options, function() {
                    res.end();
                });
            });
        }



        // method for handle the api call with module names
        function handleApiCallWithModule(api_method, module_name, api_name, req, res, next) {
            let query_string = req.query;
            let params = req.params;
            let q = require('q').defer();
            let start_time = new Date();
            q.promise.then(function(result) {
                res.status = result.status;
                if (res.status === 302) {
                    res.redirect(result.data.redirect_url);
                } else if (res.status === 404) {
                    res.writeHead(404, {
                        "Content-Type": "text/plain"
                    });
                    res.end('Oops! \nThe requested URL /404 was not found on this server.');
                } else {
                    let response = {
                        code: 0,
                        data: result.data,
                        message: result.error_message
                    };
                    res.json(response);
                    res.end();
                    let end_time = new Date();
                    let elapsed_time = (end_time - start_time) / 1000;
                    console.warn("API Response", module_name + "@" + api_name, elapsed_time);

                }
            }, function(err) {
                // error handler if q.promise failed.
                console.error('An unhandled error occured while calling the api. Error was ' + err.toString());
            }.bind(start_time));
            console.warn("[" + getFormatedDate() + "] [INFO] [API] [" + module_name + "/" + api_name + '_' + api_method.toLowerCase() + "] [execute] API Process Started.");
            let rqst = {
                query: query_string,
                params: params,
                cookies: req.cookies,
                req: req,
                res: res

            }
            if (api_method) {
                api_method = api_method.toLowerCase()
                if (api_method == "post" || api_method == 'put') {
                    rqst.body = req.body;
                }
                try {
                    require('../api/' + module_name + '/' + api_name + '_' + api_method.toLowerCase()).execute(rqst, q, require('../utils/fwk').fwk);
                } catch (err) {
                    handleRequestErr(module_name, api_name, api_method, res, err);
                }
            }

        }



        function handleRequestErr(module_name, api_name, api_method, res, err) {
            console.warn('Module name: ' + module_name + ', Api Name:  ' + api_name + ', Method Name: ' + api_method.toLowerCase() + ', Unhandled Error', err.code);
            try {
                q.resolve({
                    status: error_codes[err.code]["status"]
                });
            } catch (e) {
                console.error('Error executing the API ' + module_name + '_' + api_name, err);
                // console.log("file_options", file_options)
                res.sendFile("404.html", file_options)
            }
        }


        //method for get the formated date for loging
        function getFormatedDate() {
            let current_date = new Date();
            current_date = current_date.toJSON();
            return current_date;
        }

        function disableCacheOnResponse(req, res) {
            res.set('Cache-Control', 'no-store,no-cache');
            res.set('Pragma', 'no-cache');
        }

        exports.establishRoutes = establishRoutes;
    } // end closure
)();
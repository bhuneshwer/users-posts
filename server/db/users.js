(function() {
    function getUsers(query_parameters, selected_fields, options, fwk, cb) {
        fwk.getDbClient(function(err, client) {
            if (err) {
                fwk.endDbClient(client);
                console.error("Mongodb Client Error: db.users: getUsers: Error Message: Error occurred while getting mongodb client: Error: " + err);
                fwk.execute(cb, [err, null]);
            } else {
                var users = client.collection('users');
                users.find(query_parameters, selected_fields).toArray(function(err, users) {
                    if (err) {
                        console.error('Error occurred while getting users details. Query parameters: ', query_parameters, " Error: ", err);
                        fwk.endDbClient(client);
                        fwk.execute(cb, [err, null]);
                    } else {
                        fwk.endDbClient(client);
                        if (users && users.length > 0) {
                            fwk.execute(cb, [null, users]);
                        } else {
                            fwk.execute(cb, [err, null]);
                        }
                    }
                });
            }
        })
    }

    function createUser(user, fwk, cb) {
        fwk.getDbClient(function(err, client) {
            if (err) {
                console.error('Error getting database client.');
                fwk.execute(cb, [err, null]);
            } else {
                let users = client.collection('users');
                users.insert(user, function(err, users) {
                    if (err) {
                        console.error('Error while creating user', err);
                        fwk.execute(cb, [err, null]);
                    } else {
                        fwk.execute(cb, [null, users]);
                    }
                });
            }
        });

    }

    function checkAndCreateUser(user, query_param, fwk, cb) {
        fwk.getDbClient(function(err, client) {
            if (err) {
                console.error('Error getting database client.');
                fwk.execute(cb, [err, null]);
            } else {
                let users = client.collection('users');
                users.findOneAndUpdate(query_param, {
                        "$set": user
                    }, { upsert: true, returnNewDocument: true },
                    function(err, user) {
                        if (err) {
                            fwk.execute(cb, [err, null]);
                        } else {
                            fwk.execute(cb, [null, user]);
                        }
                    });
            }
        });
    }

    return exports.Users = {
        createUser: createUser,
        getUsers: getUsers,
        checkAndCreateUser: checkAndCreateUser
    }
})();
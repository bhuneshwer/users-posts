(function() {

    function execute(rqst, q, fwk) {
        if (fwk.isUserLoggedIn(rqst) === true && fwk.isValidObjectId(rqst.req.user.user_id)) {

            console.log("rqst.req.user.user_id", rqst.req.user.user_id)


            let query_params = {
                "_id": new fwk.ObjectID.createFromHexString(rqst.req.user.user_id.toString())
            }

            fwk.db.Users.getUsers(query_params, {}, {}, fwk, function(err, users) {
                if (users && users.length) {
                    fwk.resolveResponse(q, 0, 200, { "user": users[0], "is_logged_in": true }, "Success");
                } else {
                    fwk.resolveResponse(q, 0, 200, { "user": null, "is_logged_in": true }, "Success");
                }
            })

        } else {
            fwk.resolveResponse(q, 0, 200, { "user": null, "is_logged_in": false }, "Success");
        }
    }
    exports.execute = execute;
})()
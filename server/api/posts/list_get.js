(function() {

    /*
    Expected Parameters:
        -rqst.query.limit - optional - number - limiting the numbers of the data
        -rqst.query.page_number - required - skipping number of data
        -rqst.query.parent_id - optional
    */

    function execute(rqst, q, fwk) {
        if (fwk.isUserLoggedIn(rqst) === true && fwk.isValidObjectId(rqst.req.user.user_id)) {
            let query_params = {

            }
            if (rqst.query.parent_id && fwk.isValidObjectId(rqst.query.parent_id)) {
                query_params["parent_id"] = new fwk.ObjectID.createFromHexString(rqst.query.parent_id);
            } else {
                query_params["parent_id"] = { "$exists": false }
            }

            let options = {
                "page_number": !isNaN(rqst.query.page_number) ? rqst.query.page_number : 1,
                "limit": !isNaN(rqst.query.limit) ? parseInt(rqst.query.limit) : 20
            }

            fwk.db.Posts.getPosts(query_params, {}, options, fwk, (err, posts) => {
                if (posts && posts.length) {
                    getUsersData(posts, fwk, (users_map) => {
                        fwk.resolveResponse(q, 0, 200, { "posts": posts, "users": users_map }, "Success");
                    })
                } else {
                    fwk.resolveResponse(q, 0, 200, { "posts": [] }, "Success");
                }
            })

        } else {
            fwk.resolveResponse(q, 401, 200, { error_message: "Authorization Failed" }, "Authorization Failed");
        }
    }

    function getUsersData(posts, fwk, cb) {
        let user_ids = fwk._.uniq(fwk._.pluck(posts, "user_id"));
        var user_map = {};
        fwk.db.Users.getUsers({ "_id": { "$in": user_ids } }, {}, {}, fwk, (err, users) => {
            if (!err && users && users.length) {
                fwk._.each(users, (user) => {
                    user_map[user._id] = user;
                })
            }
            cb(user_map);
        })
    }


    exports.execute = execute;
})()
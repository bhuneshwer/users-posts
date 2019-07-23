(function() {

    /*
    Expected Parameters:
        -rqst.body.post_id - required - string
        -rqst.body.text - required - string
    */

    function execute(rqst, q, fwk) {
        if (fwk.isUserLoggedIn(rqst) === true && fwk.isValidObjectId(rqst.req.user.user_id)) {
            let promise = require("q");
            let defer = promise.defer();
            rqst.body.user_id = new fwk.ObjectID.createFromHexString(rqst.req.user.user_id);
            if (rqst.body.text && rqst.body.post_id && fwk.isValidObjectId(rqst.body.post_id)) {
                // converting hex string to Mongo ObjectId
                rqst.body.post_id = new fwk.ObjectID.createFromHexString(rqst.body.post_id);
                // getting post data to check whether data is available or not
                fwk.db.Posts.getPosts({ _id: rqst.body.post_id }, { _id: 1, user_id: 1 }, {}, fwk, (err, posts) => {
                    if (posts && posts.length) {
                        // checking whether user has access to edit the post or not
                        if (!(posts[0]["user_id"] && posts[0]["user_id"].toString() === rqst.req.user.user_id.toString())) {
                            fwk.resolveResponse(q, 401, 200, { error_message: "You dont have access to edit this message" }, "You dont have access to edit this message");
                        } else {
                            defer.resolve();
                        }
                    } else {
                        fwk.resolveResponse(q, 410, 200, { error_message: "Parent post is no more available" }, "Parent post is not available");
                    }
                })
                defer.promise.then(() => {
                    let query_param = {
                        "_id": rqst.body.post_id
                    }
                    let post_data = {
                        "text": rqst.body.text,
                        "last_modified_on": new Date()
                    }
                    // calling db service to update the post
                    fwk.db.Posts.updatePost(query_param, post_data, fwk, (err, post_data) => {
                        fwk.resolveResponse(q, 0, 200, post_data, "Success");
                    })
                })

            } else {
                fwk.resolveResponse(q, 422, 200, {}, "Required parameters not sent");
            }

        } else {
            fwk.resolveResponse(q, 401, 200, { error_message: "Authorization Failed" }, "Authorization Failed");
        }

    }
    exports.execute = execute;
})()
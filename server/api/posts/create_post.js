(function() {

    /*
    Expected Parameters:
        -rqst.body.text - required - string
        -rqst.body.parent_id - optional
    */

    function execute(rqst, q, fwk) {
        if (fwk.isUserLoggedIn(rqst) === true && fwk.isValidObjectId(rqst.req.user.user_id)) {
            let promise = require("q");
            let defer = promise.defer();
            if (rqst.body && rqst.body.text) {
                rqst.body.user_id = new fwk.ObjectID.createFromHexString(rqst.req.user.user_id);
                if (rqst.body.parent_id && fwk.isValidObjectId(rqst.body.parent_id)) {
                    rqst.body.parent_id = new fwk.ObjectID.createFromHexString(rqst.body.parent_id);
                    fwk.db.Posts.getPosts({ _id: rqst.body.parent_id }, { _id: 1 }, {}, fwk, (err, posts) => {
                        if (posts && posts.length) {
                            defer.resolve();
                        } else {
                            fwk.resolveResponse(q, 410, 200, { error_message: "Parent post is no more available" }, "Parent post is not available");
                        }
                    })
                } else {
                    defer.resolve();
                }

                defer.promise.then(() => {
                    let data = {
                        "text": rqst.body.text,
                        "user_id": rqst.body.user_id,
                        "created_date": new Date()
                    }

                    if (rqst.body.parent_id) {
                        data["parent_id"] = rqst.body.parent_id;
                    }

                    try {
                        fwk.db.Posts.createPost(data, fwk, (err, data) => {
                            fwk.resolveResponse(q, 0, 200, {
                                "_id": data && data.insertedIds ? data.insertedIds["0"] : null
                            }, "Success");
                        })
                    } catch (e) {
                        console.error(e);
                    }
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
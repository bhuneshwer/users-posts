(function() {

    function getPosts(query_parameters, selected_fields, options, fwk, cb) {
        fwk.getDbClient((err, client) => {
            if (err) {
                fwk.endDbClient(client);
                console.error("Mongodb Client Error: db.posts: getPosts: Error Message: Error occurred while getting mongodb client: Error: " + err);
                fwk.execute(cb, []);
            } else {
                var Posts = client.collection('posts');
                var cursor;
                // properties to be handled - limit, page_number 
                if (options && !(fwk._.isEmpty(options)) && options.limit && options.page_number) {
                    // options has limit and paging data
                    // using skip and limit to enable paging
                    cursor = Posts.find(query_parameters, selected_fields).skip(options.page_number > 0 ? ((options.page_number - 1) * options.limit) : 0).sort({ _id: -1 });
                    cursor.limit(options.limit);
                } else {
                    // no options is available for paging
                    cursor = Posts.find(query_parameters, selected_fields).sort({ _id: -1 });
                }
                cursor.toArray((err, posts) => {
                    if (err) {
                        console.error('Error occurred while getting posts details. Query parameters: ', query_parameters, " Error: ", err);
                        fwk.endDbClient(client);
                        fwk.execute(cb, [err, null]);
                    } else {
                        fwk.endDbClient(client);
                        if (posts && posts.length > 0) {
                            fwk.execute(cb, [null, posts]);
                        } else {
                            fwk.execute(cb, [err, null]);
                        }
                    }
                });

            }
        })
    }

    function updatePost(query_param, data_to_update, fwk, cb) {
        fwk.getDbClient((err, client) => {
            if (err) {
                console.error('Error getting database client.');
                fwk.execute(cb, [err, null]);
            } else {
                let Posts = client.collection('posts');
                Posts.update(query_param, { "$set": data_to_update }, (err, data_to_update) => {
                    if (err) {
                        console.error('Error while updating post', err);
                        fwk.execute(cb, [err, null]);
                    } else {
                        fwk.execute(cb, [null, data_to_update]);
                    }
                });
            }
        });
    }

    function createPost(post, fwk, cb) {
        fwk.getDbClient((err, client) => {
            if (err) {
                console.error('Error getting database client.');
                fwk.execute(cb, [err, null]);
            } else {
                let Posts = client.collection('posts');
                Posts.insert(post, (err, post) => {
                    if (err) {
                        console.error('Error while creating post', err);
                        fwk.execute(cb, [err, null]);
                    } else {
                        fwk.execute(cb, [null, post]);
                    }
                });
            }
        });

    }

    return exports.Posts = {
        createPost: createPost,
        getPosts: getPosts,
        updatePost: updatePost
    }
})();
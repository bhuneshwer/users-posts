(function() {
    let current_logged_in_user = null;

    let pagination_details = {
        "page_number": 1,
        "limit": 20,
        "limit_exceeded": false
    }

    let posts = [];

    // submitPost()  - Creates new post or reply
    // params:
    //     - text - Comment text - String
    //     - parent_id - ParentId - In case of reply post
    //     - cb  - callback function
    let submitPost = (text, parent_id, cb) => {
        let comment = new Posts(text, parent_id, new Date());
        if (!(isEmptyString(comment.text))) {
            comment.create((response) => {
                if (response && response.data && response.data._id) {
                    // once comment is created, appending data in dom
                    cb(true);
                    let comment_to_append = {
                        "text": text,
                        "_id": response.data._id,
                        "user_id": current_logged_in_user._id,
                        "created_date": new Date(),
                        "edit_allowed": true,
                        "user": current_logged_in_user
                    }
                    if (parent_id) {
                        comment_to_append.replies_list_enabled = true;
                        comment_to_append.parent_id = parent_id;
                    }

                    // caling getPostToRender() to prepare dom for single post
                    let post_to_render = getPostToRender(comment_to_append);

                    if (!parent_id) {
                        posts.push(comment_to_append);
                        _id("postsListContainer").innerHTML = (post_to_render + _id("postsListContainer").innerHTML)
                        showAlert("Posted successfully.", "success");
                    } else {
                        showAlert("Replied successfully.", "success")
                    }
                } else {
                    showAlert("Something went wrong.", "error")
                }
            });
        } else {
            showAlert("Post text is mandatory.", "error")
        }
    }

    let showAlert = function(message, type) {
        if (!(isEmptyString(message))) {
            _id("alertMessageContainer").style.background = (type == "error") ? "#F44336" : "#8BC34A";
            _id("alertMessageContainer").innerHTML = message;
            _id("alertMessageContainer").style.display = "block";
            setTimeout(() => {
                _id("alertMessageContainer").style.display = "none";
            }, 3000)
        }

    }
    let updatePost = (text, post_id, cb) => {
        if (!(isEmptyString(text))) {
            Requests.put(REST_API_BASE_URL + '/api/posts/update', { "text": text, "post_id": post_id }, (response) => {
                if (response.data && response.data.code === 0) {
                    cb(true);
                    showAlert("updated successfully..", "success");
                } else {
                    cb(false);
                    alert((response.data.error_message || "Something went wrong..."), "error")
                }
            })
        }
    }

    let getPosts = function(parent_id, cb) {
        let page_number = parent_id ? 1 : pagination_details.page_number;
        Requests.get(REST_API_BASE_URL + "/api/posts/list?parent_id=" + parent_id + "&page_number=" + page_number + "&limit=" + pagination_details.limit, {}, function(response) {
            if (response.data && response.data.code === 0 && response.data.posts && response.data.posts.length) {
                posts = posts.concat(response.data.posts);
            }
            cb(response)
        })
    }



    let getPostToRender = (post, dont_return_parent) => {
        post.usrname = (post.user ? post.user.login : "Unknown") || "Unknown";
        let id = post.id;
        let list_parent = dont_return_parent ? "" : `<li id="post_${post._id}" class="post-single-item">`;
        let list_elem = `
             ${list_parent}
             <div class="post-header">
                <div  class="post-handle">
                    ${post.usrname}
                </div>
                <div class="post-single-item-date">
                    posted ${timeAgo(new Date(post.created_date))}
                </div>
            </div> 
            <div class="post-single-item-text">
             ${post.text}
            </div>
            <div class="reply-form-conatainer" style="display:${post.is_reply_mode===true?"inherit":"none"}">
                <textarea row="3" class="reply-textarea" id="replyText_${post._id}"></textarea>
                <br>
                <button class="btn btn-default" action="add-reply" id="submitReplyBtn_${post._id}" post-id="${post._id}">Submit</button>
            </div>


            <div class="reply-form-conatainer" style="display:${post.is_edit_mode===true?"inherit":"none"}">
                <textarea row="3" class="reply-textarea" id="replyUpdatedText_${post._id}" value="${post.text}"></textarea>
                <br>
                <button class="btn btn-default" action="update-reply" id="updateReplyBtn_${post._id}" post-id="${post._id}" post-text="${post.text}">Submit</button>
            </div>


            <div class="post-btns-container">
                <button class="btn btn-default" action="enable-update-reply" style="display:${(post.edit_allowed===true && !post.is_edit_mode && !post.is_reply_mode)?"initial":"none"}" id="editPostBtn_${post._id}" post-id="${post._id}">Edit</button>
                <button class="btn btn-default" action="enable-new-reply" style="display:${(post.is_reply_mode===true || post.is_edit_mode)?"none":"initial"}" id="enableReplyBtn_${post._id}" post-id="${post._id}" post-text="${post.text}" action="">Reply</button>
            </div>

            <div class="post-btns-container">
                <a href="JavaScript:void(0);" role="button" style="display:${post.replies_list_enabled===true?"none":"initial"}" action="view-replies" post-id="${post._id}" id="viewRepliesBtn_${post._id}"post-text="${post.text}">View replies</a>
                <a href="JavaScript:void(0);" role="button" style="display:${post.replies_list_enabled===true?"initial":"none"}" action="hide-replies" post-id="${post._id}" id="hideRepliesBtn_${post._id}"post-text="${post.text}">Hide replies</a>
            </div>
            <div class="post-replies" id="postRepliesContainer_${post._id}">
            
            </div>
            `;

        list_elem += (dont_return_parent ? "" : "</li>");
        return list_elem;
    }


    // returns posts elements to render
    // looping through each post and calling getPostToRender() for each post
    let getPostsToRender = (post_items, users, elem_to_append) => {
        let posts_list = '';
        post_items.forEach(post => {
            if (post.user_id === current_logged_in_user._id) {
                post.edit_allowed = true;
            }
            post.user = users[post.user_id];
            posts_list += getPostToRender(post);
        });

        return posts_list;
    }

    //    getPostById() - returns post by _id
    let getPostById = function(post_id) {
        for (let i = 0; i < posts.length; i++) {
            if (posts[i]["_id"] == post_id) {
                return posts[i];
            }
        }
    }

    let logout = function() {
        Requests.post(REST_API_BASE_URL + "/api/auth/logout", {}, function(resp) {
            window.location = '/login';
        })
    }
    // attachEvents() - attaches dom events for required elements
    let attachEvents = function() {
        const add_post_btn = _id("submitPostBtn");


        _id("logoutBtn").addEventListener("click", (event) => {
            logout();
        })

        add_post_btn.addEventListener("click", () => {
            let text = _id("postText").value;
            submitPost(text, null, (is_submitted) => {
                _id("postText").value = "";
            });

        }, false);

        // listeing scroll event for posts container
        // on scroll loading more posts
        _id("postsListContainerMain").addEventListener("scroll", function(event) {
            // add more contents if user scrolled down enough
            if (_id("postsListContainerMain").scrollTop + _id("postsListContainerMain").offsetHeight + 80 > _id("postsListContainer").offsetHeight) {
                loadMorePosts();
            }

        })
        // performAction() - perfomrs action based on action type
        let performAction = function(post, action, post_id) {
            return new Promise(function(resolve, reject) {
                replies = null;
                switch (action) {
                    case 'enable-update-reply':
                        post.is_edit_mode = true;
                        resolve()
                        break;
                    case 'enable-new-reply':
                        post.is_reply_mode = true;
                        post.is_edit_mode = false;
                        resolve()
                        break;
                    case 'add-reply':
                        let reply_text = _id("replyText_" + post._id).value;
                        submitPost(reply_text, post._id, (is_saved) => {
                            post.is_reply_mode = post.is_edit_mode = false;
                            _id("replyText_" + post._id).value = "";
                            resolve()
                        });
                        break;
                    case 'update-reply':
                        post.text = _id("replyUpdatedText_" + post._id).value;
                        updatePost(post.text, post._id, (is_updated) => {
                            if (is_updated) {
                                post.is_reply_mode = post.is_edit_mode = false;
                                post.text = _id("replyUpdatedText_" + post._id).value;
                                resolve()
                            }
                        });
                        break
                    case 'view-replies':
                        getPosts(post._id, (response) => {
                            post.replies_list_enabled = true;
                            post.replies = [];
                            if (response && response.data && response.data.posts && response.data.posts.length) {
                                post.replies = response.data.posts;
                                post.users = response.data.users;
                                post.repliesDom = getPostsToRender(response.data.posts, response.data.users);
                            } else {
                                post.repliesDom = "<li class='no-replies-message'>No replies available.</li>";
                            }
                            resolve();
                        })
                        break;
                    case 'hide-replies':
                        post.replies_list_enabled = false;
                        resolve()
                    default:
                        break;
                }
            });
        }

        const posts_list_container = _id("postsListContainer");

        posts_list_container.addEventListener("click", (event) => {
            if (event.target.nodeName === 'A' || event.target.nodeName === 'BUTTON') {
                let action = event.target.getAttribute("action");
                let post_id = event.target.getAttribute("post-id");
                let replies = null;
                // Rerendering the elements based on conditions
                if (action && post_id) {
                    let post = getPostById(post_id)
                    var promise = performAction(post, action, post_id);
                    promise.then((value) => {
                        let dont_return_parent = true;
                        _id("post_" + post._id).innerHTML = getPostToRender(post, dont_return_parent);
                        if (post.replies_list_enabled == true) {
                            _id("postRepliesContainer_" + post_id).style.display = "inherit";
                            _id("viewRepliesBtn_" + post_id).style.display = "none";
                            _id("hideRepliesBtn_" + post_id).style.display = "inherit";
                            if (post.repliesDom) {
                                _id("postRepliesContainer_" + post_id).innerHTML = post.repliesDom;
                            }
                        }
                        if (post.is_edit_mode) {
                            _id("replyUpdatedText_" + post._id).value = post.text;
                        }
                    })
                }

            }
        }, false);
    }

    // _id() returns dom object by dom id
    let _id = function(domStr) {
        return document.getElementById(domStr);
    }
    // isEmptyString() checks whether string is empty or not
    let isEmptyString = function(str) {
        return !(str && str.trim() && str.trim().length) ? true : false;
    }
    // loadMorePosts() - on scoroll loading more posts
    // fething next page data based on page_number
    let loadMorePosts = function(parent_id) {
        if (!pagination_details.limit_exceeded) {
            pagination_details.page_number += 1;
            getPosts(parent_id, (response) => {
                if (response.data.posts && response.data.posts.length) {
                    _id("postsListContainer").innerHTML = _id("postsListContainer").innerHTML + getPostsToRender(response.data.posts, response.data.users);
                } else {
                    _id("postsListContainer").innerHTML = _id("postsListContainer").innerHTML + "No more posts to load.";
                    pagination_details.limit_exceeded = true;
                }
            })
        }
    }
    // checking whether user is logged in or not
    // calling getPosts() to get posts
    let isLoggedIn = function() {
        Requests.get(REST_API_BASE_URL + "/api/auth/me", {}, function(resp) {
            if (resp.data.is_logged_in !== true) {
                window.location = '/login';
            } else {
                attachEvents();
                current_logged_in_user = resp.data.user;
                getPosts(null, (response) => {
                    _id("postsMainPageConatiner").style.display = "block";
                    _id("loader").style.display = "none";
                    _id("postsListContainer").innerHTML = getPostsToRender(response.data.posts, response.data.users);
                });
            }
        })
    }

    // timeAgo  - formats the date in moment format
    let timeAgo = (date) => {
        let currentDate = new Date();
        let yearDiff = currentDate.getFullYear() - date.getFullYear();

        if (yearDiff > 0)
            return `${yearDiff} year${yearDiff==1? "":"s"} ago`;

        let monthDiff = currentDate.getMonth() - date.getMonth();
        if (monthDiff > 0)
            return `${monthDiff} month${monthDiff == 1 ? "" : "s"} ago`;

        let dateDiff = currentDate.getDate() - date.getDate();
        if (dateDiff > 0)
            return `${dateDiff} day${dateDiff == 1 ? "" : "s"} ago`;

        let hourDiff = currentDate.getHours() - date.getHours();
        if (hourDiff > 0)
            return `${hourDiff} hour${hourDiff == 1 ? "" : "s"} ago`;

        let minuteDiff = currentDate.getMinutes() - date.getMinutes();
        if (minuteDiff > 0)
            return `${minuteDiff} minute${minuteDiff == 1 ? "" : "s"} ago`;
        return `a few seconds ago`;
    }

    // once dom content is loaded calling isLoggedIn()
    document.addEventListener('DOMContentLoaded', (params) => {
        isLoggedIn();
    }, false);

})();
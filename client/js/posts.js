class Posts {
    constructor(text, parent_id, created_date) {
        this.text = text;
        this.parent_id = parent_id;
        this.created_date = created_date;
    }
    static toJSONString(post) { // created JSON string to send/save on server
        return `{
            "text" : "${post.text}",
            "parent_id": "${post.parent_id}",
            "created_date": "${post.created_date}"
        }`;
    }

    create(cb) {
        Requests.post(REST_API_BASE_URL + "/api/posts/create", this, (response) => {
            cb(response)
        })
    }
}
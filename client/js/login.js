(function() {
    function isLoggedIn() {
        Requests.get(REST_API_BASE_URL + "/api/auth/me", {}, function(resp) {
            if (resp && resp.data && resp.data.is_logged_in === true) {
                window.location = '/posts';
                return;
            }
        })
    }

    function login() {
        Request.get(REST_API_BASE_URL + "/auth/github", {}, function(resp) {})
    }

    document.addEventListener("DOMContentLoaded", (event) => {
        document.getElementById("githubLoginBtn").setAttribute("href", REST_API_BASE_URL + "/auth/github");
    })

    isLoggedIn();
})()
(function() {
    function execute(rqst, q, fwk) {
        if (fwk.isUserLoggedIn(rqst) === true && fwk.isValidObjectId(rqst.req.user.user_id)) {
        	rqst.req.logout(); 
           	fwk.resolveResponse(q, 0, 200, { "user": null, "is_logged_in": false }, "Success");

        } else {
            fwk.resolveResponse(q, 0, 200, { "user": null, "is_logged_in": false }, "Success");
        }
    }
    exports.execute = execute;
})()
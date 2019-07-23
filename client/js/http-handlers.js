(function() {

    Requests = new function() {

        this.get = _get;
        this.post = _post;
        this.put = _put;

        function execute_ajax(method, url, data, header, cb) {
            var xmlhttp;
            if (window.XMLHttpRequest) {
                // code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp = new XMLHttpRequest();
            } else {
                // code for IE6, IE5
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.open(method, url, true);
            xmlhttp.withCredentials = true;
            if (header) {
                xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xmlhttp.setRequestHeader("Accept", "application/json, text/plain, */*");
            }
            if (cb) {
                xmlhttp.onreadystatechange = function() {
                    cb(xmlhttp);
                }
            }
            xmlhttp.send(JSON.stringify(data));
            return xmlhttp;
        }

        function _get(url, params, cb) {
            execute_ajax('GET', url, params, true, function(xmlHttp) {
                if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                    cb(JSON.parse(xmlHttp.responseText));
                }
            })
        }

        function _post(url, data, cb) {
            execute_ajax('POST', url, data, true, function(xmlHttp) {
                if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                    cb(JSON.parse(xmlHttp.responseText));
                }
            });
        }

        function _put(url, data, cb) {
            execute_ajax('PUT', url, data, true, function(xmlHttp) {
                if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                    cb(JSON.parse(xmlHttp.responseText));
                }
            });
        }
    }

})()
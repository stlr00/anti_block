var arr = []

function FindProxyForURL(url, host) {
    for (var i = 0; i < arr.length; i++) {
        if(shExpMatch(host, arr[i])) {
            return "HTTP 89.22.231.161:80; DIRECT";
        }
    }

    return  "DIRECT";
}

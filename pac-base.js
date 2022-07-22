var arr = []

function FindProxyForURL(url, host) {
    alert('HELLO')
    for (var i = 0; i < arr.length; i++) {
        if(shExpMatch(host, arr[i])) {
            return "HTTP 89.22.231.161:80; DIRECT";
        }
    }

    return  "DIRECT";
}

// https://antizapret.prostovpn.org/proxy.pac

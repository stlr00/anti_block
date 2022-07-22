var ips = 'meduzaio'

function FindProxyForURL(url, host) {
    host = host.replace('.', '')

    if (ips.indexOf(host) !== -1) {
        alert(host)
        return "PROXY 89.22.231.161";
    }

    return  "DIRECT";
}

// https://antizapret.prostovpn.org/proxy.pac

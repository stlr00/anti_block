var ips = 'meduzaio'

function FindProxyForURL(url, host) {
    host = host.replace('.', '')

    if (ips.indexOf(host) !== -1) {
        alert('MEDUZA!')
        return "HTTP 89.22.231.161:80; DIRECT";
    }

    return  "DIRECT";
}

// https://antizapret.prostovpn.org/proxy.pac

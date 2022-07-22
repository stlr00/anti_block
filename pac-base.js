var ips = 'meduzaio'

function FindProxyForURL(url, host) {
    alert(host)
    host = host.replace('.', '')

    if (ips.indexOf(host) !== -1) {
        alert('HELLO')
        return "HTTPS proxy-ssl.antizapret.prostovpn.org:3143; PROXY proxy-nossl.antizapret.prostovpn.org:29976; DIRECT";
    }

    return  "DIRECT";
}

// https://antizapret.prostovpn.org/proxy.pac

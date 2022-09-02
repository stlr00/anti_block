#!/bin/sh

# Находим все соединения на все порты и записываем их в файл ddos.iplist
netstat -ntu | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr | grep -v "127.0.0.1" > /usr/local/ddos/ddos.iplist

# создаем DROP правила (не выдавать ответа сервера на запросы забаненых) для IP с количеством подключений более 50 и добавляем их в файл
awk '{if ($1 > 50) {print "/sbin/iptables -A INPUT -s " $2 " -j DROP"; print "/sbin/iptables -A INPUT -d " $2 " -j DROP";}}' /usr/local/ddos/ddos.iplist >> /usr/local/ddos/iptables_ban.sh

# запускаем скрипт бана IP атакующих
bash /usr/local/ddos/iptables_ban.sh

# Очищаем скрипт, который производит бан
cat /dev/null > /usr/local/ddos/iptables_ban.sh

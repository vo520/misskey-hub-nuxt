# 設定 Nginx

[nginx](https://nginx.org/)をリバースプロキシとして活用し、Misskeyサーバーを直接インターネットに公開せず運用することをお勧めします。
これにより、以下のようなメリットが得られます。

- セキュリティ強化：リバースプロキシを通じてアクセスを制御することで、Misskeyサーバーに直接攻撃が及ぶリスクを軽減します。
- 柔軟な設定：nginxは柔軟な設定オプションを提供しており、リバースプロキシとしての機能だけでなく、キャッシュ[^1]やセキュリティポリシーの設定も行えます。

これらの利点を活かして、Misskeyサーバーをより安全かつ効率的に運用することが可能です。
また、CloudflareなどのCDNと併せて設定することで、さらなる効果を見込めます。

[^1]: nginxの機能である[proxy_cache_lock](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache_lock)と[proxy_cache_use_stale](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache_use_stale)を活用することで、キャッシュ未作成の状態で大量アクセスがあってもMisskeyサーバーの負荷増大を抑える効果が期待できます。

## 設定方法の一例

以下はサーバーマシン（VPSなど）に直接nginxをインストールし、認証局として[Let's Encrypt](https://letsencrypt.org/)を採用したケースでの設定例です。

1. 建立 `/etc/nginx/conf.d/misskey.conf` 或 `/etc/nginx/sites-available/misskey.conf` 並複製下面的設定範例。（檔名不必是misskey。）
2. 編輯內容如下
   1. 將 example.tld 替換為您自己的網域。\
      將 `ssl_certificate` 和 `ssl_certificate_key` 設定為透過 Let's Encrypt 取得的憑證的路徑。
   2. 如果您使用 Cloudflare 等 CDN，請刪除「If it's behind another reverse proxy or CDN, remove the following.」中的 4 行。
3. 如果建立了 `/etc/nginx/sites-available/misskey.conf`，請建立軟連結作為 `/etc/nginx/sites-enabled/misskey.conf`。\
   `sudo ln -s /etc/nginx/sites-available/misskey.conf /etc/nginx/sites-enabled/misskey.conf`
4. 使用 `sudo nginx -t` 檢查設定檔是否載入成功。
5. 使用 `sudo systemctl restart nginx` 重啟 nginx。

## 設置範例

```nginx
# For WebSocket
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

proxy_cache_path /tmp/nginx_cache levels=1:2 keys_zone=cache1:16m max_size=1g inactive=720m use_temp_path=off;

server {
    listen 80;
    listen [::]:80;
    server_name example.tld;

    # For SSL domain validation
    root /var/www/html;
    location /.well-known/acme-challenge/ { allow all; }
    location /.well-known/pki-validation/ { allow all; }
    location / { return 301 https://$server_name$request_uri; }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.tld;

    ssl_session_timeout 1d;
    ssl_session_cache shared:ssl_session_cache:10m;
    ssl_session_tickets off;

    # To use Let's Encrypt certificate
    ssl_certificate     /etc/letsencrypt/live/example.tld/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.tld/privkey.pem;

    # To use Debian/Ubuntu's self-signed certificate (For testing or before issuing a certificate)
    #ssl_certificate     /etc/ssl/certs/ssl-cert-snakeoil.pem;
    #ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;

    # SSL protocol settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Change to your upload limit
    client_max_body_size 80m;

    # Proxy to Node
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_http_version 1.1;
        proxy_redirect off;

        # If it's behind another reverse proxy or CDN, remove the following.
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        # For WebSocket
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        # Cache settings
        proxy_cache cache1;
        proxy_cache_lock on;
        proxy_cache_use_stale updating;
        proxy_force_ranges on;
        add_header X-Cache $upstream_cache_status;
    }
}
```

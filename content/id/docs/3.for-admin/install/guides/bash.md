# Misskey install shell script v3.0.0

Pasang Misskey dengan mudah hanya menggunakan satu shell script!

Kamu dapat memasang misskey pada peladen Ubuntu hanya dengan menjawab beberapa pertanyaan saja.

Terdapat juga script untuk memutakhirkan.

[Untuk v12](https://github.com/joinmisskey/bash-install/blob/a096e874f93d493aa68975a31be9ce12d644e767/README.md)\
[**Versi Bahasa Inggris**](./README.en.md)

## Bahan Yang Perlu Disiapkan

1. Domain
2. Peladen Ubuntu
3. Akun Cloudflare (Direkomendasikan)

:::danger

Jangan pernah mengganti nama domain (hostname) peladen ketika kamu sudah mulai menggunakannya!

:::

Pastikan pengaturan jaringan peladen DNS anda telah benar secara menyeluruh sebelum memulai instalasi. Apabila tidak, proses otentikasi Let's Encrypt akan terhambat dikarenakan percobaan permintaan sertifikat Let's Encrypt dibatasi dalam jumlah yang kecil.

## Pengaturan Cloudflare

Cloudflareを使う場合、Cloudflareのドメインの設定を完了してからインストールを開始するようにしてください。\
ネームサーバーの適用には最大で3日程度かかる場合があります。

Jika kamu menggunakan nginx dan Cloudflare, kamu harus mengatur Cloudflare terlebih dahulu untuk:

- Mengatur DNS.
- Pada tab pengaturan SSL/TLS, ubah mode enkripsi menjadi "Full".

## Prosedur

### 1. SSH

Menyambung ke peladen melalui SSH.\
(Jika kamu memiliki peladen dengan lingkungan desktop terpasang, buka Terminal/shell）

### 2. Perbaharui Lingkungan Peladen

Pastikan semua paket telah termutakhirkan dan boot ulang.

```sh
sudo apt update; sudo apt full-upgrade -y; sudo reboot
```

### 3. Jalankan Pemasangan

Hubungkan ulang SSH dan mulai pemasangan Misskey.

Pastikan untuk membaca [Tips](#tips) sebelum memulai proses pemasangan.

```sh
wget https://raw.githubusercontent.com/joinmisskey/bash-install/main/ubuntu.sh -O ubuntu.sh; sudo bash ubuntu.sh
```

Ubah domain example.com menjadi domain milik kamu.

### 4. Untuk memutakhirkan

Terdapat juga script untuk memutakhirkan peladen Misskey.

Script pemutakhiran tidak memutakhirkan lingkungan peladen.Mohon untuk merujuk ke CHANGELOG (Bahasa Jepang) dan [Daftar rilis di GitHub (Bahasa Inggris)](https://github.com/joinmisskey/bash-install/releases) serta lakukan operasi migrasi sesuai arahan.

Pertama, unduh script.

```sh
wget https://raw.githubusercontent.com/joinmisskey/bash-install/main/update.ubuntu.sh -O update.sh
```

Jalankan ini ketika kamu ingin memutakhirkan Misskey.

```sh
sudo bash update.sh
```

- Pada lingkungan systemd, opsi `-r` dapat digunakan untuk memutakhirkan dan memboot ulang sistem.
- Pada lingkungan docker, kamu dapat menentukan repository:tag sebagai argumen.

## Lingkungan dimana operasi ini telah diuji

### Oracle Cloud Infrastructure

Script ini bekerja dengan baik pada bentuk compute berikut yang disediakan oleh Oracle Cloud Infrastructure Always Free services.

- VM.Standard.E2.1.Micro (AMD)
- VM.Standard.A1.Flex (ARM) [1OCPU RAM6GB atau lebih]

Pastikan untuk menggunakan iptables.

## Isu & PRs Dipersilahkan

Apabila script ini tidak dapat bekerja pada lingkungan diatas, kemungkinan karena bug.Kami mengapresiasi apabila kamu dapat melaporkan hal tersebut sebagai isu dengan syarat tertentu yang telah kamu input ke dalam script.

Sangat sulit untuk memberikan bantuan untuk lingkungan selain yang disebutkan di atas, namun kami masih dapat membantu mencarikan solusi dari masalah kamu apabila kamu memberikan informasi detil mengenai lingkungan peladenmu.

Saran untuk fitur juga dipersilahkan.

# Tips

Cara memilih opsi dan spesifikasi.

## Systemd or Docker?

Mulai dari v1, terdapat metode pemasangan systemd atau Docker yang dapat dipilih.

Ketika memilih metode pemasangan Docker, **Misskey akan dipasang dan dijalankan melalui Docker** sedangkan Redis, Postgres dan sebagainya akan dipasang dan dijalankan pada host peladen langsung.\
[docker-composeですべての機能を動かす方法については、mamemonongaさんが作成したこちらの記事がおすすめです。](https://gist.github.com/mamemomonga/5549bb69cad8e5618e5527593d4890e0)

Apabila kamu memilih menggunakan image dari Docker Hub, kebutuhan untuk build Misskey tidak diperlukan dan pilihan ini merupakan **rekomendasi dari kami**.\
Namun ketika melakukan pemutakhiran, migrasi tetap dibutuhkan dan downtime tetap tidak dapat terhindarkan.\
Selain itu, dengan menggunakan image dari Docker Hub tidak perlu lagi menyiapkan lingkungan untuk build Misskey (tidak ada `git pull`). Dengan kata lain, apabila ingin menyiapkan dan menjalankan fork akan lebih merepotkan.

Karena alasan performa, metode build Docker secara lokal tidak dipergunakan lagi.

Metode pemasangan systemd sangat direkomendasikan apabila kamu ingin menggunakan ataupun menjalankan fork. Metode pemasangan ini juga tidak mengharuskan kamu untuk mengunggah image ke Docker Hub.

Urutan rekomendasi yang disarankan adalah sebagai berikut:

1. Docker Hub
2. systemd
3. Docker Build

## Gunakan nginx atau tidak?

Apabila kamu ingin membuat peladen Misskey pada satu peladen, disarankan untuk menggunakan nginx.

- ユーザは自分のみ（いわゆるお一人様サーバー）or ごく少数
- ロードバランサー等nginxのリバースプロキシ・キャッシュ機能を他の手段で賄う用意がある（上級者向け）

nginxをリバースプロキシとして採用することにより、画像ファイルなどの静的コンテンツをキャッシュしサーバーリソースの浪費を抑えることが出来ます。
また、nginxにはキャッシュが無い状態での大量アクセスを上手くコントロールする機能が搭載されていますので、Misskeyの負荷増大を抑える効果を期待できます。

設定例は[nginxの設定](../resources/nginx/)ページにて記載しています。

## Tambahkan swap!

Apabila kamu menggunakan swap, pastikan swap kamu memiliki hingga ruang hingga 3GB. Karena script akan dapat berjalan lancar apabila memiliki memori dengan minimal 3GB.

## Jika script gagal dan kamu ingin menjalankannya kembali

Perhatikan arahan berikut ini:

- Apabila Redis atau Postgres telah terpasang, atur `install locally` ke "No".\
  Biarkan pengaturan `host・port` apa adanya lalu tekan Enter. Masukkan nama pengguna dan kata sandi seperti yang telah ditentukan pada proses sebelumnya.

## Mengenai berkas .env

Script pemasangan membuat dua berkas.env yang dipergunakan untuk memutakhirkan Misskey.\
Berkas ini dipergunakan pada saat memutakhirkan.

### /root/.misskey.env

Diperlukan untuk mengingat pengguna yang menjalankan proses misskey

### /home/(pengguna_misskey)/.misskey.env

Dibuat untuk systemd yang dipertujukan mengingat direktori\
.

### /home/(pengguna_misskey)/.misskey-docker.env

Dibuat untuk Docker dengan tujuan menyimpan nomor kontainer beserta image yang sedang berjalan.\
Nomor kontainer akan diperbarui selama pemutakhiran.\
Image lama akan dihapus.

## Manajemen Mandiri

Setelah pemasangan, ada beberapa catatan yang cukup berguna pada saat ingin mengubah konfigurasi.

Ganti domain "example.com" dengan domain kamu sendiri.

### Direktori Misskey

Sumber kode akan diklon pada direktori `/home/pengguna/direktori`.\
(nilai default untuk pengguna dan direktori adalah misskey）

Kamu dapat menavigasi ke direktori Misskey dengan melakukan perintah berikut.

```sh
sudo -iu pengguna
cd direktori
```

Untuk kembali ke pengguna sebelumnya, jalankan perintah `exit`.

```sh
exit
```

### systemd

Nama proses dalam systemd adalah `example.com`.\
Sebagai contoh untuk memulai ulang proses, jalankan perintah berikut.

```sh
sudo systemctl restart example.com
```

Kamu dapat memeriksa logs dengan menggunakan `journalctl`.

```sh
journalctl -t example.com
```

Berkas konfigurasi systemd disimpan pada `/etc/systemd/system/example.com.service`.

### Docker

Docker menggunakan pengguna Misskey untuk dijalankan secara tanpa root.

Saat masuk ke pengguna Misskey menggunakan `sudo`, kamu perlu mengubah `XDG_RUNTIME_DIR` dan `DOCKER_HOST` terlebih dahulu.

```sh
sudo -iu pengguna
export XDG_RUNTIME_DIR=/run/user/$UID
export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/docker.sock

# Tampilkan daftar Proses
docker ps

# Build (Repositori: local/misskey:latest)
docker build -t local/misskey:latest ./misskey

# Menjalankan Docker
docker run -d -p 3000:3000 --add-host=docker_host:10.0.0.1 -v /home/misskey/misskey/files:/misskey/files -v "/home/misskey/misskey/.config/default.yml":/misskey/.config/default.yml:ro --restart unless-stopped -t "local/misskey:latest"

# Menampilkan log
docker logs --tail 50 -f ID Kontainer
```

Proses diatas dapat dilakukan dengan perintah satu baris berikut.

```sh
sudo -u pengguna XDG_RUNTIME_DIR=/run/user/$(id -u pengguna) DOCKER_HOST=unix:///run/user/$(id -u pengguna)/docker.sock docker ps
```

### nginx

Pengaturan situs pada nginx disimpan di `/etc/nginx/conf.d/example.com.conf`.

### Redis

Parameter `requirepass` dan `bind` diatur di `/etc/redis/misskey.conf`.

## Q. Error 502 tidak dapat diakses setelah melakukan pemutakhiran

Apabila proses migrasi sedang berlangsung, Docker tidak dapat memberikan izin akses langsung.\
Pastikan dan periksa apakah proses migrasi telah selesai.

Pada kasus menggunankan systemd, perintah `pnpm install` kemungkinan gagal.

Coba jalankan perintah berikut ini di direktori Misskey lalu jalankan pemutakhiran kembali.

```sh
pnpm run clean-all
```

Apabila kamu memeriksa log dengan `journalctl`, umumnya kamu akan menemukan pernyataan dalam log yang menampilkan `re2`.

## Q. Membangun instansi Misskey lebih dari 1 di peladen yang sama

Script ini tidak dapat melakukan pemasangan instansi Misskey lebih dari 1 pada peladen yang sama.\
Hal ini dikarenakan beberapa pengaturan nantinya akan ditimpa dan kamu akan mendapatkan banyak galat dan kesalahan dalam proses menjalankan script ini.

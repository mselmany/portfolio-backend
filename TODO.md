<!-- TODO - general -->

## GENEL YAPILACAKLAR

### api tokenları - alınan tokenları db ye kaydetme

- apilerin auth ile alınmış tokenlarını db ye kaydet ki her server restartta tekrar token oluşturmak zorunda kalma...

### timeline - tüm hesapları tek bir akışta gösterme

- Aktif hesaplar frontend için tarihe göre sıralı olarak tüm sosyal medya hesaplarını tek bir endpointten getirebilmeli.

### social media api'lerini on/off yapabilir hale getirilmeli

- .env dosyasında kullanıcı aktif etmek istemediği hesabı OFF/0 olarak belirlemeli, böylece server ayağa kalktığında gereksiz endpoint oluşturulmamalı
- Aktif olanlar frontend'deki filterlist'e bildirilmeli ki sadece aktif hesaplarla işlem yapılabilsin.

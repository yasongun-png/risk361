# risk361

isg uygulaması

## Hizmet Sözleşmeleri – Excel Raporu Uygulaması

Bu depo, ekteki **"ISG Hizmet Sözleşmeleri Ana Sayfa Raporu"** Excel dosyasıyla aynı
düzende/biçimde bir rapor üreten, tamamen tarayıcı içinde çalışan HTML tabanlı bir
uygulama içerir. Sunucu, derleme adımı veya internet bağlantısı gerektirmez.

### Çalıştırma

Herhangi bir statik dosya sunucusuyla açmanız yeterli (yerel dosya olarak açmak
tarayıcı güvenlik kısıtları nedeniyle önerilmez):

```bash
python3 -m http.server 8000
# tarayıcıda http://localhost:8000 adresini açın
```

### Özellikler

- **Sözleşme kayıtları ekleme / düzenleme / silme**: Firma bilgileri, İşveren
  Vekili, İSG Uzmanı, İşyeri Hekimi, DSP (Diğer Sağlık Personeli), personel
  sayısı / tehlike sınıfı ve PDF belge işaretleri.
- **Otomatik uygunluk değerlendirmesi**: Her rol için "Gerekli" ve "Atanan"
  dakika/ay değerlerine göre **Uygun / Yetersiz / Kapsam Dışı** durumu otomatik
  hesaplanır.
- **Tarayıcıda kalıcı saklama**: Girilen kayıtlar `localStorage` içinde saklanır,
  sayfa yenilendiğinde kaybolmaz.
- **"Excel İndir" butonu**: Ekrandaki tabloyu, kaynak rapordakiyle birebir aynı
  başlık, alt başlık, renk, hücre birleştirme, kenarlık ve yazı tipi (Segoe UI /
  Consolas) düzeninde bir `.xlsx` dosyası olarak indirir.

### Dosyalar

- `index.html` – Uygulama arayüzü (tablo + kayıt formu modalı).
- `styles.css` – Görsel tasarım.
- `app.js` – Veri yönetimi, uygunluk hesaplama mantığı ve ExcelJS ile `.xlsx`
  üretimi.
- `vendor/exceljs.min.js` – Excel dosyası oluşturmak için kullanılan
  [ExcelJS](https://github.com/exceljs/exceljs) kütüphanesi (MIT lisans, yerel
  olarak paketlenmiştir; internet bağlantısı gerektirmez).

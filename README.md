# DAÜ Mezuniyet Planlayıcı

DAÜ Öğrenci Portalı'ndaki güncel **Not Dökümü** tablosunu cihaz üzerinde okuyup DAÜ'nün yayımladığı güncel Yazılım Mühendisliği müfredatıyla karşılaştıran Chrome eklentisi.

Sürüm: **0.2.1**

## Özellikler

- Tamamlanan 240 AKTS ilerlemesi
- Zorunlu, alan seçmeli ve üniversite seçmeli sayaçları
- Ön koşulları tamamlanmış ders önerileri
- Ön koşulu eksik, devam eden ve başarısız görünen dersler
- Tekrarlanan ve bütünleme sonucu bulunan derslerde portalın `Summary` sütununu esas alma
- Yeni akademik dönem ve bütünleme sütunlarını dinamik algılama
- Portal ders kodu güncel katalogla uyuşmadığında müfredat farkı uyarısı
- Sunucusuz çalışma; notlar ve oturum bilgileri dışarı gönderilmez

## Kurulum

1. Chrome'da `chrome://extensions` adresini aç.
2. Sağ üstten **Geliştirici modu**nu etkinleştir.
3. **Paketlenmemiş öğe yükle** düğmesine bas.
4. Bu klasörü seç.
5. DAÜ Öğrenci Portalı'nda **Akademik → Not Dökümü** sayfasını yenile.

Analiz paneli not tablosunun hemen üstünde görünür.

## Desteklenen sayfa

`https://student.emu.edu.tr/Academic/RecordSheet*`

## Test

```sh
node test/engine.test.cjs
```

## Bilinen sınırlar

- Bu sürüm Yazılım Mühendisliği için DAÜ'nün güncel olarak yayımladığı 2025-26 kataloğunu içerir ve 19 Eylül 2026 tarihinde doğrulanmıştır.
- Hesaplama `Summary` sütunundaki harf notuna dayanır. DAÜ'nün resmî mezuniyet kararı ve akademik danışman kontrolü her zaman önceliklidir.
- Müfredat değişiklikleri ayrı sürümler olarak eklenmelidir; farklı giriş yılları aynı ders listesine zorlanmamalıdır.
- 2025-26 katalog metni ile canlı program sayfası arasında farklılık olduğunda, 240 AKTS dönem toplamıyla tutarlı olan güncel program sayfası esas alınmıştır.

## Gizlilik

Eklenti yalnızca Not Dökümü sayfasında çalışır. Şifreleri, çerezleri veya oturum anahtarlarını okumaz. Okunan ders verileri ağ üzerinden gönderilmez ve bu sürümde kalıcı olarak saklanmaz.

## Kaynaklar

- [DAÜ güncel Yazılım Mühendisliği ders planı](https://www.emu.edu.tr/tr/programlar/yazilim-muhendisligi-lisans-programi/896?tab=curriculum)
- [DAÜ 2025-26 Bölüm Kataloğu](https://cmpe.emu.edu.tr/Documents/main/CMPE_CMSE_AI_Catalogue_2025_2026_zb-2026-02-24.pdf)
- [DAÜ Mezuniyet Koşulları](https://registrar.emu.edu.tr/en/students/graduation)

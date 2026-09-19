(function (root, factory) {
  const curriculum = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = curriculum;
  root.EMU_CURRICULUM_CURRENT = curriculum;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const course = (ref, codes, name, semester, ects, prerequisites = [], type = "required") => ({
    ref: String(ref),
    codes: Array.isArray(codes) ? codes : [codes],
    name,
    semester,
    ects,
    prerequisites,
    type
  });

  return {
    id: "cmse-current",
    program: "Yazılım Mühendisliği",
    academicYear: "Güncel",
    catalogueYear: "2025-26",
    lastVerified: "2026-09-19",
    totalEcts: 240,
    source: "https://cmpe.emu.edu.tr/Documents/main/CMPE_CMSE_AI_Catalogue_2025_2026_zb-2026-02-24.pdf",
    courses: [
      course(29711, "CMSE107", "Yazılım Mühendisliğinin Temelleri", 1, 10),
      course(29712, "MATH163", "Ayrık Matematik", 1, 5),
      course(29713, ["ENGL191", "ENGL181"], "İngilizce I", 1, 4),
      course(29714, "MATH151", "Analiz I", 1, 6),
      course(29715, "PHYS101", "Fizik I", 1, 6),

      course(29721, "CMSE100", "Yazılım Mühendisliğine Giriş", 2, 1),
      course(29722, "CMSE112", "Programlama Esasları", 2, 10, ["CMSE107"]),
      course(29723, ["ENGL192", "ENGL182"], "İngilizce II", 2, 4, ["ENGL191|ENGL181"]),
      course(29724, "MATH152", "Analiz II", 2, 6, ["MATH151"]),
      course(29725, "PHYS102", "Fizik II", 2, 6),
      course(29726, ["HIST280", "TUSL181"], "Tarih / İkinci Dil Olarak Türkçe", 2, 2),

      course(29731, "CMSE201", "Yazılım Mühendisliğinin Temelleri", 3, 8, ["CMSE107"]),
      course(29732, "CMSE211", "Nesneye Dayalı Programlama", 3, 7, ["CMSE112"]),
      course(29733, "CMSE231", "Veri Yapıları", 3, 7, ["CMSE112"]),
      course(29734, "MATH241", "Doğrusal Cebir ve Diferansiyel Denklemler", 3, 6, ["MATH151"]),
      course(29735, "UE01", "Üniversite Seçmelisi I - Temel Bilim", 3, 4, [], "university-elective"),

      course(29741, "CMSE222", "Bilgisayar Organizasyonuna Giriş", 4, 8, ["MATH163"]),
      course(29742, "CMSE242", "İşletim Sistemleri", 4, 7, ["CMSE112"]),
      course(29743, "MATH373", "Mühendisler için Sayısal Analiz", 4, 5, ["MATH241"]),
      course(29744, "ENGL201", "İletişim Becerileri", 4, 4, ["ENGL192|ENGL182"]),
      course(29745, "UE02", "Üniversite Seçmelisi II", 4, 4, [], "university-elective"),

      course(29751, "CMSE321", "Yazılım Gereksinimleri Analizi", 5, 7, ["CMSE201"]),
      course(29752, "CMSE351", "Veritabanı Yönetim Sistemleri", 5, 7, ["CMSE231"]),
      course(29753, "CMSE371", "Algoritma Analizi", 5, 7, ["CMSE231"]),
      course(29754, "UE03", "Üniversite Seçmelisi III", 5, 4, [], "university-elective"),
      course(29755, "MATH322", "Olasılık ve İstatistiksel Yöntemler", 5, 5, ["MATH151"]),

      course(29761, "CMSE322", "Yazılım Tasarımı", 6, 6, ["CMSE321"]),
      course(29762, "CMSE318", "Programlama Dillerinin İlkeleri", 6, 7, ["CMSE211"]),
      course(29763, "CMSE344", "Bilgisayar Ağları ve İletişim", 6, 7, ["CMSE242", "MATH322"]),
      course(29764, "IENG355", "Mühendislik Etiği", 6, 4),
      course(29765, "CMSE326", "Yazılım Kalite Güvencesi ve Testi", 6, 6, ["CMSE201"]),

      course(29771, "CMSE400", "Yaz Stajı", 7, 1),
      course(29772, "CMSE405", "Mezuniyet Projesi I", 7, 1),
      course(29773, "CMSE471", "Özdevinim Kuramı", 7, 6, ["MATH163"]),
      course(29774, "CMSE473", "Yazılım Süreci ve Yönetimi", 7, 6, ["CMSE321", "MATH322"]),
      course(29775, "CMSE423", "Gömülü Sistem Tasarımı", 7, 6, ["CMSE222"]),
      course(29776, "AE01", "Alan Seçmelisi I", 7, 6, [], "area-elective"),
      course(29777, "AE02", "Alan Seçmelisi II", 7, 6, [], "area-elective"),

      course(29781, "AE03", "Alan Seçmelisi III", 8, 6, [], "area-elective"),
      course(29782, "AE04", "Alan Seçmelisi IV", 8, 6, [], "area-elective"),
      course(29783, "CMSE406", "Mezuniyet Projesi II", 8, 6, ["CMSE405"]),
      course(29784, "UE04", "Üniversite Seçmelisi IV", 8, 4, [], "university-elective"),
      course(29785, "CMSE456", "Bilgisayar Sistemleri ve Ağ Güvenliği", 8, 6, ["CMSE344"])
    ]
  };
});

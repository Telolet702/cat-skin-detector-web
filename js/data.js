const diseasesDB = {
  'scabies': { 
      title: 'Scabies (Kudis)', 
      icon: 'ti-bug', color: '#FCEBEB', iconColor: '#A32D2D', 
      imgUrl: 'https://asset.kompas.com/crops/LaeRdn_8altE05AcBv0S0qMOYH8=/0x336:4032x3024/750x500/data/photo/2022/03/18/6233fb293f22d.jpg', // Ganti dengan foto scabies asli jika ada
      articleLink: 'https://www.halodoc.com/artikel/scabies-pada-kucing-ini-penyebab-gejala-dan-cara-mengatasinya?srsltid=AfmBOormtaKnrMiq7ga_g1DY_DRwu6i6BV8WLVhgTYlerumYAibkFYPL',
      desc: 'Infeksi parasit akibat tungau yang sangat menular, menyebabkan gatal ekstrem dan kerak kulit.',
      cause: 'Infeksi tungau <i>Sarcoptes scabiei</i> yang bersarang dan bertelur di bawah lapisan kulit.',
      symptoms: '<ul class="disease-list"><li>Gatal hebat (kucing terus menggaruk)</li><li>Kerak tebal terutama di ujung telinga dan wajah</li><li>Bulu rontok parah (Alopecia) pada area yang terinfeksi</li></ul>',
      treatment: '<ul class="disease-list"><li>Pemberian obat anti-parasit (tetes/suntik) oleh dokter hewan</li><li>Isolasi ketat dari hewan peliharaan lain</li><li>Mandi menggunakan sampo khusus bersulfur</li></ul>',
      prevention: 'Jaga kebersihan lingkungan kandang, hindari kontak dengan kucing/hewan liar, dan cek kesehatan rutin.'
  },
  'ringworms': { 
      title: 'Ringworm (Kurap)', 
      icon: 'ti-circles', color: '#FFF3E0', iconColor: '#E65100', 
      imgUrl: 'https://preview.redd.it/found-this-under-my-cats-ear-tonight-it-isnt-a-scab-afaik-v0-l3ow8l1f4w711.jpg?width=1080&crop=smart&auto=webp&s=83da2fcfd317511691b8754362e5baaa4a9c4611', // Ganti dengan foto ringworm
      articleLink: 'https://www.halodoc.com/artikel/jamur-kucing-seperti-apa-sih-waspadai-cirinya?srsltid=AfmBOoqOzYbrvsbs0l_QSRx9hStg5WQ4YPyGXKdqqio95RhRyquehxPm',
      desc: 'Infeksi jamur menular yang membentuk pola bercak melingkar botak pada kulit kucing (bisa menular ke manusia).',
      cause: 'Infeksi jamur dermatofita (tersering <i>Microsporum canis</i>) yang memakan keratin kulit dan bulu.',
      symptoms: '<ul class="disease-list"><li>Bercak melingkar pitak (tanpa bulu) kemerahan</li><li>Kulit bersisik dan kasar</li><li>Biasanya muncul di area kepala, telinga, dan kaki depan</li></ul>',
      treatment: '<ul class="disease-list"><li>Salep/Krim antijamur topikal</li><li>Obat oral antijamur (selama 4-8 minggu)</li><li>Desinfeksi total seluruh ruangan dan mainan kucing</li></ul>',
      prevention: 'Cuci tangan dengan sabun setelah memegang kucing, pastikan ruangan kucing memiliki sirkulasi udara yang kering.'
  },
  'flea_allergy': { 
      title: 'Flea Allergy (Alergi Kutu)', 
      icon: 'ti-activity', color: '#E8F5E9', iconColor: '#1B5E20', 
      imgUrl: 'https://cat-world.com/wp-content/uploads/2018/07/flea-allergy-dermatitis-2.jpg', // Ganti dengan foto flea allergy
      articleLink: 'https://www.halodoc.com/artikel/kucing-garuk-garuk-terus-kenali-dan-atasi-penyebabnya?srsltid=AfmBOoqk1sOn5h3WPHoxZ0Tw-sGHvRMHi9D_xk78cziui0-sk3V-gvzQ',
      desc: 'Reaksi alergi parah terhadap air liur kutu, di mana satu gigitan saja bisa memicu gatal seluruh tubuh.',
      cause: 'Sistem imun yang hipersensitif terhadap protein dalam air liur kutu <i>Ctenocephalides felis</i>.',
      symptoms: '<ul class="disease-list"><li>Menggigit-gigit atau menjilat tubuh secara obsesif</li><li>Bintik/benjolan merah kecil (Papula)</li><li>Luka terbuka dan kerontokan bulu di pangkal ekor atau punggung</li></ul>',
      treatment: '<ul class="disease-list"><li>Pembasmian kutu total (Spot-on, pil, atau kalung anti-kutu)</li><li>Obat antihistamin / kortikosteroid untuk meredakan gatal</li><li>Penyembuhan luka sekunder dengan antibiotik (jika infeksi)</li></ul>',
      prevention: 'Gunakan obat pencegah kutu bulanan secara rutin dan vakum karpet/tempat tidur kucing secara berkala.'
  },
  'healthy': { 
      title: 'Kulit Sehat', 
      icon: 'ti-heart', color: '#E8F5E9', iconColor: '#1B5E20', 
      imgUrl: 'https://scontent.fcgk53-1.fna.fbcdn.net/v/t39.30808-6/344379049_562765092636098_1921602636214604117_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFnccS8u0_aRp7c7uZW5Lx07OuTcGmR9c_s65NwaZH1z0eXPKpeVZaPO4_BJG532QWToS8-R_kTvWhH7MquUiuB&_nc_ohc=PiUQfTeJMi0Q7kNvwHhmsZk&_nc_oc=Adqsy1JWq58LTrxExxzSZTAoOFNJ2nLlLpW6j-iM-1TS6nQiXlH7K7aH4JEs-z-3QJo&_nc_zt=23&_nc_ht=scontent.fcgk53-1.fna&_nc_gid=b-tIXivcuTRI2j_bINtUMw&_nc_ss=7b2a8&oh=00_Af9E2yKpyRsOMdkg3wH9QnAhpx9TqWVMUNplckd0PYgfbg&oe=6A24AA77', // Foto kucing sehat
      articleLink: 'https://www.halodoc.com/artikel/jaga-kulit-kucing-sehat-bebas-gatal-dan-bulu-tetap-indah?srsltid=AfmBOor7n9Q6VlxL4XWiomzb-TtlaTVs2N5o6smOkjRFD-wkzFYixCS6',
      desc: 'Kondisi kulit dan bulu kucing dalam keadaan sangat baik, bersih, dan terawat.',
      cause: 'Perawatan harian yang baik, nutrisi yang seimbang, dan kebersihan yang terjaga.',
      symptoms: '<ul class="disease-list"><li>Bulu mengkilap, lebat, dan halus saat dielus</li><li>Kulit bersih tanpa ketombe, kerak, atau kemerahan</li><li>Kucing aktif dan tidak sering menggaruk</li></ul>',
      treatment: '<b>Tidak ada tindakan medis yang diperlukan.</b> Kucing dalam kondisi prima!',
      prevention: 'Lanjutkan asupan makanan bernutrisi tinggi, <i>grooming</i> (sisir bulu) rutin 2 hari sekali, dan berikan vaksinasi tahunan.'
  }
};

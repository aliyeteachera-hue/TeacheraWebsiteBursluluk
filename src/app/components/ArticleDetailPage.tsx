import { useEffect, useMemo, useRef } from 'react';
import { motion, useScroll, useSpring, useInView } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import mentalTranslationCollapseImage from '../../assets/blog/mental-translation-collapse.webp';
import targetLanguageThinkingImage from '../../assets/blog/target-language-thinking-techniques.webp';
import grammarTranslationFossilizationImage from '../../assets/blog/gramer-ceviri-fosillesme-dongusu.webp';

const DEFAULT_OG_IMAGE = 'https://teachera.com.tr/favicon-32x32.png';

/* ═══════════════════════════════════════════════════════════════════════
   ARTICLE DATABASE
   ═══════════════════════════════════════════════════════════════════════ */

interface ArticleSection {
  number: string;
  title: string;
  content: string[];
  pullQuote?: string;
  image?: string;
  imageCaption?: string;
}

interface FullArticle {
  slug: string;
  category: string;
  categoryLabel: string;
  title: string;
  subtitle: string;
  epigraph: string;
  heroImage: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  sections: ArticleSection[];
  conclusion: string[];
  closingLine: string;
  relatedSlugs: string[];
  tags: string[];
  ctaTitle: string;
  ctaSubtitle: string;
  metaDescription: string;
}

const ARTICLES: Record<string, FullArticle> = {
  'ceviri-hastaligi': {
    slug: 'ceviri-hastaligi',
    category: 'genel',
    categoryLabel: 'DİL ÖĞRENİMİ',
    title: 'Zihinsel Çeviri Tuzağı:\nBiliyoruz Ama\nKonuşamıyoruz',
    subtitle: 'Dil öğrenme yolculuğunda masum görünen zihinsel çeviri alışkanlığı, konuşma akıcılığını sabote eden en büyük bilişsel bariyere dönüşebilir.',
    epigraph: 'Akıcılık, doğru kelimeyi bulmaktan önce düşünceyi hedef dilde akıta bilmektir.',
    heroImage: mentalTranslationCollapseImage,
    author: 'Teachera Uzman Ekibi',
    authorRole: 'Dil Eğitimi Araştırma Birimi',
    date: '27 Şubat 2026',
    readTime: '8 dk',
    sections: [
      {
        number: '01',
        title: 'Masum Başlangıç, Kronik Sorun',
        content: [
          'Dil öğrenme sürecinde hepimizin yaptığı, ilk başta masum görünen ama zamanla en büyük düşmanımıza dönüşen bir hata vardır: zihinsel çeviri. Bu alışkanlık, Türkiye\'deki dil öğrenme tecrübesinin kronik klişesi olan "biliyoruz ama konuşamıyoruz" durumunun en önemli nedenlerinden biridir.',
          'Konuşma anında düşünceyi önce anadilde kurup sonra hedef dile aktarmaya çalışmak, beyninizde bir trafik sıkışıklığı yaratır. Siz daha cümleyi hazırlarken konuşma akışı çoktan kaçmış olur.',
          'Sorun kelime veya kural bilmemek değildir. Sorun, bilginin gerçek zamanlı iletişimde kullanılamaması ve çeviri basamağının akıcılığı sürekli kesmesidir.',
        ],
        pullQuote: 'Zihinsel çeviri, bilgiyi konuşmaya dönüştüren köprünün tam ortasına kurulan görünmez bir bariyerdir.',
      },
      {
        number: '02',
        title: 'Beyninizi Yormayın: Çevirinin Nörolojik Maliyeti',
        content: [
          'Zihinsel çeviri sırasında beyin aynı anda iki işi yapar: önce L1\'de düşünür, sonra L2\'ye aktarır. Bu çift işlem, konuşma anında bilişsel yükü gereksiz biçimde artırır.',
          'Aşırı Yorgunluk (Brain Fatigue): Çeviri odaklı işlemleme, beynin enerji kaynaklarını hızlı tüketir. Sonuç; kısa sürede zihinsel yorgunluk, odak kaybı ve konuşma isteğinde düşüştür.',
          'Milisaniyelik Gecikmeler: Her kelimede L1-L2 eşlemesi için harcanan çok küçük gecikmeler, cümle boyunca birikerek "ölümcül sessizlikler" üretir. Akıcılık hissi tam da bu noktada dağılır.',
        ],
        image: 'https://images.unsplash.com/photo-1649937801620-d31db7fb3ab3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        imageCaption: 'Konuşma anındaki bilişsel yük, çeviri basamağı eklendiğinde katlanarak artar.',
      },
      {
        number: '03',
        title: 'Dilin Ruhunu Öldürmek: Doğallığı Neden Kaybediyoruz?',
        content: [
          'Dil sadece kelime listesi değildir; doğal eşdizimler, kalıplar ve kültürel kodlarla anlam kazanır. Zihinsel çeviri ise bu yapıları bozarak "doğru ama doğal olmayan" cümleler üretir.',
          'Yanlış Eşdizimler (Collocation Errors): Kelimeyi sözlük karşılığıyla taşımak, hedef dildeki gerçek kullanım kalıplarını kaçırmanıza neden olur. Bu da "anlaşılan ama yapay" konuşma üretir.',
          'Fosilleşme (Fossilization): L1 kurallarını sürekli L2\'ye kopyalamak, hataların kalıcı alışkanlığa dönüşmesine yol açar. Bir süre sonra bu hataları düzeltmek çok daha maliyetli hale gelir.',
        ],
        pullQuote: 'Doğru kelimeyi bilmek yetmez; o kelimenin hedef dilde kimlerle "yan yana yürüdüğünü" de bilmek gerekir.',
      },
      {
        number: '04',
        title: 'Psikolojik Yan Etki: Sahte Güvenlikten Kronik Kaygıya',
        content: [
          'Zihinsel çeviri, kısa vadede güvenli bir dayanak gibi görünür. Çünkü anadile tutunmak, belirsizlik anında öğrenciyi geçici olarak rahatlatır.',
          'Kaygı Paradoksu: Gerçek hayatta hızlı cevap gerektiğinde bu destek çalışmaz. "Çevirmeden konuşamam" inancı, iletişim anında kaygıyı katlayarak kronikleştirir.',
          'İletişim İsteksizliği (WTC): Sürekli duran, yorulan ve kendini yetersiz hisseden öğrenci zamanla konuşmaktan kaçınır. Dil, iletişim aracı olmaktan çıkıp çözülmesi gereken bir probleme dönüşür.',
        ],
        image: 'https://images.unsplash.com/photo-1626447269096-f8665509589c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        imageCaption: 'Akıcılık kaybı yalnızca teknik değil, motivasyon ve kaygı yönetimi problemidir.',
      },
      {
        number: '05',
        title: 'Kurtulma Rehberi: Hedef Dilde Düşünme Stratejileri',
        content: [
          '1) İfade Kalıpları (Lexical Chunks): Tek kelime ezberi yerine "From my perspective..." gibi bloklar öğrenin. Kalıplar, çeviri basamağını kısaltır ve otomatik üretimi güçlendirir.',
          '2) Circumlocution (Etrafından Dolaşma): Bilinmeyen kelimede L1\'e dönmek yerine tarif edin. "Matkap" akla gelmiyorsa "a tool you use to make holes in the wall" diyebilmek akışı korur.',
          '3) Meaningful Fillers (Anlamlı Dolgular): "Iıı..." yerine "Well, let me think..." gibi profesyonel köprü ifadeleri kullanın. Bu, düşünmek için süre kazandırırken akıcılığı da korur.',
          '4) Massive Input (Yoğun ve Hızlı Girdi): Biraz hızlı içerik dinleyerek beyni doğrudan anlamlandırmaya zorlayın. Çeviriye zaman kalmadığında kavramsal aracılık gelişir.',
          '5) Günlük Sınırlandırılmış Çıktı: Her gün 5-10 dakika basit eylemleri hedef dilde seslendirin. Küçük ama düzenli tekrar, yeni nöral yolların kalıcılaşmasını sağlar.',
        ],
        pullQuote: 'Akıcı konuşma, hatasızlık değil; tıkanma anını hedef dilde yönetebilme becerisidir.',
      },
    ],
    conclusion: [
      'Zihinsel çeviri alışkanlığından çıkış, pasif bir "bırakma" değil aktif bir "yeniden inşa" sürecidir. Amaç, L1 arayüzünü devreden çıkarıp düşünceden hedef dile doğrudan geçiş yapabilmektir.',
      '"Biliyoruz ama konuşamıyoruz" kader değildir. Doğru girdi, doğru çıktı ve doğru strateji ile beyin yeni konuşma yollarını üretir.',
    ],
    closingLine: 'Zihinsel çeviriyi bıraktığınız gün, konuşma akıcılığınızın gerçekten başladığı gündür.',
    relatedSlugs: ['konusma-akiciliginin-fiziksel-ve-isitsel-cokusu'],
    tags: ['Zihinsel Çeviri', 'Konuşma Akıcılığı', 'Brain Fatigue', 'WTC', 'Dil Psikolojisi', 'Teachera Academy'],
    ctaTitle: 'Zihinsel çeviri tuzağından çıkış planını başlatalım',
    ctaSubtitle: 'Konuşma odaklı yaklaşım ve kişiselleştirilmiş pratikle hedef dilde düşünmeyi birlikte inşa edelim.',
    metaDescription: 'Zihinsel çeviri konuşma akıcılığını nasıl sabote eder? Nörobilişsel etkiler, psikolojik sonuçlar ve hedef dilde düşünme stratejileri.',
  },
  'konusma-akiciliginin-fiziksel-ve-isitsel-cokusu': {
    slug: 'konusma-akiciliginin-fiziksel-ve-isitsel-cokusu',
    category: 'genel',
    categoryLabel: 'DİL ÖĞRENİMİ',
    title: 'Konuşma Akıcılığının\nFiziksel ve İşitsel\nÇöküşü',
    subtitle: 'Zihinsel çeviri, bilişsel yükü kritik eşiğin üzerine taşıyarak sadece kelimeleri değil, sesi, ritmi ve beden dilini de kilitleyen bir iletişim çöküşü üretir.',
    epigraph: 'Akıcılık önce zihinde kırılır, sonra seste ve bedende görünür hale gelir.',
    heroImage: mentalTranslationCollapseImage,
    author: 'Teachera Akademik İçerik Ekibi',
    authorRole: 'Psikodilbilim ve Öğrenme Bilimleri',
    date: '28 Şubat 2026',
    readTime: '12 dk',
    sections: [
      {
        number: '01',
        title: 'Bilişsel Yükün Dışavurumu: Akıcılık Neden Çöker?',
        content: [
          'Zihinsel çeviri sırasında çalışan bellek aynı anda dört işi yapmaya zorlanır: anadilde taslak kurma, L2 karşılıklarını arama, dilbilgisel denetim ve artikülasyon planlama. Bilişsel Yük Teorisi açısından bu, sistemin doğal kapasitesini aşan bir yüklenmedir.',
          'Bu nedenle konuşmadaki akıcılık bozuklukları rastlantı değildir; doğrudan bilişsel darboğazın dışavurumudur. Anadilde veya doğrudan L2 üretimde düşük olan duraksama oranı, çeviri baskısı altında dramatik biçimde yükselir.',
          'Akıcılık düşüşü "az pratik" problemi gibi görünse de, özünde işlemleme mimarisinin yanlış kurulması problemidir: düşünce ile ifade arasına zorunlu bir çeviri katmanı yerleştirmek.',
        ],
        pullQuote: 'Çeviri alışkanlığı, konuşmayı bilgi testine değil gerçek zamanlı bir işlemleme krizine dönüştürür.',
      },
      {
        number: '02',
        title: 'Üç Şemsiye Fenomen: Disfluency Nasıl Duyulur?',
        content: [
          'Zihinsel çeviri baskısı altındaki konuşmada akıcılık bozuklukları üç ana fenomen altında toplanır.',
          '1) Sessizlikler (Unfilled Pauses): Kelime geri çağırma ve cümle kurulumunda sistem aniden durur. Dinleyici bunu çoğu zaman güvensizlik veya konuya hakim olmama sinyali olarak algılar.',
          '2) Dolgu Sesleri (Filled Pauses): "Iıı", "öhm", "um", "uh" gibi anlamsız sesler, konuşma sırasını tutmak için kullanılan zaman kazanma araçlarına dönüşür; aşırı kullanım dinleyiciyi yorar.',
          '3) Ses Uzatmaları (Hesitation Lengthening): Kelime sonlarının istemsiz uzatılması, artikülasyonun durup fonasyonun sürmesiyle ortaya çıkar; bilişsel yük yükseldikçe belirginleşir.',
        ],
        pullQuote: 'Konuşmadaki sessizlik, dolgu sesi ve uzatma; çoğu zaman yetersizlik değil, aşırı yüklenmiş bir işlemleme sisteminin yardım çağrısıdır.',
      },
      {
        number: '03',
        title: 'Jestsel Duraksamalar: Beden de Aynı Anda Kilitlenir',
        content: [
          'Zihinsel çeviri yalnızca sözel akışı bozmaz; bedensel iletişimi de eşzamanlı olarak dondurur. Sözel duraksama anlarında jestlerin, el hareketlerinin ve mimiklerin bir pozisyonda asılı kalması sık görülür.',
          'Bu "gestural hold" durumu, bilişsel tıkanıklığın fiziksel yansımasıdır. Konuşma akışının kırıldığı noktada beden de doğal ritmini kaybeder ve iletişimin bütünsel etkisi düşer.',
          'Sonuç olarak dinleyici sadece ne söylediğinizi değil, nasıl söylediğinizi de zor işler. Zihinsel çeviri, mesajın içeriği kadar iletim biçimini de zayıflatır.',
        ],
        image: mentalTranslationCollapseImage,
        imageCaption: 'Zihinsel çeviri baskısı, ses akışı ve beden ritminde eşzamanlı kırılmalar üretir.',
      },
      {
        number: '04',
        title: 'Dilbilimsel Tahribat: Ara Dil Felci ve Fosilleşme',
        content: [
          'Ara Dil (Interlanguage) normalde geçirgen ve gelişen bir sistemdir. Ancak L2 üretimi sürekli zihinsel çeviri ile yapıldığında bu sistem donarak fosilleşmeye girer; hatalar kalıcılaşır.',
          'Negatif Aktarım (Negative Transfer) bu süreci hızlandırır: öğrenici, anadilin sözdizimini ve kelime örgüsünü hedef dile şablon gibi taşır. Sıfat-isim sıralaması, edat seçimi ve cümle dizilimleri bu yüzden sistematik biçimde bozulur.',
          'En kritik risk şudur: tekrar eden çeviri kaynaklı yapılar, örtük alışkanlığa dönüşür. Öğrenci hata yaptığını fark etmese bile aynı bozuk kalıpları otomatik olarak üretmeye devam eder.',
        ],
        pullQuote: 'Fosilleşme, yanlış bilmekten çok yanlışı otomatikleştirmektir.',
      },
      {
        number: '05',
        title: 'Eşdizimlilik Kaybı: Doğallık Neden Dağılır?',
        content: [
          'Kelimesi kelimesine çeviri, dilin estetik ve pragmatik dokusunu parçalar. Çünkü her dilde kelimeler yalnızca anlam taşımaz; hangi kelimeyle birlikte kullanılacağını da belirler.',
          '1) Birisine söz vermek -> Give a promise -> Make/Set a promise: Fiil-isim uyumsuzluğu oluşur; sözlük karşılığı doğru görünse bile ifade doğal değildir.',
          '2) Yüksek dağ -> Tall/Long mountain -> High mountain: Sıfat seçimi anadile göre taşınınca hedef dilde yapay bir kullanım ortaya çıkar.',
          '3) Ağır fakirlik -> Hard/Strong poverty -> Abject poverty: Mecaz yoğunluğu hedef dilin yerleşik eşdizimi yerine sözlük düzeyinde kalır.',
          '4) Beyin göçü -> Brain migration -> Brain drain: Sabit bir terimin mekanik çevrimi, ifadenin profesyonel bağlam değerini düşürür.',
          '5) Topu ateşlemek -> Hit the cannon -> Fire the cannon: Çok anlamlı fiillerde yanlış seçim, cümlenin anlamını ve tonunu bozabilir.',
        ],
        pullQuote: 'Doğal konuşma, doğru kelimeleri değil doğru kelime ortaklıklarını kurabilme becerisidir.',
      },
    ],
    conclusion: [
      'Zihinsel çevirinin uzun vadeli etkisi yalnızca yavaş konuşma değildir; ses akışının bozulması, beden dilinin kilitlenmesi ve dilsel doğallığın fosilleşmesiyle çok katmanlı bir iletişim kaybıdır.',
      'Çözüm, çeviri refleksini "yasaklamak" değil; hedef dilde doğrudan kavramsallaştırmayı sistemli biçimde inşa etmektir. Akıcılık, bu yeniden yapılanmanın doğal sonucudur.',
    ],
    closingLine: 'Akıcılığın gerçek düşmanı hata yapmak değil, her cümleyi zihninizde tercüme etmek zorunda kalmaktır.',
    relatedSlugs: ['ceviri-hastaligi'],
    tags: ['Disfluency', 'Cognitive Load', 'Fossilization', 'Collocation', 'Interlanguage', 'Zihinsel Çeviri'],
    ctaTitle: 'Konuşma akışını yeniden kurmak için birlikte başlayalım',
    ctaSubtitle: 'Bilişsel yükü azaltan, doğrudan hedef dil üretimini güçlendiren çalışma planını seviyene göre tasarlayalım.',
    metaDescription: 'Zihinsel çeviri konuşma akıcılığını nasıl fiziksel ve işitsel olarak çökertir? Disfluency, fosilleşme ve eşdizimlilik kaybı üzerinden detaylı analiz.',
  },
  'hedef-dilde-dusunmeyi-saglayacak-teknikler': {
    slug: 'hedef-dilde-dusunmeyi-saglayacak-teknikler',
    category: 'genel',
    categoryLabel: 'DİL ÖĞRENİMİ',
    title: 'Hedef Dilde Düşünmeyi\nSağlayacak\nTeknikler',
    subtitle: 'Hedef dilde düşünmek sihir değil; kısıtlanmış girdi-çıktı stratejileriyle beynin sinaptik ağlarını yeniden şekillendiren planlı bir süreçtir.',
    epigraph: 'Akıcılık, çeviri refleksi azaldıkça değil; doğrudan hedef dil üretimi otomatikleştikçe başlar.',
    heroImage: targetLanguageThinkingImage,
    author: 'Teachera Akademik İçerik Ekibi',
    authorRole: 'Uygulamalı Psikodilbilim',
    date: '28 Şubat 2026',
    readTime: '10 dk',
    sections: [
      {
        number: '01',
        title: 'Nöroplastisite Perspektifi: Hedef Dilde Düşünme Nasıl Oluşur?',
        content: [
          'Hedef dilde düşünme, uykudan uyanınca aniden ortaya çıkan bir yetenek değildir; tekrar eden doğru görevlerle beynin bağlantı haritasını yeniden kurma sürecidir.',
          'Çeviri refleksi güçlü olduğunda beyin, L1 basamağını güvenli yol olarak kullanır. Bu da hızlı iletişimde işlemleme gecikmesine ve akıcılık kaybına neden olur.',
          'Amaç, L1 üzerinden dolaylı üretimi azaltıp kavramdan hedef dile doğrudan geçişi güçlendirmektir. Bu geçiş ancak düzenli, yapılandırılmış ve ölçülebilir pratikle kalıcı hale gelir.',
        ],
        pullQuote: 'Hedef dilde düşünme bir karar değil, tekrar edilen doğru işlemleme alışkanlıklarının nörobiyolojik sonucudur.',
      },
      {
        number: '02',
        title: 'Lexical Chunks ve Direct Association',
        content: [
          'İzole kelime ezberi, çeviri alışkanlığının ana yakıtıdır. Bunun yerine dil birimleri bloklar halinde öğrenilmelidir: "From my perspective..." gibi açılış kalıpları tek bir kavramsal birim olarak otomatikleştirilmelidir.',
          'Doğrudan ilişkilendirme stratejisinde yeni kelime, anadil karşılığıyla değil görsel/nesne/his ile eşleştirilir. Böylece beyin L1 köprüsünü atlayarak kavram-L2 hattını güçlendirir.',
          'Evde etiketleme, kelimeyi nesneyle eşzamanlı görme ve tek dilli sözlük kullanımı; bu doğrudan hattı destekleyen düşük maliyetli ama yüksek etkili araçlardır.',
        ],
        image: targetLanguageThinkingImage,
        imageCaption: 'Kavram ile hedef dil arasında doğrudan bağ kurmak, çeviri basamağını zayıflatır.',
      },
      {
        number: '03',
        title: 'Massive Input ve Continuous Learning',
        content: [
          'Beynin çeviri yapabilmesi için zamana ihtiyacı vardır. Bu yüzden kontrollü biçimde hızlı ve yoğun işitsel girdi, çeviri için ayrılan zamanı daraltır.',
          'Öğrenci, "Bu hızda çeviremiyorum; doğrudan anlamam lazım" eşiğine geldiğinde kavramsal aracılık devreye girer. Bu, hedef dilde düşünmenin kritik kırılma noktasıdır.',
          'Süreklilik burada belirleyicidir: yoğun girdi dönemsel değil, küçük dozlarla her gün uygulanmalıdır. Aksi halde beyin eski çeviri rutinine hızla geri döner.',
        ],
        pullQuote: 'Yeterince hızlı ve anlamlı girdi, beyni çeviriden çok doğrudan kavrayışa zorlar.',
      },
      {
        number: '04',
        title: 'Tıkanma Anı Yönetimi: Circumlocution ve Shadowing',
        content: [
          'Kelime unutulduğunda anadile dönmek yerine hedef dilde tarif etmek (circumlocution), akışı koruyan en kritik iletişim becerisidir.',
          'Örnek: "matkap" akla gelmediğinde konuşmayı durdurmak yerine "It is a tool you use to make holes in the wall" diyebilmek, çeviri refleksini kırar. Gerekirse "Let me rephrase that..." gibi onarım kalıplarıyla akış onarılır.',
          'Shadowing tekniği ise duyulan cümleyi eşzamanlı tekrar ederek bilişsel kapasiteyi tamamen dinleme-artikülasyon döngüsüne ayırır; çeviriye boşluk bırakmaz ve doğal ritmi güçlendirir.',
        ],
        pullQuote: 'Akıcılık, kelimeyi hiç unutmamak değil; unuttuğunuz anda konuşmayı hedef dilde sürdürebilmektir.',
      },
      {
        number: '05',
        title: 'Günlük Sınırlandırılmış Çıktı Planı',
        content: [
          '1) 5-10 Dakika Mikro Üretim: Her gün kısa oturumlarda yalnızca hedef dilde basit eylemleri seslendirin (ör. kahve hazırlama adımları).',
          '2) Çevresel Tasarım: Çalışma ve yaşam alanında hedef dil etiketleri ve tek dilli kaynaklar kullanarak L1 tetikleyicilerini azaltın.',
          '3) Düşük Karmaşıklık, Yüksek Tutarlılık: Karmaşık cümle hedeflemek yerine her gün sürdürülebilir ve tekrarlanabilir basit üretim döngüsü kurun.',
          '4) Çeviri Yasağı Pencereleri: Gün içinde belirli zaman bloklarında L1 karşılık aramayı bilinçli biçimde kapatın; gerekirse sadece tarif ederek ilerleyin.',
          '5) Haftalık Geri Bildirim: Üretim kayıtlarını dinleyip sessizlik, dolgu sesi ve uzatma anlarını izleyin; bir sonraki hafta için tek bir odak hedef belirleyin.',
          '6) Shadowing Döngüsü: Kısa bir ses kaydını önce dinle, sonra eşzamanlı tekrar et, sonra gecikmeli tekrar et; ritim ve vurgu gelişimini kaydet.',
        ],
        pullQuote: 'Düzenli mikro pratik, düzensiz yoğun çalışmadan çok daha güçlü bir nöral yeniden yapılanma üretir.',
      },
    ],
    conclusion: [
      'Hedef dilde düşünme, "çeviri bölgesini" bir anda kapatmak değil; onu işlevsiz bırakacak kadar güçlü doğrudan üretim yolları inşa etmektir.',
      'İfade kalıpları, yoğun girdi, çevresel tasarım, circumlocution ve shadowing birlikte uygulandığında çeviri refleksi zayıflar; konuşma akışı daha doğal, sürdürülebilir ve özgüvenli hale gelir.',
    ],
    closingLine: 'Çeviriyi azaltmak için daha fazla düşünmek değil, hedef dilde daha sık ve daha stratejik üretmek gerekir.',
    relatedSlugs: ['ceviri-hastaligi', 'konusma-akiciliginin-fiziksel-ve-isitsel-cokusu'],
    tags: ['Hedef Dilde Düşünme', 'Lexical Chunks', 'Circumlocution', 'Shadowing', 'Massive Input', 'Nöroplastisite'],
    ctaTitle: 'Hedef dilde düşünme planını birlikte kuralım',
    ctaSubtitle: 'Seviyene uygun mikro rutinlerle çeviri refleksini azaltan günlük çalışma sistemini hemen başlatalım.',
    metaDescription: 'Hedef dilde düşünmeyi sağlayan teknikler: lexical chunks, massive input, direct association, circumlocution, constrained output ve shadowing.',
  },
  'iletisimsel-felc-gramer-ceviri-fosillesme-dongusu': {
    slug: 'iletisimsel-felc-gramer-ceviri-fosillesme-dongusu',
    category: 'genel',
    categoryLabel: 'DİL ÖĞRENİMİ',
    title: 'Yabancı Dil Ediniminde\nİletişimsel Felç',
    subtitle: 'Gramer-çeviri yöntemiyle başlayan yanlış işlemleme zinciri, zihinsel çeviriye ve sonunda fosilleşmeye dönüşerek akıcılığı kalıcı biçimde kilitleyebilir.',
    epigraph: 'Dil kuralla değil, gerçek zamanlı üretimle otomatikleşir.',
    heroImage: grammarTranslationFossilizationImage,
    author: 'Teachera Akademik İçerik Ekibi',
    authorRole: 'Dil Edinimi ve Bilişsel Bilimler',
    date: '28 Şubat 2026',
    readTime: '11 dk',
    sections: [
      {
        number: '01',
        title: 'Gramer-Çeviri Yöntemi ve Bilişsel Yanılgı',
        content: [
          '19. yüzyılda ölü klasik diller için geliştirilen gramer-çeviri modeli, modern iletişim odaklı dil edinimi için yapısal olarak yetersizdir. Çünkü hedefi spontane iletişim değil, kural çözümleme ve metin çevirisidir.',
          'Bu yaklaşım, dili yaşayan bir üretim sistemi yerine matematiksel bir problem gibi öğretir. Sonuçta öğrenci kuralı bilir ama konuşma anında bu bilgiyi otomatik üretime aktaramaz.',
          'Nörobilişsel açıdan fark kritiktir: bildirimsel bilgi (kuralı açıklayabilme) ile işlemsel bilgi (anlık ve akıcı üretim) farklı sistemlerdir. Gramer-çeviri, ikinci sistemi geliştirmeden birincisini şişirir.',
        ],
        pullQuote: 'Kuralı bilmek, konuşmayı otomatikleştirmek değildir.',
      },
      {
        number: '02',
        title: 'Çeviri Hastalığı: Konuşma Anındaki Nörolojik Darboğaz',
        content: [
          'Gramer-çeviriyle yetişen zihin, düşünceyi hedef dilde kurmak yerine önce anadilde tasarlar, sonra çevirir. Bu refleks iletişim hızında ciddi işlemleme gecikmesi üretir.',
          'Bilişsel yük arttıkça konuşmada sessizlikler, dolgu sesleri ve cümle ortasında donmalar artar. Bu belirtiler çoğu zaman özgüven sorunu değil, arka planda çalışan çeviri mekanizmasının metabolik maliyetidir.',
          'Ek olarak dilin doğal eşdizim yapısı bozulur: kelime kelime aktarım, hedef dilde doğru görünen ama doğal olmayan cümleler üretir. Uzun vadede bu durum konuşma isteğini de zayıflatır.',
        ],
        image: grammarTranslationFossilizationImage,
        imageCaption: 'Çeviri refleksi, akıcı iletişim hattında yapısal bir darboğaz oluşturur.',
      },
      {
        number: '03',
        title: 'Fosilleşme Döngüsü: Kalıcı Gelişim Duraksaması',
        content: [
          'Selinker\'in interlanguage çerçevesinde tanımlanan fosilleşme, öğrenicinin belirli hata kalıplarında kalıcı olarak takılmasıdır. Maruziyet artsa bile gelişim aynı hızda devam etmez.',
          'Temel tetikleyici bilişsel yerleşmedir: anadil kalıpları hedef dile tekrar tekrar taşındığında beyin bu hatalı üretimi "varsayılan doğru yol" gibi otomatikleştirir.',
          'Bu nedenle sorun yalnızca yanlış bilmek değil, yanlışı işlemsel belleğe kazımaktır. Dönüşüm için çeviri refleksini azaltan iletişimsel pratikler ve hedef dilde doğrudan kavramsallaştırma gerekir.',
        ],
        pullQuote: 'Fosilleşme, hatayı görmekten çok hatayı otomatik üretmeye başlamaktır.',
      },
    ],
    conclusion: [
      'Gramer-çeviri yöntemi beyni üretim yerine tercümeye hazırladığında, çeviri hastalığı konuşma akıcılığını yavaşlatır; süreç devam ettiğinde fosilleşme kalıcı bariyer haline gelir.',
      'Bu döngüyü kırmanın yolu, kural odaklı pasif öğrenmeden iletişimsel ve üretim odaklı aktif modele geçmektir: kavramı anadil filtresinden geçirmeden hedef dilde işleyebilmek.',
    ],
    closingLine: 'Akıcılığa giden yol, cümleleri çevirmekten değil düşünceyi hedef dilde kurmaktan geçer.',
    relatedSlugs: ['ceviri-hastaligi', 'hedef-dilde-dusunmeyi-saglayacak-teknikler'],
    tags: ['Gramer-Çeviri Yöntemi', 'İletişimsel Felç', 'Çeviri Hastalığı', 'Fosilleşme', 'Interlanguage', 'Bilişsel Yük'],
    ctaTitle: 'Çeviri refleksini kıran iletişimsel programa geçelim',
    ctaSubtitle: 'Kural bilgisini konuşma otomasyonuna dönüştüren, seviyene göre yapılandırılmış pratik planını birlikte oluşturalım.',
    metaDescription: 'Gramer-çeviri yöntemi, çeviri hastalığı ve fosilleşme döngüsü akıcılığı nasıl engeller? Nörobilişsel temelli açıklama ve çözüm yaklaşımı.',
  },
};

const DEFAULT_META_DESCRIPTION = 'Teachera Academy içerikleriyle dil öğreniminde pratik odaklı, uygulanabilir yöntemleri keşfedin.';

/* ═══════════════════════════════════════════════════════════════════════
   SLUG MAPPING — article id → slug
   ═══════════════════════════════════════════════════════════════════════ */
export const ARTICLE_SLUG_MAP: Record<number, string> = {
  1: 'ceviri-hastaligi',
  2: 'konusma-akiciliginin-fiziksel-ve-isitsel-cokusu',
  3: 'hedef-dilde-dusunmeyi-saglayacak-teknikler',
  5: 'iletisimsel-felc-gramer-ceviri-fosillesme-dongusu',
};

/* ═══════════════════════════════════════════════════════════════════════
   REVEAL
   ═══════════════════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   READING PROGRESS BAR
   ═══════════════════════════════════════════════════════════════════════ */
function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 50, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-[#E70000] origin-left z-[9999]"
      style={{ scaleX }}
    />
  );
}

function normalizeArticleTitle(title: string): string {
  return title.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

const TURKISH_MONTH_MAP: Record<string, number> = {
  ocak: 0,
  oca: 0,
  subat: 1,
  sub: 1,
  mart: 2,
  mar: 2,
  nisan: 3,
  nis: 3,
  mayis: 4,
  may: 4,
  haziran: 5,
  haz: 5,
  temmuz: 6,
  tem: 6,
  agustos: 7,
  agu: 7,
  eylul: 8,
  eyl: 8,
  ekim: 9,
  eki: 9,
  kasim: 10,
  kas: 10,
  aralik: 11,
  ara: 11,
};

function normalizeTurkishToken(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}

function toIsoDateString(dateLabel: string): string | undefined {
  const [dayPart, monthPart, yearPart] = dateLabel.trim().replace(/\./g, '').split(/\s+/);
  const day = Number(dayPart);
  const year = Number(yearPart);
  const monthIndex = TURKISH_MONTH_MAP[normalizeTurkishToken(monthPart || '')];

  if (!Number.isInteger(day) || !Number.isInteger(year) || monthIndex === undefined) {
    return undefined;
  }

  const parsedDate = new Date(Date.UTC(year, monthIndex, day));
  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString().slice(0, 10);
}

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonicalLink(href: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/* ═══════════════════════════════════════════════════════════════════════
   ARTICLE DETAIL PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = useMemo(() => {
    if (!slug) return undefined;
    return ARTICLES[slug];
  }, [slug]);
  const plainTitle = useMemo(() => (article ? normalizeArticleTitle(article.title) : ''), [article]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!article) {
      document.title = 'Makale Bulunamadı | Teachera Academy';
      upsertMetaTag('name', 'description', 'Aradığınız Teachera Academy makalesi bulunamadı.');
      upsertMetaTag('name', 'robots', 'noindex,follow,noarchive');
      upsertMetaTag('property', 'og:type', 'website');
      upsertMetaTag('property', 'og:title', 'Makale Bulunamadı | Teachera Academy');
      upsertMetaTag('property', 'og:description', 'Aradığınız Teachera Academy makalesi bulunamadı.');
      upsertMetaTag('property', 'og:url', `${window.location.origin}/academy`);
      upsertMetaTag('property', 'og:image', DEFAULT_OG_IMAGE);
      upsertMetaTag('name', 'twitter:card', 'summary');
      upsertMetaTag('name', 'twitter:title', 'Makale Bulunamadı | Teachera Academy');
      upsertMetaTag('name', 'twitter:description', 'Aradığınız Teachera Academy makalesi bulunamadı.');
      upsertMetaTag('name', 'twitter:image', DEFAULT_OG_IMAGE);
      upsertCanonicalLink(`${window.location.origin}/academy`);

      const existingStructuredData = document.getElementById('teachera-academy-article-jsonld');
      if (existingStructuredData) {
        existingStructuredData.remove();
      }
      return;
    }

    const pageTitle = `${plainTitle} | Teachera Academy`;
    const description = article.metaDescription || article.subtitle || DEFAULT_META_DESCRIPTION;
    const pageUrl = `${window.location.origin}${window.location.pathname}`;
    const publishedAt = toIsoDateString(article.date);
    const isOrganizationAuthor = /ekip|ekibi|birimi|teachera/i.test(article.author);

    document.title = pageTitle;
    upsertMetaTag('name', 'description', description);
    upsertMetaTag('property', 'og:type', 'article');
    upsertMetaTag('property', 'og:title', pageTitle);
    upsertMetaTag('property', 'og:description', description);
    upsertMetaTag('property', 'og:url', pageUrl);
    upsertMetaTag('property', 'og:image', article.heroImage);
    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('name', 'twitter:title', pageTitle);
    upsertMetaTag('name', 'twitter:description', description);
    upsertMetaTag('name', 'twitter:image', article.heroImage);
    upsertCanonicalLink(pageUrl);

    const jsonLdId = 'teachera-academy-article-jsonld';
    let structuredData = document.getElementById(jsonLdId) as HTMLScriptElement | null;
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.type = 'application/ld+json';
      structuredData.id = jsonLdId;
      document.head.appendChild(structuredData);
    }

    structuredData.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: plainTitle,
      description,
      image: [article.heroImage],
      author: {
        '@type': isOrganizationAuthor ? 'Organization' : 'Person',
        name: article.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Teachera',
      },
      ...(publishedAt ? { datePublished: publishedAt } : {}),
      mainEntityOfPage: pageUrl,
      keywords: article.tags.join(', '),
    });

    return () => {
      const existingStructuredData = document.getElementById(jsonLdId);
      if (existingStructuredData) {
        existingStructuredData.remove();
      }
    };
  }, [article, plainTitle]);

  if (!article) {
    return (
      <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/30 font-['Neutraface_2_Text:Demi',sans-serif] text-lg mb-6">Makale bulunamadı</p>
          <button
            onClick={() => navigate('/academy')}
            className="text-[#E70000] font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-[0.15em] hover:text-white transition-colors cursor-pointer"
          >
            ACADEMY'YE DON
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReadingProgress />

      <div className="min-h-screen bg-[#F4EBD1]">

        {/* ═══════════════════════════════════════════════════════
            HERO — Pure Typography, No Image
            ═══════════════════════════════════════════════════════ */}
        <section className="relative bg-[#0a0a10] overflow-hidden">
          {/* Subtle texture */}
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundSize: '4px 4px' }} />

          {/* Atmospheric red glow — very subtle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[#E70000] rounded-full filter blur-[300px] opacity-[0.04] pointer-events-none" />

          <div className="max-w-[1100px] mx-auto px-6 lg:px-12 relative z-10 pt-24 md:pt-32 pb-16 md:pb-20">

            {/* Navigation row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-10 md:mb-14"
            >
              <button
                onClick={() => navigate('/academy')}
                className="flex items-center gap-3 text-white/25 hover:text-white/60 transition-colors cursor-pointer group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.3em]">
                  TEACHERA ACADEMY
                </span>
              </button>
              <div className="flex items-center gap-4 text-white/20 text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em]">
                <span>{article.date}</span>
                <span className="w-[3px] h-[3px] rounded-full bg-white/15" />
                <span>{article.readTime}</span>
              </div>
            </motion.div>

            {/* Category */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-6"
            >
              <span className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.35em]">
                {article.categoryLabel}
              </span>
            </motion.div>

            {/* Title — the statement */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-white leading-[0.95] mb-8 md:mb-12 whitespace-pre-line"
              style={{ fontSize: 'clamp(2.4rem, 7vw, 5.5rem)', fontFamily: "'Neutraface_2_Text:Bold', sans-serif", letterSpacing: '-0.02em' }}
            >
              {article.title}
            </motion.h1>

            {/* Thin red rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-20 h-[2px] bg-[#E70000] origin-left mb-8"
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-white/35 text-[15px] md:text-[17px] font-['Neutraface_2_Text:Book',sans-serif] italic leading-[1.65] max-w-xl mb-10"
            >
              {article.subtitle}
            </motion.p>

            {/* Author line — minimal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <p className="text-white/50 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.05em]">
                  {article.author}
                </p>
                <p className="text-white/20 text-[11px] font-['Neutraface_2_Text:Book',sans-serif]">
                  {article.authorRole}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            HERO IMAGE — Full bleed between hero and body
            ═══════════════════════════════════════════════════════ */}
        <div className="relative w-full h-[40vh] md:h-[55vh] lg:h-[65vh] overflow-hidden">
          <ImageWithFallback
            src={article.heroImage}
            alt={`${plainTitle} kapak görseli`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a10] via-transparent to-[#F4EBD1]" style={{ background: 'linear-gradient(to bottom, #0a0a10 0%, transparent 25%, transparent 75%, #F4EBD1 100%)' }} />
        </div>

        {/* ═══════════════════════════════════════════════════════
            EPIGRAPH
            ═══════════════════════════════════════════════════════ */}
        <div className="max-w-[800px] mx-auto px-6 lg:px-12 pt-10 md:pt-14 pb-8 md:pb-12">
          <Reveal>
            <div className="text-center">
              <div className="text-[#E70000]/25 text-[60px] md:text-[80px] leading-none font-['Neutraface_2_Text:Bold',sans-serif] select-none mb-2">"</div>
              <p className="text-[#324D47] text-[clamp(1.1rem,2.8vw,1.6rem)] font-['Neutraface_2_Text:Demi',sans-serif] italic leading-[1.7] max-w-[640px] mx-auto -mt-8 md:-mt-12">
                {article.epigraph}
              </p>
              <div className="w-8 h-[1px] bg-[#324D47]/15 mx-auto mt-7" />
            </div>
          </Reveal>
        </div>

        {/* ═══════════════════════════════════════════════════════
            ARTICLE BODY
            ═══════════════════════════════════════════════════════ */}
        <article className="max-w-[800px] mx-auto px-6 lg:px-12 pb-8">

          {article.sections.map((section, sIdx) => (
            <Reveal key={section.number} delay={sIdx === 0 ? 0 : 0.05}>
              <section className={sIdx === 0 ? 'pt-2' : 'pt-10 md:pt-12'}>

                {/* ── Section Header ── */}
                <div className="relative mb-5 md:mb-6">
                  {/* Ghost number — positioned in margin on lg */}
                  <span
                    className="block lg:absolute lg:-left-24 lg:top-0 text-[#E70000]/[0.07] font-['Neutraface_2_Text:Bold',sans-serif] leading-none select-none mb-4 lg:mb-0"
                    style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}
                  >
                    {section.number}
                  </span>
                  <h2
                    className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] leading-[1.1]"
                    style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)' }}
                  >
                    {section.title}
                  </h2>
                </div>

                {/* ── Paragraphs ── */}
                <div className="space-y-3.5 md:space-y-4">
                  {section.content.map((paragraph, pIdx) => (
                    (() => {
                      const isStrategyLine = /^\d\)\s/.test(paragraph);
                      if (isStrategyLine) {
                        const [heading, ...rest] = paragraph.split(':');
                        const body = rest.join(':').trim();
                        return (
                          <div
                            key={pIdx}
                            className="border-l-2 border-[#E70000]/35 bg-[#324D47]/[0.03] px-5 py-2.5"
                          >
                            <p className="text-[#324D47]/80 font-['Neutraface_2_Text:Book',sans-serif] leading-[1.62]" style={{ fontSize: 'clamp(1rem, 1.65vw, 1.1rem)' }}>
                              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]">{heading}:</span>{' '}
                              {body}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <p
                          key={pIdx}
                          className="text-[#324D47]/70 font-['Neutraface_2_Text:Book',sans-serif] leading-[1.66]"
                          style={{
                            fontSize: 'clamp(1.05rem, 1.8vw, 1.15rem)',
                            ...(sIdx === 0 && pIdx === 0 ? {} : {}),
                          }}
                        >
                          {sIdx === 0 && pIdx === 0 ? (
                            <>
                              <span
                                className="float-left text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] leading-[0.75] mr-3 mt-2"
                                style={{ fontSize: '4.2em' }}
                              >
                                {paragraph.charAt(0)}
                              </span>
                              {paragraph.slice(1)}
                            </>
                          ) : paragraph}
                        </p>
                      );
                    })()
                  ))}
                </div>

                {/* ── Pull Quote — Full-width, centered, dramatic ── */}
                {section.pullQuote && (
                  <Reveal delay={0.1}>
                    <div className="my-8 md:my-10 py-6 md:py-8 border-t border-b border-[#324D47]/[0.06] text-center relative">
                      {/* Large quotation mark */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[#E70000]/10 font-['Neutraface_2_Text:Bold',sans-serif] select-none pointer-events-none" style={{ fontSize: '8rem', lineHeight: '1' }}>
                        "
                      </div>
                      <p
                        className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] leading-[1.35] max-w-[560px] mx-auto relative z-10"
                        style={{ fontSize: 'clamp(1.15rem, 2.8vw, 1.55rem)' }}
                      >
                        {section.pullQuote}
                      </p>
                    </div>
                  </Reveal>
                )}

                {/* ── Section Image — Edge-to-edge ── */}
                {section.image && (
                  <Reveal delay={0.1}>
                    <figure className="my-8 md:my-12 -mx-6 lg:-mx-24">
                      <div className="overflow-hidden">
                        <ImageWithFallback
                          src={section.image}
                          alt={section.imageCaption || section.title}
                          className="w-full h-[280px] md:h-[420px] lg:h-[480px] object-cover"
                        />
                      </div>
                      {section.imageCaption && (
                        <figcaption className="mt-3 px-6 lg:px-24 text-[#324D47]/30 text-[11px] font-['Neutraface_2_Text:Book',sans-serif] tracking-[0.05em]">
                          — {section.imageCaption}
                        </figcaption>
                      )}
                    </figure>
                  </Reveal>
                )}
              </section>
            </Reveal>
          ))}

          {/* ═══════════════════════════════════════════════════════
              CONCLUSION
              ═══════════════════════════════════════════════════════ */}
          <Reveal>
            <section className="pt-10 md:pt-12">
              {/* Heavy rule */}
              <div className="w-full h-[2px] bg-[#324D47]/10 mb-8 md:mb-10" />

              <div className="space-y-4">
                {article.conclusion.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-[#324D47]/70 font-['Neutraface_2_Text:Book',sans-serif] leading-[1.66]"
                    style={{ fontSize: 'clamp(1.05rem, 1.8vw, 1.15rem)' }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Closing line — standalone, bold */}
              <p
                className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] leading-[1.35] mt-8"
                style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)' }}
              >
                {article.closingLine}
              </p>

              {/* End mark */}
              <div className="mt-8 flex items-center gap-4">
                <div className="w-3 h-3 bg-[#E70000]" />
                <div className="flex-1 h-[1px] bg-[#324D47]/[0.06]" />
              </div>
            </section>
          </Reveal>

          {/* ═══════════════════════════════════════════════════════
              AUTHOR CARD
              ═══════════════════════════════════════════════════════ */}
          <Reveal>
            <div className="mt-10 md:mt-12 py-6 flex items-start gap-6">
              <div className="w-[3px] h-14 bg-[#E70000]/20 rounded-full shrink-0 mt-1" />
              <div>
                <p className="text-[10px] text-[#324D47]/25 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.3em] mb-3">
                  YAZAR
                </p>
                <p className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] mb-1" style={{ fontSize: '1.1rem' }}>
                  {article.author}
                </p>
                <p className="text-[#324D47]/40 text-[14px] font-['Neutraface_2_Text:Book',sans-serif] italic leading-relaxed">
                  {article.authorRole}
                </p>
              </div>
            </div>
          </Reveal>

          {/* ═══════════════════════════════════════════════════════
              TAGS
              ═══════════════════════════════════════════════════════ */}
          <Reveal>
            <div className="mt-4 pt-5 border-t border-[#324D47]/[0.06] flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 border border-[#324D47]/[0.08] text-[10px] text-[#324D47]/35 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.1em]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
        </article>

        {/* ═══════════════════════════════════════════════════════
            BOTTOM CTA — Dark, authoritative
            ═══════════════════════════════════════════════════════ */}
        <Reveal>
          <section className="bg-[#0a0a10] mt-14 md:mt-20 relative overflow-hidden">
            {/* Subtle red glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E70000] rounded-full filter blur-[250px] opacity-[0.06] pointer-events-none" />

            <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-14 md:py-16 relative z-10">
              <div className="text-center">
                <span className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.35em] block mb-5">
                  SONRAKİ ADIM
                </span>
                <h3
                  className="text-white font-['Neutraface_2_Text:Bold',sans-serif] leading-[1.1] mb-4"
                  style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)' }}
                >
                  {article.ctaTitle}
                </h3>
                <p className="text-white/30 text-[15px] font-['Neutraface_2_Text:Book',sans-serif] italic leading-relaxed max-w-md mx-auto mb-8">
                  {article.ctaSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => navigate('/iletisim')}
                    className="h-[52px] px-10 bg-[#E70000] hover:bg-[#c40000] text-white font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-[0.15em] transition-all duration-300 shadow-lg shadow-[#E70000]/20 cursor-pointer hover:shadow-[#E70000]/30 flex items-center gap-3"
                  >
                    DENEME DERSİ AL
                    <ArrowUpRight size={15} />
                  </button>
                  <button
                    onClick={() => navigate('/academy')}
                    className="h-[52px] px-10 border border-white/[0.08] hover:border-white/20 text-white/40 hover:text-white/70 font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-[0.15em] transition-all duration-300 cursor-pointer"
                  >
                    DİĞER YAZILAR
                  </button>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </>
  );
}

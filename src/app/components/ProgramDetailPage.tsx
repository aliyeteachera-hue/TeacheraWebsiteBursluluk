import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Users,
  User,
  Monitor,
  MapPin,
  GraduationCap,
  Sparkles,
  MessageCircle,
  BookOpen,
  Target,
  Award,
  Star,
  Zap,
  Shield,
  Globe,
  Briefcase,
  BarChart3,
  Layers,
  Headphones,
  PenTool,
  Eye,
  Mic,
  TrendingUp,
} from 'lucide-react';
import { ALL_PROGRAMS, type ProgramItem } from './AllPrograms';
import { useFreeTrial } from './FreeTrialContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import TeacheraLogo from '../../imports/TeacheraLogo';
import heartImg from 'figma:asset/7d33c418a182fc076257cfeeb01ba43b5692e3f6.webp';
import { ListenIcon, SpeakIcon, CorrectIcon, RepeatIcon as RepeatCustomIcon } from './MethodologyIcons';
import { useMotionTiming } from '../lib/uiMotion';

/* ═══════════════════════════════════════════════════════════════════════
   HERO IMAGES — vintage / cinematic
   ═══════════════════════════════════════════════════════════════════════ */
const CATEGORY_IMAGES: Record<string, string> = {
  general: 'https://images.unsplash.com/photo-1584445743187-cd8ba040349a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZmlsbSUyMGdyYWluJTIwY2xhc3Nyb29tJTIwZWR1Y2F0aW9uJTIwY2luZW1hdGljfGVufDF8fHx8MTc3MjEzMzQ2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  career: 'https://images.unsplash.com/photo-1576759310201-7d60ea1f039a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwb2ZmaWNlJTIwZGVzayUyMHR5cGV3cml0ZXIlMjBtb29keSUyMGNpbmVtYXRpY3xlbnwxfHx8fDE3NzIxMzM0NjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  exam: 'https://images.unsplash.com/photo-1604011483213-7b9f65aeff68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBkYXJrJTIwYWNhZGVtaWElMjBsaWJyYXJ5JTIwYm9va3MlMjBtb29keXxlbnwxfHx8fDE3NzIxMzM0NjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'kids-teens-child': 'https://images.unsplash.com/photo-1733671805619-1a1563c006bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHBsYXlpbmclMjB2aW50YWdlJTIwd2FybSUyMGxpZ2h0JTIwbm9zdGFsZ2ljfGVufDF8fHx8MTc3MjEzMzQ2Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'kids-teens-teen': 'https://images.unsplash.com/photo-1653079537423-79a33181bc41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwYWNhZGVtaWElMjB0ZWVuYWdlciUyMHN0dWR5JTIwYWVzdGhldGljJTIwd2FybXxlbnwxfHx8fDE3NzIxMzM0NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
};

function getHeroImage(p: ProgramItem): string {
  if (p.category === 'kids-teens') {
    return p.ages.includes('child')
      ? CATEGORY_IMAGES['kids-teens-child']
      : CATEGORY_IMAGES['kids-teens-teen'];
  }
  return CATEGORY_IMAGES[p.category] || CATEGORY_IMAGES.general;
}

/* ═══════════════════════════════════════════════════════════════════════
   LANG ACCENTS
   ═══════════════════════════════════════════════════════════════════════ */
const LANG_ACCENTS: Record<string, string> = {
  ingilizce: '#E70000',
  ispanyolca: '#FFC400',
  almanca: '#DD0000',
  fransizca: '#0055A4',
  italyanca: '#008C45',
  rusca: '#D52B1E',
  arapca: '#006C35',
};

const FALLBACK_SITE_URL = 'https://teachera.com.tr';
const SITE_URL = (import.meta.env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, '');

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

function upsertJsonLd(id: string, payload: unknown) {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(payload);
}

/* ═══════════════════════════════════════════════════════════════════════
   FLOW STEPS PER CATEGORY — adapted zigzag timeline
   ═══════════════════════════════════════════════════════════════════════ */
interface FlowStep {
  num: string;
  tag: string;
  tagEn: string;
  headline: string;
  body: string;
  detail: string;
  accent: string;
  glowColor: string;
  customIcon: React.ComponentType<{ color: string; className?: string }>;
}

const GENERAL_FLOW: FlowStep[] = [
  { num: '01', tag: 'DİNLE', tagEn: 'LISTEN', headline: 'Her An Dinle!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Native Speaker eğitmen yeni bir yapı ya da kavramı sistemli şekilde tanıtır. Ardından o yapıyı kullanmanı gerektiren soru gelir.', detail: 'Duyduğun an, öğrenme başlar.' },
  { num: '02', tag: 'KONUŞ', tagEn: 'SPEAK', headline: 'Her An Konuş!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Yeni öğrendiğin yapı, daha soğumadan… eğitmenin yönlendirmesiyle tam ve doğru cümle kurarsın. Bilgi içeride kalmaz; dışarı çıkar.', detail: 'Bilmek yetmez, söylemek gerekir.' },
  { num: '03', tag: 'DÜZELT', tagEn: 'CORRECT', headline: 'Düzelt!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Hata yaptıysan korkma. En ufak hata bile yanlış olarak yerleşmeden anında düzeltilir. Doğrusunu kurdururuz.', detail: 'Hata yapılır, yerleşmesine izin verilmez.' },
  { num: '04', tag: 'TEKRAR ET', tagEn: 'REPEAT', headline: 'Tekrar Et!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Döngü, seri bir soru bombardımanı gibi devam eder. Tekrar sayısı artar; düşünme süresi azalır. Cümleler refleks olur.', detail: 'Tekrar ettikçe, düşünmeden konuşursun.' },
];

function getIeltsFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'TEŞHİS', tagEn: 'DIAGNOSE', headline: 'Band Seviyeni Ölç!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'IELTS diagnostik testi ile mevcut band seviyeni, her modüldeki güçlü ve zayıf yönlerini ortaya koyarız. Hedef band skoru netleşir, yol haritası çizilir.', detail: 'Band descriptor\'lar pusulandır.' },
    { num: '02', tag: 'STRATEJİ', tagEn: 'STRATEGIZE', headline: 'Modül Bazlı Strateji!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Listening, Reading, Writing ve Speaking için ayrı strateji: soru tipi analizi, band descriptor bazlı hedefleme ve zaman yönetimi.', detail: 'Her modülün kendi savaş planı vardır.' },
    { num: '03', tag: 'PRATİK', tagEn: 'PRACTICE', headline: 'Mock Sınavlarla Dene!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Gerçek sınav koşullarında tam format mock sınavlar, ardından detaylı band analizi. Writing ve Speaking için rubrik bazlı geri bildirim.', detail: 'Gerçek sınavdan önce, gerçek deneyim.' },
    { num: '04', tag: 'HEDEF', tagEn: 'ACHIEVE', headline: 'Hedef Banda Ulaş!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Son sprint: yoğunlaştırılmış tekrar, stres yönetimi ve strateji pekiştirme. Sınav gününde tam hazır olursun.', detail: 'Hazırlık tamamlandığında, band gelir.' },
  ];
}

function getPteFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'TEŞHİS', tagEn: 'DIAGNOSE', headline: 'Seviyeni Ölç!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'PTE Academic diagnostik testi ile mevcut seviyeni ortaya koyarız. AI skorlama mantığı açıklanır, hedef skor netleşir.', detail: 'AI\'ın dilini anlamak, başarının ilk adımıdır.' },
    { num: '02', tag: 'STRATEJİ', tagEn: 'STRATEGIZE', headline: 'Format Bazlı Strateji!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Her soru tipi için ayrı strateji: Read Aloud, Repeat Sentence, Describe Image, Summarize Written Text — çapraz skorlama mantığıyla puan maksimizasyonu.', detail: 'Doğru strateji, çapraz skorlamayı avantaja çevirir.' },
    { num: '03', tag: 'PRATİK', tagEn: 'PRACTICE', headline: 'Bilgisayar Tabanlı Pratik!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Gerçek sınav ortamını birebir yansıtan bilgisayar tabanlı mock sınavlar. AI skorlama kriterleri üzerinden detaylı performans analizi.', detail: 'Formatı tanıdıkça, stres azalır.' },
    { num: '04', tag: 'HEDEF', tagEn: 'ACHIEVE', headline: 'Hedefe Ulaş!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Son sprint: pronunciation ve fluency optimizasyonu, zayıf soru tiplerinde yoğunlaşma ve strateji pekiştirme.', detail: 'Hazırlık tamamlandığında, skor gelir.' },
  ];
}

function getExamFlow(examName: string, programId?: string): FlowStep[] {
  const name = programId === 'toefl' ? 'TOEFL IBT' : examName;
  return [
    { num: '01', tag: 'TEŞHİS', tagEn: 'DIAGNOSE', headline: 'Seviyeni Ölç!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: `${name} diagnostik testi ile mevcut seviyeni, güçlü ve zayıf yönlerini ortaya koyarız. Hedef skor netleşir, yol haritası çizilir.`, detail: 'Nerede olduğunu bilmeden, nereye gideceğini bilemezsin.' },
    { num: '02', tag: 'STRATEJİ', tagEn: 'STRATEGIZE', headline: 'Modül Bazlı Strateji!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Her sınav modülü için ayrı strateji: soru tipi analizi, zaman yönetimi, puan maksimizasyonu. Zayıf modüllere ekstra yoğunlaşma.', detail: 'Stratejisiz çalışma, pusulasız yolculuktur.' },
    { num: '03', tag: 'PRATİK', tagEn: 'PRACTICE', headline: 'Mock Sınavlarla Dene!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Gerçek sınav koşullarında mock sınavlar, ardından detaylı performans analizi. Her denemede neyi, neden kaçırdığını görürsün.', detail: 'Gerçek sınavdan önce, gerçek deneyim.' },
    { num: '04', tag: 'HEDEF', tagEn: 'ACHIEVE', headline: 'Hedefe Ulaş!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Son sprint: yoğunlaştırılmış tekrar, stres yönetimi ve strateji pekiştirme. Sınav gününde tam hazır olursun.', detail: 'Hazırlık tamamlandığında, skor gelir.' },
  ];
}

function getCareerFlow(name: string): FlowStep[] {
  return [
    { num: '01', tag: 'ANALİZ', tagEn: 'ANALYZE', headline: 'İhtiyacını Belirle!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Sektörün, pozisyonun ve günlük iş iletişimin detaylıca analiz edilir. Müfredat tamamen senin dünyandan beslenir.', detail: 'Doğru plan, doğru analizle başlar.' },
    { num: '02', tag: 'TERMİNOLOJİ', tagEn: 'TERMINOLOGY', headline: 'Sektörel Dil!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: `${name} alanına özel teknik terimler, jargon ve profesyonel ifadeler — gerçek dokümanlar üzerinden, konuşarak öğrenilir.`, detail: 'Dilin sektörünü konuşsun.' },
    { num: '03', tag: 'SİMÜLASYON', tagEn: 'SIMULATE', headline: 'Gerçekçi Senaryolar!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Toplantı, sunum, müzakere ve telefon görüşmesi senaryoları birebir canlandırılır. Hata güvenli ortamda yapılır, düzeltilir.', detail: 'Pratikte öğrenilen, sahada kullanılır.' },
    { num: '04', tag: 'UYGULA', tagEn: 'APPLY', headline: 'Sahaya Çık!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Kendi iş ortamından bir senaryo üzerinde kapsamlı proje çalışması. Artık dili gerçek dünyada güvenle kullanırsın.', detail: 'Öğrendiğini uygula, uygularken öğren.' },
  ];
}

function getKidsFlow(isChild: boolean): FlowStep[] {
  if (isChild) {
    return [
      { num: '01', tag: 'KEŞFET', tagEn: 'DISCOVER', headline: 'Merakla Başla!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Şarkılar, renkler, sayılar ve günlük ifadelerle dil ile ilk buluşma. Merak uyandıran, baskısız bir başlangıç.', detail: 'Merak eden çocuk, öğrenen çocuktur.' },
      { num: '02', tag: 'OYNA', tagEn: 'PLAY', headline: 'Oynayarak Öğren!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Rol yapma oyunları, hikaye anlatımı ve yaratıcı aktivitelerle kelime hazinesi farkında bile olmadan genişler.', detail: 'Oyun olan yerde, öğrenme doğal gelir.' },
      { num: '03', tag: 'KONUŞ', tagEn: 'SPEAK', headline: 'İlk Cümleler!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Market, park, okul senaryolarıyla basit ama gerçekçi diyaloglar. Çocuğunuz ilk cümlelerini eğlenerek kurar.', detail: 'İlk cümle, büyük bir adımdır.' },
      { num: '04', tag: 'SERGİLE', tagEn: 'SHOWCASE', headline: 'Başardığını Göster!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Her modül sonunda küçük sunum, poster veya kısa video projesiyle öğrenilenleri sergileme ve özgüven pekiştirme.', detail: 'Başarı görünür olunca, motivasyon katlanır.' },
    ];
  }
  return [
    { num: '01', tag: 'HEDEFLE', tagEn: 'TARGET', headline: 'Hedefini Koy!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Detaylı giriş değerlendirmesi ve gencin hedeflerine uygun kişisel yol haritası. Motivasyonu yüksek tutan, somut hedefler.', detail: 'Hedefsiz yolculuk, rotasız gemiye benzer.' },
    { num: '02', tag: 'KONUŞ', tagEn: 'SPEAK', headline: 'Konuşarak İlerle!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Teknoloji, seyahat, sosyal medya, gelecek planları gibi gençlere yakın konularda derin diyaloglar ve tartışmalar.', detail: 'Gençlerin dünyasında, gençlerin diliyle.' },
    { num: '03', tag: 'ÜRET', tagEn: 'CREATE', headline: 'Projelerle Üret!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Podcast kaydı, blog yazımı veya mini araştırma projesiyle dili gerçek hayatta kullanma. Akademik beceriler de gelişir.', detail: 'Üretirken öğrenmek, en kalıcı öğrenmedir.' },
    { num: '04', tag: 'GELİŞ', tagEn: 'GROW', headline: 'Ölçülebilir İlerleme!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Düzenli ilerleme testleri, veli bilgilendirme ve bireysel geri bildirim raporları. Her adım somut ve görünür.', detail: 'Gelişim ölçüldüğünde, motivasyon artar.' },
  ];
}

function getYdsFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'TEŞHİS', tagEn: 'DIAGNOSE', headline: 'Seviyeni Ölç!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'YDS / YÖKDİL diagnostik testi ile mevcut seviyeni, gramer, kelime ve okuma anlama performansını ortaya koyarız. Hedef puan netleşir, zayıf alanlar belirlenir.', detail: 'Nerede olduğunu bilmeden, nereye gideceğini bilemezsin.' },
    { num: '02', tag: 'GRAMER', tagEn: 'GRAMMAR', headline: 'Gramer Stratejisi!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'YDS / YÖKDİL\'e özgü gramer kalıpları, cümle tamamlama ve paragraf tamamlama stratejileri — soru tipi bazlı sistematik çalışma. Her soru tipinin kendine özgü çözüm tekniği vardır.', detail: 'Gramer bilmek yetmez, soru tipini tanımak gerekir.' },
    { num: '03', tag: 'KELİME', tagEn: 'VOCABULARY', headline: 'Akademik Kelime Hazinesi!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'YDS / YÖKDİL\'de sıklıkla karşılaşılan akademik kelimeler ve eş/zıt anlam stratejileri. Bağlamdan anlam çıkarma teknikleri ve kelime ailesi çalışması.', detail: 'Kelimeyi ezberlemek değil, bağlamda tanımak önemli.' },
    { num: '04', tag: 'HEDEF', tagEn: 'ACHIEVE', headline: 'Hedefe Ulaş!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Tam format deneme sınavları, zaman yönetimi pratiği ve paragraf okuma hız artırma çalışması. Son sprint ile hedef puana kilitlen.', detail: 'Hazırlık tamamlandığında, puan gelir.' },
  ];
}

function getDeleFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'TEŞHİS', tagEn: 'DIAGNOSE', headline: 'Seviyeni Ölç!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'DELE / SIELE diagnostik testi ile İspanyolca seviyeni ortaya koyarız. Comprensión de lectura, expresión escrita, oral ve auditiva performansın analiz edilir.', detail: 'Doğru seviye tespiti, doğru sınav seçimini belirler.' },
    { num: '02', tag: 'STRATEJİ', tagEn: 'STRATEGIZE', headline: 'Modül Bazlı Strateji!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Her DELE modülü için ayrı strateji: okuma ve dinleme için teknikler, yazma görevleri için template çalışması, konuşma için spontan ifade geliştirme.', detail: 'Her modülün kendi savaş planı vardır.' },
    { num: '03', tag: 'PRATİK', tagEn: 'PRACTICE', headline: 'Gerçek Format Pratiği!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Gerçek sınav koşullarında mock sınavlar — Instituto Cervantes formatında tam uygulama. Detaylı geri bildirim ve zayıf alan analizi.', detail: 'Sınav formatını tanıdıkça, stres azalır.' },
    { num: '04', tag: 'HEDEF', tagEn: 'ACHIEVE', headline: 'Sertifikanı Al!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Son sprint: zayıf modüllere yoğunlaşma, expresión oral pratiği ve strateji pekiştirme. Sınav gününde tam hazır olursun.', detail: 'Hazırlık tamamlandığında, sertifika gelir.' },
  ];
}

function getGoetheFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'TEŞHİS', tagEn: 'DIAGNOSE', headline: 'Einstufung!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Goethe-Zertifikat / TestDaF / TELC diagnostik testi ile Almanca seviyeni belirleriz. Lesen, Hören, Schreiben ve Sprechen performansın detaylı analiz edilir.', detail: 'Doğru seviye tespiti, başarının temelidir.' },
    { num: '02', tag: 'STRATEJİ', tagEn: 'STRATEGIZE', headline: 'Prüfungsstrategie!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Her sınav modülü için ayrı strateji: TestDaF TDN seviye hedeflemesi, Goethe Schreiben görev tipleri, TELC konuşma kalıpları — sınav tipine göre özelleştirilmiş plan.', detail: 'Almanca sınavların kendine özgü mantığı vardır.' },
    { num: '03', tag: 'PRATİK', tagEn: 'PRACTICE', headline: 'Modelltest!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Gerçek sınav koşullarında tam format Modelltest uygulamaları. Sprechen modülünde birebir canlandırma ve Schreiben için detaylı geri bildirim.', detail: 'Pratikte öğrenilen, sınavda kullanılır.' },
    { num: '04', tag: 'HEDEF', tagEn: 'ACHIEVE', headline: 'Zertifikat!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Son sprint: zayıf modüllere yoğunlaşma, Sprechen pratiği ve strateji pekiştirme. Sınav gününde tam hazır olursun.', detail: 'Hazırlık tamamlandığında, Zertifikat gelir.' },
  ];
}

function getDelfFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'TEŞHİS', tagEn: 'DIAGNOSE', headline: 'Évaluation!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'DELF / DALF / TCF diagnostik testi ile Fransızca seviyeni belirleriz. Compréhension orale, écrite, production orale ve écrite performansın analiz edilir.', detail: 'Doğru seviye, doğru diploma.' },
    { num: '02', tag: 'STRATEJİ', tagEn: 'STRATEGIZE', headline: 'Stratégie d\'Examen!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Her modül için ayrı strateji: DELF B2 argumentation, DALF C1 synthèse, TCF compréhension teknikleri — sınav seviyesine özel hedefleme.', detail: 'Fransız sınav sisteminin inceliklerini bilmek avantaj.' },
    { num: '03', tag: 'PRATİK', tagEn: 'PRACTICE', headline: 'Examen Blanc!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Gerçek sınav koşullarında tam format examen blanc uygulamaları. Production orale canlandırması ve production écrite için detaylı düzeltme.', detail: 'Pratik sınav, gerçek sınavı kolaylaştırır.' },
    { num: '04', tag: 'HEDEF', tagEn: 'ACHIEVE', headline: 'Diplôme!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Son sprint: zayıf alanlara odaklanma, oral pratik yoğunlaştırma ve strateji pekiştirme. Sınav gününde tam hazır ol.', detail: 'Hazırlık tamamlandığında, diplôme gelir.' },
  ];
}

function getCilsFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'TEŞHİS', tagEn: 'DIAGNOSE', headline: 'Valutazione!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'CILS / CELI diagnostik testi ile İtalyanca seviyeni belirleriz. Ascolto, lettura, produzione scritta ve orale performansın detaylı analiz edilir.', detail: 'Seviye tespiti, doğru sertifika seçiminin temelidir.' },
    { num: '02', tag: 'STRATEJİ', tagEn: 'STRATEGIZE', headline: 'Strategia d\'Esame!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Her modül için ayrı strateji: ascolto dinleme teknikleri, lettura okuma stratejileri, produzione scritta yazma template\'leri ve orale konuşma kalıpları.', detail: 'İtalyan sınav formatının inceliklerini öğren.' },
    { num: '03', tag: 'PRATİK', tagEn: 'PRACTICE', headline: 'Simulazione!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Gerçek sınav koşullarında tam format simulazione uygulamaları. Native speaker eğitmenle produzione orale pratiği ve detaylı geri bildirim.', detail: 'Simülasyon, sınav gününü tanıdık kılar.' },
    { num: '04', tag: 'HEDEF', tagEn: 'ACHIEVE', headline: 'Certificato!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Son sprint: zayıf modüllere yoğunlaşma, konuşma pratiği ve strateji pekiştirme. Sertifikanı almaya hazır ol.', detail: 'Hazırlık tamamlandığında, certificato gelir.' },
  ];
}

function getTorflFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'TEŞHİS', tagEn: 'DIAGNOSE', headline: 'Оценка!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'TORFL diagnostik testi ile Rusça seviyeni belirleriz. Чтение, аудирование, письмо, говорение ve грамматика performansın analiz edilir.', detail: 'Doğru seviye tespiti, doğru sertifika seviyesi.' },
    { num: '02', tag: 'STRATEJİ', tagEn: 'STRATEGIZE', headline: 'Стратегия!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Her TORFL modülü için ayrı strateji: грамматика kalıpları, чтение okuma teknikleri, письмо yazma formatı ve говорение konuşma pratiği.', detail: 'Rus sınav sisteminin kendine özgü yapısını öğren.' },
    { num: '03', tag: 'PRATİK', tagEn: 'PRACTICE', headline: 'Пробный Экзамен!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Gerçek sınav koşullarında tam format пробный экзамен (mock sınav) uygulamaları. Говорение modülünde birebir canlandırma.', detail: 'Pratik, sınav gününü tanıdık kılar.' },
    { num: '04', tag: 'HEDEF', tagEn: 'ACHIEVE', headline: 'Сертификат!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Son sprint: грамматика ve говорение yoğunlaştırma, strateji pekiştirme ve zaman yönetimi pratiği.', detail: 'Hazırlık tamamlandığında, сертификат gelir.' },
  ];
}

function getBusinessFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'ANALİZ', tagEn: 'ANALYZE', headline: 'İş Dilini Haritalandır!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Günlük iş iletişimini, toplantı dinamiklerini ve yazışma alışkanlıklarını analiz ederiz. Müfredat tamamen senin iş dünyandan beslenir.', detail: 'İş dilin, seni iş dünyasında tanımlar.' },
    { num: '02', tag: 'TERMİNOLOJİ', tagEn: 'TERMINOLOGY', headline: 'Profesyonel Dil!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Toplantı yönetimi, müzakere, e-posta yazımı ve sunum terminolojisi — gerçek iş dokümanların üzerinden, konuşarak öğrenirsin.', detail: 'Toplantıda söz almak, doğru kelimelerle başlar.' },
    { num: '03', tag: 'SİMÜLASYON', tagEn: 'SIMULATE', headline: 'Boardroom Simülasyonu!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Gerçek toplantı, müzakere ve sunum senaryoları birebir canlandırılır. Pitch yaparsın, müzakere edersin, e-posta yazarsın — hata güvenli ortamda olur.', detail: 'Boardroom\'da hata yapmanın bedeli yüksek; burada sıfır.' },
    { num: '04', tag: 'UYGULA', tagEn: 'APPLY', headline: 'Sahaya Çık!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Kendi iş ortamından gerçek bir case üzerinde kapsamlı proje: sunum hazırla, müzakere et, rapor yaz. Artık iş dilini güvenle konuşursun.', detail: 'Öğrendiğini uyguladığın an, gerçek başarı başlar.' },
  ];
}

function getMarketingFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'ANALİZ', tagEn: 'ANALYZE', headline: 'Pazarlama Dilini Keşfet!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Mevcut İngilizce seviyeni ve pazarlama iletişim ihtiyaçlarını analiz ederiz. Kampanya sunumları, marka stratejisi ve dijital pazarlama terminolojisi odaklı plan oluşturulur.', detail: 'Her pazarlamacının bir dil stratejisi olmalı.' },
    { num: '02', tag: 'TERMİNOLOJİ', tagEn: 'TERMINOLOGY', headline: 'Global Marketing Dili!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'ROI, KPI, brand positioning, target audience, funnel, conversion — pazarlama jargonunu gerçek case study\'ler üzerinden öğrenirsin.', detail: 'Küresel pazarlamada dil, kampanyanın ta kendisidir.' },
    { num: '03', tag: 'SİMÜLASYON', tagEn: 'SIMULATE', headline: 'Campaign Pitch!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Kampanya sunumu, marka lansmanı ve global ekip toplantısı senaryoları canlandırılır. Storytelling ve persuasion teknikleri pratikte öğrenilir.', detail: 'Bir kampanyayı İngilizce pitchleyebilmek, kariyer atılımıdır.' },
    { num: '04', tag: 'UYGULA', tagEn: 'APPLY', headline: 'Go Global!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Kendi markandan veya şirketinden gerçek bir case: İngilizce kampanya brief\'i yaz, pitch\'i hazırla, sunumunu yap.', detail: 'Küresel sahneye çıkmak, doğru kelimelerle başlar.' },
  ];
}

function getFinanceFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'ANALİZ', tagEn: 'ANALYZE', headline: 'Finans Dilini Haritalandır!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Finans sektöründeki İngilizce iletişim ihtiyaçlarını analiz ederiz. Raporlama, yatırımcı ilişkileri ve endüstri terminolojisi odaklı plan oluşturulur.', detail: 'Finans dünyasında yanlış kelime, yanlış karar demek.' },
    { num: '02', tag: 'TERMİNOLOJİ', tagEn: 'TERMINOLOGY', headline: 'Wall Street Dili!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'P&L, EBITDA, cash flow, hedge, yield, portfolio — finans jargonunu gerçek raporlar ve analist sunumları üzerinden öğrenirsin.', detail: 'Rakamlar evrensel, ama finans dili İngilizce konuşur.' },
    { num: '03', tag: 'SİMÜLASYON', tagEn: 'SIMULATE', headline: 'Earnings Call Simülasyonu!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Yatırımcı sunumu, earnings call ve finansal rapor sunumu senaryoları birebir canlandırılır. Rakamları anlatma ve soru yanıtlama pratiği.', detail: 'Yatırımcıya güven vermek, doğru anlatımla başlar.' },
    { num: '04', tag: 'UYGULA', tagEn: 'APPLY', headline: 'Sahaya Çık!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Kendi şirketinden gerçek bir case: İngilizce finansal rapor hazırla, yatırımcı sunumunu yap, conference call\'a katıl.', detail: 'Öğrendiğini uyguladığın an, güven gelir.' },
  ];
}

function getLegalFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'ANALİZ', tagEn: 'ANALYZE', headline: 'Hukuk Dilini Keşfet!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Uluslararası hukuk iletişim ihtiyaçlarını analiz ederiz. Sözleşme dili, dava terminolojisi ve profesyonel yazışma odaklı plan oluşturulur.', detail: 'Hukukta her kelime bağlayıcıdır.' },
    { num: '02', tag: 'TERMİNOLOJİ', tagEn: 'TERMINOLOGY', headline: 'Legal Terminology!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Sözleşme hukuku, fikri mülkiyet, şirketler hukuku terminolojisi — gerçek hukuki dokümanlar üzerinden, kontekst içinde öğrenirsin.', detail: 'Sözleşmedeki bir kelime, milyonlarca doları belirleyebilir.' },
    { num: '03', tag: 'SİMÜLASYON', tagEn: 'SIMULATE', headline: 'Negotiation Table!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Müzakere, sözleşme müzakeresi ve müvekkil toplantısı senaryoları canlandırılır. Hukuki argüman sunma ve karşı tarafla İngilizce müzakere pratiği.', detail: 'Müzakere masasında dil hakimiyeti, pozisyon hakimiyetidir.' },
    { num: '04', tag: 'UYGULA', tagEn: 'APPLY', headline: 'Sahaya Çık!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Gerçek bir hukuki senaryo üzerinde kapsamlı proje: sözleşme analizi yap, hukuki görüş yaz, müzakere et.', detail: 'Uluslararası hukuk arenasında güvenle ilerle.' },
  ];
}

function getMedicalFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'ANALİZ', tagEn: 'ANALYZE', headline: 'Tıbbi Dil İhtiyacını Belirle!', customIcon: ListenIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Tıbbi İngilizce iletişim ihtiyaçlarını analiz ederiz. Hasta iletişimi, akademik makale ve kongre sunumu odaklı plan oluşturulur.', detail: 'Tıpta iletişim, tedavinin bir parçasıdır.' },
    { num: '02', tag: 'TERMİNOLOJİ', tagEn: 'TERMINOLOGY', headline: 'Medical Terminology!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Anatomi, farmakoloji, tanı ve tedavi terminolojisi — gerçek tıbbi vakalar ve akademik makaleler üzerinden, kontekst içinde öğrenirsin.', detail: 'Tıbbi terim bilmek, hasta güvenliğinin temelidir.' },
    { num: '03', tag: 'SİMÜLASYON', tagEn: 'SIMULATE', headline: 'Clinical Scenario!', customIcon: CorrectIcon, accent: '#324D47', glowColor: 'rgba(50,77,71,0.15)', body: 'Hasta anamnezi, konsültasyon ve kongre sunumu senaryoları birebir canlandırılır. Case presentation ve poster sunumu pratiği.', detail: 'Kongreye hazırlık, klinikte başlar.' },
    { num: '04', tag: 'UYGULA', tagEn: 'APPLY', headline: 'Sahaya Çık!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Kendi alanından gerçek bir case: İngilizce vaka sunumu hazırla, abstract yaz, kongre simülasyonu yap.', detail: 'Uluslararası tıp sahnesinde güvenle ilerle.' },
  ];
}

function getFlowSteps(program: ProgramItem): FlowStep[] {
  if (program.id === 'ielts') return getIeltsFlow();
  if (program.id === 'pte') return getPteFlow();
  if (program.id === 'yds') return getYdsFlow();
  if (program.id === 'dele') return getDeleFlow();
  if (program.id === 'goethe') return getGoetheFlow();
  if (program.id === 'delf') return getDelfFlow();
  if (program.id === 'cils') return getCilsFlow();
  if (program.id === 'torfl') return getTorflFlow();
  if (program.category === 'exam') {
    const examName = program.name.replace(' Hazırlık', '');
    return getExamFlow(examName, program.id);
  }
  if (program.id === 'business-en') return getBusinessFlow();
  if (program.id === 'marketing-en') return getMarketingFlow();
  if (program.id === 'finance-en') return getFinanceFlow();
  if (program.id === 'legal-en') return getLegalFlow();
  if (program.id === 'medical-en') return getMedicalFlow();
  if (program.category === 'career') return getCareerFlow(program.name);
  if (program.category === 'kids-teens') return getKidsFlow(program.ages.includes('child'));
  if (program.id === 'ar-f2f-grup' || program.id === 'ar-online-grup') return getArabicGrupFlow();
  if (program.id === 'ar-ozel') return getArabicOzelFlow();
  return GENERAL_FLOW;
}

function getArabicGrupFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'DİNLE', tagEn: 'LISTEN', headline: 'Anlayarak Dinle!', customIcon: ListenIcon, accent: '#006C35', glowColor: 'rgba(0,108,53,0.15)', body: 'Native speaker eğitmenin kullandığı yapıları ve kelimeleri dinler, farklı bağlamlarda anlam çıkarmayı öğrenirsin. Dinleme, konuşmanın beslenme kaynağıdır.', detail: 'Kulak, dilin ilk kapısıdır.' },
    { num: '02', tag: 'KONUŞ', tagEn: 'SPEAK', headline: 'Konuşarak İlerle!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Her ders konuşma pratiğiyle güçlenir. Eğitmen yönlendirmesiyle Fasih Arapça\'da cümle kurar, duyduğunu hemen uygulamaya dökersin.', detail: 'Konuşma, öğrenmenin motorudur.' },
    { num: '03', tag: 'OKU', tagEn: 'READ', headline: 'Metinle Derinleş!', customIcon: CorrectIcon, accent: '#006C35', glowColor: 'rgba(0,108,53,0.15)', body: 'Harekeli ve harekesiz metinler üzerinde okuma pratiği yaparsın. Akademik, edebi ve günlük metinlerle kelime dağarcığın ve kavrama gücün büyür.', detail: 'Okumak, dili derinleştirir.' },
    { num: '04', tag: 'YAZ', tagEn: 'WRITE', headline: 'Yazarak Pekiştir!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Öğrendiğin yapıları yazıya dökersin. Cümle kurma, paragraf oluşturma ve metin yazma ile bilgi kalıcı hale gelir.', detail: 'Yazmak, bilgiyi sabitler.' },
  ];
}

function getArabicOzelFlow(): FlowStep[] {
  return [
    { num: '01', tag: 'DİNLE', tagEn: 'LISTEN', headline: 'Anlayarak Dinleyin!', customIcon: ListenIcon, accent: '#006C35', glowColor: 'rgba(0,108,53,0.15)', body: 'Birebir derste native speaker eğitmenin kullandığı yapıları ve kelimeleri dikkatle dinler, farklı bağlamlarda anlam kurarsınız.', detail: 'Kulak, dilin ilk kapısıdır.' },
    { num: '02', tag: 'KONUŞ', tagEn: 'SPEAK', headline: 'Konuşarak İlerleyin!', customIcon: SpeakIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Dinlediğiniz yapıları anında konuşmaya çevirirsiniz. Eğitmen yönlendirmesiyle Fasih Arapça cümle kurma beceriniz her derste güçlenir.', detail: 'Konuşma, öğrenmenin motorudur.' },
    { num: '03', tag: 'OKU', tagEn: 'READ', headline: 'Metinle Derinleşin!', customIcon: CorrectIcon, accent: '#006C35', glowColor: 'rgba(0,108,53,0.15)', body: 'Harekeli ve harekesiz metinler üzerinden okuma pratiği yaparsınız. Akademik ve günlük içeriklerle kelime dağarcığınız sistemli biçimde genişler.', detail: 'Okuma, dili derinleştirir.' },
    { num: '04', tag: 'YAZ', tagEn: 'WRITE', headline: 'Yazarak Pekiştirin!', customIcon: RepeatCustomIcon, accent: '#E70000', glowColor: 'rgba(231,0,0,0.12)', body: 'Öğrendiğiniz yapıları yazıya döker, cümle ve paragraf üretimiyle bilgiyi kalıcı hale getirirsiniz. Her derste hedef odaklı geri bildirim alırsınız.', detail: 'Yazmak, bilgiyi sabitler.' },
  ];
}

/* ═══════════════════════════════════════════════════════════════════════
   TESTIMONIALS PER CATEGORY
   ═══════════════════════════════════════════��════��══════════════════════ */
interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
}

const TOEFL_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Burak Yılmaz', role: 'TOEFL IBT 102 · Yüksek Lisans Adayı', content: 'Üç kez girip istediğim skoru alamadığım TOEFL IBT sınavında, Teachera ile 8 haftada 102 puana ulaştım. Diagnostik test ve kişiye özel plan her şeyi değiştirdi.', rating: 5 },
  { id: 2, name: 'Elif Sönmez', role: 'TOEFL IBT 98 · MBA Öğrencisi', content: 'Speaking modülü en zayıf noktamdı. Native speaker eğitmenimle yoğun pratik yaparak 98 puana ulaştım. Mock sınavlardaki geri bildirimler inanılmaz faydalıydı.', rating: 5 },
  { id: 3, name: 'Can Erdem', role: 'TOEFL IBT 105 · Doktora Adayı', content: 'Writing ve Speaking modüllerinde strateji eksikliğim vardı. Eğitmenimin güncel sınav trendlerini bilmesi ve buna göre hazırlaması büyük avantaj sağladı.', rating: 5 },
  { id: 4, name: 'Merve Aydın', role: 'TOEFL IBT 96 · Erasmus Öğrencisi', content: 'Online derslerle evimden hazırlandım. Her hafta mock test yapılması ve detaylı analiziyle sınav gününde hiç stres yaşamadım. Hedefimi ilk seferde aştım.', rating: 5 },
];

const IELTS_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Deniz Akman', role: 'IELTS 7.5 · Erasmus Öğrencisi', content: 'IELTS sınavında hedefimin üzerinde bir skor aldım. Mock sınavlar ve modül bazlı strateji çalışması gerçekten fark yarattı. Speaking modülünde kendimi çok hazır hissettim.', rating: 5 },
  { id: 2, name: 'Seda Yıldırım', role: 'IELTS 8.0 · Doktora Adayı', content: 'Writing modülünde 6.5\'ten 8.0\'a çıkmak inanılmaz bir başarıydı. Task Response ve Coherence stratejileri her şeyi değiştirdi. Eğitmenimin detaylı essay geri bildirimleri paha biçilemezdi.', rating: 5 },
  { id: 3, name: 'Oğuzhan Kılıç', role: 'IELTS 7.0 · Kanada Göç Başvurusu', content: 'PR başvurum için her modülden minimum 7.0 almam gerekiyordu. En zor kısmı olan Listening\'de bile hedefime ulaştım. Band descriptor bazlı çalışma mantığı çok etkili.', rating: 5 },
  { id: 4, name: 'Zehra Çetin', role: 'IELTS 7.5 · MBA Öğrencisi', content: 'İkinci kez girdiğim IELTS\'te Speaking 5.5\'ten 7.5\'e çıktı. Native speaker eğitmenle yaptığımız yoğun pratikler ve Part 2-3 stratejileri hayat kurtardı.', rating: 5 },
];

const PTE_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Selin Korkmaz', role: 'PTE Academic 79 · Avustralya Göç Başvurusu', content: 'PTE formatını bilmiyordum bile. Sıfırdan öğrenip 79 puan aldım. Bilgisayar tabanlı sınav formatına özel teknikler çok işe yaradı.', rating: 5 },
  { id: 2, name: 'Barış Aksoy', role: 'PTE Academic 84 · Yazılım Mühendisi', content: 'IELTS\'te istediğim skoru alamayınca PTE\'ye geçtim. Teachera ile bilgisayar tabanlı formatın inceliklerini öğrendim. Speaking & Writing entegre soruları artık çok kolay geliyor.', rating: 5 },
  { id: 3, name: 'Gamze Özkan', role: 'PTE Academic 72 · Hemşire · UK Başvurusu', content: 'Read Aloud ve Repeat Sentence stratejileri skorumu inanılmaz yükseltti. AI skorlama mantığını anlayınca her şey yerine oturdu. 3 haftada 15 puan artış sağladım.', rating: 5 },
  { id: 4, name: 'Cem Aydın', role: 'PTE Academic 82 · Akademisyen', content: 'Summarize Written Text ve Essay bölümlerinde template stratejisi çok işe yaradı. Eğitmenimin PTE\'nin AI değerlendirme kriterlerine hakimiyeti fark yarattı.', rating: 5 },
];

const EXAM_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Deniz Akman', role: 'IELTS 7.5 · Erasmus Öğrencisi', content: 'IELTS sınavında hedefimin üzerinde bir skor aldım. Mock sınavlar ve modül bazlı strateji çalışması gerçekten fark yarattı. Speaking modülünde kendimi çok hazır hissettim.', rating: 5 },
  { id: 2, name: 'Burak Yılmaz', role: 'TOEFL IBT 102 · Yüksek Lisans Adayı', content: 'Üç kez girip istediğim skoru alamadığım TOEFL IBT sınavında, Teachera ile 8 haftada 102 puana ulaştım. Diagnostik test ve kişiye özel plan her şeyi değiştirdi.', rating: 5 },
  { id: 3, name: 'Selin Korkmaz', role: 'PTE Academic 79 · Göç Başvurusu', content: 'PTE formatını bilmiyordum bile. Sıfırdan öğrenip 79 puan aldım. Bilgisayar tabanlı sınav formatına özel teknikler çok işe yaradı.', rating: 5 },
  { id: 4, name: 'Emre Çelik', role: 'YDS 92 · Akademisyen', content: 'YDS için yıllardır kendi başıma çalışıyordum ama 80 duvarını aşamıyordum. Stratejik çalışma planıyla 92 puana ulaştım.', rating: 5 },
];

const CAREER_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Caner Öztürk', role: 'Finans Direktörü · Capital Finance', content: 'Yurtdışı operasyonlarımızı yönetirken yaşadığım en büyük zorluk günlük iş konuşmalarıydı. Business English programı tam benim gibi yöneticiler için tasarlanmış.', rating: 5 },
  { id: 2, name: 'Zeynep Kaya', role: 'Pazarlama Direktörü · Global Brands', content: 'Kültürel nüanslara hakim olmak hayati önem taşıyor. Sektörel terminoloji ve sunum teknikleri kariyerimde gerçek bir fark yarattı.', rating: 5 },
  { id: 3, name: 'Av. Derya Aksoy', role: 'Hukuk Danışmanı · Uluslararası Firma', content: 'Hukuki İngilizce programıyla sözleşme dilini ve müzakere terminolojisini özgüvenle kullanmaya başladım. Uluslararası müvekkillere çok daha profesyonel hizmet veriyorum.', rating: 5 },
  { id: 4, name: 'Dr. Murat Kılıç', role: 'Cerrah · Özel Hastane', content: 'Tıbbi terminolojiyi akademik makalelerde okuyordum ama konuşamıyordum. Artık uluslararası kongrelerde rahatlıkla sunum yapabiliyorum.', rating: 5 },
];

const KIDS_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Sibel Arslan', role: 'Veli · 8 Yaş Çocuk Annesi', content: 'Oğlum derse gitmek için sabırsızlanıyor. Oyun oynarken farkında bile olmadan İngilizce cümleler kurmaya başladı. Eğlenerek öğrenmek gerçekten mümkünmüş!', rating: 5 },
  { id: 2, name: 'Hakan Tekin', role: 'Veli · 15 Yaş Genç Babası', content: 'Kızım artık yabancı dilde konuşmaktan çekinmiyor. Özgüveni inanılmaz arttı, okulda da farkı hissediyoruz. Gençlerin dünyasına uygun içerik çok önemli.', rating: 5 },
  { id: 3, name: 'Elif Demir', role: 'Veli · 6 Yaş İkiz Annesi', content: 'İkizlerim Mini Kids programıyla başladı. Evde birbiriyle İngilizce konuşmaya başladıklarını duyduğumda gözlerime inanamadım.', rating: 5 },
  { id: 4, name: 'Tolga Şahin', role: 'Veli · 14 Yaş Genç Babası', content: 'Oğlum Teens programıyla hem okul notlarını yükseltti hem de yurt dışı değişim programına kabul aldı. Akademik destek boyutu çok değerli.', rating: 5 },
];

const EN_GRUP_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Selin Yıldız', role: 'Grup Öğrencisi · A2 → B2', content: 'Yıllardır kendi başıma çalışıyordum ama konuşamıyordum. Grup derslerindeki enerji ve native speaker eğitmenlerle 4 ayda rahatça konuşmaya başladım. %85 konuşma pratiği gerçekten fark yaratıyor.', rating: 5 },
  { id: 2, name: 'Emre Kaplan', role: 'Grup Öğrencisi · B1 → C1', content: 'Speaking Cafe ve Language Lab etkinlikleri sayesinde sınıf dışında da İngilizce konuşma fırsatı buldum. Grup enerjisi ve akran öğrenmesi motivasyonumu hep yüksek tuttu.', rating: 5 },
  { id: 3, name: 'Derya Arslan', role: 'Grup Öğrencisi · Sıfırdan Başladı', content: 'Hiç İngilizce bilmeden başladım. Küçük grup ortamı sayesinde konuşmaktan çekinmedim, eğitmenimiz her hatamı anında düzeltti. Şimdi seyahatte rahatlıkla iletişim kurabiliyorum.', rating: 5 },
  { id: 4, name: 'Okan Çelik', role: 'Grup Öğrencisi · B2 → C1', content: 'Kule Plaza\'daki V.I.P sınıflar ve maksimum 10 kişilik ortam çok konforlu. Amerikalı eğitmenimiz sayesinde doğal bir aksan edinmeye başladım. Teachera Community ile güçlü bir network kurdum.', rating: 5 },
];

const YDS_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Dr. Hasan Yılmaz', role: 'YDS 92 · Doçentlik Adayı', content: 'Yıllardır 80 duvarını aşamıyordum. Teachera\'daki stratejik gramer çalışması ve soru tipi bazlı tekniklerle 92 puana ulaştım. Paragraf okuma hızım inanılmaz arttı.', rating: 5 },
  { id: 2, name: 'Arş. Gör. Elif Aydın', role: 'YÖKDİL 88 · Sağlık Bilimleri', content: 'Sağlık Bilimleri YÖKDİL\'de 88 puan aldım. Akademik kelime stratejileri ve bağlamdan anlam çıkarma teknikleri her şeyi değiştirdi.', rating: 5 },
  { id: 3, name: 'Öğr. Gör. Murat Demir', role: 'YDS 85 · Fen Bilimleri', content: 'Fen Bilimleri alanında YÖKDİL\'e hazırlanırken alanıma özel okuma parçaları üzerinden çalıştık. Soru tiplerini tanımayı öğrenince her şey kolaylaştı.', rating: 5 },
  { id: 4, name: 'Arş. Gör. Zeynep Kara', role: 'YDS 90 · Sosyal Bilimler', content: 'İlk sınavda 68 almıştım. 3 aylık yoğun hazırlıkla 90 puana çıktım. Gramer kalıpları ve cümle tamamlama stratejileri çok etkili.', rating: 5 },
];

const BUSINESS_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Caner Öztürk', role: 'Finans Direktörü · Capital Group', content: 'Yurtdışı operasyonlarımızı yönetirken günlük iş konuşmalarında zorlanıyordum. Business English programı ile toplantılarda artık özgüvenle söz alıyorum.', rating: 5 },
  { id: 2, name: 'Aylin Korkmaz', role: 'İK Müdürü · Global Tech', content: 'Uluslararası yetenek mülakatlarını İngilizce yürütmem gerekiyordu. 3 ayda mülakat sorularından performans değerlendirmesine kadar profesyonel İngilizce hakimiyeti kazandım.', rating: 5 },
  { id: 3, name: 'Burak Şahin', role: 'Satış Direktörü · Export Plus', content: 'Müzakere masasında doğru kelimeyi bulmak hayati önem taşıyor. Artık yabancı partnerlerle sözleşme müzakerelerini güvenle yürütüyorum.', rating: 5 },
  { id: 4, name: 'Seda Yıldırım', role: 'CEO · StartUp Hub', content: 'Yatırımcı sunumlarımı İngilizce yapmam gerekiyordu. Pitch deck sunumu, Q&A yönetimi ve small talk pratiği ile yatırımcı toplantılarında çok rahatladım.', rating: 5 },
];

const LEGAL_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Av. Derya Aksoy', role: 'Uluslararası Hukuk Danışmanı', content: 'Sözleşme dilini ve müzakere terminolojisini özgüvenle kullanmaya başladım. Uluslararası müvekkillere çok daha profesyonel hizmet veriyorum.', rating: 5 },
  { id: 2, name: 'Av. Kemal Tunç', role: 'Şirketler Hukuku · Big Four', content: 'M&A süreçlerinde İngilizce due diligence raporlarını artık çeviriye ihtiyaç duymadan değerlendirebiliyorum. Hukuki terminoloji hakimiyetim çok arttı.', rating: 5 },
  { id: 3, name: 'Av. Selin Aras', role: 'Fikri Mülkiyet Uzmanı', content: 'Patent başvurularında ve lisans anlaşmalarında İngilizce yazışma artık rutin. IP terminolojisi üzerine derinlemesine çalışmak çok değerli oldu.', rating: 5 },
  { id: 4, name: 'Av. Emre Kılıç', role: 'Tahkim Avukatı · Uluslararası', content: 'ICC tahkim duruşmalarında İngilizce argüman sunma pratiği hayat kurtardı. Hukuki İngilizce ile genel İngilizce arasındaki farkı Teachera ile öğrendim.', rating: 5 },
];

const MEDICAL_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Dr. Murat Kılıç', role: 'Cerrah · Özel Hastane', content: 'Tıbbi terminolojiyi akademik makalelerde okuyordum ama konuşamıyordum. Artık uluslararası kongrelerde rahatlıkla sunum yapabiliyorum.', rating: 5 },
  { id: 2, name: 'Dr. Ayşe Çetin', role: 'Kardiyolog · Üniversite Hastanesi', content: 'Case presentation ve poster sunumu pratiği çok değerli oldu. ESC kongresinde İngilizce sunum yaptığımda hiç tedirginlik hissetmedim.', rating: 5 },
  { id: 3, name: 'Dr. Oğuz Demir', role: 'Nörolog · Araştırma Görevlisi', content: 'Hasta anamnez alma ve konsültasyon İngilizcesi çok farklı bir alan. Simülasyonlarla bu beceriyi kazanmak harika oldu. USMLE için de büyük avantaj.', rating: 5 },
  { id: 4, name: 'Ecz. Fatma Güneş', role: 'Klinik Eczacı · İlaç Sektörü', content: 'Farmakovigilans raporlama ve uluslararası ilaç firmaları ile toplantılarda artık çok daha profesyonelim. Sektörel terminoloji eğitimi tam ihtiyacımdı.', rating: 5 },
];

const MARKETING_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Zeynep Kaya', role: 'Pazarlama Direktörü · Global Brands', content: 'Global kampanya sunumlarında artık anadilim gibi rahat konuşabiliyorum. Storytelling ve persuasion teknikleri kariyerimde gerçek bir fark yarattı.', rating: 5 },
  { id: 2, name: 'Cem Aktaş', role: 'Dijital Pazarlama Müdürü · E-Ticaret', content: 'Uluslararası agency\'lerle brief hazırlamak ve kampanya analizi sunmak artık çok kolay. Pazarlama jargonuna tam hakimiyet kazandım.', rating: 5 },
  { id: 3, name: 'İrem Yılmaz', role: 'Brand Manager · FMCG', content: 'Global marka toplantılarında positioning ve consumer insights sunumlarımı İngilizce yapabilmek terfi almamda büyük rol oynadı.', rating: 5 },
  { id: 4, name: 'Kaan Arslan', role: 'Content Strategist · Tech Startup', content: 'İngilizce içerik stratejisi ve editorial calendar sunumları artık günlük rutinimin parçası. Küresel ekiple uyumum çok arttı.', rating: 5 },
];

const FINANCE_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Serkan Yıldız', role: 'Portföy Yöneticisi · Yatırım Bankası', content: 'Earnings call simulasyonları ve yatırımcı sunumu pratiği çok değerli. Artık uluslararası yatırımcılarla güvenle iletişim kuruyorum.', rating: 5 },
  { id: 2, name: 'Deniz Akar', role: 'CFO · Teknoloji Şirketi', content: 'Finansal raporlama terminolojisi ve board presentation pratiği ile uluslararası board toplantılarında çok rahatladım.', rating: 5 },
  { id: 3, name: 'Ece Korkmaz', role: 'Risk Analisti · Sigorta', content: 'Risk assessment raporlarını İngilizce yazmam ve sunmam gerekiyordu. Finans terminolojisi üzerine yoğunlaşmak tam ihtiyacımdı.', rating: 5 },
  { id: 4, name: 'Mert Özkan', role: 'Denetçi · Big Four', content: 'Uluslararası denetim raporlama standartları ve müşteri toplantılarında İngilizce artık sorun olmaktan çıktı. Sektörel terminoloji hakimiyeti fark yarattı.', rating: 5 },
];

const EN_ONLINE_GRUP_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Pınar Aksoy', role: 'Online Grup Öğrencisi · A2 → B1', content: 'Konya dışında yaşıyorum, Teachera\'nın online grubu tam bana göre. Ekran karşısında bile grup enerjisini hissediyorsun, eğitmenimiz herkesi konuşturuyor.', rating: 5 },
  { id: 2, name: 'Tolga Şen', role: 'Online Grup Öğrencisi · B1 → B2', content: 'Yoğun iş temposuyla yüz yüze derslere gidemiyordum. Online grup programı ile evimden katılıp %85 konuşma pratiği yapıyorum. Fark yok!', rating: 5 },
  { id: 3, name: 'Elif Duman', role: 'Online Grup Öğrencisi · Sıfırdan', content: 'Online dersten çekiniyordum ama ortam çok samimi. Küçük grup sayesinde herkes konuşuyor, native speaker eğitmen herkesi dahil ediyor.', rating: 5 },
  { id: 4, name: 'Barış Yılmaz', role: 'Online Grup Öğrencisi · B2 → C1', content: 'Ankara\'dan katılıyorum. Teachera\'nın online altyapısı çok stabil, ders kalitesi yüz yüzeyle birebir aynı. Grubumuzla çok güzel bir enerji yakaladık.', rating: 5 },
];

const EN_OZEL_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Ayşe Yılmaz', role: 'Mimar · A2 → B2 · 3 Ay', content: 'Yoğun iş tempomla grup derslerine katılamıyordum. Özel ders ile kendi tempomda, tamamen bana özel müfredatla 3 ayda B2 seviyesine ulaştım.', rating: 5 },
  { id: 2, name: 'Mehmet Demir', role: 'Yazılım Mühendisi · B1 → C1', content: 'Technical English ihtiyacım vardı. Eğitmenimiz müfredatı tamamen yazılım dünyasından case\'lerle oluşturdu. Artık global takım toplantılarında rahatça konuşuyorum.', rating: 5 },
  { id: 3, name: 'Fatma Güneş', role: 'Akademisyen · B2 → C1', content: 'Akademik makale yazımı ve kongre sunumu odaklı özel ders aldım. Birebir ilgi ve anında düzeltme ile gelişimim çok hızlı oldu.', rating: 5 },
  { id: 4, name: 'Ali Bozkurt', role: 'Girişimci · Sıfırdan → B1 · 4 Ay', content: 'Sıfırdan başladım, yoğun tempo istedim. Haftada 5 gün birebir ders ile 4 ayda yurt dışı seyahatte rahatlıkla iletişim kurabilir hale geldim.', rating: 5 },
];

const MINI_KIDS_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Sibel Arslan', role: 'Veli · 5 Yaş Çocuk Annesi', content: 'Kızım derse gitmek için sabırsızlanıyor! Oyunlarla, şarkılarla öğreniyor. Evde bize İngilizce renkler ve sayılar öğretiyor, inanılmaz keyifli.', rating: 5 },
  { id: 2, name: 'Elif Demir', role: 'Veli · 6 Yaş İkiz Annesi', content: 'İkizlerim Mini Kids programıyla başladı. Evde birbirleriyle İngilizce konuşmaya başladıklarını duyduğumda gözlerime inanamadım!', rating: 5 },
  { id: 3, name: 'Ahmet Kaya', role: 'Veli · 4 Yaş Çocuk Babası', content: '4 yaşında erken mi diye düşünmüştük. Ama çocuğumuz İngilizce kelimeleri Türkçe kadar doğal kullanmaya başladı. Erken başlamanın farkı net.', rating: 5 },
  { id: 4, name: 'Merve Aksoy', role: 'Veli · 5 Yaş Çocuk Annesi', content: 'Native speaker eğitmenin aksanıyla büyümek ne büyük avantaj. Oğlum "apple" derken Amerikan aksanıyla söylüyor, biz bile şaşırıyoruz.', rating: 5 },
];

const DELE_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Sinem Yıldız', role: 'DELE B2 · Erasmus Öğrencisi', content: 'İspanya\'da Erasmus için DELE B2 gerekiyordu. Teachera\'daki native speaker eğitmenle 3 ayda sertifikamı aldım. Expresión oral modülünde çok rahat hissettim.', rating: 5 },
  { id: 2, name: 'Burak Aydın', role: 'SIELE C1 · Kariyer Hedefi', content: 'Latin Amerika\'da çalışmak istiyordum, SIELE skoru gerekiyordu. Eğitmenimin Instituto Cervantes formatına hakimiyeti büyük avantaj sağladı.', rating: 5 },
  { id: 3, name: 'Deniz Arslan', role: 'DELE A2 · Hobi', content: 'İspanyolca\'yı sevdiğim için öğreniyordum ama sertifikayla taçlandırmak istedim. DELE A2\'yi ilk seferde geçmek harika hissettirdi.', rating: 5 },
  { id: 4, name: 'Ece Korkmaz', role: 'DELE B1 · Üniversite Başvurusu', content: 'İspanya\'da üniversite başvurusu için DELE B1 aldım. Mock sınavlar ve modül bazlı çalışma çok etkili oldu.', rating: 5 },
];

const GOETHE_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Kemal Öztürk', role: 'TestDaF 4x4 · Doktora Adayı', content: 'Almanya\'da doktora için TestDaF 4x4 gerekiyordu. Schreiben ve Sprechen modüllerinde yoğun pratik yaparak hedefime ulaştım.', rating: 5 },
  { id: 2, name: 'Ayşe Çelik', role: 'Goethe B2 · Kariyer Hedefi', content: 'Almanya\'da çalışma vizesi için Goethe B2 sertifikası gerekiyordu. 4 ayda sertifikamı aldım. Sprechen pratiği her şeyi değiştirdi.', rating: 5 },
  { id: 3, name: 'Mert Demir', role: 'TELC B1 · Aile Birleşimi', content: 'Aile birleşimi vizesi için TELC B1 sertifikası gerekiyordu. Sıfırdan başlayıp 6 ayda başardım. Eğitmenimin sabırlı ve sistematik yaklaşımı çok değerli.', rating: 5 },
  { id: 4, name: 'Seda Yılmaz', role: 'Goethe C1 · Akademisyen', content: 'Goethe C1 Almanca\'nın en zor sertifikalarından biri. Schreiben ve Lesen modüllerindeki strateji çalışması ile hedefimi aştım.', rating: 5 },
];

const DELF_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Nil Aksoy', role: 'DELF B2 · Fransa Üniversitesi', content: 'Fransa\'da master için DELF B2 gerekiyordu. Production écrite ve orale modüllerinde yoğun çalıştık, sertifikamı ilk seferde aldım.', rating: 5 },
  { id: 2, name: 'Kaan Şahin', role: 'TCF C1 · Kanada Göç', content: 'Kanada göç başvurusu için TCF gerekiyordu. Compréhension orale stratejileri ve expression orale pratiği ile hedef skoruma ulaştım.', rating: 5 },
  { id: 3, name: 'Elif Tunç', role: 'DELF B1 · Diplomatik Kariyer', content: 'Dışişleri sınavı için Fransızca gerekiyordu. DELF B1 sertifikası ile özgeçmişime güçlü bir referans ekledim.', rating: 5 },
  { id: 4, name: 'Emre Yıldız', role: 'DALF C1 · Araştırma Görevlisi', content: 'DALF C1, Fransızca\'nın en prestijli sertifikalarından. Synthèse ve argumentation çalışmaları çok zorlu ama eğitmenimle birlikte başardık.', rating: 5 },
];

const CILS_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Gizem Kaya', role: 'CILS B2 · İtalya Üniversitesi', content: 'İtalya\'da mimarlık master\'ı için CILS B2 gerekiyordu. Native speaker eğitmenle produzione orale pratiği çok değerli oldu.', rating: 5 },
  { id: 2, name: 'Ozan Demir', role: 'CELI B1 · Vatandaşlık', content: 'İtalyan vatandaşlığı için B1 sertifikası gerekiyordu. Sıfırdan başlayıp 8 ayda CELI B1 sertifikamı aldım. Harika bir yolculuktu.', rating: 5 },
  { id: 3, name: 'Selin Aras', role: 'CILS C1 · Sanat Tarihçi', content: 'İtalya\'da akademik kariyer için CILS C1 hedefliyordum. Produzione scritta ve lettura modüllerindeki stratejiler fark yarattı.', rating: 5 },
  { id: 4, name: 'Murat Aksoy', role: 'CILS B1 · Aşçılık Okulu', content: 'İtalya\'da aşçılık okulu için İtalyanca sertifika gerekiyordu. Eğlenceli ve etkili derslerle kısa sürede hazırlandım.', rating: 5 },
];

const TORFL_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Eren Kılıç', role: 'TORFL B2 · Rusya Üniversitesi', content: 'Rusya\'da tıp okumak için TORFL B2 gerekiyordu. Кириллица\'dan grамматика\'ya sistematik çalışma ile hedefime ulaştım.', rating: 5 },
  { id: 2, name: 'Ayşe Demirbaş', role: 'TORFL B1 · Ticaret', content: 'Rusya ile ticaret yapıyorum, TORFL sertifikası iş ilişkilerimde büyük güven sağladı. Говорение pratiği çok etkili oldu.', rating: 5 },
  { id: 3, name: 'Barış Şahin', role: 'TORFL A2 · Kültürel İlgi', content: 'Rus edebiyatını orijinal dilinde okumak istiyordum. TORFL A2 ile başlangıç seviyemi belgeledim, okuma becerilerim çok gelişti.', rating: 5 },
  { id: 4, name: 'Seda Yıldırım', role: 'TORFL B1 · Akademik', content: 'Slavistik alanında akademik kariyer için Rusça sertifika gerekiyordu. Письмо ve чтение modüllerindeki çalışma çok faydalı oldu.', rating: 5 },
];

const GENERAL_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Ayşe Yılmaz', role: 'Yüksek Mimar · Studio Arch', content: 'Teachera ile başladığım yolculukta, sadece dil bilgisi değil, aynı zamanda sektörel terminolojiye hakimiyet kazandım. Uluslararası projelerde artık çok daha özgüvenli sunumlar yapabiliyorum.', rating: 5 },
  { id: 2, name: 'Mehmet Demir', role: 'Yazılım Mühendisi · TechSolutions', content: 'Teknik dökümanları okumak ile global bir toplantıda fikirlerini savunmak arasında dağlar kadar fark var. Speaking odaklı yaklaşım tam da bu boşluğu doldurdu.', rating: 5 },
  { id: 3, name: 'Ali Bozkurt', role: 'Seyahat Tutkunu · Fotoğrafçı', content: 'Yıllardır gramer biliyordum ama konuşamıyordum. 3 ayda seyahatte rahatlıkla İngilizce konuşmaya başladım. %85 konuşma pratiği gerçekten işe yarıyor.', rating: 5 },
  { id: 4, name: 'Fatma Güneş', role: 'Öğretmen · Kültür Meraklısı', content: 'İspanyolca öğrenmeye hobi olarak başladım ama şimdi İspanya\'da siparişimi verebiliyor, sohbet edebiliyorum. Kültürel bağlamda öğrenmek çok keyifli.', rating: 5 },
];

function getTestimonials(cat: string, programId?: string): TestimonialItem[] {
  const map: Record<string, TestimonialItem[]> = {
    'toefl': TOEFL_TESTIMONIALS,
    'ielts': IELTS_TESTIMONIALS,
    'pte': PTE_TESTIMONIALS,
    'en-grup-f2f': EN_GRUP_TESTIMONIALS,
    'yds': YDS_TESTIMONIALS,
    'business-en': BUSINESS_TESTIMONIALS,
    'legal-en': LEGAL_TESTIMONIALS,
    'medical-en': MEDICAL_TESTIMONIALS,
    'marketing-en': MARKETING_TESTIMONIALS,
    'finance-en': FINANCE_TESTIMONIALS,
    'en-online-grup': EN_ONLINE_GRUP_TESTIMONIALS,
    'en-ozel': EN_OZEL_TESTIMONIALS,
    'mini-kids-en': MINI_KIDS_TESTIMONIALS,
    'dele': DELE_TESTIMONIALS,
    'goethe': GOETHE_TESTIMONIALS,
    'delf': DELF_TESTIMONIALS,
    'cils': CILS_TESTIMONIALS,
    'torfl': TORFL_TESTIMONIALS,
  };
  if (programId && map[programId]) return map[programId];
  switch (cat) {
    case 'exam': return EXAM_TESTIMONIALS;
    case 'career': return CAREER_TESTIMONIALS;
    case 'kids-teens': return KIDS_TESTIMONIALS;
    default: return GENERAL_TESTIMONIALS;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   RICH DATA PER CATEGORY
   ═══════════════════════════════════════════════════════════════════════ */
interface CategoryContent {
  heroTagline: string;
  whoIsItFor: { title: string; items: string[] };
  curriculum: { title: string; modules: { name: string; detail: string }[] };
  faqs: { q: string; a: string; ctaType?: 'contact' | 'trial' | 'kurumsal' }[];
  flowTitle: string;
  flowSubtitle: string;
  quickStats?: { icon: React.ReactNode; value: string; label: string }[];
}

function getCategoryContent(program: ProgramItem): CategoryContent {
  const lang = program.languageLabel;
  // Program-specific content
  const contentMap: Record<string, () => CategoryContent> = {
    'toefl': getToeflContent,
    'ielts': getIeltsContent,
    'pte': getPteContent,
    'en-grup-f2f': getEnGrupContent,
    'yds': getYdsContent,
    'business-en': getBusinessContent,
    'marketing-en': getMarketingContent,
    'finance-en': getFinanceContent,
    'legal-en': getLegalContent,
    'medical-en': getMedicalContent,
    'en-online-grup': getEnOnlineGrupContent,
    'en-ozel': getEnOzelContent,
    'mini-kids-en': getMiniKidsContent,
    'dele': () => getDeleContent(lang),
    'goethe': () => getGoetheContent(lang),
    'delf': () => getDelfContent(lang),
    'cils': () => getCilsContent(lang),
    'torfl': () => getTorflContent2(lang),
    'legal-fr': getLegalFrContent,
    'ar-f2f-grup': () => getArabicGrupContent(false),
    'ar-online-grup': () => getArabicGrupContent(true),
    'ar-ozel': getArabicOzelContent,
  };
  if (contentMap[program.id]) return contentMap[program.id]();
  // Category fallbacks
  if (program.category === 'exam') return getExamContent(program, lang);
  if (program.category === 'career') return getCareerContent(program, lang);
  if (program.category === 'kids-teens') return getKidsTeensContent(program, lang);
  return getGeneralContent(program, lang);
}

function getToeflContent(): CategoryContent {
  return {
    heroTagline: 'Hedef skorunuza stratejik yoldan ulaşın',
    flowTitle: 'TOEFL IBT Hazırlık Süreci',
    flowSubtitle: 'Her aşaması planlanmış, stratejik bir yolculuk.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'Tecrübeli Eğitmen' },
      { icon: null, value: 'Kişiye Özgü', label: 'Program' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Ders Formatı' },
      { icon: null, value: 'Gerçek Mocktestler', label: 'Sınav Simülasyonu' },
    ],
    whoIsItFor: {
      title: 'TOEFL IBT Hazırlık Kime Uygun?',
      items: [
        'Yurt dışı üniversite başvurusu planlayan öğrenciler',
        'Kariyer hedefleri için uluslararası sertifika arayan profesyoneller',
        'Akademik dil yetkinliğini belgelemek isteyenler',
        'Belirli bir skor hedefine kısa sürede ulaşmak isteyenler',
        'Daha önce TOEFL IBT sınavına girip hedef skorun altında kalanlar',
      ],
    },
    curriculum: {
      title: 'TOEFL IBT Müfredat Yapısı',
      modules: [
        { name: 'Diagnostik Değerlendirme', detail: 'Mevcut seviye tespiti, güçlü/zayıf yönlerin belirlenmesi ve kişisel hedef skorun netleştirilmesi' },
        { name: 'Modül Bazlı Derinlemesine Çalışma', detail: 'Her sınav modülü için ayrı strateji: soru tipi analizi, zaman yönetimi, örüntü tanıma' },
        { name: 'Speaking & Writing Atölyeleri', detail: 'Üretim becerilerine özel yoğun pratik — rubrik bazlı geri bildirim ve düzeltme döngüsü' },
        { name: 'Mock Sınavlar & Analiz', detail: 'Gerçek sınav koşullarında uygulama sınavları, ardından detaylı performans analizi' },
        { name: 'Son Sprint', detail: 'Sınav öncesi son 2 haftalık yoğunlaştırılmış tekrar, stres yönetimi ve strateji pekiştirme' },
      ],
    },
    faqs: [
      {
        q: 'Öğretmenleriniz TOEFL IBT konusunda tecrübeli mi?',
        a: 'Kesinlikle. TOEFL IBT hazırlık programımızda görev alan eğitmenlerimiz hem native speaker hem de TOEFL IBT sınav hazırlığında uzun yıllara dayanan deneyime sahiptir. Eğitmenlerimiz ETS\'nin yayımladığı güncellemeleri, yeni soru formatlarını ve değerlendirme kriterlerindeki değişiklikleri sürekli takip eder. Böylece siz her zaman en güncel stratejilerle hazırlanırsınız. Bir deneme seansıyla eğitmenlerimizi yakından tanıyabilirsiniz.',
        ctaType: 'trial',
      },
      {
        q: 'Mock sınavlar programa dahil mi?',
        a: 'Evet, program süresince düzenlenen tüm mock sınavlar ve performans analiz raporları programa dahildir. Gerçek sınav koşullarını birebir yansıtan mock testlerle kendinizi sınav gününe hazırlarsınız.',
      },
      {
        q: 'Writing ve Speaking skorumu kısa sürede artırabilir miyim?',
        a: 'Evet. Rubrik bazlı analiz ile hangi kriterlerde puan kaybettiğinizi tespit eder, o alana yoğunlaşırız. Integrated ve Independent Writing için ayrı strateji, Speaking için ise template ve zaman yönetimi çalışması yapılır.',
      },
    ],
  };
}

function getIeltsContent(): CategoryContent {
  return {
    heroTagline: 'Band skorunuzu stratejik çalışmayla maksimize edin',
    flowTitle: 'IELTS Hazırlık Süreci',
    flowSubtitle: 'Band descriptor odaklı, modül bazlı stratejik bir yolculuk.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'Tecrübeli Eğitmen' },
      { icon: null, value: 'Band Descriptor Odaklı', label: 'Strateji' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Ders Formatı' },
      { icon: null, value: 'Gerçek Mock Testler', label: 'Sınav Simülasyonu' },
    ],
    whoIsItFor: {
      title: 'IELTS Hazırlık Kime Uygun?',
      items: [
        'Yurt dışı üniversite başvurusu için IELTS skoru gereken öğrenciler',
        'Kanada, Avustralya veya İngiltere göç başvurusu yapanlar',
        'Akademik veya General Training modülünde hedef band skoru olanlar',
        'Speaking ve Writing modüllerinde skor artışı hedefleyenler',
        'Daha önce IELTS sınavına girip hedef bandın altında kalanlar',
      ],
    },
    curriculum: {
      title: 'IELTS Müfredat Yapısı',
      modules: [
        { name: 'Diagnostik Değerlendirme & Band Analizi', detail: 'Mevcut band seviyenizin tespiti, her modüldeki güçlü/zayıf yönlerin belirlenmesi ve hedef band skorun netleştirilmesi' },
        { name: 'Listening & Reading Stratejileri', detail: 'Soru tipi bazlı teknikler — matching, multiple choice, True/False/Not Given ve map/diagram labelling için sistematik yaklaşım' },
        { name: 'Writing Task 1 & Task 2 Atölyesi', detail: 'Task Achievement, Coherence & Cohesion, Lexical Resource ve Grammatical Range kriterlerine özel çalı��ma ve rubrik bazlı geri bildirim' },
        { name: 'Speaking Part 1-2-3 Pratiği', detail: 'Fluency, pronunciation ve lexical resource geliştirme — gerçek sınav formatında yoğun konuşma pratiği ve anında düzeltme' },
        { name: 'Mock Sınavlar & Son Sprint', detail: 'Tam format mock sınavlar, detaylı performans analizi ve sınav öncesi yoğunlaştırılmış strateji pekiştirme' },
      ],
    },
    faqs: [
      {
        q: 'IELTS Academic mi yoksa General Training mi almalıyım?',
        a: 'Üniversite başvurusu veya profesyonel kayıt için Academic, göç başvurusu için genellikle General Training tercih edilir. İlk görüşmede hedefinize göre doğru modülü birlikte belirleriz. Detaylı bilgi için iletişim formumuzu doldurabilirsiniz.',
        ctaType: 'contact' as const,
      },
      {
        q: 'Öğretmenleriniz IELTS konusunda tecrübeli mi?',
        a: 'Kesinlikle. IELTS hazırlık programımızda görev alan eğitmenlerimiz hem native speaker hem de IELTS sınav hazırlığında uzun yıllara dayanan deneyime sahiptir. Band descriptor kriterlerini, güncel sınav trendlerini ve Cambridge\'in yayımladığı değişiklikleri sürekli takip ederler. Bir deneme seansıyla eğitmenlerimizi yakından tanıyabilirsiniz.',
        ctaType: 'trial' as const,
      },
      {
        q: 'Speaking modülünde nasıl gelişebilirim?',
        a: 'Native speaker eğitmenle birebir, gerçek sınav formatında yoğun pratik yaparız. Part 2 cue card stratejileri, Part 3 tartışma teknikleri ve pronunciation çalışmalarıyla band skorunuzu yükseltiriz.',
      },
      {
        q: 'Mock sınavlar programa dahil mi?',
        a: 'Evet, program süresince düzenlenen tüm mock sınavlar ve performans analiz raporları programa dahildir. Gerçek sınav koşullarını birebir yansıtan tam format testlerle kendinizi sınav gününe hazırlarsınız.',
      },
      {
        q: 'Writing skorumu kısa sürede artırabilir miyim?',
        a: 'Evet. Band descriptor bazlı çalışma ile hangi kriterde puan kaybettiğinizi tespit eder, o alana yoğunlaşırız. Task 1 ve Task 2 için ayrı strateji ve template çalışması yapılır.',
      },
    ],
  };
}

function getPteContent(): CategoryContent {
  return {
    heroTagline: 'Bilgisayar tabanlı sınav formatına tam hakimiyet',
    flowTitle: 'PTE Academic Hazırlık Süreci',
    flowSubtitle: 'AI skorlama mantığına dayalı, stratejik bir yolculuk.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'Tecrübeli Eğitmen' },
      { icon: null, value: 'AI Skorlama Odaklı', label: 'Strateji' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Ders Formatı' },
      { icon: null, value: 'Gerçek Format Pratiği', label: 'Bilgisayar Tabanlı' },
    ],
    whoIsItFor: {
      title: 'PTE Academic Hazırlık Kime Uygun?',
      items: [
        'Avustralya, Yeni Zelanda veya İngiltere vizesi için PTE skoru gereken adaylar',
        'IELTS\'te istediği skoru alamayıp alternatif arayan öğrenciler',
        'Bilgisayar tabanlı sınav formatını tercih edenler',
        'Hızlı sonuç almak isteyenler (sonuçlar genellikle 48 saat içinde)',
        'Entegre beceri sorularında (Speaking & Writing birlikte) zorlanalar',
      ],
    },
    curriculum: {
      title: 'PTE Academic Müfredat Yapısı',
      modules: [
        { name: 'Diagnostik Test & Format Tanıma', detail: 'PTE Academic sınav formatının detaylı tanıtımı, mevcut seviye tespiti ve AI skorlama kriterlerinin açıklanması' },
        { name: 'Speaking & Writing Entegre Çalışma', detail: 'Read Aloud, Repeat Sentence, Describe Image, Summarize Written Text ve Essay — her soru tipi için ayrı strateji ve template' },
        { name: 'Reading & Listening Teknikleri', detail: 'Re-order Paragraphs, Fill in the Blanks, Highlight Correct Summary ve dikkat gerektiren Listening soru tipleri için sistematik yaklaşım' },
        { name: 'AI Skorlama Optimizasyonu', detail: 'PTE\'nin bilgisayar tabanlı değerlendirme kriterlerini anlama — pronunciation, oral fluency ve content skorlarını maksimize etme teknikleri' },
        { name: 'Mock Sınavlar & Son Sprint', detail: 'Tam format bilgisayar tabanlı mock sınavlar, skor analizi ve sınav öncesi yoğunlaştırılmış strateji pekiştirme' },
      ],
    },
    faqs: [
      {
        q: 'PTE Academic ile IELTS arasındaki fark nedir?',
        a: 'PTE tamamen bilgisayar tabanlıdır ve AI tarafından skorlanır. Sonuçlar genellikle 48 saat içinde açıklanır. Speaking modülü yüz yüze değil, mikrofona konuşarak yapılır. Hangi sınavın size uygun olduğunu birlikte değerlendirebiliriz.',
        ctaType: 'contact' as const,
      },
      {
        q: 'Öğretmenleriniz PTE Academic konusunda tecrübeli mi?',
        a: 'Kesinlikle. PTE Academic hazırlık programımızda görev alan eğitmenlerimiz hem native speaker hem de PTE\'nin bilgisayar tabanlı formatında uzun yıllara dayanan deneyime sahiptir. AI skorlama kriterlerini, Pearson\'ın yayımladığı güncellemeleri ve soru tipi değişikliklerini sürekli takip ederler. Bir deneme seansıyla eğitmenlerimizi yakından tanıyabilirsiniz.',
        ctaType: 'trial' as const,
      },
      {
        q: 'PTE\'nin AI skorlama sistemi nasıl çalışıyor?',
        a: 'PTE, yapay zeka kullanarak pronunciation, oral fluency, grammar, spelling ve content gibi kriterleri değerlendirir. Bu sistemi anlayarak stratejinizi optimize ederiz. İnsan faktörü olmadığı için skorlama tamamen tutarlıdır; bu da doğru stratejiyle öngörülebilir sonuçlar almanızı sağlar.',
      },
      {
        q: 'Mock sınavlar programa dahil mi?',
        a: 'Evet, program süresince düzenlenen tüm mock sınavlar ve performans analiz raporları programa dahildir. Gerçek sınav ortamını birebir yansıtan bilgisayar tabanlı testlerle kendinizi sınav gününe hazırlarsınız.',
      },
      {
        q: 'Hangi soru tipleri en çok puan getirir?',
        a: 'PTE\'de bazı soru tipleri birden fazla beceriyi aynı anda skorlar. Örneğin Read Aloud hem Speaking hem Reading skorunuza katkı sağlar. Bu çapraz skorlama mantığını öğrenerek stratejik avantaj elde edersiniz.',
      },
    ],
  };
}

function getEnGrupContent(): CategoryContent {
  return {
    heroTagline: 'Native speaker eğitmenlerle yüz yüze, %85\'i konuşma pratiğine dayalı grup dersleri. Teachera Teaching Method ile günlük hayatta en çok ihtiyaç duyulan yapıları gerçek diyaloglar içinde öğrenirsiniz.',
    flowTitle: 'Teachera Teaching Method',
    flowSubtitle: 'Her ders boyunca kesintisiz dönen bu döngü, bilgiyi reflekse çevirir.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'Amerikalı İngiliz' },
      { icon: null, value: 'Teachera Teaching Method', label: 'Standardize Metod' },
      { icon: null, value: 'Maks. 10 Kişi', label: 'Güçlü Topluluk' },
      { icon: null, value: 'V.I.P Sınıflar', label: 'Kule Plaza' },
    ],
    whoIsItFor: {
      title: 'Bu Program Kime Uygun?',
      items: [
        'İngilizce öğrenmeye sıfırdan başlamak isteyenler',
        'Mevcut seviyesini geliştirmek isteyenler',
        'Geleneksel yöntemlerle İngilizce öğrenip konuşamayanlar',
        'Seyahat, kültür veya kişisel gelişim amacıyla dil öğrenmek isteyenler',
        'Sosyal ortam, grup enerjisinden ve akran öğrenmesinden motivasyon alanlar',
      ],
    },
    curriculum: {
      title: 'Program Yapısı',
      modules: [
        { name: 'Seviye Değerlendirmesi & Yerleştirme', detail: 'Öncelikle seviye değerlendirmesi, hedef belirleme yapılır. Öğrenci seviyesine uygun gruba yerleştirilir.' },
        { name: 'Müfredat', detail: 'Günlük hayatta en sık kullanılan kalıplar, diyaloglar ve pratik senaryolar üzerinden ilerleme sağlanır.' },
        { name: 'Kültürel Keşif', detail: 'Native Speaker öğretmenler sayesinde, İngilizce konuşulan ülkelerin kültürü, gelenekleri ve günlük yaşamına dair kültürel eğitim.' },
        { name: 'Aksan', detail: 'Native Speaker eğitmenler sayesinde doğal aksan.' },
        { name: 'Sosyal Ortam', detail: 'Speaking Cafe, Teachera Language Lab\'ler ile dili doğal, keyifli, akıcı hale getirme.' },
        { name: 'Güçlü Network', detail: 'Teachera Community ile güçlü network. Language Lab\'ler ile sınıfınızda olmayan, sizinle aynı ilgi alanlarına sahip insanlarla tanışma fırsatı. Hem eğlen, hem öğren, hem network.' },
      ],
    },
    faqs: [
      {
        q: 'Öğrenmek istediğim dili hiç bilmiyorum. Eğitimlerinize katılabilir miyim?',
        a: 'Evet, herhangi bir dil altyapısına sahip olmanız gerekmez. Dersler oldukça basit yapılarla başlar; kendinizi öğretmeninize teslim ettiğinizde nasıl öğrendiğinizi siz de fark edeceksiniz.',
        ctaType: 'trial',
      },
      {
        q: 'Derslerde Türkçe kullanılmıyor, nasıl anlayacağız?',
        a: 'Eğitmenlerimiz metodoloji eğitimlerine tabidir. Derslerde beden dili, illüstrasyonlar ve görsel materyaller yoğun olarak kullanılır. Bu sayede anadil kullanımından uzak durularak "öğrenme engelleri" önlenir.',
        ctaType: 'trial',
      },
      {
        q: 'Eğitmenlerinizin yeterliliğinden nasıl emin olabilirim?',
        a: 'Eğitmenlerimiz dil öğretmenliği, metodoloji ve dil bilimi gibi alanlarda eğitim almış, deneyim sahibidir. Ayrıca sürekli olarak bilgi ve becerilerini geliştirmek için iç eğitimlere tabidirler.',
        ctaType: 'trial',
      },
      {
        q: 'Tüm dersler konuşma üzerine mi kurulu?',
        a: "Derslerin %85'i konuşma pratiğiyle geçer. Ancak bu sadece serbest sohbet değil; bilimsel ve sistematik bir yöntemle yapılandırılmış derslerdir. Okuma, yazma, anlama ve konuşma becerileri bir bütün olarak geliştirilir.",
        ctaType: 'trial',
      },
      {
        q: 'Grup eğitiminde katılımcılar nasıl seçiliyor?',
        a: 'Katılımcılar dil seviyeleri, yaş grupları ve aldıkları eğitim paketlerine göre gruplanır. Böylece her grup benzer ihtiyaçlara sahip bireylerden oluşur.',
      },
      {
        q: 'Grup ders saatleri nasıl ayarlanır?',
        a: 'Tüm katılımcıların uygun olduğu saatler dikkate alınarak haftada 3 gün, her gün 2 ders saati olacak şekilde planlama yapılır.',
      },
      {
        q: 'Grup dersleri ertelenebilir mi?',
        a: 'Hayır, grup dersleri belirlenen plana göre yapılır ve ertelenemez.',
      },
    ],
  };
}

function getYdsContent(): CategoryContent {
  return {
    heroTagline: 'Akademik kariyeriniz için stratejik YDS / YÖKDİL hazırlığı',
    flowTitle: 'YDS / YÖKDİL Hazırlık Süreci',
    flowSubtitle: 'Gramer, kelime ve okuma — stratejik bir yolculuk.',
    quickStats: [
      { icon: null, value: 'Uzman Eğitmen', label: 'YDS/YÖKDİL Deneyimli' },
      { icon: null, value: 'Soru Tipi Bazlı', label: 'Stratejik Çalışma' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
      { icon: null, value: 'Tam Format Denemeler', label: 'Gerçek Sınav Koşulu' },
    ],
    whoIsItFor: {
      title: 'YDS / YÖKDİL Hazırlık Kime Uygun?',
      items: [
        'Doçentlik başvurusu için YDS puanı gereken akademisyenler',
        'Yüksek lisans veya doktora başvurusu yapan araştırma görevlileri',
        'Kamuda yabancı dil tazminatı almak isteyen memurlar',
        'YÖKDİL ile alan bazlı İngilizce yetkinliğini belgelemek isteyenler',
        'Daha önce sınava girip hedef puanın altında kalanlar',
      ],
    },
    curriculum: {
      title: 'YDS / YÖKDİL Müfredat Yapısı',
      modules: [
        { name: 'Diagnostik Test & Puan Analizi', detail: 'Mevcut seviye tespiti, soru tipi bazlı performans analizi ve hedef puanın netleştirilmesi' },
        { name: 'Gramer Stratejileri', detail: 'Cümle tamamlama, paragraf tamamlama ve çeviri sorularına özel gramer kalıpları ve çözüm teknikleri' },
        { name: 'Akademik Kelime Hazinesi', detail: 'YDS/YÖKDİL\'de sıklıkla çıkan akademik kelimeler, eş/zıt anlam stratejileri ve bağlamdan anlam ��ıkarma' },
        { name: 'Okuma Anlama Teknikleri', detail: 'Paragraf soruları, ana fikir, yardımcı fikir ve çıkarım soruları için sistematik okuma stratejileri' },
        { name: 'Deneme Sınavları & Son Sprint', detail: 'Tam format deneme sınavları, zaman yönetimi pratiği ve sınav öncesi yoğunlaştırılmış strateji pekiştirme' },
      ],
    },
    faqs: [
      { q: 'YDS ile YÖKDİL arasındaki fark nedir?', a: 'YDS genel İngilizce yetkinliğini ölçerken, YÖKDİL alan bazlı (Fen Bilimleri, Sosyal Bilimler, Sağlık Bilimleri) akademik İngilizce yetkinliğini ölçer. Hedefinize göre hangisinin size uygun olduğunu birlikte belirleriz.', ctaType: 'contact' as const },
      { q: 'Eğitmenleriniz YDS/YÖKDİL konusunda deneyimli mi?', a: 'Kesinlikle. YDS/YÖKDİL hazırlık programımızda görev alan eğitmenlerimiz ÖSYM sınav formatına ve soru tipilerine hakim, uzun yıllara dayanan deneyime sahiptir. Bir deneme seansıyla yakından tanışabilirsiniz.', ctaType: 'trial' as const },
      { q: 'Online hazırlık yeterli mi?', a: 'Kesinlikle. Online derslerimiz yüz yüze ile birebir aynı kalitede sunulur. Ekran paylaşımı ile soru çözümü, anında geri bildirim ve deneme sınavı analizi online ortamda çok etkili.' },
    ],
  };
}

function getBusinessContent(): CategoryContent {
  return {
    heroTagline: 'İş dünyasının dilini, konuşarak öğrenin',
    flowTitle: 'Business English Süreci',
    flowSubtitle: 'İş iletişiminizi uluslararası standartlara taşıyın.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'Tecrübeli Eğitmen' },
      { icon: null, value: 'Sektörel İçerik', label: 'Kişiye Özel Müfredat' },
      { icon: null, value: 'Boardroom Simülasyonu', label: 'Gerçekçi Senaryolar' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
    ],
    whoIsItFor: {
      title: 'Business English Kime Uygun?',
      items: [
        'Uluslararası toplantılarda İngilizce sunum yapan veya yapacak yöneticiler',
        'Yabancı müşteri ve partnerlerle müzakere yürüten profesyoneller',
        'Global şirketlerde İngilizce iş yazışması yapan çalışanlar',
        'Yurt dışı kariyer planlaması yapan iş dünyası profesyonelleri',
        'Şirket içi terfi veya uluslararası atama hedefleyenler',
      ],
    },
    curriculum: {
      title: 'Business English Program Yapısı',
      modules: [
        { name: 'İhtiyaç Analizi & Profil Oluşturma', detail: 'Günlük iş iletişiminiz, sektörünüz ve pozisyonunuz üzerinden tamamen kişiselleştirilmiş müfredat tasarımı' },
        { name: 'Meeting & Negotiation', detail: 'Toplantı yönetimi, gündem oluşturma, müzakere teknikleri ve diplomatik dil — gerçek senaryolarla pratik' },
        { name: 'Presentation & Public Speaking', detail: 'İngilizce sunum yapma, storytelling, veri sunumu ve Q&A yönetimi — birebir canlandırma' },
        { name: 'Professional Writing', detail: 'E-posta, rapor, teklif ve memo yazımı — profesyonel ton ve format, düzeltme döngüsü' },
        { name: 'Networking & Small Talk', detail: 'İş yemekleri, networking etkinlikleri ve spontan konuşma becerileri — kültürel nüanslar ve etiquette' },
      ],
    },
    faqs: [
      { q: 'Genel seviyem düşük, Business English programına katılabilir miyim?', a: 'Business English programlarımız minimum B1 seviyesi gerektirir. Daha düşük seviyelerde önce Genel İngilizce ile temel oluşturup ardından Business English\'e geçiş yapabilirsiniz.', ctaType: 'contact' as const },
      { q: 'Derslerde kendi iş dokümanlarımı kullanabilir miyim?', a: 'Kesinlikle! Gerçek e-postalar, raporlar ve sunumlarınız üzerinde çalışmak programın en etkili parçalarından biridir. Eğitmeniniz içeriği sizin dünyadan besler.', ctaType: 'trial' as const },
      { q: 'Kurumsal gruplar için özel paketler var mı?', a: 'Evet, şirketlere özel kurumsal paketlerimiz mevcuttur. Departman bazlı, yönetici ekibi veya tüm şirket çalışanları için farklı formatlar sunuyoruz. Detaylı bilgi ve teklif için kurumsal sayfamızı inceleyebilirsiniz.', ctaType: 'kurumsal' as const },
    ],
  };
}

function getMarketingContent(): CategoryContent {
  return {
    heroTagline: 'Küresel pazarlama sahnesine hazır olun',
    flowTitle: 'Marketing English Süreci',
    flowSubtitle: 'Kampanyanızı küresel dilde konuşturun.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'Sektör Deneyimli' },
      { icon: null, value: 'Kampanya Simülasyonu', label: 'Gerçek Case\'ler' },
      { icon: null, value: 'Storytelling & Pitch', label: 'Sunum Becerileri' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
    ],
    whoIsItFor: {
      title: 'Marketing Management Kime Uygun?',
      items: [
        'Global marka yöneticileri ve pazarlama direktörleri',
        'Uluslararası agency\'lerle çalışan dijital pazarlama uzmanları',
        'Kampanya sunumlarını İngilizce yapması gereken kreatif ekipler',
        'Content marketing ve brand strategy alanında uluslararası kariyer hedefleyenler',
        'Küresel pazarlara açılmak isteyen girişimciler',
      ],
    },
    curriculum: {
      title: 'Marketing Management Program Yapısı',
      modules: [
        { name: 'Marketing Lingo', detail: 'ROI, KPI, funnel, conversion, brand equity — pazarlama jargonuna tam hakimiyet. Gerçek kampanya case\'leri üzerinden çalışma' },
        { name: 'Campaign Pitch & Storytelling', detail: 'Kampanya sunumu hazırlama, storytelling teknikleri ve ikna edici sunum yapma — birebir canlandırma' },
        { name: 'Digital Marketing English', detail: 'SEO, SEM, social media, influencer marketing terminolojisi. Analytics raporlama ve performans sunumu' },
        { name: 'Brand Strategy Communication', detail: 'Marka konumlandırma, consumer insight sunumu ve rekabet analizi — stratejik dil ve profesyonel ton' },
        { name: 'Global Team Collaboration', detail: 'Uluslararası ekip toplantıları, proje yönetimi ve cross-cultural iletişim becerileri' },
      ],
    },
    faqs: [
      { q: 'Dijital pazarlama terminolojisi de dahil mi?', a: 'Kesinlikle. SEO, SEM, social media, content marketing, data analytics gibi dijital pazarlama terminolojisi programın önemli bir parçasıdır.', ctaType: 'trial' as const },
      { q: 'Sunumlarımı program içinde prova edebilir miyim?', a: 'Evet! Gerçek kampanya sunumlarınızı eğitmeninizle birlikte prova eder, geri bildirim alır ve geliştirilmiş versiyonunu tekrar sunarsınız.' },
      { q: 'Genel İngilizce seviyem orta. Katılabilir miyim?', a: 'Minimum B1 seviyesi önerilir. Seviyenizi belirlemek için ücretsiz deneme seansı ile başlayabilirsiniz.', ctaType: 'trial' as const },
    ],
  };
}

function getFinanceContent(): CategoryContent {
  return {
    heroTagline: 'Finans dünyasının dilini İngilizce konuşun',
    flowTitle: 'Finance English Süreci',
    flowSubtitle: 'Rakamları doğru anlatmak, doğru kelimelerle başlar.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'Finans Deneyimli' },
      { icon: null, value: 'Earnings Call Pratiği', label: 'Gerçek Simülasyon' },
      { icon: null, value: 'Raporlama Dili', label: 'Finansal Terminoloji' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
    ],
    whoIsItFor: {
      title: 'Finance & Industry Kime Uygun?',
      items: [
        'Uluslararası yatırımcılarla iletişim kuran finans profesyonelleri',
        'Finansal raporlama ve sunum yapan CFO ve finans müdürleri',
        'Global denetim firmalarında çalışan veya çalışmak isteyen denetçiler',
        'Risk analizi ve yönetimi alanında İngilizce raporlama yapanlar',
        'Bankacılık ve sermaye piyasasında uluslararası kariyer hedefleyenler',
      ],
    },
    curriculum: {
      title: 'Finance & Industry Program Yapısı',
      modules: [
        { name: 'Financial Terminology', detail: 'P&L, EBITDA, cash flow, hedge, yield, portfolio — finans jargonuna gerçek raporlar üzerinden hakimiyet' },
        { name: 'Financial Reporting & Analysis', detail: 'İngilizce finansal rapor okuma, yazma ve sunma. Yatırımcı ilişkileri ve board raporlama formatları' },
        { name: 'Earnings Call & Investor Relations', detail: 'Yatırımcı sunumu hazırlama ve sunma. Q&A yönetimi, forward-looking statements ve disclaimer dili' },
        { name: 'Negotiation & Deal Making', detail: 'M&A müzakereleri, kredi anlaşmaları ve partnership görüşmeleri — finansal müzakere terminolojisi' },
        { name: 'Regulatory & Compliance', detail: 'Uluslararası düzenleme terminolojisi, compliance raporlama ve audit iletişimi' },
      ],
    },
    faqs: [
      { q: 'Hangi finans alanlarını kapsıyor?', a: 'Bankacılık, yatırım, sigorta, denetim, risk yönetimi ve kurumsal finans gibi tüm alt alanları kapsıyoruz. Müfredat tamamen sizin sektörünüze özelleştirilir.', ctaType: 'trial' as const },
      { q: 'CFA veya ACCA gibi sertifika hazırlığına da yardımcı olur mu?', a: 'Doğrudan sertifika hazırlığı yapmıyoruz, ancak finansal İngilizce terminoloji hakimiyeti bu sınavlarda büyük avantaj sağlar.' },
      { q: 'Kendi şirketimdeki gerçek raporları kullanabilir miyim?', a: 'Kesinlikle! Gerçek finansal raporlarınız ve sunumlarınız üzerinde çalışmak en etkili yöntemdir.' },
    ],
  };
}

function getLegalContent(): CategoryContent {
  return {
    heroTagline: 'Uluslararası hukuk arenasında güvenle konuşun',
    flowTitle: 'Legal English Süreci',
    flowSubtitle: 'Hukukta her kelime bağlayıcıdır — doğru dil, güçlü pozisyon.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'Hukuk Deneyimli' },
      { icon: null, value: 'Sözleşme Analizi', label: 'Gerçek Dokümanlar' },
      { icon: null, value: 'Müzakere Simülasyonu', label: 'Courtroom Pratiği' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
    ],
    whoIsItFor: {
      title: 'Legal English Kime Uygun?',
      items: [
        'Uluslararası hukuk firmalarında çalışan veya çalışmak isteyen avukatlar',
        'M&A, fikri mülkiyet veya ticaret hukuku alanında uluslararası iş yapanlar',
        'Yabancı müvekkillere hizmet veren hukuk büroları',
        'ICC veya LCIA tahkim süreçlerine katılan tahkim avukatları',
        'Hukuk fakültesi öğrencileri ve LLM adayları',
      ],
    },
    curriculum: {
      title: 'Legal English Program Yapısı',
      modules: [
        { name: 'Legal Terminology Foundation', detail: 'Sözleşme hukuku, şirketler hukuku, fikri mülkiyet ve uluslararası ticaret temel terminolojisi' },
        { name: 'Contract Drafting & Analysis', detail: 'İngilizce sözleşme okuma, analiz etme ve madde yazımı. Boilerplate clause\'lar ve özel hükümler' },
        { name: 'Legal Negotiation & Advocacy', detail: 'Müzakere masası simülasyonları, hukuki argüman sunma ve karşı taraf analizi' },
        { name: 'Legal Writing & Correspondence', detail: 'Hukuki görüş yazımı (legal opinion), müvekkil yazışmaları ve mahkeme dokümanları' },
        { name: 'Arbitration & Dispute Resolution', detail: 'Uluslararası tahkim terminolojisi, duruşma simülasyonu ve expert witness iletişimi' },
      ],
    },
    faqs: [
      { q: 'Hangi hukuk alanlarını kapsıyor?', a: 'Sözleşme hukuku, şirketler hukuku, fikri mülkiyet, uluslararası ticaret, tahkim ve insan hakları gibi tüm ana alanları kapsıyoruz. Müfredat sizin uzmanlık alanınıza göre şekillenir.', ctaType: 'trial' as const },
      { q: 'Eğitmenler hukuk terminolojisine hakim mi?', a: 'Eğitmenlerimiz hukuki İngilizce alanında özel eğitim almış native speaker\'lardır. Sözleşme dili, tahkim terminolojisi ve mahkeme İngilizcesine hakimdirler.', ctaType: 'trial' as const },
      { q: 'LLM başvurusu için de faydalı mı?', a: 'Kesinlikle. Legal English programı, LSAT/GRE hazırlığı olmasa da akademik hukuki İngilizce yetkinliğinizi güçlendirir ve SOP/essay yazımında avantaj sağlar.' },
    ],
  };
}

function getMedicalContent(): CategoryContent {
  return {
    heroTagline: 'Tıbbın uluslararası dilini konuşarak öğrenin',
    flowTitle: 'Medical English Süreci',
    flowSubtitle: 'Tıpta iletişim, tedavinin bir parçasıdır.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'Tıp Deneyimli' },
      { icon: null, value: 'Clinical Senaryolar', label: 'Vaka Simülasyonu' },
      { icon: null, value: 'Kongre Hazırlığı', label: 'Sunum & Poster' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
    ],
    whoIsItFor: {
      title: 'Medical English Kime Uygun?',
      items: [
        'Uluslararası kongrelerde sunum yapan veya yapacak hekimler',
        'Akademik makale yazımında İngilizce desteğe ihtiyaç duyan araştırmacılar',
        'Yurt dışında çalışmak isteyen sağlık profesyonelleri (USMLE, Plab vb.)',
        'İlaç sektöründe uluslararası iletişim kuran farmakoloji uzmanları',
        'Tıp fakültesi öğrencileri ve asistanlar',
      ],
    },
    curriculum: {
      title: 'Medical English Program Yapısı',
      modules: [
        { name: 'Medical Terminology Foundation', detail: 'Anatomi, fizyoloji, farmakoloji ve patoloji temel terminolojisi — Latince/Yunanca köklerle sistematik öğrenme' },
        { name: 'Patient Communication', detail: 'Hasta anamnezi alma, fizik muayene dili, tedavi planı açıklama ve informed consent — klinik senaryo simülasyonları' },
        { name: 'Academic Medical Writing', detail: 'Abstract, case report, makale yazımı ve reviewer yanıtları — akademik İngilizce yazım kuralları ve format' },
        { name: 'Conference Presentation', detail: 'Oral sunum, poster sunumu ve Q&A yönetimi — uluslararası kongre simülasyonu' },
        { name: 'Specialty-Specific Module', detail: 'Uzmanlık alanınıza özel terminoloji ve senaryo çalışması — kardiyoloji, nöroloji, ortopedi vb.' },
      ],
    },
    faqs: [
      { q: 'Hangi tıp dallarını kapsıyor?', a: 'Tüm ana uzmanlık dallarını kapsıyoruz. Müfredat tamamen sizin uzmanlık alanınıza göre özelleştirilir — kardiyoloji, nöroloji, ortopedi, onkoloji, psikiyatri vb.', ctaType: 'trial' as const },
      { q: 'USMLE/Plab hazırlığına da yardımcı olur mu?', a: 'Doğrudan sınav hazırlığı yapmıyoruz ancak Medical English, bu sınavlardaki klinik senaryo ve iletişim sorularında büyük avantaj sağlar.' },
      { q: 'Kongre sunumumu program içinde prova edebilir miyim?', a: 'Kesinlikle! Gerçek sunumunuzu eğitmeninizle birlikte prova eder, pronunciation ve akıcılık üzerinde çalışır, Q&A pratiği yaparsınız.' },
    ],
  };
}

function getEnOnlineGrupContent(): CategoryContent {
  return {
    heroTagline: 'Nerede olursanız olun — Teachera Teaching Method enerjisini online yaşayın',
    flowTitle: 'Teachera Teaching Method',
    flowSubtitle: 'Her ders boyunca kesintisiz dönen bu döngü, bilgiyi reflekse çevirir.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'Amerikalı İngiliz' },
      { icon: null, value: 'Teachera Teaching Method', label: 'Standardize Metod' },
      { icon: null, value: 'Maks. 10 Kişi', label: 'Küçük Grup' },
      { icon: null, value: 'Her Yerden Katıl', label: 'Online Canlı' },
    ],
    whoIsItFor: {
      title: 'Online Grup Programı Kime Uygun?',
      items: [
        'Konya dışında yaşayıp Teachera kalitesinden faydalanmak isteyenler',
        'Yoğun iş temposuyla yüz yüze derslere gidemeyenler',
        'Esnek ders saatleri arayanlar',
        'Evinden veya ofisinden katılım tercih edenler',
        'Grup enerjisinden motivasyon alıp online ortamda rahat hissedenler',
      ],
    },
    curriculum: {
      title: 'Online Grup Program Yapısı',
      modules: [
        { name: 'Seviye Değerlendirmesi & Yerleştirme', detail: 'Online seviye değerlendirmesi, hedef belirleme ve seviyeye uygun gruba yerleştirme' },
        { name: 'Canlı İnteraktif Dersler', detail: 'Teachera Teaching Method ile %85 konuşma pratiği — ekran karşısında bile grup enerjisi ve etkileşim' },
        { name: 'Kültürel Keşif', detail: 'Native Speaker eğitmenlerle İngilizce konuşulan ülkelerin kültürü, gelenekleri ve günlük yaşamı' },
        { name: 'Doğal Aksan Geliştirme', detail: 'Amerikalı ve İngiliz eğitmenler sayesinde doğal aksan ve telaffuz çalışması' },
        { name: 'Düzenli Değerlendirme', detail: 'Periyodik ilerleme testleri, bireysel geri bildirim ve seviye atlama değerlendirmesi' },
      ],
    },
    faqs: [
      { q: 'Öğrenmek istediğim dili hiç bilmiyorum. Eğitimlerinize katılabilir miyim?', a: 'Evet, herhangi bir dil altyapısına sahip olmanız gerekmez. Dersler oldukça basit yapılarla başlar; kendinizi öğretmeninize teslim ettiğinizde nasıl öğrendiğinizi siz de fark edeceksiniz.', ctaType: 'trial' as const },
      { q: 'Derslerde Türkçe kullanılmıyor, nasıl anlayacağız?', a: 'Eğitmenlerimiz metodoloji eğitimlerine tabidir. Derslerde beden dili, illüstrasyonlar ve görsel materyaller yoğun olarak kullanılır. Bu sayede anadil kullanımından uzak durularak "öğrenme engelleri" önlenir.', ctaType: 'trial' as const },
      { q: 'Online dersler yüz yüze kadar etkili mi?', a: 'Kesinlikle. Teachera Teaching Method online ortamda da birebir aynı kalitede uygulanır. Küçük grup yapısı sayesinde her öğrenci yeterli konuşma süresi alır.', ctaType: 'trial' as const },
      { q: 'Teknik gereksinimler neler?', a: 'Stabil internet bağlantısı, bilgisayar veya tablet ve kulaklık yeterli.', ctaType: 'trial' as const },
      { q: 'Ders saatleri nasıl ayarlanıyor?', a: 'Tüm katılımcıların uygun olduğu saatler belirlenir. Hafta içi akşam ve hafta sonu seçenekleri mevcuttur.' },
    ],
  };
}

function getEnOzelContent(): CategoryContent {
  return {
    heroTagline: 'Tamamen size özel müfredat, kendi temponuzda ilerleme',
    flowTitle: 'Teachera Teaching Method',
    flowSubtitle: 'Her ders boyunca kesintisiz dönen bu döngü, bilgiyi reflekse çevirir.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'Amerikalı İngiliz' },
      { icon: null, value: '%100 Kişiye Özel', label: 'Müfredat' },
      { icon: null, value: 'Birebir', label: 'Özel Ders' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
    ],
    whoIsItFor: {
      title: 'İngilizce Özel Ders Kime Uygun?',
      items: [
        'Kendi temposunda, birebir ilerleme tercih edenler',
        'Spesifik bir hedefe (seyahat, kariyer, sınav) kısa sürede ulaşmak isteyenler',
        'Yoğun iş temposuyla esnek ders saati arayanlar',
        'Konuşma özgüvenini grup ortamına girmeden geliştirmek isteyenler',
        'Belirli bir konuya (akademik yazım, sunum, aksan) odaklanmak isteyenler',
      ],
    },
    curriculum: {
      title: 'Özel Ders Program Yapısı',
      modules: [
        { name: 'Detaylı İhtiyaç Analizi', detail: 'Hedefleriniz, öğrenme stiliniz ve mevcut seviyeniz üzerinden tamamen kişiselleştirilmiş müfredat tasarımı' },
        { name: 'Kişisel Yol Haritası', detail: 'Haftalık ve aylık hedefler, milestone\'lar ve ilerleme ölçütleri ile net bir yol haritası' },
        { name: 'Yoğun Konuşma Pratiği', detail: 'Teachera Teaching Method ile %85 konuşma pratiği — tamamen sizin ilgi alanlarınız ve hedefleriniz üzerinden' },
        { name: 'Anında Düzeltme & Geri Bildirim', detail: 'Her hatanız anında düzeltilir, doğrusu kurdurulur. Birebir ilgi ile gelişiminiz hızlanır' },
        { name: 'Esnek İlerleme', detail: 'Hızlı ilerlemek mi istiyorsunuz, yavaş ve derin mi? Tempoyu siz belirlersiniz, eğitmen uyum sağlar' },
      ],
    },
    faqs: [
      { q: 'Öğrenmek istediğim dili hiç bilmiyorum. Eğitimlerinize katılabilir miyim?', a: 'Evet, herhangi bir dil altyapısına sahip olmanız gerekmez. Dersler oldukça basit yapılarla başlar; kendinizi öğretmeninize teslim ettiğinizde nasıl öğrendiğinizi siz de fark edeceksiniz.', ctaType: 'trial' as const },
      { q: 'Özel ders ile grup dersi arasındaki fark nedir?', a: 'Özel ders, adı üzerinde, her detayıyla size özel tasarlanan bir eğitimdir. İhtiyaçlarınız, hedefiniz, mevcut seviyeniz, zaman planınız ve öğrenme tarzınız dikkate alınarak size özgü bir program kurgulanır. İsterseniz ders yoğunluğunu artırabilir, isterseniz daha esnek ilerleyebilir; ders gün ve saatlerini kendi takviminize göre belirleyebilirsiniz. Hatta odaklanmak istediğiniz alanı siz seçersiniz: konuşma akıcılığı, iş İngilizcesi, sınav hazırlığı, telaffuz, yazma…', ctaType: 'trial' as const },
      { q: 'Belirli bir konuya odaklanabilir miyim?', a: 'Kesinlikle. İş İngilizcesi, aksan çalışması, akademik yazım, seyahat İngilizcesi gibi spesifik alanlara yoğunlaşabilirsiniz.', ctaType: 'trial' as const },
    ],
  };
}

function getMiniKidsContent(): CategoryContent {
  return {
    heroTagline: 'Çocuğunuz eğlenirken, farkında bile olmadan İngilizce\'yi içselleştirsin',
    flowTitle: 'Mini Kids Öğrenme Döngüsü',
    flowSubtitle: 'Merakla başlar, oyunla büyür.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'Çocuk Eğitimcisi' },
      { icon: null, value: '4-6 Yaş', label: 'Özel Tasarım' },
      { icon: null, value: 'Oyun Temelli', label: 'Doğal Edinim' },
      { icon: null, value: 'Yüz Yüze', label: 'Küçük Grup' },
    ],
    whoIsItFor: {
      title: 'Mini Kids Programı Kimlere Uygun?',
      items: [
        'İngilizce ile ilk kez tanışacak 4-6 yaş arası çocuklar',
        'Erken yaşta dil eğitiminin önemini bilen ebeveynler',
        'Çocuklarının erkenden akıcı bir yabancı dil konuşmasını isteyen aileler',
        'Çocuğunun yabancı dili doğal yollarla, baskısız öğrenmesini isteyen veliler',
        'Yurt dışı eğitim planı olan ailelerin çocukları',
      ],
    },
    curriculum: {
      title: 'Mini Kids Öğrenme Yolculuğu',
      modules: [
        { name: 'Duyusal Tanışma', detail: 'Renkler, şekiller, sayılar ve hayvanlarla duyusal deneyim. Müzik, dans ve dokunsal aktivitelerle ilk bağ kurma' },
        { name: 'Oyun Dünyası', detail: 'Rol yapma oyunları, kukla tiyatrosu ve yaratıcı el işleriyle kelime hazinesini farkında olmadan genişletme' },
        { name: 'Hikaye Zamanı', detail: 'Resimli hikaye okuma, karakter canlandırma ve basit diyalog pratiği. İlk cümlelerin temeli burada atılır' },
        { name: 'Müzik & Hareket', detail: 'İngilizce şarkılar, dans ve ritim aktiviteleriyle dil ve müzik becerisini birlikte geliştirme' },
        { name: 'Mini Proje', detail: 'Her modül sonunda küçük sunum, poster veya kısa video projesiyle öğrenilenleri sergileme ve özgüven pekiştirme' },
      ],
    },
    faqs: [
      { q: '4 yaş erken değil mi?', a: 'Tam aksine! Araştırmalar 3-7 yaş arasının dil edinimi için kritik dönem olduğunu gösteriyor. Bu yaşta dil, ana dil gibi doğal yollarla edinilir — gramer kuralı ezberlemeden. Bir deneme dersiyle farkı görebilirsiniz.', ctaType: 'trial' as const },
      { q: 'Çocuğum eğitmeni anlamayacak diye endişeleniyorum', a: 'Eğitmenlerimiz çocuk gelişimi eğitimi almış native speaker\'lardır. Beden dili, görseller, müzik ve oyunlarla iletişim kurarlar. İlk dersten itibaren çocuğunuz eğlenmeye başlayacak.', ctaType: 'trial' as const },
      { q: 'Ders süreleri ne kadar?', a: '4-6 yaş grubunun dikkat sürelerine uygun olarak 30-40 dakikalık kısa seanslar planlanır. Her seans farklı aktivitelerle zenginleştirilir.' },
      { q: 'Gelişimi nasıl takip edebilirim?', a: 'Her modül sonunda veli bilgilendirme raporu, dönem sonunda mini sunum/gösteri ve istendiğinde eğitmenle görüşme imkanı sunuyoruz.' },
      { q: 'Online seçenek var mı?', a: '4-6 yaş grubu için yüz yüze format önerilir. Bu yaşta fiziksel etkileşim, hareket ve duyusal deneyim öğrenmenin temelidir.' },
    ],
  };
}

function getDeleContent(lang: string): CategoryContent {
  return {
    heroTagline: 'Instituto Cervantes onaylı sınav formatına tam hakimiyet',
    flowTitle: 'DELE / SIELE Hazırlık Süreci',
    flowSubtitle: 'İspanyolca yetkinliğinizi uluslararası sertifikayla taçlandırın.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'İspanyol Eğitmen' },
      { icon: null, value: 'Cervantes Formatı', label: 'Sınav Odaklı' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
      { icon: null, value: 'Mock Sınavlar', label: 'Gerçek Koşulda' },
    ],
    whoIsItFor: {
      title: 'DELE / SIELE Hazırlık Kime Uygun?',
      items: [
        'İspanya veya Latin Amerika\'da üniversite başvurusu planlayan öğrenciler',
        'İspanyolca dil yetkinliğini uluslararası sertifika ile belgelemek isteyenler',
        'İspanyol vatandaşlığı başvurusu için DELE A2 sertifikası gerekenler',
        'Kariyer hedefleri için İspanyolca sertifika arayan profesyoneller',
        'Daha önce sınava girip hedef seviyenin altında kalanlar',
      ],
    },
    curriculum: {
      title: 'DELE / SIELE Müfredat Yapısı',
      modules: [
        { name: 'Diagnostik Test & Seviye Belirleme', detail: 'Mevcut İspanyolca seviyenizin tespiti ve hedef DELE/SIELE seviyesinin netleştirilmesi' },
        { name: 'Comprensión de Lectura & Auditiva', detail: 'Okuma ve dinleme anlama stratejileri — soru tipi bazlı teknikler ve zaman yönetimi' },
        { name: 'Expresión Escrita', detail: 'Yazma görevleri için template çalışması, formal/informal yazım ayrımı ve rubrik bazlı geri bildirim' },
        { name: 'Expresión e Interacción Oral', detail: 'Konuşma modülü için yoğun pratik — monolog, diyalog ve tartışma formatlarında hazırlık' },
        { name: 'Examen de Prueba & Son Sprint', detail: 'Tam format mock sınav, detaylı analiz ve sınav öncesi yoğunlaştırılmış çalışma' },
      ],
    },
    faqs: [
      { q: 'DELE ile SIELE arasındaki fark nedir?', a: 'DELE, seviye bazlı (A1-C2) kalıcı bir sertifikadır. SIELE ise tek bir sınavla farklı becerilerde farklı puanlar verir ve 5 yıl geçerlidir. Hedefinize göre hangisinin uygun olduğunu birlikte belirleriz.', ctaType: 'contact' as const },
      { q: 'Eğitmenleriniz DELE/SIELE formatına hakim mi?', a: 'Kesinlikle. Native speaker İspanyol eğitmenlerimiz Instituto Cervantes sınav formatlarına ve değerlendirme kriterlerine tam hakimdir. Bir deneme seansıyla tanışabilirsiniz.', ctaType: 'trial' as const },
      { q: 'Hangi DELE seviyesine girmem gerekiyor?', a: 'Hedefinize bağlıdır: vatandaşlık için genellikle A2, üniversite için B2, profesyonel amaçlar için C1 önerilir. Diagnostik testle uygun seviyeyi belirleriz.' },
      { q: 'Ne kadar sürede hazırlanabilirim?', a: 'Mevcut seviyenize ve hedef DELE seviyenize bağlı olarak 8-20 hafta arası planlanır.' },
    ],
  };
}

function getGoetheContent(lang: string): CategoryContent {
  return {
    heroTagline: 'Goethe-Institut onaylı sınav formatına stratejik hazırlık',
    flowTitle: 'Goethe / TestDaF / TELC Hazırlık Süreci',
    flowSubtitle: 'Almanca yetkinliğinizi uluslararası sertifikayla belirleyin.',
    quickStats: [
      { icon: null, value: 'Uzman Eğitmen', label: 'Almanca Sınav Deneyimli' },
      { icon: null, value: 'Modelltest Pratiği', label: 'Gerçek Format' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
      { icon: null, value: 'Sprechen Pratiği', label: 'Konuşma Odaklı' },
    ],
    whoIsItFor: {
      title: 'Goethe / TestDaF / TELC Hazırlık Kime Uygun?',
      items: [
        'Almanya\'da üniversite başvurusu için TestDaF veya DSH skoru gereken öğrenciler',
        'Almanya çalışma vizesi için Goethe sertifikası gereken profesyoneller',
        'Aile birleşimi için TELC veya Goethe B1 sertifikası gerekenler',
        'Akademik kariyer için Almanca yetkinliğini belgelemek isteyenler',
        'Almanya\'da sağlık sektöründe çalışmak isteyen profesyoneller',
      ],
    },
    curriculum: {
      title: 'Goethe / TestDaF / TELC Müfredat Yapısı',
      modules: [
        { name: 'Einstufungstest & Hedef Belirleme', detail: 'Mevcut Almanca seviyenizin tespiti, hedef sertifikanın ve seviyenin netleştirilmesi' },
        { name: 'Lesen & Hören Stratejileri', detail: 'Okuma ve dinleme anlama teknikleri — sınav formatına özgü soru tipi stratejileri ve zaman yönetimi' },
        { name: 'Schreiben Atölyesi', detail: 'Yazma görevleri için sistematik çalışma — formal mektup, essay, grafik yorumlama ve Stellungnahme' },
        { name: 'Sprechen Pratiği', detail: 'Konuşma modülü için yoğun hazırlık — Goethe Sprechen Part 1-2-3, TestDaF Mündlicher Ausdruck formatları' },
        { name: 'Modelltest & Son Sprint', detail: 'Tam format Modelltest uygulamaları, detaylı analiz ve sınav öncesi yoğunlaştırılmış çalışma' },
      ],
    },
    faqs: [
      { q: 'Goethe, TestDaF ve TELC arasındaki fark nedir?', a: 'Goethe-Zertifikat genel amaçlı kalıcı bir sertifikadır. TestDaF üniversite başvurusu için özelleşmiştir. TELC çeşitli amaçlar (göç, iş, akademi) için kullanılır. Hedefinize göre doğru sınavı birlikte belirleriz.', ctaType: 'contact' as const },
      { q: 'TestDaF için TDN 4 almam gerekiyor, mümkün mü?', a: 'Kesinlikle. TestDaF TDN 4 (her modülden minimum 4) hedefiyle özel program hazırlanır. Diagnostik testle başlayıp, zayıf modüllere yoğunlaşırız.', ctaType: 'trial' as const },
      { q: 'Aile birleşimi için hangi sertifika gerekiyor?', a: 'Almanya aile birleşimi vizesi için genellikle Goethe A1 veya TELC A1 sertifikası istenir. Bazı durumlarda B1 seviyesi gerekebilir.' },
      { q: 'Sıfırdan ne kadar sürede B1 seviyesine ulaşabilirim?', a: 'Yoğunluğa bağlı olarak 4-8 ay arası planlanır. Günlük yoğun programla süre kısalabilir.' },
    ],
  };
}

function getDelfContent(lang: string): CategoryContent {
  return {
    heroTagline: 'France Éducation international onaylı sınav formatına tam hazırlık',
    flowTitle: 'DELF / DALF / TCF Hazırlık Süreci',
    flowSubtitle: 'Fransızca yetkinliğinizi diplomatik dilin sertifikasıyla taçlandırın.',
    quickStats: [
      { icon: null, value: 'Uzman Eğitmen', label: 'Fransızca Sınav Deneyimli' },
      { icon: null, value: 'Examen Blanc', label: 'Gerçek Format' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
      { icon: null, value: 'Production Orale', label: 'Konuşma Odaklı' },
    ],
    whoIsItFor: {
      title: 'DELF / DALF / TCF Hazırlık Kime Uygun?',
      items: [
        'Fransa veya Kanada\'da üniversite başvurusu planlayan öğrenciler',
        'Kanada göç başvurusu için TCF/TEF skoru gereken adaylar',
        'Fransızca dil yetkinliğini uluslararası sertifika ile belgelemek isteyenler',
        'Diplomatik kariyer için Fransızca sertifika arayan profesyoneller',
        'Daha önce sınava girip hedef seviyenin altında kalanlar',
      ],
    },
    curriculum: {
      title: 'DELF / DALF / TCF Müfredat Yapısı',
      modules: [
        { name: 'Évaluation Diagnostique', detail: 'Mevcut Fransızca seviyenizin tespiti ve hedef sertifika/seviyenin netleştirilmesi' },
        { name: 'Compréhension Orale & Écrite', detail: 'Dinleme ve okuma anlama stratejileri — DELF/DALF formatına özel soru tipi teknikleri' },
        { name: 'Production Écrite', detail: 'Yazma görevleri: DELF B2 argumentation, DALF C1 synthèse, formal/informal yazım ve rubrik bazlı geri bildirim' },
        { name: 'Production & Interaction Orale', detail: 'Konuşma modülü: monolog, expose ve tartışma formatlarında yoğun pratik — jüri simülasyonu' },
        { name: 'Examen Blanc & Son Sprint', detail: 'Tam format examen blanc, detaylı performans analizi ve sınav öncesi yoğunlaştırılmış çalışma' },
      ],
    },
    faqs: [
      { q: 'DELF, DALF ve TCF arasındaki fark nedir?', a: 'DELF (A1-B2) ve DALF (C1-C2) seviye bazlı kalıcı diplomalardır. TCF ise genel bir yeterlilik testi olup puanlama sistemiyle çalışır ve 2 yıl geçerlidir. Hedefinize göre doğru sınavı birlikte belirleriz.', ctaType: 'contact' as const },
      { q: 'Kanada göç başvurusu için hangi sınav gerekli?', a: 'Kanada göç başvurusu için genellikle TCF Canada veya TEF Canada kabul edilir. Minimum puan gereksinimleri başvuru türüne göre değişir.', ctaType: 'contact' as const },
      { q: 'DELF B2 ne kadar sürede hazırlanılır?', a: 'Mevcut seviyenize bağlı olarak B1\'den B2\'ye genellikle 12-16 hafta arası planlanır. Diagnostik testle süreyi netleştiririz.' },
    ],
  };
}

function getCilsContent(lang: string): CategoryContent {
  return {
    heroTagline: 'İtalyanca yetkinliğinizi Università di Siena sertifikasıyla taçlandırın',
    flowTitle: 'CILS / CELI Hazırlık Süreci',
    flowSubtitle: 'Sanat ve kültür dilinin resmi sertifikası için stratejik hazırlık.',
    quickStats: [
      { icon: null, value: 'Native Speaker', label: 'İtalyan Eğitmen' },
      { icon: null, value: 'Simulazione', label: 'Gerçek Format' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
      { icon: null, value: 'Produzione Orale', label: 'Konuşma Odaklı' },
    ],
    whoIsItFor: {
      title: 'CILS / CELI Hazırlık Kime Uygun?',
      items: [
        'İtalya\'da üniversite başvurusu için İtalyanca sertifika gereken öğrenciler',
        'İtalyan vatandaşlığı başvurusu için B1 sertifikası gerekenler',
        'İtalya\'da çalışma veya staj için dil yetkinliğini belgelemek isteyenler',
        'İtalyanca dil becerilerini uluslararası sertifikayla taçlandırmak isteyenler',
        'Sanat tarihi, mimarlık veya aşçılık alanında İtalya\'da kariyer hedefleyenler',
      ],
    },
    curriculum: {
      title: 'CILS / CELI Müfredat Yapısı',
      modules: [
        { name: 'Valutazione Iniziale', detail: 'Mevcut İtalyanca seviyenizin tespiti ve hedef sertifika seviyesinin netleştirilmesi' },
        { name: 'Ascolto & Lettura', detail: 'Dinleme ve okuma anlama stratejileri — CILS/CELI formatına özel soru tipi teknikleri' },
        { name: 'Produzione Scritta', detail: 'Yazma görevleri için sistematik çalışma — mektup, email, essay ve riassunto formatları' },
        { name: 'Produzione Orale', detail: 'Konuşma modülü için yoğun pratik — native speaker eğitmenle monolog ve diyalog hazırlığı' },
        { name: 'Simulazione d\'Esame & Son Sprint', detail: 'Tam format simulazione, detaylı analiz ve sınav öncesi yoğunlaştırılmış çalışma' },
      ],
    },
    faqs: [
      { q: 'CILS ile CELI arasındaki fark nedir?', a: 'CILS, Siena Üniversitesi tarafından verilen uluslararası geçerliliği olan bir sertifikadır. CELI ise Perugia Üniversitesi tarafından verilir. Her ikisi de İtalyan hükümeti tarafından kabul edilir. Hedefinize göre doğru sınavı birlikte belirleriz.', ctaType: 'contact' as const },
      { q: 'İtalyan vatandaşlığı için hangi seviye gerekiyor?', a: 'İtalyan vatandaşlığı başvurusu için minimum B1 seviyesi (CILS B1 Cittadinanza) sertifikası istenmektedir.', ctaType: 'trial' as const },
      { q: 'Sıfırdan ne kadar sürede B1\'e ulaşabilirim?', a: 'Yoğunluğa bağlı olarak 5-9 ay arası planlanır. Native speaker eğitmenle birebir çalışarak süre optimize edilir.' },
    ],
  };
}

function getTorflContent2(lang: string): CategoryContent {
  return {
    heroTagline: 'Rusça yetkinliğinizi uluslararası sertifikayla belgelendirin',
    flowTitle: 'TORFL Hazırlık Süreci',
    flowSubtitle: 'Rusça\'nın resmi yeterlilik sertifikası için stratejik hazırlık.',
    quickStats: [
      { icon: null, value: 'Uzman Eğitmen', label: 'Rusça Sınav Deneyimli' },
      { icon: null, value: 'Пробный Экзамен', label: 'Mock Sınav' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
      { icon: null, value: 'Говорение Pratiği', label: 'Konuşma Odaklı' },
    ],
    whoIsItFor: {
      title: 'TORFL Hazırlık Kime Uygun?',
      items: [
        'Rusya\'da üniversite başvurusu için TORFL sertifikası gereken öğrenciler',
        'Rusya ile ticari ilişkileri olan ve dil yetkinliğini belgelemek isteyen iş insanları',
        'Slavistik veya Rusça filoloji alanında akademik kariyer yapanlar',
        'Rus kültürü ve edebiyatına ilgi duyan ve resmi seviye belgesi isteyenler',
        'Rusya\'da çalışma veya oturma izni için dil sertifikası gerekenler',
      ],
    },
    curriculum: {
      title: 'TORFL Müfredat Yapısı',
      modules: [
        { name: 'Diagnostik Test & Seviye Belirleme', detail: 'Mevcut Rusça seviyenizin tespiti ve hedef TORFL seviyesinin (A1-C2) netleştirilmesi' },
        { name: 'Грамматика & Лексика', detail: 'Rusça gramer yapıları ve kelime hazinesi — sınav formatına özel alıştırmalar ve strateji çalışması' },
        { name: 'Чтение & Аудирование', detail: 'Okuma ve dinleme anlama stratejileri — TORFL soru tipilerine özel teknikler' },
        { name: 'Письмо & Говорение', detail: 'Yazma ve konuşma modülleri için yoğun pratik — gerçek sınav formatında hazırlık' },
        { name: 'Пробный Экзамен & Son Sprint', detail: 'Tam format mock sınav, detaylı performans analizi ve sınav öncesi yoğunlaştırılmış çalışma' },
      ],
    },
    faqs: [
      { q: 'TORFL hangi ülkelerde geçerli?', a: 'TORFL (ТРКИ), Rusya Federasyonu tarafından verilen ve uluslararası alanda kabul edilen resmi Rusça yeterlilik sertifikasıdır. Rusya\'daki üniversite başvurularında, çalışma ve oturma izni başvurularında geçerlidir.', ctaType: 'contact' as const },
      { q: 'Kiril alfabesini bilmiyorum, başlayabilir miyim?', a: 'Evet! Programımız gerektiğinde Kiril alfabesinden başlayarak temeli oluşturur. Sıfırdan başlayıp sertifika seviyesine ulaşmak mümkündür.', ctaType: 'trial' as const },
      { q: 'Ne kadar sürede hazırlanabilirim?', a: 'Mevcut seviyenize ve hedef TORFL seviyenize bağlı olarak 8-20 hafta arası planlanır. Diagnostik testle süreyi netleştiririz.' },
    ],
  };
}

function getLegalFrContent(): CategoryContent {
  return {
    heroTagline: 'Uluslararası hukukun diplomatik dilinde uzmanlaşın',
    flowTitle: 'Hukuki Fransızca Süreci',
    flowSubtitle: 'Diplomatik dil, hukuki hassasiyet — profesyonel bir yolculuk.',
    quickStats: [
      { icon: null, value: 'Uzman Eğitmen', label: 'Hukuk Fransızcası' },
      { icon: null, value: 'Sözleşme Analizi', label: 'Gerçek Dokümanlar' },
      { icon: null, value: 'Diplomatik Dil', label: 'Uluslararası Hukuk' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
    ],
    whoIsItFor: {
      title: 'Hukuki Fransızca Kime Uygun?',
      items: [
        'Uluslararası hukuk firmalarında Fransızca iletişim kuran avukatlar',
        'Diplomasi ve uluslararası ilişkiler alanında çalışan profesyoneller',
        'Frankofon Afrika ülkeleriyle iş yapan hukuk büroları',
        'AB hukuku ve uluslararası kuruluşlarda kariyer hedefleyenler',
        'Fransız hukuku veya karşılaştırmalı hukuk alanında akademik çalışma yapanlar',
      ],
    },
    curriculum: {
      title: 'Hukuki Fransızca Program Yapısı',
      modules: [
        { name: 'Terminologie Juridique', detail: 'Fransız hukuk terminolojisi temelleri — droit civil, droit pénal, droit commercial ve droit international' },
        { name: 'Rédaction Juridique', detail: 'Hukuki Fransızca yazım: contrat, mémoire, conclusions ve correspondance professionnelle' },
        { name: 'Plaidoirie & Négociation', detail: 'Mahkeme dili, müzakere terminolojisi ve diplomatik ifade kalıpları — simülasyon pratiği' },
        { name: 'Droit International & Européen', detail: 'AB hukuku ve uluslararası kuruluşların Fransızca terminolojisi ve yazışma formatları' },
        { name: 'Projet Pratique', detail: 'Gerçek hukuki senaryo üzerinde kapsamlı proje: Fransızca sözleşme analizi ve hukuki görüş yazımı' },
      ],
    },
    faqs: [
      { q: 'Genel Fransızca seviyem orta. Katılabilir miyim?', a: 'Minimum B1 Fransızca seviyesi önerilir. Seviyenizi belirlemek için ücretsiz deneme seansı ile başlayabilirsiniz.', ctaType: 'trial' as const },
      { q: 'Diplomatik kariyer için de uygun mu?', a: 'Kesinlikle. Fransızca, diplomasinin resmi dillerinden biridir. Programımız BM, AB ve uluslararası kuruluş terminolojisini kapsar.' },
      { q: 'Frankofon Afrika hukuku da kapsanıyor mu?', a: 'Evet. Müfredat hedefinize göre özelleştirilir. Frankofon Afrika ülkelerinin hukuk sistemi terminolojisi de dahil edilebilir.' },
    ],
  };
}

function getExamContent(p: ProgramItem, lang: string): CategoryContent {
  const examName = p.name.replace(' Hazırlık', '');
  const hasNative = p.nativeSpeaker;
  return {
    heroTagline: `${examName} hedef skorunuza stratejik yoldan ulaşın`,
    flowTitle: `${examName} Hazırlık Süreci`,
    flowSubtitle: 'Her aşaması planlanmış, stratejik bir yolculuk.',
    quickStats: [
      { icon: null, value: hasNative ? 'Native Speaker' : 'Uzman Eğitmen', label: 'Sınav Deneyimli' },
      { icon: null, value: 'Kişiye Özgü', label: 'Stratejik Plan' },
      { icon: null, value: p.formats.length > 1 ? 'Online veya Yüzyüze' : p.formats[0] === 'online' ? 'Online' : 'Yüz Yüze', label: 'Ders Formatı' },
      { icon: null, value: 'Mock Sınavlar', label: 'Gerçek Koşulda' },
    ],
    whoIsItFor: {
      title: `${examName} Hazırlık Kime Uygun?`,
      items: [
        'Yurt dışı üniversite başvurusu planlayan öğrenciler',
        `Kariyer hedefleri için ${examName} sertifikası arayan profesyoneller`,
        `${lang} yetkinliğini uluslararası sertifikayla belgelemek isteyenler`,
        'Belirli bir skor hedefine kısa sürede ulaşmak isteyenler',
        `Daha önce ${examName} sınavına girip hedef skorun altında kalanlar`,
      ],
    },
    curriculum: {
      title: `${examName} Müfredat Yapısı`,
      modules: [
        { name: 'Diagnostik Değerlendirme', detail: 'Mevcut seviye tespiti, güçlü/zayıf yönlerin belirlenmesi ve kişisel hedef skorun netleştirilmesi' },
        { name: 'Modül Bazlı Derinlemesine Çalışma', detail: 'Her sınav modülü için ayrı strateji: soru tipi analizi, zaman yönetimi, örüntü tanıma' },
        { name: 'Konuşma & Yazma Atölyeleri', detail: 'Üretim becerilerine özel yoğun pratik — rubrik bazlı geri bildirim ve düzeltme döngüsü' },
        { name: 'Mock Sınavlar & Analiz', detail: 'Gerçek sınav koşullarında uygulama sınavları, ardından detaylı performans analizi' },
        { name: 'Son Sprint', detail: 'Sınav öncesi son 2 haftalık yoğunlaştırılmış tekrar, stres yönetimi ve strateji pekiştirme' },
      ],
    },
    faqs: [
      { q: `${examName} hazırlık süreci ne kadar sürüyor?`, a: 'Mevcut seviyenize ve hedef skorunuza bağlı olarak genellikle 8-16 hafta arası planlanır. Diagnostik testten sonra size özel bir takvim oluşturulur.', ctaType: 'contact' as const },
      { q: `Eğitmenleriniz ${examName} konusunda deneyimli mi?`, a: `Kesinlikle. ${examName} hazırlık programımızda görev alan eğitmenlerimiz sınav formatına ve değerlendirme kriterlerine tam hakimdir. Bir deneme seansıyla tanışabilirsiniz.`, ctaType: 'trial' as const },
      { q: 'Mock sınavlar programa dahil mi?', a: 'Evet, program süresince düzenlenen tüm mock sınavlar ve performans analiz raporları programa dahildir.' },
      { q: 'Hedef skora ulaşamazsam ne olur?', a: 'Eğitmeninizle birlikte planı revize eder, ek destek seansları ve yoğunlaştırılmış çalışma modülüyle devam edersiniz.' },
    ],
  };
}

function getCareerContent(p: ProgramItem, lang: string): CategoryContent {
  const hasNative = p.nativeSpeaker;
  return {
    heroTagline: 'Kariyerinizi uluslararası arenaya taşıyın',
    flowTitle: `${p.name} Süreci`,
    flowSubtitle: 'Sektörünüze özel, sonuç odaklı bir yolculuk.',
    quickStats: [
      { icon: null, value: hasNative ? 'Native Speaker' : 'Uzman Eğitmen', label: 'Sektör Deneyimli' },
      { icon: null, value: 'Sektörel İçerik', label: 'Kişiye Özel Müfredat' },
      { icon: null, value: 'Senaryo Simülasyonu', label: 'Gerçekçi Pratik' },
      { icon: null, value: p.formats.length > 1 ? 'Online veya Yüzyüze' : p.formats[0] === 'online' ? 'Online' : 'Yüz Yüze', label: 'Esnek Format' },
    ],
    whoIsItFor: {
      title: `${p.name} Kime Uygun?`,
      items: [
        'Uluslararası şirketlerde çalışan veya çalışmak isteyen profesyoneller',
        'Yabancı müşteri ve partnerlerle iletişim kuran yöneticiler',
        `Sektöründe ${lang} yetkinliğini artırmak isteyen uzmanlar`,
        'Yurt dışı kariyer planlaması yapan adaylar',
        'Şirket içi terfi veya uluslararası atama hedefleyenler',
      ],
    },
    curriculum: {
      title: `${p.name} Program İçeriği`,
      modules: [
        { name: 'İhtiyaç Analizi & Hedef Belirleme', detail: 'Sektörünüz, pozisyonunuz ve günlük iş iletişiminiz üzerinden kişiye özel müfredat tasarımı' },
        { name: 'Sektörel Kelime Hazinesi', detail: `${p.name} alanına özgü teknik terimler, jargon ve profesyonel ifadeler — gerçek dokümanlar üzerinden çalışma` },
        { name: 'İş Senaryoları Simülasyonu', detail: 'Toplantı, sunum, telefon görüşmesi ve müzakere senaryolarının birebir canlandırılması' },
        { name: 'Yazılı İletişim Atölyesi', detail: 'Profesyonel e-posta, rapor ve teklif yazımı — düzeltme ve geri bildirim döngüsüyle' },
        { name: 'Gerçek Dünya Projesi', detail: 'Kendi iş ortamınızdan bir senaryo üzerinde kapsamlı proje çalışması ve sunum' },
      ],
    },
    faqs: [
      { q: 'Sektörüme özel içerik hazırlanıyor mu?', a: 'Kesinlikle. İlk derste detaylı bir ihtiyaç analizi yapılır, müfredat tamamen sizin sektörünüz ve günlük iş iletişiminiz üzerine şekillendirilir.', ctaType: 'trial' as const },
      { q: 'Genel seviyem düşük, bu programa katılabilir miyim?', a: `Minimum A2 ${lang} seviyesi önerilir. Daha düşük seviyelerde önce Genel ${lang} programı ile temel oluşturup ardından kariyer programına geçiş yapabilirsiniz.`, ctaType: 'contact' as const },
      { q: 'Derslerde kendi iş dokümanlarımı kullanabilir miyim?', a: 'Evet! Gerçek e-postalar, raporlar ve sunumlarınız üzerinde çalışmak programın en etkili parçalarından biridir.' },
      { q: 'Kurumsal gruplar için özel paketler var mı?', a: 'Evet, şirketlere özel kurumsal paketlerimiz mevcuttur. Detaylar için kurumsal sayfamızı inceleyebilirsiniz.' },
    ],
  };
}

function getKidsTeensContent(p: ProgramItem, lang: string): CategoryContent {
  const isChild = p.ages.includes('child');
  const isPrivate = p.classTypes.includes('private') && !p.classTypes.includes('group');
  const isOnline = p.formats.length === 1 && p.formats[0] === 'online';
  const hasNative = p.nativeSpeaker;

  const childStats = [
    { icon: null, value: hasNative ? 'Native Speaker' : 'Uzman Eğitmen', label: 'Çocuk Eğitimcisi' },
    { icon: null, value: '7-12 Yaş', label: 'Yaşa Uygun İçerik' },
    { icon: null, value: isPrivate ? 'Birebir' : 'Küçük Grup', label: isPrivate ? 'Özel İlgi' : 'Akran Öğrenmesi' },
    { icon: null, value: isOnline ? 'Online Canlı' : p.formats.length > 1 ? 'Online veya Yüzyüze' : 'Yüz Yüze', label: isOnline ? 'Evden Katılım' : 'Ders Formatı' },
  ];

  const teenStats = [
    { icon: null, value: hasNative ? 'Native Speaker' : 'Uzman Eğitmen', label: 'Genç Eğitimcisi' },
    { icon: null, value: '13-17 Yaş', label: 'Gençlere Uygun' },
    { icon: null, value: isPrivate ? 'Birebir' : 'Küçük Grup', label: isPrivate ? 'Kişiye Özel Tempo' : 'Akran Enerjisi' },
    { icon: null, value: isOnline ? 'Online Canlı' : p.formats.length > 1 ? 'Online veya Yüzyüze' : 'Yüz Yüze', label: isOnline ? 'Her Yerden Katılım' : 'Ders Formatı' },
  ];

  return {
    heroTagline: isChild ? `Çocuğunuz eğlenirken ${lang} öğrensin` : `Gençler için ${lang}'da özgüven ve akıcılık`,
    flowTitle: isChild ? `Çocuklar İçin ${lang} Öğrenme Döngüsü` : `Gençler İçin ${lang} Gelişim Süreci`,
    flowSubtitle: isChild ? 'Oyunla başlar, keşifle devam eder.' : 'Hedefle başlar, üretimle pekişir.',
    quickStats: isChild ? childStats : teenStats,
    whoIsItFor: {
      title: isChild ? `${lang} Kids Programı Kimlere Uygun?` : `${lang} Teens Programı Kimlere Uygun?`,
      items: isChild
        ? [
            `${lang} ile ilk kez tanışacak 7-12 yaş arası çocuklar`,
            'Erken yaşta dil eğitiminin önemini bilen aileler',
            'Çocuklarının erkenden akıcı bir yabancı dil konuşmasını isteyen ebeveynler',
            `İkinci dili doğal yollarla edinmesini isteyen ebeveynlerin çocukları`,
            'Yurt dışı eğitim planı olan ailelerin çocukları',
          ]
        : [
            `${lang} becerilerini geliştirmek isteyen 13-17 yaş arası gençler`,
            'Yurt dışı üniversite veya değişim programı planlayan lise öğrencileri',
            `${lang} sertifikası hedefleyen genç adaylar`,
            'Okul derslerinde daha iyi performans göstermek isteyenler',
            `${lang}'yı gerçek hayatta kullanabilmek isteyen gençler`,
          ],
    },
    curriculum: {
      title: isChild ? `Çocuklar İçin ${lang} Yolculuğu` : `Gençler İçin ${lang} Program Yapısı`,
      modules: isChild
        ? [
            { name: 'Keşif & Tanışma', detail: `${lang} ile ilk buluşma — şarkılar, renkler, sayılar ve günlük ifadeler. Merak uyandıran, baskısız başlangıç.` },
            { name: 'Oyun Dünyası', detail: 'Rol yapma oyunları, hikaye anlatımı ve yaratıcı el işleriyle kelime hazinesini genişletme' },
            { name: 'Mini Diyaloglar', detail: 'Basit ama gerçekçi diyaloglarla ilk cümle kurma deneyimi — market, park, okul senaryoları' },
            { name: 'Proje Haftası', detail: 'Her modül sonunda küçük sunum, poster veya kısa video projesiyle öğrenilenleri sergileme' },
          ]
        : [
            { name: 'Seviye Tespiti & Hedef', detail: 'Detaylı giriş değerlendirmesi ve gencin hedeflerine uygun kişisel yol haritası oluşturma' },
            { name: 'Tematik Konuşma Modülleri', detail: `Teknoloji, seyahat, sosyal medya, gelecek planları gibi gençlere yakın konularda ${lang} diyaloglar` },
            { name: 'Akademik Beceriler', detail: `${lang}'da essay yazımı, sunum yapma, not alma ve kaynak kullanma gibi akademik dil becerileri` },
            { name: 'Gerçek Dünya Projeleri', detail: `Podcast kaydı, blog yazımı veya mini araştırma projesiyle ${lang}'yı gerçek hayatta kullanma` },
            { name: 'Değerlendirme & Geri Bildirim', detail: 'Düzenli ilerleme testleri, veli toplantıları ve bireysel geri bildirim raporları' },
          ],
    },
    faqs: isChild
      ? [
          { q: `Çocuğum hiç ${lang} bilmiyor, katılabilir mi?`, a: `Elbette! Programımız sıfırdan başlayan çocuklar için tasarlanmıştır. Oyun ve etkileşimle doğal edinim sağlanır. Bir deneme dersiyle başlayabilirsiniz.`, ctaType: 'trial' as const },
          { q: 'Ders süreleri ne kadar?', a: 'Dikkat sürelerine uygun olarak 30-45 dakikalık seanslar planlanır. Yaş grubuna göre süre ve format ayarlanır.' },
          { q: 'Gelişimi nasıl takip edebilirim?', a: 'Düzenli veli bilgilendirme raporları, her modül sonunda mini değerlendirme ve istendiğinde eğitmenle görüşme imkanı.' },
          { q: `Online dersler küçük çocuklar için uygun mu?`, a: `7 yaş ve üstü çocuklar için online formatımız oldukça etkilidir. 4-6 yaş grubu için yüz yüze format önerilir.` },
        ]
      : [
          { q: 'Gencimin mevcut okul programıyla çakışır mı?', a: 'Esnek ders saatleri sunuyoruz. Hafta içi akşam ve hafta sonu seçenekleriyle okul programına uyum sağlanır.', ctaType: 'trial' as const },
          { q: `${lang} sınav hazırlığına da yardımcı oluyor mu?`, a: `Evet, program genel ${lang} yetkinliğini artırırken sınav hedefi olan gençler için modüler destek de sağlanır.` },
          { q: 'Grup mu özel ders mi daha uygun?', a: 'Sosyal etkileşim ve motivasyon için grup dersleri harikadır. Spesifik hedefler veya hızlı ilerleme için özel ders önerilir.' },
          { q: 'Veli olarak süreci nasıl takip edebilirim?', a: 'Düzenli ilerleme raporları, modül sonu değerlendirmeleri ve istendiğinde eğitmenle birebir görüşme imkanı sunuyoruz.' },
        ],
  };
}

function getArabicGrupContent(isOnline: boolean): CategoryContent {
  const format = isOnline ? 'Online' : 'Yüz Yüze';
  return {
    heroTagline: 'Fasih Arapça\'yı dört beceriyle, konuşma merkezli öğrenin',
    flowTitle: 'Arapça Öğrenme Süreci',
    flowSubtitle: 'Dört temel beceri bir arada gelişir; konuşma her zaman merkezde kalır.',
    quickStats: [
      { icon: null, value: 'Fasih Arapça', label: 'Standart Arapça' },
      { icon: null, value: '4 Beceri Entegre', label: 'Konuşma Merkezli' },
      { icon: null, value: 'Maks. 8 Kişi', label: 'Küçük Grup' },
      { icon: null, value: format, label: 'Ders Formatı' },
    ],
    whoIsItFor: {
      title: 'Arapça Grup Programı Kime Uygun?',
      items: [
        'İlahiyat fakültesi öğrencileri ve akademisyenler',
        'Arap Dili ve Edebiyatı bölümü öğrencileri',
        'Konuşma Arapçası öğrenmek isteyenler',
        'Arap ülkeleriyle ticari ilişkilerini geliştirmek isteyen profesyoneller',
        'Kur\'an-ı Kerim\'i ve İslami kaynakları orijinal dilinde anlamak isteyenler',
      ],
    },
    curriculum: {
      title: 'Arapça Grup Programı Yapısı',
      modules: [
        { name: 'Seviye Tespiti & Hedef Belirleme', detail: 'Detaylı giriş değerlendirmesi ile mevcut Arapça seviyeniz, güçlü ve zayıf yönleriniz belirlenir; hedefinize özel plan oluşturulur' },
        { name: 'Konuşma & Dinleme Temeli', detail: 'Fasih Arapça telaffuz kuralları, günlük diyaloglar ve dinleme pratikleri ile aktif iletişim becerisi kurulur' },
        { name: 'Okuma & Kavrama', detail: 'Harekeli ve harekesiz metinler üzerinden okuma pratiği; gazete, edebiyat ve akademik metin çözümleme' },
        { name: 'Yazma & Kompozisyon', detail: 'Arapça cümle yapısı, paragraf kurgusu ve farklı metin türlerinde yazma pratiği' },
        { name: 'Entegre Uygulama & İlerleme', detail: 'Dört becerinin bir arada kullanıldığı senaryo çalışmaları, tartışma oturumları ve düzenli ilerleme değerlendirmesi' },
      ],
    },
    faqs: [
      { q: 'Hiç Arapça bilmiyorum, sıfırdan başlayabilir miyim?', a: 'Elbette! A1 seviyesinden itibaren tüm seviyelere uygun programlar mevcut. Elif-Ba\'dan başlayarak adım adım ilerleriz. Bir deneme seansıyla başlayabilirsiniz.', ctaType: 'trial' as const },
      { q: 'Hangi Arapça öğretiliyor — Fasih mi, lehçe mi?', a: 'Programımızda Fasih Arapça (Fusha / Modern Standart Arapça) öğretilir. Fasih Arapça, tüm Arap ülkelerinde anlaşılan ortak dildir ve akademik, ticari ve resmi iletişimde kullanılır.' },
      { q: 'Derslerde sadece konuşma mı yapılıyor?', a: 'Konuşma her dersin merkezinde yer alır ancak tek başına değildir. Dinleme, okuma ve yazma becerileri de her derste entegre şekilde çalışılır. Amaç dört beceriyi birlikte geliştirmektir.' },
      { q: 'Grup dersleri kaç kişilik?', a: 'Maksimum 8 kişilik küçük gruplarla çalışıyoruz. Bu sayede her öğrenci yeterli konuşma süresi alır.' },
    ],
  };
}

function getArabicOzelContent(): CategoryContent {
  return {
    heroTagline: 'Fasih Arapça\'yı birebir, kendi hedefinize göre öğrenin',
    flowTitle: 'Arapça Özel Ders Süreci',
    flowSubtitle: 'Dört temel beceri bir arada gelişir; konuşma her zaman merkezde kalır.',
    quickStats: [
      { icon: null, value: 'Fasih Arapça', label: 'Standart Arapça' },
      { icon: null, value: '%100 Kişiye Özel', label: 'Müfredat' },
      { icon: null, value: 'Birebir', label: 'Özel Ders' },
      { icon: null, value: 'Online veya Yüzyüze', label: 'Esnek Format' },
    ],
    whoIsItFor: {
      title: 'Arapça Özel Ders Kime Uygun?',
      items: [
        'İlahiyat veya Arap Dili bölümünde akademik Arapça desteğine ihtiyaç duyanlar',
        'Arap ülkeleriyle ticari ilişkilerini geliştirmek isteyen iş insanları',
        'Kur\'an-ı Kerim\'i ve İslami kaynakları orijinal dilinde anlamak isteyenler',
        'Konuşma Arapçası\'nı kendi temposunda, birebir öğrenmek isteyenler',
        'Belirli bir hedefe (akademik çalışma, seyahat, kariyer) kısa sürede ulaşmak isteyenler',
      ],
    },
    curriculum: {
      title: 'Arapça Özel Ders Program Yapısı',
      modules: [
        { name: 'Detaylı İhtiyaç Analizi', detail: 'Hedefleriniz, öğrenme stiliniz ve mevcut seviyeniz üzerinden tamamen kişiselleştirilmiş Fasih Arapça müfredatı tasarımı' },
        { name: 'Kişisel Yol Haritası', detail: 'Haftalık ve aylık hedefler, milestone\'lar ve ilerleme ölçütleri ile net bir yol haritası' },
        { name: 'Konuşma Merkezli 4 Beceri Entegrasyonu', detail: 'Konuşma, dinleme, okuma ve yazma becerileri her derste bir arada çalışılır; konuşma her zaman merkezde tutulur' },
        { name: 'Anında Düzeltme & Geri Bildirim', detail: 'Her hatanız anında düzeltilir, doğrusu kurdurulur. Birebir ilgi ile gelişiminiz hızlanır' },
        { name: 'Esnek İlerleme', detail: 'Hızlı ilerlemek mi istiyorsunuz, yavaş ve derin mi? Tempoyu siz belirlersiniz, eğitmen uyum sağlar' },
      ],
    },
    faqs: [
      { q: 'Hiç Arapça bilmiyorum, sıfırdan başlayabilir miyim?', a: 'Elbette! Elif-Ba\'dan başlayarak adım adım ilerleriz. Özel derslerde tamamen sizin seviyenize göre ilerlenir, herhangi bir ön bilgi gerekmez. Bir deneme seansıyla başlayabilirsiniz.', ctaType: 'trial' as const },
      { q: 'Hangi Arapça öğretiliyor — Fasih mi, lehçe mi?', a: 'Özel derslerimizde Fasih Arapça (Fusha / Modern Standart Arapça) öğretilir. Fasih Arapça, tüm Arap ülkelerinde anlaşılan ortak dildir ve akademik, ticari ve resmi iletişimde kullanılır.' },
      { q: 'Özel ders ile grup dersi arasındaki fark nedir?', a: 'Özel ders, her detayıyla size özel tasarlanan bir eğitimdir. Hedefiniz, seviyeniz ve öğrenme tarzınız dikkate alınarak kişiye özgü bir müfredat kurgulanır. Ders gün ve saatlerini kendi takviminize göre belirleyebilir, odaklanmak istediğiniz alanı siz seçebilirsiniz.', ctaType: 'trial' as const },
      { q: 'Belirli bir konuya odaklanabilir miyim?', a: 'Kesinlikle. Akademik Arapça, ticari yazışma, dini metinler, konuşma pratiği gibi spesifik alanlara yoğunlaşabilirsiniz. Müfredat tamamen hedefinize göre şekillenir.', ctaType: 'trial' as const },
    ],
  };
}

function getGeneralContent(p: ProgramItem, lang: string): CategoryContent {
  const isPrivate = p.classTypes.includes('private') && !p.classTypes.includes('group');
  const isOnline = p.formats.length === 1 && p.formats[0] === 'online';
  const isGroupF2f = p.classTypes.includes('group') && p.formats.includes('face-to-face');
  const hasNative = p.nativeSpeaker;

  // Smarter taglines based on format
  const tagline = isOnline
    ? `Nerede olursanız olun — ${lang}'yı %85 konuşma pratiğiyle online öğrenin`
    : isPrivate
    ? `Tamamen size özel ${lang} müfredatı, kendi temponuzda ilerleme`
    : `${lang}'yı konuşarak, yaşayarak öğrenin`;

  // Smarter quickStats
  const stats = [
    { icon: null, value: hasNative ? 'Native Speaker' : '%85 Konuşma', label: hasNative ? 'Eğitmen' : 'Konuşma Pratiği' },
    { icon: null, value: 'Teachera Teaching Method', label: 'Standardize Metod' },
    { icon: null, value: isPrivate ? 'Birebir' : p.language === 'ingilizce' ? 'Maks. 10 Kişi' : 'Maks. 8 Kişi', label: isPrivate ? 'Özel Ders' : 'Küçük Grup' },
    { icon: null, value: isOnline ? 'Her Yerden Katıl' : p.formats.length > 1 ? 'Online veya Yüzyüze' : 'Yüz Yüze', label: isOnline ? 'Online Canlı' : 'Ders Formatı' },
  ];

  return {
    heroTagline: tagline,
    flowTitle: isGroupF2f ? 'Teachera Teaching Method' : 'Ders Akışı',
    flowSubtitle: 'Her ders boyunca kesintisiz dönen bu döngü, bilgiyi reflekse çevirir.',
    quickStats: stats,
    whoIsItFor: {
      title: 'Bu Program Kime Uygun?',
      items: [
        `${lang} öğrenmeye sıfırdan başlamak isteyenler`,
        'Mevcut seviyesini konuşma pratiğiyle pekiştirmek isteyenler',
        `Geleneksel yöntemlerle ${lang} öğrenip konuşamayanlar`,
        'Seyahat, kültür veya kişisel gelişim amacıyla dil öğrenmek isteyenler',
        isPrivate
          ? 'Kendi temposunda, birebir ilerleme tercih edenler'
          : isOnline
          ? 'Konya dışından veya yoğun tempolardan dolayı online katılım tercih edenler'
          : 'Grup enerjisinden ve akran öğrenmesinden motivasyon alanlar',
      ],
    },
    curriculum: {
      title: 'Program Yapısı',
      modules: [
        { name: 'Seviye Tespiti & Oryantasyon', detail: 'Detaylı giriş değerlendirmesi, hedef belirleme ve kişiselleştirilmiş öğrenme planı oluşturma' },
        { name: 'Temel İletişim Blokları', detail: 'Günlük hayatta en sık kullanılan kalıplar, diyaloglar ve pratik senaryolar üzerinden ilerleme' },
        { name: 'Tematik Konuşma Modülleri', detail: 'Seyahat, iş, sosyal yaşam, kültür gibi temalarda derinlemesine diyalog ve kelime çalışması' },
        { name: 'Kültürel Keşif Seansları', detail: `${lang} konuşulan ülkelerin kültürü, gelenekleri ve günlük yaşamına dair interaktif oturumlar` },
        { name: 'İlerleme Değerlendirmesi', detail: 'Düzenli seviye testleri, konuşma kaydı analizi ve bireysel geri bildirim raporları' },
      ],
    },
    faqs: [
      { q: `Hiç ${lang} bilmiyorum, sıfırdan başlayabilir miyim?`, a: 'Elbette! A1 seviyesinden itibaren tüm seviyelere uygun programlar mevcut. Bir deneme seansıyla başlayabilirsiniz.', ctaType: 'trial' as const },
      { q: 'Derslerde Türkçe konuşuluyor mu?', a: `Derslerimizin %85'i hedef dilde geçer. Başlangıç seviyelerinde gerektiğinde Türkçe destek verilir, ancak mümkün olduğunca hedef dilde kalınır.`, ctaType: 'trial' as const },
      ...(isPrivate
        ? [{ q: 'Ders saatleri esnek mi?', a: 'Evet. Eğitmeninizle birlikte size uygun gün ve saatleri belirlersiniz. Değişiklik gerektiğinde 24 saat önceden bildirimle yeniden planlanır.' }]
        : [{ q: 'Grup dersleri kaç kişilik?', a: p.language === 'ingilizce' ? 'Maksimum 10 kişilik küçük gruplarla çalışıyoruz. Her öğrencinin yeterli konuşma süresi almasını sağlıyoruz.' : 'Maksimum 8 kişilik küçük gruplarla çalışıyoruz. Bu sayede her öğrenci yeterli konuşma süresi alır.' }]
      ),
      { q: `Ne kadar sürede ${lang} konuşabilirim?`, a: 'Hedef ve başlangıç seviyenize bağlı olarak 2-4 ay içinde günlük iletişimde rahatlıkla konuşabilir seviyeye gelirsiniz.' },
    ],
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   REVEAL ANIMATION
   ═══════════════════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const motionTiming = useMotionTiming();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: motionTiming.base, delay, ease: motionTiming.easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FLOW DIAGRAM SECTION (adapted from MethodologyPage zigzag)
   ═══════════════════════════════════════════════════════════════════════ */
function FlowDiagramSection({ steps, title, subtitle }: { steps: FlowStep[]; title: string; subtitle: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    if (inView) {
      steps.forEach((_, i) => {
        setTimeout(() => setActiveStep(i), 800 + i * 600);
      });
    }
  }, [inView, steps]);

  return (
    <section ref={sectionRef} className="bg-[#09090F] relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute top-[10%] left-[-8%] w-[500px] h-[500px] bg-[#324D47]/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-6%] w-[400px] h-[400px] bg-[#E70000]/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="pt-24 md:pt-32 pb-16 md:pb-20 text-center px-6">
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 1 }}>
          <span className="font-['Luxury:Gold',sans-serif] text-white/[0.06] text-[10px] tracking-[0.5em] block mb-6">
            LESSON FLOW
          </span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.15 }}>
          <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-[1.8rem] md:text-[2.8rem] leading-[1.15] mb-4">
            {title.split(' ').map((w, i, arr) =>
              i === arr.length - 1
                ? <span key={i} className="text-[#324D47]">{w}</span>
                : <span key={i}>{w} </span>
            )}
          </h2>
          <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/30 text-[14px] md:text-[15px] max-w-[420px] mx-auto leading-[1.8]">
            {subtitle.includes('bilgiyi reflekse') ? (
              <>{subtitle.split('bilgiyi reflekse çevirir.')[0]}<span className="text-white/50">bilgiyi reflekse çevirir.</span></>
            ) : subtitle}
          </p>
        </motion.div>
      </div>

      {/* Steps */}
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 pb-24 md:pb-32">
        <div className="relative">
          {/* Central timeline line — desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full bg-gradient-to-b from-white/[0.03] via-white/[0.08] to-white/[0.03] origin-top"
            />
          </div>

          <div className="space-y-8 md:space-y-0">
            {steps.map((step, i) => {
              const CustomIcon = step.customIcon;
              const isLeft = i % 2 === 0;
              const isActive = activeStep >= i;

              return (
                <div key={step.num} className="relative">
                  {/* Timeline node — desktop */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={isActive ? { scale: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
                      className="relative"
                    >
                      <motion.div
                        animate={isActive ? { scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] } : {}}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: step.accent, filter: 'blur(8px)' }}
                      />
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center relative z-10 border"
                        style={{
                          backgroundColor: step.accent + '15',
                          borderColor: step.accent + '30',
                          boxShadow: `0 0 30px ${step.glowColor}`,
                        }}
                      >
                        <CustomIcon color={isActive ? step.accent : 'rgba(255,255,255,0.15)'} className="w-6 h-6 transition-colors duration-700" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Card — alternating left/right */}
                  <div className="md:grid md:grid-cols-2 md:gap-24 items-center">
                    <motion.div
                      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                      animate={isActive ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className={`${isLeft ? 'md:col-start-1' : 'md:col-start-2'} md:py-12`}
                    >
                      <div
                        className="group relative rounded-2xl p-6 md:p-8 border transition-all duration-700"
                        style={{
                          backgroundColor: isActive ? step.accent + '08' : 'rgba(255,255,255,0.01)',
                          borderColor: isActive ? step.accent + '15' : 'rgba(255,255,255,0.03)',
                          boxShadow: isActive ? `0 8px 60px ${step.glowColor}, inset 0 1px 0 ${step.accent}10` : 'none',
                        }}
                      >
                        {/* Mobile icon + number header */}
                        <div className="flex items-center gap-4 mb-5">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={isActive ? { scale: 1 } : {}}
                            transition={{ duration: 0.4, type: 'spring', delay: 0.2 }}
                            className="md:hidden w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: step.accent + '15' }}
                          >
                            <CustomIcon color={step.accent} className="w-6 h-6" />
                          </motion.div>
                          <div className="flex items-center gap-3 flex-1">
                            <span
                              className="font-['Neutraface_2_Text:Bold',sans-serif] text-[3rem] md:text-[4.5rem] leading-none select-none transition-colors duration-700"
                              style={{ color: isActive ? step.accent + '12' : 'rgba(255,255,255,0.02)' }}
                            >
                              {step.num}
                            </span>
                            <div>
                              <span
                                className="font-['Luxury:Gold',sans-serif] text-[9px] tracking-[0.3em] block mb-1 transition-colors duration-700"
                                style={{ color: isActive ? step.accent + '40' : 'rgba(255,255,255,0.06)' }}
                              >
                                {step.tagEn}
                              </span>
                              <span
                                className="font-['Neutraface_2_Text:Demi',sans-serif] text-[11px] tracking-[0.2em] transition-colors duration-700"
                                style={{ color: isActive ? step.accent : 'rgba(255,255,255,0.15)' }}
                              >
                                {step.tag}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Headline */}
                        <h3
                          className="font-['Neutraface_2_Text:Bold',sans-serif] text-[1.3rem] md:text-[1.6rem] leading-[1.2] mb-3 transition-colors duration-700"
                          style={{ color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.1)' }}
                        >
                          {step.headline}
                        </h3>

                        {/* Body */}
                        <p
                          className="font-['Neutraface_2_Text:Book',sans-serif] text-[14px] md:text-[15px] leading-[1.9] mb-4 transition-colors duration-700"
                          style={{ color: isActive ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.06)' }}
                        >
                          {step.body}
                        </p>

                        {/* Detail accent line */}
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={isActive ? { scaleX: 1 } : {}}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className="h-px w-12 origin-left mb-3"
                          style={{ backgroundColor: step.accent + '30' }}
                        />

                        {/* Detail quote */}
                        <p
                          className="font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] md:text-[13px] italic transition-colors duration-700"
                          style={{ color: isActive ? step.accent + '90' : 'rgba(255,255,255,0.04)' }}
                        >
                          {step.detail}
                        </p>
                      </div>
                    </motion.div>

                    <div className={`hidden md:block ${isLeft ? 'md:col-start-2' : 'md:col-start-1 md:row-start-1'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TESTIMONIALS CAROUSEL (adapted from Testimonials.tsx)
   ═══════════════════════════════════════════════════════════════════════ */
const AUTOPLAY_MS = 6000;

function TestimonialSection({ testimonials }: { testimonials: TestimonialItem[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const goTo = useCallback((i: number) => { setCurrent(i); setProgress(0); }, []);
  const prev = () => goTo(current === 0 ? testimonials.length - 1 : current - 1);
  const next = useCallback(() => goTo(current === testimonials.length - 1 ? 0 : current + 1), [current, goTo, testimonials.length]);

  const onSwipeStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    setPaused(true);
  };

  const onSwipeEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) {
      setPaused(false);
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const horizontalThreshold = 42;

    if (absX > horizontalThreshold && absX > absY * 1.2) {
      if (deltaX < 0) next();
      else prev();
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    setPaused(false);
  };

  useEffect(() => {
    if (paused) return;
    const step = 100 / (AUTOPLAY_MS / 16);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p + step >= 100) { next(); return 0; }
        return p + step;
      });
    }, 16);
    return () => clearInterval(id);
  }, [paused, next]);

  const t = testimonials[current];

  return (
    <section
      className="py-12 md:py-16 bg-[#09090F] relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute top-[20%] right-[-5%] w-[420px] h-[420px] bg-[#324D47]/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-8%] w-[500px] h-[500px] bg-[#09090F] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-[860px] mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <span className="text-[#324D47] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] block mb-2">
              ÖĞRENCİ DENEYİMİ
            </span>
            <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-[1.4rem] md:text-[1.8rem] leading-[1.15]">
              Gerçek <span className="text-white/20">Hikayeler.</span>
            </h2>
          </motion.div>

          <div className="flex items-center gap-2">
            <button onClick={prev} className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center hover:border-[#324D47]/40 hover:text-[#324D47] text-white/25 transition-all cursor-pointer">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => next()} className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center hover:border-[#324D47]/40 hover:text-[#324D47] text-white/25 transition-all cursor-pointer">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Testimonial */}
        <div
          className="relative min-h-[160px] md:min-h-[140px] [touch-action:pan-y]"
          onTouchStart={onSwipeStart}
          onTouchEnd={onSwipeEnd}
          onTouchCancel={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            >
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/65 text-[15px] md:text-[17px] leading-[1.75] mb-6">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#324D47]/15 flex items-center justify-center">
                    <span className="text-[#324D47] text-[11px] font-['Neutraface_2_Text:Demi',sans-serif]">
                      {t.name.split(' ').map(w => w[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-white/80 text-[13px]">{t.name}</span>
                    <span className="text-white/15 text-[13px] mx-2">—</span>
                    <span className="font-['Neutraface_2_Text:Book',sans-serif] text-white/30 text-[12px]">{t.role}</span>
                  </div>
                </div>
                <div className="hidden sm:flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={10} fill="#324D47" className="text-[#324D47]/60" />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative h-[3px] rounded-full overflow-hidden cursor-pointer transition-all duration-300"
              style={{ width: i === current ? 32 : 6 }}
            >
              <span className="absolute inset-0 bg-white/[0.08] rounded-full" />
              {i === current && <span className="absolute inset-y-0 left-0 bg-[#324D47] rounded-full" style={{ width: `${progress}%` }} />}
              {i < current && <span className="absolute inset-0 bg-[#324D47]/40 rounded-full" />}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STARS SECTION — Speaking Cafe & Language Lab (en-grup-f2f only)
   ═══════════════════════════════════════════════════════════════════════ */
const starsData = [
  {
    num: '01',
    title: 'Speaking Cafe',
    subtitle: 'Sosyalleş – Akıcılığı Geliştir',
    body: [
      'Grup programı satın alan öğrencilere, 2. seviyeden itibaren haftada 1 gün ek olarak sunulur ve Teachera\'nın içindeki Speaking Cafe alanında gerçekleşir. Bu aktivite sınıfa özgü, düzenli ve seviyeye uygun konu akışıyla ilerler; amaç sadece sohbet etmek değil, konuşmayı hızlandırmak, akıcılığı artırmak ve fikirlerini İngilizce daha net bir örgüyle ifade edebilme becerisi kazandırmaktır.',
      'İlham noktası da çok tanıdık bir cümle: "Abi dil Türkiye\'de öğrenilmez, yurt dışında öğrenilir." Biz o "yurt dışı hissini" Teachera\'nın içine taşıyoruz: kahveni al, sınıfınla gel, native speaker eşliğinde konuş — gerisi zaten akıyor.',
    ],
    accent: '#D4A76A',
  },
  {
    num: '02',
    title: 'Teachera Language Lab',
    subtitle: 'Eğlen – Öğren – Network',
    body: [
      'Grup programı satın alan öğrenciler, 2. seviyeden itibaren Teachera\'da açılan Language Lab etkinliklerine, seviyelerine uygun olanlara sınırsız katılım sağlayabilir.',
      'Konsept aslında çok basit: kitapta klasik şekilde öğrenemeyeceğin şeyleri eğlenerek, Teachera topluluğundaki insanlarla tanışıp sosyalleşerek, rahat ve keyifli bir ortamda öğrenmek. Dedikodu partilerinden sokak diline, "therapy session"lardan felsefi sohbetlere kadar öğretmenler; kendilerinin de keyif alacağı etkinlikler planlar.',
      'Burada konu–mekân kısıtlaması yoktur. Etkinlik standartları sayfamızda yer alır; yeni etkinlikler de WhatsApp gruplarımızda duyurulur. Vaktin varsa ve kontenjan dolmadıysa, gel katıl.',
    ],
    accent: '#E70000',
  },
];

function StarsSection() {
  return (
    <section className="py-20 md:py-28 bg-[#09090F] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#324D47]/[0.06] blur-[200px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#D4A76A]/[0.04] blur-[200px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 md:px-10 relative">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-block font-['Neutraface_2_Text:Demi',sans-serif] text-[10px] tracking-[0.2em] text-[#D4A76A]/60 mb-4">
              SADECE YÜZ YÜZE GRUP PROGRAMINDA
            </span>
            <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-2xl md:text-[2.2rem] leading-tight">
              İngilizce Grup Programımızın{' '}
              <span className="text-[#D4A76A]">Starları</span>
            </h2>

            {/* teachera ❤ U */}
            <div className="flex items-center justify-center mt-6">
              <div
                className="w-[90px] h-[18px] md:w-[110px] md:h-[22px] relative opacity-70 shrink-0"
                style={{ '--fill-0': '#ffffff' } as React.CSSProperties}
              >
                <TeacheraLogo />
              </div>
              <div className="relative flex items-center ml-1 md:ml-1.5">
                <img
                  src={heartImg}
                  alt="love"
                  className="w-[36px] h-[36px] md:w-[44px] md:h-[44px] object-contain animate-[heartbeat_1.4s_ease-in-out_infinite]"
                />
                <span
                  className="font-['Retro_Signature',cursive] text-white/80 text-[32px] md:text-[40px] -ml-2 md:-ml-3 relative -top-[1px]"
                >
                  U
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {starsData.map((star, idx) => (
            <React.Fragment key={star.num}>
              <Reveal delay={idx * 0.15}>
                <motion.div
                  className="relative rounded-2xl border border-white/[0.08] hover:border-white/[0.18] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm p-8 md:p-10 h-full flex flex-col group transition-colors duration-400 overflow-hidden"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${star.accent}, ${star.accent}40, transparent)` }}
                />

                {/* Corner glow — always visible, intensifies on hover */}
                <div
                  className="absolute -top-20 -right-20 w-[200px] h-[200px] rounded-full opacity-[0.07] group-hover:opacity-[0.14] transition-opacity duration-700 pointer-events-none"
                  style={{ backgroundColor: star.accent }}
                />

                {/* Background heart watermark */}
                <img
                  src={heartImg}
                  alt=""
                  className="absolute -bottom-6 -right-6 w-[140px] h-[140px] md:w-[180px] md:h-[180px] object-contain opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none"
                />

                {/* Number + Title row */}
                <div className="flex items-start gap-5 mb-4">
                  {/* Number badge */}
                  <div
                    className="shrink-0 w-[52px] h-[52px] md:w-[60px] md:h-[60px] rounded-xl flex items-center justify-center border"
                    style={{
                      backgroundColor: `${star.accent}0C`,
                      borderColor: `${star.accent}20`,
                    }}
                  >
                    <span
                      className="font-['Neutraface_2_Text:Bold',sans-serif] text-[20px] md:text-[22px] leading-none"
                      style={{ color: star.accent }}
                    >
                      {star.num}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="pt-1">
                    <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-xl md:text-2xl mb-1.5">
                      {star.title}
                    </h3>
                    <p
                      className="font-['Neutraface_2_Text:Demi',sans-serif] text-[11px] md:text-[12px] tracking-[0.12em]"
                      style={{ color: `${star.accent}CC` }}
                    >
                      {star.subtitle}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full mb-6" style={{ background: `linear-gradient(90deg, ${star.accent}30, transparent)` }} />

                {/* Body paragraphs */}
                <div className="flex-1 space-y-4">
                  {star.body.map((p, i) => (
                    <p
                      key={i}
                      className="font-['Neutraface_2_Text:Book',sans-serif] text-white/55 text-[13px] md:text-[14px] leading-[1.85]"
                    >
                      {p}
                    </p>
                  ))}
                </div>

                {/* Bottom accent line */}
                <div className="mt-8 h-[2px] w-full rounded-full overflow-hidden bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: star.accent }}
                    initial={{ width: '0%' }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3 + idx * 0.2, ease: [0.33, 1, 0.68, 1] }}
                  />
                </div>
                </motion.div>
              </Reveal>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FAQ ITEM
   ═══════════════════════════════════════════════════════════════════════ */
function FAQItem({ question, answer, index, accent, ctaType }: { question: string; answer: string; index: number; accent: string; ctaType?: 'contact' | 'trial' | 'kurumsal' }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { open: openFreeTrial } = useFreeTrial();
  return (
    <Reveal delay={index * 0.06}>
      <div className="rounded-2xl border border-[#09090F]/[0.06] bg-white overflow-hidden transition-all hover:border-[#324D47]/15">
        <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 md:p-6 text-left">
          <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F] text-[14px] md:text-[15px] pr-4">{question}</span>
          <motion.div
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: open ? `${accent}15` : '#09090F08', color: open ? accent : '#09090F40' }}
          >
            <span className="text-[18px] leading-none">+</span>
          </motion.div>
        </button>
        <motion.div initial={false} animate={{ height: open ? 'auto' : 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
          <div className="px-5 md:px-6 pb-5 md:pb-6">
            <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/50 text-[13px] leading-[1.75] mb-0">{answer}</p>
            {ctaType === 'contact' && (
              <button
                onClick={() => navigate('/iletisim')}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#324D47]/20 text-[#324D47] hover:border-[#324D47]/40 hover:bg-[#324D47]/[0.03] font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-wide transition-all"
              >
                <ChevronRight size={14} />
                İLETİŞİM FORMU
              </button>
            )}
            {ctaType === 'trial' && (
              <button
                onClick={() => openFreeTrial('program_detail_faq_trial')}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-wide transition-all hover:brightness-110"
                style={{ backgroundColor: accent }}
              >
                <Sparkles size={14} />
                ÜCRETSİZ DENEME SEANSI
              </button>
            )}
            {ctaType === 'kurumsal' && (
              <button
                onClick={() => navigate('/kurumsal')}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#324D47]/20 text-[#324D47] hover:border-[#324D47]/40 hover:bg-[#324D47]/[0.03] font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-wide transition-all"
              >
                <ChevronRight size={14} />
                KURUMSAL TEKLİF AL
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   RELATED PROGRAMS
   ═══════════════════════════════════════════════════════════════════════ */
function RelatedPrograms({ current }: { current: ProgramItem }) {
  const related = useMemo(() => {
    return ALL_PROGRAMS
      .filter(p => p.id !== current.id && (p.language === current.language || p.category === current.category))
      .slice(0, 3);
  }, [current]);

  const navigate = useNavigate();
  if (related.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-[#FAFAF8]">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-2xl md:text-3xl mb-10">
            İlginizi Çekebilecek Programlar
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {related.map((p, i) => {
            const a = LANG_ACCENTS[p.language] || '#324D47';
            return (
              <React.Fragment key={p.id}>
                <Reveal delay={i * 0.1}>
                  <div
                    className="bg-white rounded-2xl border border-[#09090F]/[0.06] p-6 cursor-pointer hover:shadow-[0_8px_32px_rgba(50,77,71,0.07)] hover:border-[#324D47]/20 transition-all duration-300 group"
                    onClick={() => navigate(`/egitimlerimiz/${p.slug}`)}
                  >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a }} />
                    <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[10px] tracking-[0.1em]" style={{ color: `${a}CC` }}>{p.languageLabel}</span>
                  </div>
                  <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[15px] mb-2 group-hover:text-[#324D47] transition-colors">{p.name}</h3>
                  <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/45 text-[12px] leading-[1.6] line-clamp-2 mb-4">{p.description}</p>
                  <span className="flex items-center gap-1 text-[#324D47] text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] group-hover:gap-2 transition-all">
                    Detayları İncele <ChevronRight size={12} />
                  </span>
                  </div>
                </Reveal>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DEFAULT QUICK STATS (fallback when content.quickStats is not set)
   ═══════════════════════════════════════════════════════════════════════ */
function defaultQuickStats(program: ProgramItem) {
  return [
    { icon: null, value: '%85', label: 'Konuşma Pratiği' },
    { icon: null, value: 'Esnek', label: 'Ders Saatleri' },
    { icon: null, value: program.classTypes.includes('group') ? 'Maks. 10 Kişi' : 'Birebir', label: program.classTypes.includes('group') ? 'Grup Dersi' : 'Özel Ders' },
    { icon: null, value: program.formats.length > 1 ? 'Hibrit' : program.formats[0] === 'online' ? 'Online' : 'Yüz Yüze', label: 'Ders Formatı' },
  ];
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function ProgramDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { open: openFreeTrial } = useFreeTrial();

  const slug = `${params.lang}/${params.program}`;
  const program = ALL_PROGRAMS.find(p => p.slug === slug);
  const contentForSeo = program ? getCategoryContent(program) : null;

  useEffect(() => {
    const jsonLdIds = ['teachera-program-course-jsonld', 'teachera-program-faq-jsonld', 'teachera-program-breadcrumb-jsonld'];
    const pageUrl = `${window.location.origin}${window.location.pathname}`;

    if (!program || !contentForSeo) {
      document.title = 'Program Bulunamadı | Teachera';
      upsertMetaTag('name', 'description', 'Aradığınız program bulunamadı. Teachera eğitim programları sayfasından güncel programları inceleyebilirsiniz.');
      upsertMetaTag('name', 'keywords', 'konya dil kursu, türkiye online dil kursu, teachera programlar');
      upsertMetaTag('name', 'robots', 'noindex,follow,noarchive');
      upsertMetaTag('property', 'og:type', 'website');
      upsertMetaTag('property', 'og:title', 'Program Bulunamadı | Teachera');
      upsertMetaTag('property', 'og:description', 'Aradığınız program bulunamadı. Teachera eğitim programları sayfasına dönebilirsiniz.');
      upsertMetaTag('property', 'og:url', `${SITE_URL}/egitimlerimiz`);
      upsertMetaTag('property', 'og:image', `${SITE_URL}/favicon-32x32.png`);
      upsertMetaTag('name', 'twitter:card', 'summary');
      upsertMetaTag('name', 'twitter:title', 'Program Bulunamadı | Teachera');
      upsertMetaTag('name', 'twitter:description', 'Aradığınız program bulunamadı. Teachera eğitim programları sayfasına dönebilirsiniz.');
      upsertMetaTag('name', 'twitter:image', `${SITE_URL}/favicon-32x32.png`);
      upsertCanonicalLink(`${SITE_URL}/egitimlerimiz`);

      jsonLdIds.forEach((id) => {
        const script = document.getElementById(id);
        if (script) script.remove();
      });
      return;
    }

    const localizedLanguage = program.languageLabel.toLocaleLowerCase('tr-TR');
    const pageTitle = `${program.name} | Konya ${program.languageLabel} Kursu | Teachera`;
    const description = `${program.name}: Konya Selçuklu merkezli Teachera ile ${program.languageLabel} eğitiminde konuşma odaklı yaklaşım. Türkiye geneline online, Konya’da yüz yüze seçenekler.`;
    const courseMode = program.formats.length > 1 ? 'Hybrid' : program.formats[0] === 'online' ? 'Online' : 'Onsite';
    const keywords = [
      `konya ${localizedLanguage} kursu`,
      `türkiye online ${localizedLanguage} kursu`,
      `${program.name.toLocaleLowerCase('tr-TR')} teachera`,
      'konuşma odaklı dil eğitimi',
      'teachera konya',
    ];
    const faqEntities = contentForSeo.faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    }));

    document.title = pageTitle;
    upsertMetaTag('name', 'description', description);
    upsertMetaTag('name', 'keywords', keywords.join(', '));
    upsertMetaTag('name', 'robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    upsertMetaTag('property', 'og:type', 'website');
    upsertMetaTag('property', 'og:title', pageTitle);
    upsertMetaTag('property', 'og:description', description);
    upsertMetaTag('property', 'og:url', pageUrl);
    upsertMetaTag('property', 'og:image', `${SITE_URL}/favicon-32x32.png`);
    upsertMetaTag('name', 'twitter:card', 'summary');
    upsertMetaTag('name', 'twitter:title', pageTitle);
    upsertMetaTag('name', 'twitter:description', description);
    upsertMetaTag('name', 'twitter:image', `${SITE_URL}/favicon-32x32.png`);
    upsertCanonicalLink(pageUrl);

    upsertJsonLd('teachera-program-course-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: program.name,
      description: program.description,
      inLanguage: 'tr-TR',
      courseMode,
      provider: {
        '@type': 'LanguageSchool',
        name: 'Teachera Dil Okulu',
        url: SITE_URL,
        telephone: '+90 332 236 80 66',
        email: 'info@teachera.com.tr',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Kule Plaza Kat: 26',
          addressLocality: 'Selçuklu',
          addressRegion: 'Konya',
          addressCountry: 'TR',
        },
      },
      areaServed: ['Konya', 'Türkiye'],
      url: pageUrl,
      availableLanguage: [program.languageLabel],
    });

    upsertJsonLd('teachera-program-faq-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntities,
    });

    upsertJsonLd('teachera-program-breadcrumb-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Ana Sayfa',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Eğitimlerimiz',
          item: `${SITE_URL}/egitimlerimiz`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: program.name,
          item: pageUrl,
        },
      ],
    });

    return () => {
      jsonLdIds.forEach((id) => {
        const script = document.getElementById(id);
        if (script) script.remove();
      });
    };
  }, [contentForSeo, program]);

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-3xl mb-4">Program Bulunamadı</h1>
          <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/50 mb-8">Aradığınız program mevcut değil veya kaldırılmış olabilir.</p>
          <button onClick={() => navigate('/egitimlerimiz')} className="px-6 py-3 rounded-xl bg-[#324D47] text-white font-['Neutraface_2_Text:Demi',sans-serif] text-sm">Tüm Programlara Dön</button>
        </div>
      </div>
    );
  }

  const accent = LANG_ACCENTS[program.language] || '#324D47';
  const content = getCategoryContent(program);
  const heroImg = getHeroImage(program);
  const flowSteps = getFlowSteps(program);
  const testimonials = getTestimonials(program.category, program.id);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative bg-[#09090F] overflow-hidden">
        {/* Vintage cinematic background */}
        <div className="absolute inset-0">
          <ImageWithFallback src={heroImg} alt="" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090F]/60 via-[#09090F]/40 to-[#09090F]" />
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-28">
          {/* Back */}
          <motion.button
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate('/egitimlerimiz')}
            className="flex items-center gap-2 text-white/50 hover:text-white/80 font-['Neutraface_2_Text:Book',sans-serif] text-sm mb-10 transition-colors"
          >
            <ArrowLeft size={16} />
            Tüm Programlar
          </motion.button>

          <div className="max-w-3xl">
            {/* Language badge */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-mobile-kicker md:text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.05em] md:tracking-[0.08em]" style={{ backgroundColor: `${accent}CC` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                {program.languageLabel}
              </span>
              {program.badges.map(b => (
                <span key={b} className="text-white/30 text-mobile-kicker md:text-[11px] font-['Neutraface_2_Text:Book',sans-serif]">{b}</span>
              ))}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-3xl md:text-5xl lg:text-[3.5rem] leading-[1.1] mb-5"
            >
              {program.name}
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="font-['Neutraface_2_Text:Book',sans-serif] text-white/60 text-lg md:text-xl leading-relaxed mb-8 max-w-xl"
            >
              {content.heroTagline}
            </motion.p>

            {/* CTA buttons */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openFreeTrial}
                className="px-5 md:px-6 py-2 md:py-2.5 border border-[#324D47]/60 backdrop-blur-sm text-white rounded-full text-mobile-kicker sm:text-xs md:text-sm font-['Neutraface_2_Text:Demi',sans-serif] hover:bg-[#324D47]/20 hover:border-[#324D47] transition-all"
              >
                Ücretsiz Deneme Seansı
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/iletisim')}
                className="px-5 md:px-6 py-2 md:py-2.5 border border-white/40 backdrop-blur-sm text-white rounded-full text-mobile-kicker sm:text-xs md:text-sm font-['Neutraface_2_Text:Book',sans-serif] hover:bg-white/5 hover:border-white/60 transition-all"
              >
                Detaylı Bilgi Al
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── DESCRIPTION + WHO IS IT FOR ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
            {/* Left: Description */}
            <Reveal>
              <div>
                <span className="inline-block font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker md:text-[10px] tracking-[0.08em] md:tracking-[0.15em] mb-4" style={{ color: accent }}>
                  PROGRAM HAKKINDA
                </span>
                <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-2xl md:text-3xl leading-tight mb-6">{program.name}</h2>
                <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/55 text-[15px] leading-[1.8] mb-8">{program.description}</p>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-4">
                  {(content.quickStats || defaultQuickStats(program)).map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#FAFAF8] border border-[#09090F]/[0.04]">
                      <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-mobile-kicker md:text-[11px] tracking-[0.05em] mb-2 block" style={{ color: `${accent}60` }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F] text-mobile-meta md:text-[13px] block mb-0.5">{stat.value}</span>
                      <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/40 text-mobile-kicker md:text-[11px]">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Right: Who is it for */}
            <Reveal delay={0.15}>
              <div>
                <span className="inline-block font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker md:text-[10px] tracking-[0.08em] md:tracking-[0.15em] text-[#324D47] mb-4">KİME UYGUN?</span>
                <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-2xl md:text-3xl leading-tight mb-8">{content.whoIsItFor.title}</h2>
                <ul className="space-y-4">
                  {content.whoIsItFor.items.map((item, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="flex gap-3 items-baseline">
                      <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-mobile-kicker md:text-[11px] tracking-[0.05em] shrink-0" style={{ color: `${accent}60` }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/65 text-[14px] leading-[1.6]">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── FLOW DIAGRAM (zigzag timeline) ─── */}
      <FlowDiagramSection steps={flowSteps} title={content.flowTitle} subtitle={content.flowSubtitle} />

      {/* ─── STARS — Speaking Cafe & Language Lab (en-grup only) ─── */}
      {program.id === 'en-grup-f2f' && <StarsSection />}

      {/* ─── CURRICULUM ─── */}
      <section className="py-20 md:py-28 bg-[#FAFAF8] relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none" style={{ backgroundColor: `${accent}08` }} />
        <div className="max-w-4xl mx-auto px-6 md:px-10 relative">
          <Reveal>
            <div className="text-center mb-14 md:mb-18">
              <span className="inline-block font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker md:text-[10px] tracking-[0.08em] md:tracking-[0.15em] mb-4" style={{ color: accent }}>MÜFREDAT</span>
              <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-2xl md:text-3xl">{content.curriculum.title}</h2>
            </div>
          </Reveal>
          <div className="space-y-0">
            {content.curriculum.modules.map((mod, i) => (
              <React.Fragment key={`${mod.name}-${i}`}>
                <Reveal delay={i * 0.08}>
                  <div className="relative pl-12 md:pl-16 pb-10 last:pb-0">
                    {i < content.curriculum.modules.length - 1 && <div className="absolute left-[18px] md:left-[22px] top-10 bottom-0 w-px bg-gradient-to-b from-[#09090F]/[0.08] to-transparent" />}
                    <div className="absolute left-0 top-0 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white font-['Neutraface_2_Text:Bold',sans-serif] text-[12px] md:text-[13px]" style={{ backgroundColor: accent }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="bg-white rounded-2xl border border-[#09090F]/[0.05] p-5 md:p-6 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow">
                      <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[15px] mb-2">{mod.name}</h3>
                      <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/50 text-mobile-meta md:text-[13px] leading-[1.7]">{mod.detail}</p>
                    </div>
                  </div>
                </Reveal>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <TestimonialSection testimonials={testimonials} />

      {/* ─── FAQ ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-block font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker md:text-[10px] tracking-[0.08em] md:tracking-[0.15em] text-[#324D47] mb-4">SIKÇA SORULAN SORULAR</span>
              <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-2xl md:text-3xl">Merak Edilenler</h2>
            </div>
          </Reveal>
          <div className="space-y-4">
            {content.faqs.map((faq, i) => (
              <React.Fragment key={`${faq.q}-${i}`}>
                <FAQItem question={faq.q} answer={faq.a} index={i} accent={accent} ctaType={faq.ctaType} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-20 md:py-28 bg-[#FAFAF8]">
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
          <Reveal>
            <span className="inline-block font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker md:text-[10px] tracking-[0.08em] md:tracking-[0.15em] mb-4" style={{ color: accent }}>
              HAREKETE GEÇ
            </span>
            <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-2xl md:text-3xl leading-tight mb-4">
              {program.name} ile Yolculuğunuza Başlayın
            </h2>
            <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/50 text-mobile-meta sm:text-[15px] leading-[1.7] mb-10 max-w-xl mx-auto">
              Ücretsiz deneme dersiyle Teachera farkını deneyimleyin veya eğitim danışmanlarımızdan detaylı bilgi alın.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openFreeTrial}
                className="px-5 md:px-6 py-2 md:py-2.5 border border-[#324D47]/60 text-[#324D47] rounded-full text-mobile-kicker sm:text-xs md:text-sm font-['Neutraface_2_Text:Demi',sans-serif] hover:bg-[#324D47]/10 hover:border-[#324D47] transition-all"
              >
                Ücretsiz Deneme Seansı
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/iletisim')}
                className="px-5 md:px-6 py-2 md:py-2.5 border border-[#09090F]/15 text-[#09090F]/50 rounded-full text-mobile-kicker sm:text-xs md:text-sm font-['Neutraface_2_Text:Book',sans-serif] hover:border-[#09090F]/30 hover:text-[#09090F]/70 transition-all"
              >
                Detaylı Bilgi Al
              </motion.button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── RELATED PROGRAMS ─── */}
      <RelatedPrograms current={program} />
    </>
  );
}

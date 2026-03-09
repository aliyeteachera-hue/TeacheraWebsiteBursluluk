import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  Monitor,
  MapPin,
  Layers,
  ChevronRight,
  Check,
  RotateCcw,
  Sparkles,
  Clock,
  Zap,
  Shield,
  Phone,
  Users,
  User,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { useFreeTrial } from './FreeTrialContext';
import { useLevelAssessment } from './LevelAssessmentContext';
import { useMotionTiming } from '../lib/uiMotion';

/* ═══════════════════════════════════════════════════════════════════════
   TYPES & DATA
   ═══════════════════════════════════════════════════════════════════════ */

type AgeGroup = 'child' | 'teen' | 'adult';
type GoalType = 'conversation' | 'academic' | 'career';
type ClassType = 'private' | 'group';
type FormatType = 'online' | 'face-to-face';

interface AgeOption {
  id: AgeGroup;
  title: string;
  range: string;
  description: string;
}

interface LanguageOption {
  id: string;
  name: string;
  native: string;
  accent: string;
  tagline: string;
  programCount: number;
  badge?: 'popular' | 'trending';
  formats: ('online' | 'face-to-face')[];
}

interface GoalOption {
  id: GoalType;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
}

interface FormatOption {
  id: FormatType | 'any';
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface RecommendedProgram {
  name: string;
  promise: string;
  badges: string[];
  strength: 'perfect' | 'strong' | 'good';
  slug: string;
  languageLabel: string;
  languageAccent: string;
  formats: ('online' | 'face-to-face')[];
  classTypes: ('private' | 'group')[];
  nativeSpeaker: boolean;
}

const AGE_OPTIONS: AgeOption[] = [
  {
    id: 'adult',
    title: 'Yetişkin',
    range: '18+ yaş',
    description: 'Kariyer, sınav, kültür veya kişisel gelişim — hedefe özel yolculuk.',
  },
  {
    id: 'teen',
    title: 'Genç',
    range: '13 – 17 yaş',
    description: 'Akademik hedefler, akıcılık ve geleceğe yatırım.',
  },
  {
    id: 'child',
    title: 'Çocuk',
    range: '4 – 12 yaş',
    description: 'Oyunla öğrenme, doğal dil edinimi ve erken dönem alışkanlıkları.',
  },
];

const LANGUAGES: LanguageOption[] = [
  { id: 'ingilizce', name: 'İngilizce', native: 'English', accent: '#E70000', tagline: 'Küresel iletişimin anahtarı.', programCount: 15, badge: 'popular', formats: ['online', 'face-to-face'] },
  { id: 'ispanyolca', name: 'İspanyolca', native: 'Español', accent: '#FFC400', tagline: 'Tutkunun ve kültürün dili.', programCount: 4, badge: 'trending', formats: ['online', 'face-to-face'] },
  { id: 'almanca', name: 'Almanca', native: 'Deutsch', accent: '#DD0000', tagline: 'Mühendisliğin ve felsefenin dili.', programCount: 5, formats: ['online', 'face-to-face'] },
  { id: 'fransizca', name: 'Fransızca', native: 'Français', accent: '#0055A4', tagline: 'Diplomasi ve zerafetin dili.', programCount: 5, formats: ['online', 'face-to-face'] },
  { id: 'italyanca', name: 'İtalyanca', native: 'Italiano', accent: '#008C45', tagline: 'Sanat, tarih ve lezzetin dili.', programCount: 3, formats: ['online', 'face-to-face'] },
  { id: 'rusca', name: 'Rusça', native: 'Русский', accent: '#D52B1E', tagline: 'Edebiyatın ve stratejinin dili.', programCount: 3, formats: ['online', 'face-to-face'] },
  { id: 'arapca', name: 'Arapça', native: 'العربية', accent: '#006C35', tagline: 'Medeniyetin ve bilimin dili.', programCount: 3, formats: ['online', 'face-to-face'] },
];

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'conversation',
    title: 'Konuşma & Kültür',
    subtitle: 'Akıcılık, özgüven ve gerçek senaryolar',
    description: 'Günlük yaşam, seyahat ve kültürel etkileşim için.',
    emoji: '💬',
  },
  {
    id: 'academic',
    title: 'Akademik & Sınav',
    subtitle: 'Hedef skor, plan ve ölçüm',
    description: 'IELTS, TOEFL, DELE, Goethe ve daha fazlası.',
    emoji: '🎯',
  },
  {
    id: 'career',
    title: 'Kariyer & İş Dünyası',
    subtitle: 'Toplantı, sunum ve teknik terminoloji',
    description: 'Profesyonel dil yetkinliği ve sektörel uzmanlık.',
    emoji: '🚀',
  },
];

const FORMAT_OPTIONS: FormatOption[] = [
  { id: 'online', label: 'Online', icon: <Monitor size={18} />, description: 'Her yerden erişim' },
  { id: 'any', label: 'Farketmez', icon: <Layers size={18} />, description: 'En geniş seçenek' },
  { id: 'face-to-face', label: 'Yüz Yüze', icon: <MapPin size={18} />, description: 'Kule Plaza, Konya' },
];

const STEPS = [
  { num: '01', label: 'Yaş', short: 'Yaşını seç' },
  { num: '02', label: 'Dil', short: 'Dilini seç' },
  { num: '03', label: 'Amaç', short: 'Amacını belirle' },
  { num: '04', label: 'Format', short: 'Formatını seç' },
];

const STEP_QUESTIONS = [
  'Eğitim kimin için?',
  'Hangi dili öğrenmek istiyorsun?',
  'Öğrenme amacın ne?',
  'Online mı, yüz yüze mi?',
];

const STEP_DESCRIPTIONS = [
  'Yaş grubuna göre en uygun müfredatı belirleyelim.',
  'Hedef diline göre mevcut programları filtreleyelim.',
  'Amacına uygun en etkili programı eşleştirelim.',
  'Son adım — formatını seç, sana özel önerileri gör.',
];

const ENCOURAGEMENTS = [
  ['Harika seçim!', 'Şimdi uygun dilleri gösteriyoruz...'],
  ['Mükemmel!', 'Amacını belirleyelim...'],
  ['Neredeyse bitti!', 'Son adıma geçiyoruz...'],
];

/* ═══════════════════════════════════════════════════════════════════════
   PROGRAM CATALOG
   Her programın gerçek mevcut class type ve format bilgisi.
   Her programın gerçek class type ve format bilgisi badge için kullanılır.
   ═══════════════════════════════════════════════════════════════════════ */
interface CatalogEntry {
  name: string;
  promise: string;
  slug: string;
  ages: AgeGroup[];
  languages: string[] | 'all';
  goals: GoalType[];
  classTypes: ('private' | 'group')[];
  formats: ('online' | 'face-to-face')[];
  priority: number; // düşük = daha yüksek öncelik
  extraBadges?: string[];
}

const PROGRAM_CATALOG: CatalogEntry[] = [
  // ──── ÇOCUK — İngilizce ────
  { name: 'Mini Kids İngilizce', promise: 'Oyun ve etkileşimle doğal dil edinimi — çocuğunuz farkında bile olmadan öğrenecek.', slug: 'ingilizce/mini-kids', ages: ['child'], languages: ['ingilizce'], goals: ['conversation', 'academic', 'career'], classTypes: ['group'], formats: ['face-to-face'], priority: 1, extraBadges: ['4-6 Yaş'] },
  { name: 'Kids İngilizce Grup', promise: 'Native speaker eğitmenlerle yüz yüze grup dersleri — eğlenceli aktiviteler ve %85 konuşma pratiği.', slug: 'ingilizce/kids-grup', ages: ['child'], languages: ['ingilizce'], goals: ['conversation', 'academic', 'career'], classTypes: ['group'], formats: ['face-to-face'], priority: 1, extraBadges: ['7-12 Yaş'] },
  { name: 'Online Kids İngilizce', promise: 'Evden güvenle katılım — native speaker eğitmenlerle interaktif, oyunlaştırılmış canlı dersler.', slug: 'ingilizce/online-kids', ages: ['child'], languages: ['ingilizce'], goals: ['conversation', 'academic', 'career'], classTypes: ['group'], formats: ['online'], priority: 1, extraBadges: ['7-12 Yaş'] },
  { name: 'Kids İngilizce Özel Ders', promise: 'Çocuğunuzun hızında ilerleyen, tamamen kişiselleştirilmiş birebir İngilizce programı.', slug: 'ingilizce/kids-ozel', ages: ['child'], languages: ['ingilizce'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['7-12 Yaş'] },

  // ──── ÇOCUK — Almanca ────
  { name: 'Kids Almanca', promise: 'Erken yaştan Almanca — birebir özel derslerle doğal edinim.', slug: 'almanca/kids', ages: ['child'], languages: ['almanca'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['7-12 Yaş'] },

  // ──── ÇOCUK — İspanyolca ────
  { name: 'Kids İspanyolca', promise: 'Native speaker eğitmenle birebir İspanyolca — erken yaşta ikinci dil alışkanlığı.', slug: 'ispanyolca/kids', ages: ['child'], languages: ['ispanyolca'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['7-12 Yaş'] },

  // ──── GENÇ — İngilizce ────
  { name: 'Teens İngilizce Grup', promise: 'Yüz yüze grup programı — akıcılık ve özgüven odaklı, gençlerin dünyasına uygun içerik.', slug: 'ingilizce/teens-grup', ages: ['teen'], languages: ['ingilizce'], goals: ['conversation', 'academic', 'career'], classTypes: ['group'], formats: ['face-to-face'], priority: 1, extraBadges: ['13-17 Yaş'] },
  { name: 'Online Teens İngilizce', promise: 'Evden güvenle katılım — native speaker eğitmenlerle interaktif canlı dersler.', slug: 'ingilizce/online-teens', ages: ['teen'], languages: ['ingilizce'], goals: ['conversation', 'academic', 'career'], classTypes: ['group'], formats: ['online'], priority: 1, extraBadges: ['13-17 Yaş'] },
  { name: 'Teens İngilizce Özel Ders', promise: 'Gencin hedefine göre şekillenen, konuşma odaklı kişiselleştirilmiş birebir program.', slug: 'ingilizce/teens-ozel', ages: ['teen'], languages: ['ingilizce'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['13-17 Yaş'] },

  // ──── GENÇ — Diğer diller ────
  { name: 'Teens İspanyolca Grup', promise: 'Gençlere özel İspanyolca grup programı — etkileşimli konuşma pratiği ve akran öğrenme enerjisi.', slug: 'ispanyolca/teens-grup', ages: ['teen'], languages: ['ispanyolca'], goals: ['conversation', 'academic', 'career'], classTypes: ['group'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['13-17 Yaş'] },
  { name: 'Teens İspanyolca Özel Ders', promise: 'Gençlere özel İspanyolca birebir program — kendi hızında, kişiselleştirilmiş ilerleme.', slug: 'ispanyolca/teens-ozel', ages: ['teen'], languages: ['ispanyolca'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['13-17 Yaş'] },
  { name: 'Teens Almanca', promise: 'Gençlere özel Almanca programı — birebir özel derslerle hızlı ilerleme.', slug: 'almanca/teens', ages: ['teen'], languages: ['almanca'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['13-17 Yaş'] },
  { name: 'Teens Fransızca', promise: 'Gençlere özel Fransızca programı — birebir özel derslerle hızlı ilerleme.', slug: 'fransizca/teens', ages: ['teen'], languages: ['fransizca'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['13-17 Yaş'] },
  { name: 'Teens İtalyanca', promise: 'Gençlere özel İtalyanca programı — birebir özel derslerle sanat ve kültür dili.', slug: 'italyanca/teens', ages: ['teen'], languages: ['italyanca'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['13-17 Yaş'] },
  { name: 'Teens Rusça', promise: 'Gençlere özel Rusça programı — birebir özel derslerle stratejik dil yetkinliği.', slug: 'rusca/teens', ages: ['teen'], languages: ['rusca'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['13-17 Yaş'] },

  // ──── AKADEMİK SINAV — İngilizce ────
  { name: 'IELTS Hazırlık', promise: 'Hedef puanınıza özel modüler sınav hazırlık programı.', slug: 'ingilizce/ielts', ages: ['teen', 'adult'], languages: ['ingilizce'], goals: ['academic'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['Sınav'] },
  { name: 'TOEFL IBT', promise: 'TOEFL IBT sınavı için stratejik hazırlık programı.', slug: 'ingilizce/toefl', ages: ['teen', 'adult'], languages: ['ingilizce'], goals: ['academic'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['Sınav'] },
  { name: 'PTE Academic', promise: 'Bilgisayar tabanlı sınav formatına özel hazırlık programı.', slug: 'ingilizce/pte', ages: ['adult'], languages: ['ingilizce'], goals: ['academic'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 2, extraBadges: ['Sınav'] },
  { name: 'YDS / YÖKDİL', promise: 'Akademik İngilizce sınav hazırlığı — hedef puanınıza stratejik planla ulaşın.', slug: 'ingilizce/yds-yokdil', ages: ['adult'], languages: ['ingilizce'], goals: ['academic'], classTypes: ['private', 'group'], formats: ['online', 'face-to-face'], priority: 2, extraBadges: ['Sınav'] },

  // ──── AKADEMİK SINAV — Diğer diller ────
  { name: 'DELE / SIELE', promise: 'İspanyolca akademik sınav hazırlık programı — hedef puanınıza stratejik planla ulaşın.', slug: 'ispanyolca/dele-siele', ages: ['adult'], languages: ['ispanyolca'], goals: ['academic'], classTypes: ['private', 'group'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['Sınav'] },
  { name: 'Goethe / TestDaF / TELC', promise: 'Almanca akademik sınav hazırlık programı — hedef puanınıza stratejik planla ulaşın.', slug: 'almanca/goethe-testdaf', ages: ['adult'], languages: ['almanca'], goals: ['academic'], classTypes: ['private', 'group'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['Sınav'] },
  { name: 'DELF / DALF / TCF', promise: 'Fransızca akademik sınav hazırlık programı — hedef puanınıza stratejik planla ulaşın.', slug: 'fransizca/delf-dalf', ages: ['adult'], languages: ['fransizca'], goals: ['academic'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['Sınav'] },
  { name: 'CILS / CELI', promise: 'İtalyanca akademik sınav hazırlık programı — hedef puanınıza stratejik planla ulaşın.', slug: 'italyanca/cils-celi', ages: ['adult'], languages: ['italyanca'], goals: ['academic'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['Sınav'] },
  { name: 'TORFL', promise: 'Rusça akademik sınav hazırlık programı — hedef puanınıza stratejik planla ulaşın.', slug: 'rusca/torfl', ages: ['adult'], languages: ['rusca'], goals: ['academic'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['Sınav'] },

  // ──── KARİYER — İngilizce ────
  { name: 'Business English', promise: 'Toplantı, müzakere ve sunum dili — profesyonel iletişimde güven.', slug: 'ingilizce/business', ages: ['adult'], languages: ['ingilizce'], goals: ['career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['İş Dünyası'] },
  { name: 'Marketing Management', promise: 'Pazarlama ve yönetim terminolojisi ile global kariyer.', slug: 'ingilizce/marketing', ages: ['adult'], languages: ['ingilizce'], goals: ['career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 2, extraBadges: ['İş Dünyası'] },
  { name: 'Finance & Industry', promise: 'Finans ve endüstri terminolojisi ile sektörde öne çıkın.', slug: 'ingilizce/finance', ages: ['adult'], languages: ['ingilizce'], goals: ['career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 3, extraBadges: ['İş Dünyası'] },
  { name: 'Legal English', promise: 'Hukuk terminolojisi ve profesyonel yazışma becerileri.', slug: 'ingilizce/legal', ages: ['adult'], languages: ['ingilizce'], goals: ['career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 3, extraBadges: ['İş Dünyası'] },
  { name: 'Medical English', promise: 'Tıp terminolojisi ve hasta iletişimi.', slug: 'ingilizce/medical', ages: ['adult'], languages: ['ingilizce'], goals: ['career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 3, extraBadges: ['İş Dünyası'] },

  // ──── KARİYER — Fransızca ────
  { name: 'Hukuki Fransızca', promise: 'Fransızca hukuki terminoloji ve profesyonel yazışma — uluslararası hukuk alanında yetkinlik.', slug: 'fransizca/hukuki', ages: ['adult'], languages: ['fransizca'], goals: ['career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 1, extraBadges: ['Hukuk'] },

  // ──── GENEL DİL — Dil bazlı Grup ve Özel Ders programları ────

  // İngilizce Genel
  { name: 'İngilizce Grup Programı', promise: 'Native speaker eğitmenlerle %85 konuşma pratiğine dayalı grup dersleri. Teachera Teaching Method ile günlük hayatta en çok kullanılan yapıları keşfedin.', slug: 'ingilizce/grup-programi', ages: ['adult'], languages: ['ingilizce'], goals: ['conversation'], classTypes: ['group'], formats: ['face-to-face'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'Online İngilizce Grup Programı', promise: 'Native speaker eğitmenlerle canlı grup dersleri — Teachera Teaching Method\'un konuşma odaklı enerjisini online ortamda yaşayın.', slug: 'ingilizce/online-grup', ages: ['adult'], languages: ['ingilizce'], goals: ['conversation'], classTypes: ['group'], formats: ['online', 'face-to-face'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'İngilizce Özel Ders', promise: 'Tamamen size özel müfredat ve native speaker eğitmenle birebir. Tempoyu ve yoğunluğu siz belirleyin.', slug: 'ingilizce/ozel-ders', ages: ['adult'], languages: ['ingilizce'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 3, extraBadges: ['A1-C2'] },

  // İspanyolca Genel
  { name: 'İspanyolca Grup Programı', promise: 'Native speaker eğitmenlerle yüz yüze, %85 konuşma odaklı İspanyolca grup dersleri.', slug: 'ispanyolca/grup-programi', ages: ['adult'], languages: ['ispanyolca'], goals: ['conversation'], classTypes: ['group'], formats: ['face-to-face'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'Online İspanyolca Grup', promise: 'Native speaker eğitmenlerle canlı, interaktif İspanyolca grup dersleri — online ortamda.', slug: 'ispanyolca/online-grup', ages: ['adult'], languages: ['ispanyolca'], goals: ['conversation'], classTypes: ['group'], formats: ['online'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'İspanyolca Özel Ders', promise: 'Native speaker eğitmenle tamamen size özel İspanyolca — kendi temponuzda, birebir konuşma pratiği.', slug: 'ispanyolca/ozel-ders', ages: ['adult'], languages: ['ispanyolca'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 3, extraBadges: ['A1-C2'] },

  // Almanca Genel
  { name: 'Almanca Grup Programı', promise: '%85 konuşma pratiğine dayalı yüz yüze Almanca grup dersleri.', slug: 'almanca/grup-programi', ages: ['adult'], languages: ['almanca'], goals: ['conversation'], classTypes: ['group'], formats: ['face-to-face'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'Online Almanca Grup', promise: 'Canlı, interaktif Almanca grup dersleri — %85 konuşma odaklı, online ortamda.', slug: 'almanca/online-grup', ages: ['adult'], languages: ['almanca'], goals: ['conversation'], classTypes: ['group'], formats: ['online'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'Almanca Özel Ders', promise: 'Tamamen size özel Almanca müfredatı ve birebir eğitmen desteği — tempoyu siz belirleyin.', slug: 'almanca/ozel-ders', ages: ['adult'], languages: ['almanca'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 3, extraBadges: ['A1-C2'] },

  // Fransızca Genel
  { name: 'Fransızca Grup Programı', promise: '%85 konuşma pratiğine dayalı yüz yüze Fransızca grup dersleri.', slug: 'fransizca/grup-programi', ages: ['adult'], languages: ['fransizca'], goals: ['conversation'], classTypes: ['group'], formats: ['face-to-face'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'Online Fransızca Grup', promise: 'Canlı, interaktif Fransızca grup dersleri — online ortamda.', slug: 'fransizca/online-grup', ages: ['adult'], languages: ['fransizca'], goals: ['conversation'], classTypes: ['group'], formats: ['online'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'Fransızca Özel Ders', promise: 'Tamamen size özel Fransızca müfredatı — diplomatik dili konuşarak keşfedin.', slug: 'fransizca/ozel-ders', ages: ['adult'], languages: ['fransizca'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 3, extraBadges: ['A1-C2'] },

  // İtalyanca Genel
  { name: 'İtalyanca Grup Programı', promise: 'Native speaker eğitmenlerle yüz yüze, %85 konuşma odaklı İtalyanca grup dersleri.', slug: 'italyanca/grup-programi', ages: ['adult'], languages: ['italyanca'], goals: ['conversation'], classTypes: ['group'], formats: ['face-to-face'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'Online İtalyanca Grup', promise: 'Native speaker eğitmenlerle canlı, interaktif İtalyanca grup dersleri — online ortamda.', slug: 'italyanca/online-grup', ages: ['adult'], languages: ['italyanca'], goals: ['conversation'], classTypes: ['group'], formats: ['online'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'İtalyanca Özel Ders', promise: 'Native speaker eğitmenle tamamen size özel İtalyanca — kültürden kariyere, birebir program.', slug: 'italyanca/ozel-ders', ages: ['adult'], languages: ['italyanca'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 3, extraBadges: ['A1-C2'] },

  // Rusça Genel
  { name: 'Rusça Grup Programı', promise: '%85 konuşma pratiğine dayalı yüz yüze Rusça grup dersleri.', slug: 'rusca/grup-programi', ages: ['adult'], languages: ['rusca'], goals: ['conversation'], classTypes: ['group'], formats: ['face-to-face'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'Online Rusça Grup', promise: 'Canlı, interaktif Rusça grup dersleri — online ortamda.', slug: 'rusca/online-grup', ages: ['adult'], languages: ['rusca'], goals: ['conversation'], classTypes: ['group'], formats: ['online'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'Rusça Özel Ders', promise: 'Tamamen size özel Rusça müfredatı ve birebir eğitmen desteği — esnek tempolu program.', slug: 'rusca/ozel-ders', ages: ['adult'], languages: ['rusca'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 3, extraBadges: ['A1-C2'] },

  // Arapça
  { name: 'Arapça Grup Programı', promise: '%85 konuşma pratiğine dayalı yüz yüze Arapça grup dersleri — native speaker eğitmenlerle.', slug: 'arapca/grup-programi', ages: ['adult'], languages: ['arapca'], goals: ['conversation'], classTypes: ['group'], formats: ['face-to-face'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'Online Arapça Grup', promise: 'Canlı, interaktif Arapça grup dersleri — native speaker eğitmenlerle online ortamda.', slug: 'arapca/online-grup', ages: ['adult'], languages: ['arapca'], goals: ['conversation'], classTypes: ['group'], formats: ['online'], priority: 2, extraBadges: ['A1-C2'] },
  { name: 'Arapça Özel Ders', promise: 'Native speaker eğitmenle tamamen size özel Arapça — Modern Standart veya günlük konuşma odaklı birebir program.', slug: 'arapca/ozel-ders', ages: ['adult'], languages: ['arapca'], goals: ['conversation', 'academic', 'career'], classTypes: ['private'], formats: ['online', 'face-to-face'], priority: 2, extraBadges: ['A1-C2'] },
];

/* ═══════════════════════════════════════════════════════════════════════
   RECOMMENDATION ENGINE — SERT FİLTRE
   4 kriterin tamamı eşleşmeli: yaş + dil + amaç + format.
   Eşleşme yoksa boş döner, UI "bulamadık" mesajı gösterir.
   ═══════════════════════════════════════════════════════════════════════ */
function getRecommendations(
  age: AgeGroup,
  language: string,
  goal: GoalType,
  format: FormatType | 'any' | null
): RecommendedProgram[] {
  const langName = LANGUAGES.find(l => l.id === language)?.name || '';
  const fmt = format || 'any';

  // 4 kriter sert filtre: yaş + dil + amaç + format
  const matches = PROGRAM_CATALOG.filter(p => {
    const ageOk = p.ages.includes(age);
    const langOk = p.languages === 'all' || p.languages.includes(language);
    const goalOk = p.goals.includes(goal);
    const formatOk = fmt === 'any' || p.formats.includes(fmt as 'online' | 'face-to-face');
    return ageOk && langOk && goalOk && formatOk;
  });

  // Önceliğe göre sırala
  matches.sort((a, b) => a.priority - b.priority);

  const fixName = (name: string) => name;
  const fixSlug = (slug: string) => slug;
  const fixPromise = (p: CatalogEntry) => p.promise;
  const makeBadges = (p: CatalogEntry): string[] => {
    const badges: string[] = [...(p.extraBadges || [])];
    badges.push(p.classTypes.length === 1
      ? (p.classTypes[0] === 'private' ? 'Özel' : 'Grup')
      : 'Özel & Grup');
    badges.push(p.formats.length === 1
      ? (p.formats[0] === 'online' ? 'Online' : 'Yüz Yüze')
      : 'Online & Yüz Yüze');
    return badges;
  };

  const seen = new Set<string>();
  const results: RecommendedProgram[] = [];

  for (const p of matches) {
    const slug = fixSlug(p.slug);
    if (seen.has(slug)) continue;
    seen.add(slug);
    const lang = LANGUAGES.find(l => l.id === language);
    results.push({
      name: fixName(p.name),
      promise: fixPromise(p),
      badges: makeBadges(p),
      strength: 'perfect',
      slug,
      languageLabel: lang?.name || '',
      languageAccent: lang?.accent || '#324D47',
      formats: p.formats,
      classTypes: p.classTypes,
      nativeSpeaker: true,
    });
    if (results.length >= 6) break;
  }

  return results;
}

/* ═══════════════════════════════════════════════════════════════════════
   STEP QUESTION HEADER
   ═══════════════════════════════════════════════════════════════════════ */
function StepQuestion({ step, hasSelection }: { step: number; hasSelection: boolean }) {
  return (
    <div className="mb-7">
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0 }}
        className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[1.15rem] md:text-[1.35rem] leading-snug tracking-tight"
      >
        {STEP_QUESTIONS[step]}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.04 }}
        className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/50 text-[13px] mt-1.5 leading-relaxed"
      >
        {STEP_DESCRIPTIONS[step]}
      </motion.p>
      <AnimatePresence mode="wait">
        {!hasSelection && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, delay: 0.18 }}
            className="flex items-center gap-2 mt-3"
          >
            <motion.span
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[16px] select-none"
            >
              {'\ud83d\udc47'}
            </motion.span>
            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]/50 text-[11px]">
              Aşağıdan birini seç
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   IDLE NUDGE HOOK
   ═══════════════════════════════════════════════════════════════════════ */
function useIdleNudge(currentStep: number, hasSelection: boolean, cardCount: number, delay = 3000) {
  const [spotlightIdx, setSpotlightIdx] = useState(-1);

  useEffect(() => {
    setSpotlightIdx(-1);
    if (hasSelection || cardCount === 0) return;
    const startTimer = setTimeout(() => setSpotlightIdx(0), delay);
    return () => clearTimeout(startTimer);
  }, [currentStep, hasSelection, cardCount, delay]);

  useEffect(() => {
    if (spotlightIdx < 0 || hasSelection) return;
    const cycleTimer = setTimeout(() => {
      setSpotlightIdx(prev => (prev + 1) % cardCount);
    }, 1200);
    return () => clearTimeout(cycleTimer);
  }, [spotlightIdx, hasSelection, cardCount]);

  return spotlightIdx;
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function ProgramFinder() {
  const scrollToAllPrograms = () => {
    // Set hash to trigger AllPrograms' hashchange listener which opens the section
    if (window.location.hash === '#tum-programlar') {
      // Already at hash — manually dispatch event
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      window.location.hash = '#tum-programlar';
    }
  };
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { open: openFreeTrial } = useFreeTrial();
  const { open: openLevelAssessment } = useLevelAssessment();
  const resultsRef = useRef<HTMLDivElement>(null);
  const motionTiming = useMotionTiming();

  const [currentStep, setCurrentStep] = useState(0);
  const [age, setAge] = useState<AgeGroup | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [goal, setGoal] = useState<GoalType | null>(null);
  const [format, setFormat] = useState<FormatType | 'any' | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Read age from URL query params (e.g. ?age=child) and pre-select
  const processedParamRef = useRef(false);
  useEffect(() => {
    if (processedParamRef.current) return;
    const ageParam = searchParams.get('age') as AgeGroup | null;
    if (ageParam && ['child', 'teen', 'adult'].includes(ageParam)) {
      processedParamRef.current = true;
      setAge(ageParam);
      setCurrentStep(1); // Advance to language selection step
      // Clean up the URL param
      setSearchParams({}, { replace: true });
      // Scroll to ProgramFinder after a short delay
      setTimeout(() => {
        const el = document.getElementById('program-finder');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [searchParams, setSearchParams]);

  const TOTAL_STEPS = 4;
  const stepAdvanceDelayMs =
    motionTiming.profile === 'lite' ? 120 : motionTiming.profile === 'balanced' ? 190 : 230;

  const stepHasSelection = [
    age !== null,
    language !== null,
    goal !== null,
    format !== null,
  ][currentStep] ?? false;

  const stepCardCounts = [AGE_OPTIONS.length, LANGUAGES.length, GOAL_OPTIONS.length, FORMAT_OPTIONS.length];
  const spotlightIdx = useIdleNudge(currentStep, stepHasSelection, stepCardCounts[currentStep] ?? 3);

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1200);
  };

  const advanceStep = useCallback((nextStep: number) => {
    setCurrentStep(nextStep);
    if (nextStep === TOTAL_STEPS) {
      setShowResults(true);
      triggerCelebration();
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, stepAdvanceDelayMs);
    }
  }, [stepAdvanceDelayMs]);

  const handleAgeSelect = (ageId: AgeGroup) => {
    setAge(ageId);
    setTimeout(() => advanceStep(1), stepAdvanceDelayMs);
  };

  const handleLanguageSelect = (langId: string) => {
    setLanguage(langId);
    // Çocuk veya genç seçildiyse amaç otomatik 'conversation' atanır, format adımına geçilir
    if (age === 'child' || age === 'teen') {
      setGoal('conversation');
      setTimeout(() => advanceStep(3), stepAdvanceDelayMs);
    } else {
      setTimeout(() => advanceStep(2), stepAdvanceDelayMs);
    }
  };

  const handleGoalSelect = (goalId: GoalType) => {
    setGoal(goalId);
    setTimeout(() => advanceStep(3), stepAdvanceDelayMs);
  };

  const handleFormatSelect = (formatId: FormatType | 'any') => {
    setFormat(formatId);
    setTimeout(() => advanceStep(4), stepAdvanceDelayMs);
  };

  const goBack = () => {
    if (showResults) {
      setShowResults(false);
      setFormat(null);
      setCurrentStep(3);
      return;
    }
    if (currentStep > 0) {
      // Çocuk/genç ise format adımından (3) geri gelince amaç adımını (2) atla, dil adımına (1) dön
      const skipGoal = (age === 'child' || age === 'teen') && currentStep === 3;
      const target = skipGoal ? 1 : currentStep - 1;

      if (target <= 0) setAge(null);
      if (target <= 1) setLanguage(null);
      if (target <= 2) setGoal(null);
      if (target <= 3) setFormat(null);
      setCurrentStep(target);
    }
  };

  const resetAll = () => {
    setAge(null);
    setLanguage(null);
    setGoal(null);
    setFormat(null);
    setCurrentStep(0);
    setShowResults(false);
  };

  const recommendations = age && language && goal
    ? getRecommendations(age, language, goal, format)
    : null;

  const progressPercent = showResults ? 100 : Math.round(((currentStep) / TOTAL_STEPS) * 100);

  const cardSpring: Variants = {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 260,
        damping: 22,
        delay: 0.04 + i * motionTiming.stagger,
      },
    }),
  };

  const getPersonalizedHeadline = () => {
    const ageName = AGE_OPTIONS.find(a => a.id === age)?.title || '';
    const langName = LANGUAGES.find(l => l.id === language)?.name || '';
    const goalName = GOAL_OPTIONS.find(g => g.id === goal)?.title || '';
    return `${ageName} ${langName} \u2014 ${goalName}`;
  };

  /* ── Back button labels ── */
  const skipGoalStep = age === 'child' || age === 'teen';
  const backLabels = ['', 'Yaş Seçimine Dön', 'Dil Seçimine Dön', skipGoalStep ? 'Dil Seçimine Dön' : 'Amaç Seçimine Dön'];

  return (
    <section id="program-finder" className="py-8 md:py-12 bg-[#FAFAF8] relative">

      {/* ── Celebration particles ── */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, x: '50vw', y: '50vh', scale: 0 }}
                animate={{ opacity: 0, x: `${25 + Math.random() * 50}vw`, y: `${20 + Math.random() * 60}vh`, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut' }}
                className="absolute w-2 h-2 rounded-full"
                style={{ background: ['#324D47', '#E70000', '#FFC400', '#0055A4'][i % 4] }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-[900px] mx-auto px-6">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-[2px] w-6 bg-[#324D47]" />
            <span className="text-[#324D47] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.15em] text-[10px] uppercase">
              Program Bulucu
            </span>
          </div>
          <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[1.6rem] md:text-[2rem] leading-[1.1] tracking-tight">
            30 Saniyede Sana Özel Programı Bul.
          </h2>
          <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/50 text-[14px] mt-2 max-w-[480px] leading-relaxed">
            4 kısa soruyla ihtiyacına en uygun eğitim programını eşleştiriyoruz.
          </p>
          <button
            onClick={scrollToAllPrograms}
            className="inline-flex items-center gap-1.5 mt-3 text-[#324D47]/45 text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] hover:text-[#324D47] transition-colors cursor-pointer"
          >
            veya tüm programlara göz at
            <ChevronRight size={12} />
          </button>
        </motion.div>

        {/* ── Progress Bar ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F]/35 text-[10px] uppercase tracking-wider">
              {showResults ? 'Tamamlandı!' : `Adım ${currentStep + 1} / ${TOTAL_STEPS}`}
            </span>
            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]/50 text-[10px]">
              %{progressPercent}
            </span>
          </div>
          <div className="h-1 bg-[#09090F]/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#324D47] to-[#4a6b64]"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
            />
          </div>
        </div>

        {/* ── Desktop Stepper ── */}
        <div className="hidden md:flex items-center justify-between mb-8 relative">
          <div className="absolute top-[18px] left-[28px] right-[28px] h-px bg-[#09090F]/[0.06]" />
          <motion.div
            className="absolute top-[18px] left-[28px] h-px bg-[#324D47]"
            animate={{ width: `${Math.min(currentStep / TOTAL_STEPS, 1) * 94}%` }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          />

          {STEPS.map((step, i) => {
            // Çocuk/genç ise amaç adımı (index 2) otomatik atlandı — tıklanabilir olmamalı
            const isGoalAutoSkipped = (age === 'child' || age === 'teen') && i === 2;
            return (
            <button
              key={step.num}
              onClick={() => {
                if (isGoalAutoSkipped) return;
                if (i < currentStep) {
                  setShowResults(false);
                  if (i <= 0) setAge(null);
                  if (i <= 1) { setLanguage(null); setGoal(null); }
                  if (i <= 2) setGoal(null);
                  if (i <= 3) setFormat(null);
                  setCurrentStep(i);
                }
              }}
              className={`relative z-10 flex flex-col items-center gap-2.5 cursor-pointer group transition-all duration-300 ${
                i <= currentStep && !isGoalAutoSkipped ? '' : isGoalAutoSkipped && i < currentStep ? 'cursor-default' : 'pointer-events-none'
              }`}
            >
              <motion.div
                animate={
                  i < currentStep
                    ? { scale: 1, backgroundColor: '#324D47', borderColor: '#324D47', color: '#ffffff' }
                    : i === currentStep
                    ? { scale: 1, backgroundColor: '#ffffff', borderColor: '#324D47', color: '#324D47' }
                    : { scale: 1, backgroundColor: '#FAFAF8', borderColor: 'rgba(9,9,15,0.08)', color: 'rgba(9,9,15,0.2)' }
                }
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] border ${
                  i === currentStep ? 'shadow-[0_0_0_4px_rgba(50,77,71,0.08)]' : ''
                }`}
              >
                {i < currentStep ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check size={11} />
                  </motion.div>
                ) : (
                  step.num
                )}
              </motion.div>
              <span
                className={`text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] transition-colors duration-300 ${
                  i <= currentStep ? 'text-[#09090F]/70' : 'text-[#09090F]/25'
                }`}
              >
                {isGoalAutoSkipped && i < currentStep ? `${step.label} ✓` : step.label}
              </span>

              {i === currentStep && !isGoalAutoSkipped && (
                <motion.div
                  key={`pulse-${i}`}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-[#324D47]/10"
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0, 0.2, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </button>
            );
          })}

          {/* Result indicator */}
          <div className="relative z-10 flex flex-col items-center gap-2.5">
            <motion.div
              animate={showResults ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                showResults
                  ? 'bg-[#324D47] border-[#324D47] text-white'
                  : 'bg-[#FAFAF8] border-[#09090F]/[0.08] text-[#09090F]/20'
              }`}
            >
              {showResults ? <Sparkles size={12} /> : <ArrowRight size={12} />}
            </motion.div>
            <span
              className={`text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] transition-colors duration-300 ${
                showResults ? 'text-[#09090F]/70' : 'text-[#09090F]/25'
              }`}
            >
              Sonuç
            </span>
          </div>
        </div>

        {/* ── Mobile Step Indicator ── */}
        {!showResults && (
          <div className="md:hidden mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F]/65 text-[13px]">
                Adım {currentStep + 1} / {TOTAL_STEPS} {'\u2014'} {STEPS[currentStep]?.short}
              </span>
              {currentStep > 0 && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-[#324D47] text-[12px] font-['Neutraface_2_Text:Demi',sans-serif]"
                >
                  <ArrowLeft size={12} />
                  Geri
                </button>
              )}
            </div>
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    backgroundColor:
                      i < currentStep
                        ? '#324D47'
                        : i === currentStep
                        ? 'rgba(50,77,71,0.45)'
                        : 'rgba(9,9,15,0.06)',
                  }}
                  className="h-1 flex-1 rounded-full"
                  transition={{ duration: 0.4 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Step Content ── */}
        <div className="relative min-h-[320px]">
          <AnimatePresence mode="wait">

            {/* ════ STEP 1: AGE ════ */}
            {currentStep === 0 && !showResults && (
              <motion.div
                key="step-age"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
              >
                <StepQuestion step={0} hasSelection={age !== null} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {AGE_OPTIONS.map((opt, i) => {
                    const selected = age === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        custom={i}
                        variants={cardSpring}
                        initial="initial"
                        animate={selected ? { opacity: 1, y: -3, scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 20 } } : 'animate'}
                        whileHover={!selected ? { y: -2, transition: { duration: 0.2 } } : {}}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAgeSelect(opt.id)}
                        className={`group relative text-left p-6 rounded-2xl border transition-colors duration-300 cursor-pointer ${
                          selected
                            ? 'bg-[#324D47]/[0.05] border-[#324D47] shadow-[0_8px_28px_rgba(50,77,71,0.13)]'
                            : 'bg-white border-[#09090F]/[0.07] hover:border-[#324D47]/40'
                        }`}
                      >
                        {/* Ripple spotlight */}
                        {!age && spotlightIdx === i && (
                          <>
                            {[0, 1, 2].map(ring => (
                              <motion.div
                                key={ring}
                                initial={{ opacity: 0.5, scale: 1 }}
                                animate={{ opacity: 0, scale: 1.06 }}
                                transition={{ duration: 2.2, repeat: Infinity, delay: ring * 0.7, ease: 'easeOut' }}
                                className="absolute inset-0 rounded-2xl border border-[#324D47]/30 pointer-events-none"
                              />
                            ))}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="absolute inset-0 rounded-2xl shadow-[0_0_18px_rgba(50,77,71,0.08)] pointer-events-none"
                            />
                          </>
                        )}

                        {selected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                            className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-[#324D47] flex items-center justify-center shadow-[0_2px_8px_rgba(50,77,71,0.25)]"
                          >
                            <Check size={11} className="text-white" strokeWidth={2.5} />
                          </motion.div>
                        )}

                        <span className={`font-['Neutraface_2_Text:Bold',sans-serif] text-[2rem] leading-none transition-colors duration-300 ${
                          selected ? 'text-[#324D47]/25' : 'text-[#09090F]/[0.05] group-hover:text-[#324D47]/12'
                        }`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>

                        <h3 className={`font-['Neutraface_2_Text:Bold',sans-serif] mt-3 mb-1 transition-all duration-300 ${
                          selected ? 'text-[#324D47] text-[19px]' : 'text-[#09090F] text-[18px]'
                        }`}>
                          {opt.title}
                        </h3>

                        <span className={`font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-wide transition-colors duration-300 ${
                          selected ? 'text-[#324D47]/70' : 'text-[#09090F]/45'
                        }`}>
                          {opt.range}
                        </span>

                        <p className={`font-['Neutraface_2_Text:Book',sans-serif] text-[13px] leading-[1.6] mt-3 transition-colors duration-300 ${
                          selected ? 'text-[#09090F]/70' : 'text-[#09090F]/50'
                        }`}>
                          {opt.description}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Micro-reward */}
                <AnimatePresence>
                  {age && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center gap-2 mt-7"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        className="w-5 h-5 rounded-full bg-[#324D47]/10 flex items-center justify-center"
                      >
                        <Check size={10} className="text-[#324D47]/60" />
                      </motion.div>
                      <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]/55 text-[13px]">
                        {ENCOURAGEMENTS[0][0]}
                      </span>
                      <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[#324D47]/40 text-[13px]">
                        {ENCOURAGEMENTS[0][1]}
                      </span>
                      <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
                        <ArrowRight size={13} className="text-[#324D47]/40" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ════ STEP 2: LANGUAGE ════ */}
            {currentStep === 1 && !showResults && (
              <motion.div
                key="step-lang"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
              >
                <button
                  onClick={goBack}
                  className="hidden md:inline-flex items-center gap-1.5 mb-4 text-[#324D47]/50 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] hover:text-[#324D47] transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  {backLabels[1]}
                </button>

                <StepQuestion step={1} hasSelection={language !== null} />

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {LANGUAGES.filter(lang => {
                    // Yaşa göre dil filtresi — çocuk/genç için kısıtlı dil seti
                    if (age === 'child') return ['ingilizce', 'almanca', 'ispanyolca'].includes(lang.id);
                    if (age === 'teen') return ['ingilizce', 'almanca', 'ispanyolca', 'fransizca', 'italyanca', 'rusca'].includes(lang.id);
                    return true; // yetişkin: tüm diller
                  }).map((lang, i) => {
                    const selected = language === lang.id;

                    return (
                      <motion.button
                        key={lang.id}
                        custom={i}
                        variants={cardSpring}
                        initial="initial"
                        animate={selected ? { opacity: 1, y: -3, scale: 1.03, transition: { type: 'spring', stiffness: 300, damping: 20 } } : 'animate'}
                        whileHover={!selected ? { y: -2, transition: { duration: 0.2 } } : {}}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleLanguageSelect(lang.id)}
                        className={`group relative text-left p-4 pb-5 rounded-xl border transition-colors duration-300 cursor-pointer ${
                          selected
                            ? 'bg-[#324D47]/[0.05] border-[#324D47] shadow-[0_8px_28px_rgba(50,77,71,0.13)]'
                            : 'bg-white border-[#09090F]/[0.07] hover:border-[#324D47]/40 hover:shadow-[0_2px_16px_rgba(0,0,0,0.04)]'
                        }`}
                      >
                        {!language && spotlightIdx === i && (
                          <>
                            {[0, 1, 2].map(ring => (
                              <motion.div
                                key={ring}
                                initial={{ opacity: 0.5, scale: 1 }}
                                animate={{ opacity: 0, scale: 1.08 }}
                                transition={{ duration: 2.2, repeat: Infinity, delay: ring * 0.7, ease: 'easeOut' }}
                                className="absolute inset-0 rounded-xl border border-[#324D47]/30 pointer-events-none"
                              />
                            ))}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="absolute inset-0 rounded-xl shadow-[0_0_18px_rgba(50,77,71,0.08)] pointer-events-none"
                            />
                          </>
                        )}

                        {selected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#324D47] flex items-center justify-center shadow-[0_2px_8px_rgba(50,77,71,0.25)]"
                          >
                            <Check size={9} className="text-white" strokeWidth={2.5} />
                          </motion.div>
                        )}

                        {lang.badge && !selected && (
                          <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[8px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.06em] uppercase ${
                            lang.badge === 'popular'
                              ? 'bg-[#E70000]/[0.08] text-[#E70000]/70'
                              : 'bg-[#324D47]/[0.08] text-[#324D47]/70'
                          }`}>
                            {lang.badge === 'popular' ? 'En Popüler' : 'Yükselen Trend'}
                          </span>
                        )}

                        <span className={`font-['Neutraface_2_Text:Bold',sans-serif] text-[1.8rem] leading-none transition-colors duration-300 ${
                          selected ? 'text-[#324D47]/25' : 'text-[#09090F]/[0.05] group-hover:text-[#324D47]/12'
                        }`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>

                        <h3 className={`font-['Neutraface_2_Text:Bold',sans-serif] leading-[1.1] tracking-tight mt-2 transition-all duration-300 ${
                          selected
                            ? 'text-[#324D47] text-[18px] md:text-[19px]'
                            : 'text-[#09090F] text-[17px] md:text-[18px] group-hover:text-[#324D47]'
                        }`}>
                          {lang.name}
                        </h3>

                        <span className={`block mt-0.5 font-['Neutraface_2_Text:Book',sans-serif] text-[11px] italic tracking-wide transition-colors duration-300 ${
                          selected ? 'text-[#324D47]/50' : 'text-[#09090F]/30'
                        }`}>
                          {lang.native}
                        </span>

                        <p className={`mt-2 font-['Neutraface_2_Text:Book',sans-serif] text-[11px] leading-[1.5] transition-colors duration-300 ${
                          selected ? 'text-[#324D47]/60' : 'text-[#09090F]/40'
                        }`}>
                          {lang.tagline}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          {lang.formats.map(f => (
                            <span key={f} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-['Neutraface_2_Text:Book',sans-serif] transition-colors duration-300 ${
                              selected
                                ? 'bg-[#324D47]/[0.06] text-[#324D47]/50'
                                : 'bg-[#09090F]/[0.03] text-[#09090F]/25'
                            }`}>
                              {f === 'online' ? <Monitor size={8} /> : <MapPin size={8} />}
                              {f === 'online' ? 'Online' : 'Yüz Yüze'}
                            </span>
                          ))}
                          <span className={`text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] transition-colors duration-300 ${
                            selected ? 'text-[#324D47]/40' : 'text-[#09090F]/20'
                          }`}>
                            {'\u00b7'} {lang.programCount} program
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {language && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2 mt-7"
                    >
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} className="w-5 h-5 rounded-full bg-[#324D47]/10 flex items-center justify-center">
                        <Check size={10} className="text-[#324D47]/60" />
                      </motion.div>
                      <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]/55 text-[13px]">{ENCOURAGEMENTS[1][0]}</span>
                      <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[#324D47]/40 text-[13px]">{(age === 'child' || age === 'teen') ? 'Formatını seçelim...' : ENCOURAGEMENTS[1][1]}</span>
                      <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
                        <ArrowRight size={13} className="text-[#324D47]/40" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ════ STEP 3: GOAL ════ */}
            {currentStep === 2 && !showResults && (
              <motion.div
                key="step-goal"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
              >
                <button
                  onClick={goBack}
                  className="hidden md:inline-flex items-center gap-1.5 mb-4 text-[#324D47]/50 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] hover:text-[#324D47] transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  {backLabels[2]}
                </button>

                <StepQuestion step={2} hasSelection={goal !== null} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {GOAL_OPTIONS.map((opt, i) => {
                    const selected = goal === opt.id;

                    return (
                      <motion.button
                        key={opt.id}
                        custom={i}
                        variants={cardSpring}
                        initial="initial"
                        animate={selected ? { opacity: 1, y: -3, scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 20 } } : 'animate'}
                        whileHover={!selected ? { y: -2, transition: { duration: 0.2 } } : {}}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleGoalSelect(opt.id)}
                        className={`group relative text-left p-6 rounded-2xl border transition-colors duration-300 cursor-pointer overflow-hidden ${
                          selected
                            ? 'bg-[#324D47]/[0.05] border-[#324D47] shadow-[0_8px_28px_rgba(50,77,71,0.13)]'
                            : 'bg-white border-[#09090F]/[0.07] hover:border-[#324D47]/40'
                        }`}
                      >
                        {!goal && spotlightIdx === i && (
                          <>
                            {[0, 1, 2].map(ring => (
                              <motion.div
                                key={ring}
                                initial={{ opacity: 0.5, scale: 1 }}
                                animate={{ opacity: 0, scale: 1.06 }}
                                transition={{ duration: 2.2, repeat: Infinity, delay: ring * 0.7, ease: 'easeOut' }}
                                className="absolute inset-0 rounded-2xl border border-[#324D47]/30 pointer-events-none"
                              />
                            ))}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="absolute inset-0 rounded-2xl shadow-[0_0_18px_rgba(50,77,71,0.08)] pointer-events-none"
                            />
                          </>
                        )}

                        {selected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                            className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-[#324D47] flex items-center justify-center shadow-[0_2px_8px_rgba(50,77,71,0.25)]"
                          >
                            <Check size={11} className="text-white" strokeWidth={2.5} />
                          </motion.div>
                        )}

                        <span className="absolute -bottom-2 -right-1 text-[4rem] leading-none select-none pointer-events-none opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-500">
                          {opt.emoji}
                        </span>

                        <span className={`font-['Neutraface_2_Text:Bold',sans-serif] text-[2rem] leading-none transition-colors duration-300 ${
                          selected ? 'text-[#324D47]/25' : 'text-[#09090F]/[0.05] group-hover:text-[#324D47]/12'
                        }`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>

                        <h3 className={`font-['Neutraface_2_Text:Bold',sans-serif] mt-3 mb-1 leading-tight transition-all duration-300 ${
                          selected ? 'text-[#324D47] text-[17px]' : 'text-[#09090F] text-[16px]'
                        }`}>
                          {opt.title}
                        </h3>

                        <p className={`font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] mb-3 transition-colors duration-300 ${
                          selected ? 'text-[#324D47]/65' : 'text-[#09090F]/40'
                        }`}>
                          {opt.subtitle}
                        </p>

                        <p className={`font-['Neutraface_2_Text:Book',sans-serif] text-[13px] leading-[1.6] transition-colors duration-300 ${
                          selected ? 'text-[#09090F]/70' : 'text-[#09090F]/50'
                        }`}>
                          {opt.description}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {goal && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2 mt-7"
                    >
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} className="w-5 h-5 rounded-full bg-[#324D47]/10 flex items-center justify-center">
                        <Check size={10} className="text-[#324D47]/60" />
                      </motion.div>
                      <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]/55 text-[13px]">{ENCOURAGEMENTS[2][0]}</span>
                      <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[#324D47]/40 text-[13px]">{ENCOURAGEMENTS[2][1]}</span>
                      <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
                        <ArrowRight size={13} className="text-[#324D47]/40" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ════ STEP 4: FORMAT ════ */}
            {currentStep === 3 && !showResults && (
              <motion.div
                key="step-format"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
              >
                <button
                  onClick={goBack}
                  className="hidden md:inline-flex items-center gap-1.5 mb-4 text-[#324D47]/50 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] hover:text-[#324D47] transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  {backLabels[3]}
                </button>

                <StepQuestion step={3} hasSelection={false} />

                {/* Selection summary */}
                <div className="flex flex-wrap items-center gap-2 mb-7 -mt-3">
                  <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/35 text-[11px]">Seçimlerin:</span>
                  {[
                    AGE_OPTIONS.find(a => a.id === age)?.title,
                    LANGUAGES.find(l => l.id === language)?.name,
                    GOAL_OPTIONS.find(g => g.id === goal)?.title,
                  ].filter(Boolean).map((label, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 bg-[#324D47]/[0.06] rounded-full text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]/65"
                    >
                      <Check size={8} className="mr-1 text-[#324D47]/40" />
                      {label}
                    </span>
                  ))}
                </div>

                {/* Almost there */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 mb-6 px-4 py-3 bg-[#324D47]/[0.04] rounded-xl border border-[#324D47]/[0.08]"
                >
                  <Zap size={14} className="text-[#324D47]/50 shrink-0" />
                  <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[#324D47]/60 text-[12px]">
                    Son adım! Formatını seç, <span className="font-['Neutraface_2_Text:Demi',sans-serif]">kişisel önerilerini</span> hemen gör.
                  </span>
                </motion.div>

                {/* Format cards */}
                <div className="grid grid-cols-3 gap-4 max-w-[540px] mx-auto">
                  {FORMAT_OPTIONS.map((opt, i) => {
                    const selected = format === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={selected
                          ? { opacity: 1, y: -3, scale: 1.03, transition: { type: 'spring', stiffness: 300, damping: 20 } }
                          : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, delay: 0.08 + i * 0.07 } }
                        }
                        whileHover={!selected ? { y: -2, transition: { duration: 0.2 } } : {}}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleFormatSelect(opt.id)}
                        className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                          selected
                            ? 'bg-[#324D47]/[0.05] border-[#324D47] shadow-[0_8px_28px_rgba(50,77,71,0.13)]'
                            : 'bg-white border-[#09090F]/[0.07] hover:border-[#324D47]/40'
                        }`}
                      >
                        {!format && spotlightIdx === i && (
                          <>
                            {[0, 1, 2].map(ring => (
                              <motion.div
                                key={ring}
                                initial={{ opacity: 0.5, scale: 1 }}
                                animate={{ opacity: 0, scale: 1.06 }}
                                transition={{ duration: 2.2, repeat: Infinity, delay: ring * 0.7, ease: 'easeOut' }}
                                className="absolute inset-0 rounded-2xl border border-[#324D47]/30 pointer-events-none"
                              />
                            ))}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="absolute inset-0 rounded-2xl shadow-[0_0_18px_rgba(50,77,71,0.08)] pointer-events-none"
                            />
                          </>
                        )}

                        {selected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                            className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#324D47] flex items-center justify-center shadow-[0_2px_8px_rgba(50,77,71,0.25)]"
                          >
                            <Check size={10} className="text-white" strokeWidth={2.5} />
                          </motion.div>
                        )}

                        <div className={`transition-colors duration-200 ${
                          selected ? 'text-[#324D47]' : 'text-[#09090F]/30 group-hover:text-[#324D47]/60'
                        }`}>
                          {opt.icon}
                        </div>
                        <span className={`font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-200 ${
                          selected ? 'text-[#324D47] text-[15px]' : 'text-[#09090F] text-[14px]'
                        }`}>
                          {opt.label}
                        </span>
                        <span className={`font-['Neutraface_2_Text:Book',sans-serif] text-[11px] transition-colors duration-200 ${
                          selected ? 'text-[#324D47]/70' : 'text-[#09090F]/35'
                        }`}>
                          {opt.description}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ══════════════════════════════════════════════════════════════
           RESULTS
           ══════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showResults && recommendations && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
              className="mt-10"
            >
              {/* ── Results Header ── */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={goBack}
                    className="inline-flex items-center gap-1.5 text-[#324D47]/50 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] hover:text-[#324D47] transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    Format Seçimine Dön
                  </button>
                  <button
                    onClick={resetAll}
                    className="flex items-center gap-1.5 text-[#09090F]/30 text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] hover:text-[#324D47] transition-colors cursor-pointer"
                  >
                    <RotateCcw size={10} />
                    Sıfırla
                  </button>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.35 }}
                >
                  {recommendations.length > 0 ? (
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          <motion.div
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
                            className="w-7 h-7 rounded-lg bg-[#324D47] flex items-center justify-center shadow-[0_2px_8px_rgba(50,77,71,0.15)]"
                          >
                            <Sparkles size={12} className="text-white" />
                          </motion.div>
                          <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[1.2rem] md:text-[1.4rem] leading-tight tracking-tight">
                            {recommendations.length} program eşleşti
                          </h3>
                        </div>
                        <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/40 text-[13px] leading-relaxed">
                          <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]/50">{getPersonalizedHeadline()}</span> profiline göre
                        </p>
                      </div>
                      {/* Selection tags */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          AGE_OPTIONS.find(a => a.id === age)?.title,
                          LANGUAGES.find(l => l.id === language)?.name,
                          GOAL_OPTIONS.find(g => g.id === goal)?.title,
                          FORMAT_OPTIONS.find(f => f.id === format)?.label,
                        ].filter(Boolean).map((label, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-1 bg-[#324D47]/[0.05] rounded-md text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]/55"
                          >
                            <Check size={8} className="mr-1 text-[#324D47]/35" />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[1.2rem] md:text-[1.4rem] leading-tight tracking-tight mb-2">
                        Bu kriterlere uygun program bulamadık.
                      </h3>
                      <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/50 text-[13px] leading-relaxed max-w-[480px]">
                        Seçimlerini değiştirerek tekrar deneyebilir veya danışmanlarımızla iletişime geçebilirsin.
                      </p>
                    </>
                  )}
                </motion.div>
              </div>

              {/* ── Empty state actions ── */}
              {recommendations.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-col sm:flex-row items-center gap-3 mb-8"
                >
                  <button
                    onClick={resetAll}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-[#324D47]/20 text-[#324D47] rounded-full text-[14px] font-['Neutraface_2_Text:Demi',sans-serif] hover:border-[#324D47]/35 hover:bg-[#324D47]/[0.03] transition-all cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    Seçimleri Değiştir
                  </button>
                  <button
                    onClick={() => navigate('/iletisim')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-[#09090F]/45 text-[14px] font-['Neutraface_2_Text:Demi',sans-serif] hover:text-[#324D47] transition-colors cursor-pointer"
                  >
                    <Phone size={13} />
                    Danışmana Sor
                  </button>
                </motion.div>
              )}

              {/* ── Program Cards (AllPrograms style grid) ── */}
              {recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((prog, i) => {
                    const isTop = i === 0;
                    const accent = prog.languageAccent;
                    return (
                      <motion.div
                        key={prog.slug}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: Math.min(i * 0.06, 0.3),
                        }}
                        onClick={() => navigate(`/egitimlerimiz/${prog.slug}`)}
                        className="group relative bg-white rounded-2xl border border-[#09090F]/[0.06] hover:border-[#324D47]/20 hover:shadow-[0_8px_32px_rgba(50,77,71,0.07)] transition-all duration-400 overflow-hidden cursor-pointer"
                      >
                        {/* Top accent line */}
                        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${accent}40, ${accent}15, transparent)` }} />

                        <div className="p-5 md:p-6">
                          {/* Header row: Language dot + Native Speaker badge + Recommended */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[10px] tracking-[0.1em] uppercase" style={{ color: `${accent}CC` }}>
                                {prog.languageLabel}
                              </span>
                              {prog.nativeSpeaker && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#324D47]/[0.07] text-[#324D47]/70 text-[8px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.05em] uppercase">
                                  Native Speaker
                                </span>
                              )}
                            </div>
                            {isTop && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#324D47]/[0.08] text-[#324D47] text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-wider uppercase shrink-0">
                                <Sparkles size={8} />
                                Önerilen
                              </span>
                            )}
                          </div>

                          {/* Program Name */}
                          <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[16px] md:text-[17px] leading-tight mb-2 group-hover:text-[#324D47] transition-colors duration-300">
                            {prog.name}
                          </h3>

                          {/* Description */}
                          <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/50 text-[13px] leading-[1.65] mb-5 line-clamp-3">
                            {prog.promise}
                          </p>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {prog.badges.map(badge => (
                              <span
                                key={badge}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#09090F]/[0.03] text-[#09090F]/40 text-[10px] font-['Neutraface_2_Text:Demi',sans-serif]"
                              >
                                {badge.includes('Online') && <Monitor size={8} />}
                                {badge.includes('Yüz Yüze') && !badge.includes('Online') && <MapPin size={8} />}
                                {badge.includes('Grup') && !badge.includes('Özel') && <Users size={8} />}
                                {badge.includes('Özel') && !badge.includes('Grup') && <User size={8} />}
                                {badge}
                              </span>
                            ))}
                          </div>

                          {/* Footer: CTA */}
                          <div className="flex items-center justify-between pt-4 border-t border-[#09090F]/[0.04]">
                            <span className="flex items-center gap-1.5 text-[#324D47] text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] group-hover:gap-2.5 transition-all duration-300">
                              Detayları İncele
                              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </span>

                            {/* Format indicators */}
                            <div className="flex items-center gap-2">
                              {prog.formats.includes('online') && (
                                <span className="flex items-center gap-1 text-[#09090F]/25 text-[9px] font-['Neutraface_2_Text:Book',sans-serif]">
                                  <Monitor size={9} />
                                  Online
                                </span>
                              )}
                              {prog.formats.includes('face-to-face') && (
                                <span className="flex items-center gap-1 text-[#09090F]/25 text-[9px] font-['Neutraface_2_Text:Book',sans-serif]">
                                  <MapPin size={9} />
                                  Yüz Yüze
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* ── CTA Strip ── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-10 bg-[#09090F] rounded-2xl p-7 md:p-9"
              >
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-[1.15rem] md:text-[1.35rem] leading-tight mb-2">
                      Hemen Başlamak İster misin?
                    </h4>
                    <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/40 text-[13px] leading-relaxed">
                      Ücretsiz deneme seansında eğitmenimizle tanış, seviyeni öğren ve planını al.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openFreeTrial('program_finder_cta')}
                      className="flex items-center gap-2 px-7 py-3.5 bg-[#324D47] text-white rounded-full font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] hover:bg-[#3d5e56] transition-all cursor-pointer shadow-[0_4px_20px_rgba(50,77,71,0.35)]"
                    >
                      <Zap size={14} />
                      Ücretsiz Seans Al
                    </motion.button>
                    <button
                      onClick={() => openLevelAssessment('program_finder_cta')}
                      className="flex items-center gap-1.5 px-6 py-3.5 rounded-full border border-white/[0.12] text-white/45 text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] hover:border-white/25 hover:text-white/65 transition-all cursor-pointer"
                    >
                      Seviye Tespit
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-5 mt-6 pt-5 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5">
                    <Shield size={10} className="text-white/25" />
                    <span className="font-['Neutraface_2_Text:Book',sans-serif] text-white/25 text-[11px]">Taahhüt yok</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={10} className="text-white/25" />
                    <span className="font-['Neutraface_2_Text:Book',sans-serif] text-white/25 text-[11px]">45 dk ücretsiz</span>
                  </div>
                </div>
              </motion.div>

              {/* ── Footer Actions ── */}
              <div className="flex flex-col items-center gap-4 mt-8">
                <button
                  onClick={resetAll}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-[#324D47]/15 text-[#324D47]/55 rounded-full text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] hover:border-[#324D47]/30 hover:text-[#324D47] transition-all cursor-pointer"
                >
                  <RotateCcw size={12} />
                  Tekrar Seç
                </button>
                <button
                  onClick={scrollToAllPrograms}
                  className="inline-flex items-center gap-1.5 text-[#324D47]/35 text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] hover:text-[#324D47]/60 transition-colors cursor-pointer"
                >
                  Tüm Programlara Göz At
                  <ChevronRight size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


      </div>
    </section>
  );
}

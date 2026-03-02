import React, { useState, useMemo, forwardRef, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  Sparkles,
  Monitor,
  MapPin,
  Users,
  User,
  GraduationCap,
  Briefcase,
  MessageCircle,
  Baby,
  BookOpen,
  Globe,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router';

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */
type AgeGroup = 'child' | 'teen' | 'adult';
type FormatType = 'online' | 'face-to-face';
type CategoryId = 'all' | 'kids-teens' | 'exam' | 'career' | 'general';

export interface ProgramItem {
  id: string;
  name: string;
  description: string;
  slug: string;
  language: string;
  languageLabel: string;
  ages: AgeGroup[];
  category: CategoryId;
  classTypes: ('private' | 'group')[];
  formats: FormatType[];
  badges: string[];
  featured?: boolean;
  nativeSpeaker?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════
   LANGUAGE ACCENT COLORS
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

/* ═══════════════════════════════════════════════════════════════════════
   COMPLETE PROGRAM CATALOG — Single Source of Truth
   Teachera Teaching Method · %85 Konuşma Pratiği · Native Speaker
   Her dil: Grup (F2F) + Online Grup + Özel Ders ayrımı
   ═══════════════════════════════════════════════════════════════════════ */
const ALL_PROGRAMS: ProgramItem[] = [

  // ═══════════════ İNGİLİZCE — YETİŞKİN GENEL ════════════════════════

  {
    id: 'en-grup-f2f',
    name: 'İngilizce Grup Programı',
    description: 'Native speaker eğitmenlerle yüz yüze, %85\'i konuşma pratiğine dayalı grup dersleri. Teachera Teaching Method ile günlük hayatta en çok ihtiyaç duyulan yapıları gerçek diyaloglar içinde keşfedin.',
    slug: 'ingilizce/grup-programi',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['face-to-face'],
    badges: ['A1-C2', 'Grup', 'Yüz Yüze'],
    featured: true,
    nativeSpeaker: true,
  },
  {
    id: 'en-online-grup',
    name: 'Online İngilizce Grup Programı',
    description: 'Nerede olursanız olun — native speaker eğitmenlerle canlı, interaktif grup dersleri. Teachera Teaching Method\'un %85 konuşma odaklı enerjisini online ortamda yaşayın.',
    slug: 'ingilizce/online-grup',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['online'],
    badges: ['A1-C2', 'Grup', 'Online'],
    nativeSpeaker: true,
  },
  {
    id: 'en-ozel',
    name: 'İngilizce Özel Ders',
    description: 'Tamamen size özel tasarlanan müfredat ve native speaker eğitmenle birebir çalışma. Hedefiniz ne olursa olsun, tempoyu ve yoğunluğu siz belirleyin.',
    slug: 'ingilizce/ozel-ders',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['adult'],
    category: 'general',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['A1-C2', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },

  // ═══════════════ İNGİLİZCE — AKADEMİK SINAV ═══════════════════════

  {
    id: 'ielts',
    name: 'IELTS Hazırlık',
    description: 'Hedef bandınıza özel modüler plan ve native speaker eğitmenle birebir strateji çalışması. Speaking, Writing, Listening ve Reading modülleri için kişiye özgü yol haritası.',
    slug: 'ingilizce/ielts',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['teen', 'adult'],
    category: 'exam',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['Sınav', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'toefl',
    name: 'TOEFL IBT Hazırlık',
    description: 'TOEFL IBT\'ye özel stratejik hazırlık — TOEFL IBT sınav hazırlığında tecrübeli ve son gelişmeleri düzenli takip eden native speaker eğitmenle birebir, kişiye özgü plan ve düzenli takip ile hedef skorunuza sizi ulaştırır.',
    slug: 'ingilizce/toefl',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['teen', 'adult'],
    category: 'exam',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['Sınav', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'pte',
    name: 'PTE Academic Hazırlık',
    description: 'Bilgisayar tabanlı sınav formatına özel hazırlık. Native speaker eğitmenle birebir çalışma, kişiye özgü plan ve stratejik yol haritasıyla PTE skorunuzu maksimize edin.',
    slug: 'ingilizce/pte',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['adult'],
    category: 'exam',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['Sınav', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'yds',
    name: 'YDS / YÖKDİL Hazırlık',
    description: 'Akademik İngilizce sınav hazırlığı — kişiye özgü plan, düzenli takip ve stratejik yol haritasıyla hedef puanınıza ulaşın. Özel ders ve grup seçenekleri mevcut.',
    slug: 'ingilizce/yds-yokdil',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['adult'],
    category: 'exam',
    classTypes: ['private', 'group'],
    formats: ['online', 'face-to-face'],
    badges: ['Sınav', 'Özel & Grup', 'Online & Yüz Yüze'],
  },

  // ═══════════════ İNGİLİZCE — KARİYER & İŞ DÜNYASI ═════════════════

  {
    id: 'business-en',
    name: 'Business English',
    description: 'Toplantı, müzakere, sunum ve e-posta yazımında profesyonel güven. Native speaker eğitmenle iş dünyasının dilini, %85 konuşma pratiği yaklaşımıyla öğrenin.',
    slug: 'ingilizce/business',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['adult'],
    category: 'career',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['İş Dünyası', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'marketing-en',
    name: 'Marketing Management',
    description: 'Küresel pazarlama terminolojisi ve yönetim iletişimi. Kampanya sunumlarından marka stratejisine, İngilizce\'yi sektörünüzün dilinde konuşarak öğrenin.',
    slug: 'ingilizce/marketing',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['adult'],
    category: 'career',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['İş Dünyası', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'finance-en',
    name: 'Finance & Industry',
    description: 'Finans raporları, yatırımcı sunumları ve endüstri terminolojisi. Sektörel uzmanlığınızı İngilizce ile taçlandırın, native speaker eğitmenle birebir.',
    slug: 'ingilizce/finance',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['adult'],
    category: 'career',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['İş Dünyası', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'legal-en',
    name: 'Legal English',
    description: 'Hukuki terminoloji, sözleşme dili ve profesyonel yazışma becerileri. Uluslararası hukuk arenasında güvenle iletişim kurun, native speaker eğitmenle birebir.',
    slug: 'ingilizce/legal',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['adult'],
    category: 'career',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['Hukuk', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'medical-en',
    name: 'Medical English',
    description: 'Tıbbi terminoloji, hasta iletişimi ve akademik makale yazımı. Sağlık sektöründe İngilizce yetkinliğinizi zirveye taşıyın, native speaker eğitmenle birebir.',
    slug: 'ingilizce/medical',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['adult'],
    category: 'career',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['Tıp', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },

  // ═══════════════ İNGİLİZCE — ÇOCUK & GENÇ ═════════════════════════

  {
    id: 'mini-kids-en',
    name: 'Mini Kids İngilizce',
    description: '4-6 yaş grubuna özel, oyun ve etkileşimle doğal dil edinimi. Çocuğunuz eğlenirken farkında bile olmadan İngilizce\'yi içselleştirsin. Erken dönem dil alışkanlıkları.',
    slug: 'ingilizce/mini-kids',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['child'],
    category: 'kids-teens',
    classTypes: ['group'],
    formats: ['face-to-face'],
    badges: ['4-6 Yaş', 'Grup', 'Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'kids-en-f2f',
    name: 'Kids İngilizce Grup',
    description: '7-12 yaş grubuna özel, native speaker eğitmenlerle yüz yüze grup dersleri. %85 konuşma pratiği ile doğal öğrenme, eğlenceli aktiviteler ve yapılandırılmış müfredat.',
    slug: 'ingilizce/kids-grup',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['child'],
    category: 'kids-teens',
    classTypes: ['group'],
    formats: ['face-to-face'],
    badges: ['7-12 Yaş', 'Grup', 'Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'kids-en-online',
    name: 'Online Kids İngilizce',
    description: '7-12 yaş grubuna özel online program. Native speaker eğitmenlerle interaktif, oyunlaştırılmış canlı dersler. Evden güvenle katılım, %85 konuşma pratiği odaklı.',
    slug: 'ingilizce/online-kids',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['child'],
    category: 'kids-teens',
    classTypes: ['group'],
    formats: ['online'],
    badges: ['7-12 Yaş', 'Grup', 'Online'],
    nativeSpeaker: true,
  },
  {
    id: 'kids-en-ozel',
    name: 'Kids İngilizce Özel Ders',
    description: '7-12 yaş grubuna özel birebir İngilizce. Native speaker eğitmenle çocuğunuzun hızında ilerleyen, tamamen kişiselleştirilmiş program.',
    slug: 'ingilizce/kids-ozel',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['child'],
    category: 'kids-teens',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['7-12 Yaş', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'teens-en-f2f',
    name: 'Teens İngilizce Grup',
    description: '13-17 yaş grubuna özel yüz yüze grup programı. Native speaker eğitmenlerle %85 konuşma pratiği ağırlıklı, gençlerin dünyasına uygun içerik.',
    slug: 'ingilizce/teens-grup',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['teen'],
    category: 'kids-teens',
    classTypes: ['group'],
    formats: ['face-to-face'],
    badges: ['13-17 Yaş', 'Grup', 'Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'teens-en-online',
    name: 'Online Teens İngilizce',
    description: '13-17 yaş grubuna özel online program. Native speaker eğitmenlerle interaktif canlı dersler, akıcılık ve özgüven odaklı — evden güvenle katılım.',
    slug: 'ingilizce/online-teens',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['teen'],
    category: 'kids-teens',
    classTypes: ['group'],
    formats: ['online'],
    badges: ['13-17 Yaş', 'Grup', 'Online'],
    nativeSpeaker: true,
  },
  {
    id: 'teens-en-ozel',
    name: 'Teens İngilizce Özel Ders',
    description: '13-17 yaş grubuna özel birebir İngilizce. Native speaker eğitmenle gencin hedefine göre şekillenen, konuşma odaklı kişiselleştirilmiş program.',
    slug: 'ingilizce/teens-ozel',
    language: 'ingilizce',
    languageLabel: 'İngilizce',
    ages: ['teen'],
    category: 'kids-teens',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['13-17 Yaş', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },

  // ═══════════════ İSPANYOLCA ════════════════════════════════════════

  {
    id: 'es-grup-f2f',
    name: 'İspanyolca Grup Programı',
    description: 'Native speaker eğitmenlerle yüz yüze, %85\'i konuşma pratiğine dayalı grup dersleri. Kültür, seyahat ve günlük yaşam senaryolarıyla dolu, enerji yüklü İspanyolca.',
    slug: 'ispanyolca/grup-programi',
    language: 'ispanyolca',
    languageLabel: 'İspanyolca',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['face-to-face'],
    badges: ['A1-C2', 'Grup', 'Yüz Yüze'],
    featured: true,
    nativeSpeaker: true,
  },
  {
    id: 'es-online-grup',
    name: 'Online İspanyolca Grup Programı',
    description: 'Nerede olursanız olun — native speaker eğitmenlerle canlı, interaktif İspanyolca grup dersleri. %85 konuşma odaklı enerjisini online ortamda yaşayın.',
    slug: 'ispanyolca/online-grup',
    language: 'ispanyolca',
    languageLabel: 'İspanyolca',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['online'],
    badges: ['A1-C2', 'Grup', 'Online'],
    nativeSpeaker: true,
  },
  {
    id: 'es-ozel',
    name: 'İspanyolca Özel Ders',
    description: 'Native speaker eğitmenle tamamen size özel İspanyolca. Hedefinize göre şekillenen müfredat, kendi temponuzda ilerleme ve birebir konuşma pratiği.',
    slug: 'ispanyolca/ozel-ders',
    language: 'ispanyolca',
    languageLabel: 'İspanyolca',
    ages: ['adult'],
    category: 'general',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['A1-C2', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'dele',
    name: 'DELE / SIELE Hazırlık',
    description: 'İspanyolca akademik sınav hazırlığı — kişiye özgü modüler plan, düzenli takip ve stratejik yol haritasıyla hedef puanınıza ulaşın. Native speaker eğitmenle birebir speaking pratiği.',
    slug: 'ispanyolca/dele-siele',
    language: 'ispanyolca',
    languageLabel: 'İspanyolca',
    ages: ['adult'],
    category: 'exam',
    classTypes: ['private', 'group'],
    formats: ['online', 'face-to-face'],
    badges: ['Sınav', 'Özel & Grup', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'kids-es',
    name: 'Kids İspanyolca',
    description: '7-12 yaş grubuna özel İspanyolca — native speaker eğitmenle birebir dersler, oyunlaştırılmış müfredat ve doğal edinim. Erken yaşta ikinci dil alışkanlığı kazandırın.',
    slug: 'ispanyolca/kids',
    language: 'ispanyolca',
    languageLabel: 'İspanyolca',
    ages: ['child'],
    category: 'kids-teens',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['7-12 Yaş', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'teens-es-grup',
    name: 'Teens İspanyolca Grup',
    description: 'Gençlere özel İspanyolca grup programı — etkileşimli konuşma pratiği ve akran öğrenme enerjisi ile hızlı ilerleme.',
    slug: 'ispanyolca/teens-grup',
    language: 'ispanyolca',
    languageLabel: 'İspanyolca',
    ages: ['teen'],
    category: 'kids-teens',
    classTypes: ['group'],
    formats: ['online', 'face-to-face'],
    badges: ['13-17 Yaş', 'Grup', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'teens-es-ozel',
    name: 'Teens İspanyolca Özel Ders',
    description: 'Gençlere özel İspanyolca birebir program — kendi hızında, kişiselleştirilmiş ilerleme ve konuşma odaklı dersler.',
    slug: 'ispanyolca/teens-ozel',
    language: 'ispanyolca',
    languageLabel: 'İspanyolca',
    ages: ['teen'],
    category: 'kids-teens',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['13-17 Yaş', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },

  // ═══════════════ ALMANCA ═══════════════════════════════════════════

  {
    id: 'de-grup-f2f',
    name: 'Almanca Grup Programı',
    description: 'Teachera Teaching Method ile %85 konuşma pratiğine dayalı yüz yüze grup dersleri. Günlük Almanca\'yı gerçek diyaloglar ve kültürel bağlamda keşfedin.',
    slug: 'almanca/grup-programi',
    language: 'almanca',
    languageLabel: 'Almanca',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['face-to-face'],
    badges: ['A1-C2', 'Grup', 'Yüz Yüze'],
    featured: true,
  },
  {
    id: 'de-online-grup',
    name: 'Online Almanca Grup Programı',
    description: 'Nerede olursanız olun — canlı, interaktif Almanca grup dersleri. %85 konuşma odaklı Teachera Teaching Method enerjisini online ortamda yaşayın.',
    slug: 'almanca/online-grup',
    language: 'almanca',
    languageLabel: 'Almanca',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['online'],
    badges: ['A1-C2', 'Grup', 'Online'],
  },
  {
    id: 'de-ozel',
    name: 'Almanca Özel Ders',
    description: 'Tamamen size özel Almanca müfredatı ve birebir eğitmen desteği. İster kariyer ister akademik hedef — tempoyu siz belirleyin, konuşarak ilerleyin.',
    slug: 'almanca/ozel-ders',
    language: 'almanca',
    languageLabel: 'Almanca',
    ages: ['adult'],
    category: 'general',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['A1-C2', 'Özel', 'Online & Yüz Yüze'],
  },
  {
    id: 'goethe',
    name: 'Goethe / TestDaF / TELC Hazırlık',
    description: 'Almanca akademik sınav hazırlığı — kişiye özgü plan, düzenli takip ve stratejik yol haritasıyla hedef puanınıza ulaşın. Her modül için derinlemesine hazırlık.',
    slug: 'almanca/goethe-testdaf',
    language: 'almanca',
    languageLabel: 'Almanca',
    ages: ['adult'],
    category: 'exam',
    classTypes: ['private', 'group'],
    formats: ['online', 'face-to-face'],
    badges: ['Sınav', 'Özel & Grup', 'Online & Yüz Yüze'],
  },
  {
    id: 'kids-de',
    name: 'Kids Almanca',
    description: '7-12 yaş grubuna özel Almanca — birebir özel derslerle doğal edinim ve erken dönem dil alışkanlıkları. Oyunlaştırılmış müfredat.',
    slug: 'almanca/kids',
    language: 'almanca',
    languageLabel: 'Almanca',
    ages: ['child'],
    category: 'kids-teens',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['7-12 Yaş', 'Özel', 'Online & Yüz Yüze'],
  },
  {
    id: 'teens-de',
    name: 'Teens Almanca',
    description: 'Gençlere özel Almanca programı — birebir özel derslerle konuşma odaklı, hızlı ilerleme ve özgüven geliştirme.',
    slug: 'almanca/teens',
    language: 'almanca',
    languageLabel: 'Almanca',
    ages: ['teen'],
    category: 'kids-teens',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['13-17 Yaş', 'Özel', 'Online & Yüz Yüze'],
  },

  // ═══════════════ FRANSIZCA ═════════════════════════════════════════

  {
    id: 'fr-grup-f2f',
    name: 'Fransızca Grup Programı',
    description: 'Teachera Teaching Method ile %85 konuşma pratiğine dayalı yüz yüze grup dersleri. Fransızca\'yı kültürel zenginliğiyle, gerçek senaryolarda keşfedin.',
    slug: 'fransizca/grup-programi',
    language: 'fransizca',
    languageLabel: 'Fransızca',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['face-to-face'],
    badges: ['A1-C2', 'Grup', 'Yüz Yüze'],
  },
  {
    id: 'fr-online-grup',
    name: 'Online Fransızca Grup Programı',
    description: 'Nerede olursanız olun — canlı, interaktif Fransızca grup dersleri. %85 konuşma odaklı enerjisini online ortamda yaşayın.',
    slug: 'fransizca/online-grup',
    language: 'fransizca',
    languageLabel: 'Fransızca',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['online'],
    badges: ['A1-C2', 'Grup', 'Online'],
  },
  {
    id: 'fr-ozel',
    name: 'Fransızca Özel Ders',
    description: 'Tamamen size özel Fransızca müfredatı ve birebir eğitmen desteği. Diplomatik dili kendi hızınızda keşfedin, konuşarak ilerleyin.',
    slug: 'fransizca/ozel-ders',
    language: 'fransizca',
    languageLabel: 'Fransızca',
    ages: ['adult'],
    category: 'general',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['A1-C2', 'Özel', 'Online & Yüz Yüze'],
  },
  {
    id: 'delf',
    name: 'DELF / DALF / TCF Hazırlık',
    description: 'Fransızca akademik sınav hazırlığı — kişiye özgü plan ve stratejik yol haritasıyla hedef puanınıza ulaşın. Her modül için derinlemesine çalışma.',
    slug: 'fransizca/delf-dalf',
    language: 'fransizca',
    languageLabel: 'Fransızca',
    ages: ['adult'],
    category: 'exam',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['Sınav', 'Özel', 'Online & Yüz Yüze'],
  },
  {
    id: 'legal-fr',
    name: 'Hukuki Fransızca',
    description: 'Fransızca hukuki terminoloji, sözleşme dili ve profesyonel yazışma. Uluslararası hukuk alanında Fransızca yetkinliğinizi güçlendirin.',
    slug: 'fransizca/hukuki',
    language: 'fransizca',
    languageLabel: 'Fransızca',
    ages: ['adult'],
    category: 'career',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['Hukuk', 'Özel', 'Online & Yüz Yüze'],
  },
  {
    id: 'teens-fr',
    name: 'Teens Fransızca',
    description: 'Gençlere özel Fransızca programı — birebir özel derslerle konuşma odaklı, hızlı ilerleme ve doğal akıcılık.',
    slug: 'fransizca/teens',
    language: 'fransizca',
    languageLabel: 'Fransızca',
    ages: ['teen'],
    category: 'kids-teens',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['13-17 Yaş', 'Özel', 'Online & Yüz Yüze'],
  },

  // ═══════════════ İTALYANCA ═════════════════════════════════════════

  {
    id: 'it-grup-f2f',
    name: 'İtalyanca Grup Programı',
    description: 'Native speaker eğitmenlerle yüz yüze, %85\'i konuşma pratiğine dayalı grup dersleri. Sanat, kültür ve günlük yaşam senaryolarıyla dolu İtalyanca.',
    slug: 'italyanca/grup-programi',
    language: 'italyanca',
    languageLabel: 'İtalyanca',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['face-to-face'],
    badges: ['A1-C2', 'Grup', 'Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'it-online-grup',
    name: 'Online İtalyanca Grup Programı',
    description: 'Nerede olursanız olun — native speaker eğitmenlerle canlı, interaktif İtalyanca grup dersleri. %85 konuşma odaklı enerjisini online ortamda yaşayın.',
    slug: 'italyanca/online-grup',
    language: 'italyanca',
    languageLabel: 'İtalyanca',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['online'],
    badges: ['A1-C2', 'Grup', 'Online'],
    nativeSpeaker: true,
  },
  {
    id: 'it-ozel',
    name: 'İtalyanca Özel Ders',
    description: 'Native speaker eğitmenle tamamen size özel İtalyanca. Kültürden kariyere, hedefinize göre şekillenen birebir program — kendi temponuzda konuşarak öğrenin.',
    slug: 'italyanca/ozel-ders',
    language: 'italyanca',
    languageLabel: 'İtalyanca',
    ages: ['adult'],
    category: 'general',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['A1-C2', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'cils',
    name: 'CILS / CELI Hazırlık',
    description: 'İtalyanca akademik sınav hazırlığı — native speaker eğitmenle kişiye özgü plan ve stratejik yol haritasıyla hedef puanınıza ulaşın.',
    slug: 'italyanca/cils-celi',
    language: 'italyanca',
    languageLabel: 'İtalyanca',
    ages: ['adult'],
    category: 'exam',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['Sınav', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
  {
    id: 'teens-it',
    name: 'Teens İtalyanca',
    description: 'Genlere özel İtalyanca programı — birebir özel derslerle sanat ve kültür dili. Native speaker eğitmenle konuşma odaklı ilerleme.',
    slug: 'italyanca/teens',
    language: 'italyanca',
    languageLabel: 'İtalyanca',
    ages: ['teen'],
    category: 'kids-teens',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['13-17 Yaş', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },

  // ═══════════════ RUSÇA ═════════════════════════════════════════════

  {
    id: 'ru-grup-f2f',
    name: 'Rusça Grup Programı',
    description: 'Teachera Teaching Method ile %85 konuşma pratiğine dayalı yüz yüze grup dersleri. Rusça\'yı edebiyattan günlük yaşama, gerçek diyaloglarla öğrenin.',
    slug: 'rusca/grup-programi',
    language: 'rusca',
    languageLabel: 'Rusça',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['face-to-face'],
    badges: ['A1-C2', 'Grup', 'Yüz Yüze'],
  },
  {
    id: 'ru-online-grup',
    name: 'Online Rusça Grup Programı',
    description: 'Nerede olursanız olun — canlı, interaktif Rusça grup dersleri. %85 konuşma odaklı Teachera Teaching Method enerjisini online ortamda yaşayın.',
    slug: 'rusca/online-grup',
    language: 'rusca',
    languageLabel: 'Rusça',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['online'],
    badges: ['A1-C2', 'Grup', 'Online'],
  },
  {
    id: 'ru-ozel',
    name: 'Rusça Özel Ders',
    description: 'Tamamen size özel Rusça müfredatı ve birebir eğitmen desteği. Hedefinize göre şekillenen, esnek tempolu program — konuşarak ilerleyin.',
    slug: 'rusca/ozel-ders',
    language: 'rusca',
    languageLabel: 'Rusça',
    ages: ['adult'],
    category: 'general',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['A1-C2', 'Özel', 'Online & Yüz Yüze'],
  },
  {
    id: 'torfl',
    name: 'TORFL Hazırlık',
    description: 'Rusça akademik sınav hazırlığı — kişiye özgü plan ve stratejik yol haritasıyla hedef puanınıza ulaşın. Her modül için derinlemesine çalışma.',
    slug: 'rusca/torfl',
    language: 'rusca',
    languageLabel: 'Rusça',
    ages: ['adult'],
    category: 'exam',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['Sınav', 'Özel', 'Online & Yüz Yüze'],
  },
  {
    id: 'teens-ru',
    name: 'Teens Rusça',
    description: 'Gençlere özel Rusça programı — birebir özel derslerle stratejik dil yetkinliği. Konuşma odaklı, kişiselleştirilmiş ilerleme.',
    slug: 'rusca/teens',
    language: 'rusca',
    languageLabel: 'Rusça',
    ages: ['teen'],
    category: 'kids-teens',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['13-17 Yaş', 'Özel', 'Online & Yüz Yüze'],
  },

  // ═══════════════ ARAPÇA ═════════════════════════

  {
    id: 'ar-f2f-grup',
    name: 'Arapça Grup Programı',
    description: 'Dört temel beceriyi konuşma merkezli geliştiren yüz yüze Arapça grup dersleri. Fasih Arapça (Fusha) odaklı müfredat ile akademik ve günlük iletişim yetkinliği.',
    slug: 'arapca/grup-programi',
    language: 'arapca',
    languageLabel: 'Arapça',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['face-to-face'],
    badges: ['A1-C2', 'Grup', 'Yüz Yüze'],
  },
  {
    id: 'ar-online-grup',
    name: 'Online Arapça Grup Programı',
    description: 'Nerede olursanız olun — canlı, interaktif Arapça grup dersleri. Fasih Arapça müfredatıyla dört beceriyi konuşma merkezli geliştirin.',
    slug: 'arapca/online-grup',
    language: 'arapca',
    languageLabel: 'Arapça',
    ages: ['adult'],
    category: 'general',
    classTypes: ['group'],
    formats: ['online'],
    badges: ['A1-C2', 'Grup', 'Online'],
  },
  {
    id: 'ar-ozel',
    name: 'Arapça Özel Ders',
    description: 'Tamamen size özel Fasih Arapça eğitimi. Dört temel beceriyi konuşma merkezli geliştiren birebir derslerle hedefinize ulaşın — akademik, ticari veya kişisel.',
    slug: 'arapca/ozel-ders',
    language: 'arapca',
    languageLabel: 'Arapça',
    ages: ['adult'],
    category: 'general',
    classTypes: ['private'],
    formats: ['online', 'face-to-face'],
    badges: ['A1-C2', 'Özel', 'Online & Yüz Yüze'],
    nativeSpeaker: true,
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   AGE FILTER TABS
   ═══════════════════════════════════════════════════════════════════════ */
const AGE_TABS: { id: AgeGroup; label: string; ageRange: string; icon: React.ReactNode }[] = [
  { id: 'child', label: 'Çocuk', ageRange: '4-12 yaş', icon: <Baby size={14} /> },
  { id: 'teen', label: 'Genç', ageRange: '13-17 yaş', icon: <BookOpen size={14} /> },
  { id: 'adult', label: 'Yetişkin', ageRange: '18+', icon: <GraduationCap size={14} /> },
];

/* ══════════════════════════════════════════════════════════════════════
   LANGUAGE TABS (built from data)
   ══════════════════════════════════════════════════════════════════════ */
interface LanguageTab {
  id: string;
  label: string;
  accent: string;
  count: number;
}

function buildLanguageTabs(): LanguageTab[] {
  const langMap: Record<string, { label: string; accent: string; count: number }> = {};
  ALL_PROGRAMS.forEach(p => {
    if (!langMap[p.language]) {
      langMap[p.language] = {
        label: p.languageLabel,
        accent: LANG_ACCENTS[p.language] || '#324D47',
        count: 0,
      };
    }
    langMap[p.language].count++;
  });

  return Object.entries(langMap)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([id, data]) => ({
      id,
      label: data.label,
      accent: data.accent,
      count: data.count,
    }));
}

const LANGUAGE_TABS = buildLanguageTabs();

/* ═══════════════════════════════════════════════════════════════════════
   CATEGORY HELPERS
   ═══════════════════════════════════════════════════════════════════════ */
function getCategoryIcon(cat: CategoryId) {
  switch (cat) {
    case 'kids-teens': return <Baby size={12} />;
    case 'exam': return <GraduationCap size={12} />;
    case 'career': return <Briefcase size={12} />;
    case 'general': return <MessageCircle size={12} />;
    default: return <Globe size={12} />;
  }
}

function getCategoryLabel(cat: CategoryId) {
  switch (cat) {
    case 'kids-teens': return 'Çocuk & Genç';
    case 'exam': return 'Sınav Hazırlık';
    case 'career': return 'Kariyer';
    case 'general': return 'Genel & Kültür';
    default: return '';
  }
}

/* ══════════════════════════════════════════════════════════════════════
   PROGRAM CARD COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
const ProgramCard = forwardRef<HTMLDivElement, { program: ProgramItem; index: number }>(
  function ProgramCard({ program, index }, ref) {
  const navigate = useNavigate();
  const accent = LANG_ACCENTS[program.language] || '#324D47';

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        layout: { duration: 0.35, ease: [0.33, 1, 0.68, 1] },
        opacity: { duration: 0.3, delay: Math.min(index * 0.03, 0.3) },
        y: { duration: 0.35, delay: Math.min(index * 0.03, 0.3) },
      }}
      className="group relative bg-white rounded-2xl border border-[#09090F]/[0.06] hover:border-[#324D47]/20 hover:shadow-[0_8px_32px_rgba(50,77,71,0.07)] transition-all duration-400 overflow-hidden cursor-pointer"
      onClick={() => navigate(`/egitimlerimiz/${program.slug}`)}
    >
      {/* Top accent line */}
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${accent}40, ${accent}15, transparent)` }} />

      <div className="p-5 md:p-6">
        {/* Header row: Language dot + Category + Native Speaker badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accent }} />
            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[10px] tracking-[0.1em] uppercase" style={{ color: `${accent}CC` }}>
              {program.languageLabel}
            </span>
            {program.nativeSpeaker && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#324D47]/[0.07] text-[#324D47]/70 text-[8px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.05em] uppercase">
                Native Speaker
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#09090F]/[0.03] text-[#09090F]/35 text-[9px] font-['Neutraface_2_Text:Demi',sans-serif]">
            {getCategoryIcon(program.category)}
            {getCategoryLabel(program.category)}
          </span>
        </div>

        {/* Program Name */}
        <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[16px] md:text-[17px] leading-tight mb-2 group-hover:text-[#324D47] transition-colors duration-300">
          {program.name}
        </h3>

        {/* Description */}
        <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/50 text-[13px] leading-[1.65] mb-5 line-clamp-3">
          {program.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {program.badges.map(badge => (
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
            {program.formats.includes('online') && (
              <span className="flex items-center gap-1 text-[#09090F]/25 text-[9px] font-['Neutraface_2_Text:Book',sans-serif]">
                <Monitor size={9} />
                Online
              </span>
            )}
            {program.formats.includes('face-to-face') && (
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
});
ProgramCard.displayName = 'ProgramCard';

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export { ALL_PROGRAMS };
export type { ProgramItem };

export default function AllPrograms() {
  const navigate = useNavigate();

  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FormatType | null>(null);

  // Scroll into view when navigating via hash
  useEffect(() => {
    if (window.location.hash === '#tum-programlar') {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  // Listen for hash change (e.g. from ProgramFinder's "Tüm Programlara Göz At" link)
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#tum-programlar') {
        setTimeout(() => {
          sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const filtered = useMemo(() => {
    return ALL_PROGRAMS.filter(p => {
      const ageOk = !selectedAge || p.ages.includes(selectedAge);
      const langOk = !selectedLanguage || p.language === selectedLanguage;
      const formatOk = !selectedFormat || p.formats.includes(selectedFormat);
      return ageOk && langOk && formatOk;
    });
  }, [selectedAge, selectedLanguage, selectedFormat]);

  const hasFilters = selectedAge !== null || selectedLanguage !== null || selectedFormat !== null;

  const clearAll = () => {
    setSelectedAge(null);
    setSelectedLanguage(null);
    setSelectedFormat(null);
  };

  return (
    <section id="tum-programlar" ref={sectionRef} className="relative bg-[#FAFAF8]">
      <div className="py-12 md:py-16">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#324D47]/10 to-transparent" />

        <div className="max-w-[1200px] mx-auto px-6">

          {/* ── Filter Bar ── */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {AGE_TABS.map(age => {
                const isActive = selectedAge === age.id;
                return (
                  <button
                    key={age.id}
                    onClick={() => setSelectedAge(isActive ? null : age.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-300 cursor-pointer border ${
                      isActive
                        ? 'bg-[#324D47] text-white border-[#324D47] shadow-[0_4px_12px_rgba(50,77,71,0.15)]'
                        : 'bg-white text-[#09090F]/50 border-[#09090F]/[0.07] hover:border-[#324D47]/25 hover:text-[#324D47]'
                    }`}
                  >
                    {age.icon}
                    {age.label}
                    <span className={`text-[10px] ${isActive ? 'text-white/60' : 'text-[#09090F]/25'}`}>
                      {age.ageRange}
                    </span>
                  </button>
                );
              })}
              <div className="hidden md:block w-px h-6 bg-[#09090F]/[0.08] mx-1" />
              <button
                onClick={() => setSelectedLanguage(null)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-300 cursor-pointer border ${
                  !selectedLanguage
                    ? 'bg-[#324D47] text-white border-[#324D47] shadow-[0_4px_12px_rgba(50,77,71,0.15)]'
                    : 'bg-white text-[#09090F]/50 border-[#09090F]/[0.07] hover:border-[#324D47]/25 hover:text-[#324D47]'
                }`}
              >
                <Globe size={12} />
                Tüm Diller
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {LANGUAGE_TABS.map(lang => {
                const isActive = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(isActive ? null : lang.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-300 cursor-pointer border ${
                      isActive
                        ? 'bg-[#324D47] text-white border-[#324D47] shadow-[0_2px_8px_rgba(50,77,71,0.15)]'
                        : 'bg-white text-[#09090F]/50 border-[#09090F]/[0.06] hover:border-[#324D47]/25 hover:text-[#324D47]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.6)' : lang.accent }} />
                    {lang.label}
                    <span className={`text-[10px] ${isActive ? 'text-white/50' : 'text-[#09090F]/20'}`}>{lang.count}</span>
                  </button>
                );
              })}
              <div className="hidden md:block w-px h-5 bg-[#09090F]/[0.08] mx-1" />
              <button
                onClick={() => setSelectedFormat(selectedFormat === 'online' ? null : 'online')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-300 cursor-pointer border ${
                  selectedFormat === 'online'
                    ? 'bg-[#324D47] text-white border-[#324D47] shadow-[0_2px_8px_rgba(50,77,71,0.15)]'
                    : 'bg-white text-[#09090F]/50 border-[#09090F]/[0.06] hover:border-[#324D47]/25 hover:text-[#324D47]'
                }`}
              >
                <Monitor size={11} /> Online
              </button>
              <button
                onClick={() => setSelectedFormat(selectedFormat === 'face-to-face' ? null : 'face-to-face')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-300 cursor-pointer border ${
                  selectedFormat === 'face-to-face'
                    ? 'bg-[#324D47] text-white border-[#324D47] shadow-[0_2px_8px_rgba(50,77,71,0.15)]'
                    : 'bg-white text-[#09090F]/50 border-[#09090F]/[0.06] hover:border-[#324D47]/25 hover:text-[#324D47]'
                }`}
              >
                <MapPin size={11} /> Yüz Yüze
              </button>
            </div>
          </div>

          {/* ── Results Count ── */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-[#324D47]/40" />
              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F]/40 text-[12px]">
                {filtered.length} program gösteriliyor
              </span>
            </div>
            {hasFilters && (
              <button onClick={clearAll} className="inline-flex items-center gap-1.5 text-[#09090F]/30 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] hover:text-[#324D47] transition-colors cursor-pointer">
                Filtreleri Temizle
              </button>
            )}
          </div>

          {/* ── Program Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((program, i) => (
                <ProgramCard key={program.id} program={program} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {/* ── Empty State ── */}
          <AnimatePresence>
            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-20">
                <div className="w-12 h-12 rounded-full bg-[#324D47]/[0.06] flex items-center justify-center mx-auto mb-4">
                  <Filter size={18} className="text-[#324D47]/30" />
                </div>
                <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[1.1rem] mb-2">Bu filtrelere uygun program bulunamadı.</h3>
                <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/40 text-[13px] mb-5">Filtrelerinizi değiştirerek tekrar deneyin.</p>
                <button onClick={clearAll} className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-[#324D47]/15 text-[#324D47] rounded-full text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] hover:border-[#324D47]/30 transition-all cursor-pointer">
                  Filtreleri Temizle
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Bottom CTA ── */}
          <div className="mt-16 text-center">
            <div className="bg-[#09090F] rounded-2xl p-8 md:p-10 max-w-[680px] mx-auto">
              <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-[1.2rem] md:text-[1.4rem] leading-tight mb-2">
                Hangi program sana uygun?
              </h3>
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/35 text-[13px] leading-relaxed mb-6 max-w-[440px] mx-auto">
                4 kısa soruyla ihtiyacına en uygun programı bulabilir veya danışmanlarımızla konuşabilirsin.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => { const el = document.getElementById('program-finder'); el?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#324D47] text-white rounded-full text-[14px] font-['Neutraface_2_Text:Demi',sans-serif] hover:bg-[#3d5e56] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(50,77,71,0.35)]"
                >
                  <Sparkles size={14} />
                  Program Bulucuyu Kullan
                </button>
                <button
                  onClick={() => navigate('/iletisim')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/[0.1] text-white/45 text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] hover:border-white/20 hover:text-white/60 transition-all cursor-pointer"
                >
                  Danışmana Sor
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
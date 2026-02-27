import svgPaths from "./svg-s3ql4jgmva";
import imgArticleImage from "figma:asset/4443100084528b80e44b8c577118d677ccc966ed.webp";
import imgArticleImage1 from "figma:asset/d99de839eaada4a65012713f7461b190bca75c34.webp";
import imgArticleImage2 from "figma:asset/365a9e29036deb3db38c76ea35ba36e544efbae0.webp";
import { imgFooterIconContainer } from "./svg-8rtv1";

function FaqAnswerContainer({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="content-stretch flex items-center py-[10px] relative shrink-0 w-full">
      <p className="flex-[1_0_0] font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#09090f] text-[16px] whitespace-pre-wrap">{children}</p>
    </div>
  );
}

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute contents inset-0">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}
type NavItemTextProps = {
  text: string;
};

function NavItemText({ text }: NavItemTextProps) {
  return (
    <div className="content-stretch flex items-center justify-center py-[6px] relative shrink-0">
      <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[32px] not-italic relative shrink-0 text-[#f3ebd1] text-[16px]">{text}</p>
    </div>
  );
}

function VuesaxLinearAdd({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-name="vuesax/linear/add">
      <Wrapper>
        <g id="add">
          <path d="M6 12H18" id="Vector" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 18V6" id="Vector_2" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Vector_3" opacity="0" />
        </g>
      </Wrapper>
    </div>
  );
}

function VuesaxLinearCloseCircle({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-name="vuesax/linear/close-circle">
      <Wrapper>
        <g id="close-circle">
          <path d={svgPaths.p2933eac0} id="Vector" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p3ddd791c} id="Vector_2" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p1889e500} id="Vector_3" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Vector_4" opacity="0" />
        </g>
      </Wrapper>
    </div>
  );
}

export default function Academy() {
  return (
    <div className="bg-white relative size-full" data-name="ACADEMY">
      <div className="absolute bg-[#f3ebd1] h-[751px] left-0 top-[262px] w-[1440px]" data-name="Hero Image" />
      <div className="absolute flex h-[80px] items-center justify-center left-0 top-0 w-[1440px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="bg-white border-[#c4c4c4] border-l border-solid h-[1440px] w-[80px]" data-name="Menu Indicator" />
        </div>
      </div>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] left-[calc(66.67%+9.5px)] not-italic text-[#09090f] text-[16px] text-center top-[30px]">Seviye Tespit</p>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] left-[calc(75%+6.5px)] not-italic text-[#09090f] text-[16px] text-center top-[30px]">İletişime Geç</p>
      <div className="absolute h-[29px] left-[150px] top-[25px] w-[146px]" data-name="teachera_logo">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 146 29">
          <g clipPath="url(#clip0_3_1431)" id="teachera_logo">
            <path d={svgPaths.p12ae49c0} fill="var(--fill-0, #E51E25)" id="Vector" />
            <path d={svgPaths.p26b62580} fill="var(--fill-0, #E51E25)" id="Vector_2" />
            <path d={svgPaths.pd939380} fill="var(--fill-0, #E51E25)" id="Vector_3" />
            <path d={svgPaths.p1f653980} fill="var(--fill-0, #E51E25)" id="Vector_4" />
            <path d={svgPaths.p38bb4900} fill="var(--fill-0, #E51E25)" id="Vector_5" />
            <path d={svgPaths.p3a41a600} fill="var(--fill-0, #E51E25)" id="Vector_6" />
            <path d={svgPaths.p19d1ca00} fill="var(--fill-0, #E51E25)" id="Vector_7" />
            <path d={svgPaths.p2db47c80} fill="var(--fill-0, #E51E25)" id="Vector_8" />
          </g>
          <defs>
            <clipPath id="clip0_3_1431">
              <rect fill="white" height="29" width="146" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <div className="absolute bg-[#334e48] content-stretch flex items-center justify-center left-[calc(83.33%-40px)] overflow-clip px-[10px] py-[8px] rounded-[6px] top-[22px]" data-name="Menu Button Container">
        <p className="font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#eeebf5] text-[16px]">Giriş Yap</p>
      </div>
      <div className="absolute h-[14px] left-[calc(91.67%-50px)] top-[33px] w-[19px]" data-name="Menu Icon Container">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 14">
          <g clipPath="url(#clip0_3_1426)" id="Menu Icon Container">
            <path d={svgPaths.p2b6e7a00} id="Icon" stroke="var(--stroke-0, #09090F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
          <defs>
            <clipPath id="clip0_3_1426">
              <rect fill="white" height="14" width="19" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <div className="absolute bg-[#334e48] content-stretch flex flex-col items-start left-0 px-[145px] py-[20px] top-[80px] w-[1440px]" data-name="Header Container">
        <div className="content-stretch flex flex-col gap-[30px] items-center pt-[30px] relative shrink-0 w-full" data-name="Header Content">
          <div className="content-stretch flex gap-[11px] items-start relative shrink-0" data-name="Logo and Title">
            <div className="h-[27px] relative shrink-0 w-[145px]" data-name="teachera_logo">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 145 27">
                <g clipPath="url(#clip0_3_4620)" id="teachera_logo">
                  <path d={svgPaths.p1d109180} fill="var(--fill-0, #F3EBD1)" id="Vector" />
                  <path d={svgPaths.p2bd1ce40} fill="var(--fill-0, #F3EBD1)" id="Vector_2" />
                  <path d={svgPaths.p32ecb400} fill="var(--fill-0, #F3EBD1)" id="Vector_3" />
                  <path d={svgPaths.p32f5b900} fill="var(--fill-0, #F3EBD1)" id="Vector_4" />
                  <path d={svgPaths.p19578500} fill="var(--fill-0, #F3EBD1)" id="Vector_5" />
                  <path d={svgPaths.p15884200} fill="var(--fill-0, #F3EBD1)" id="Vector_6" />
                  <path d={svgPaths.p1d475300} fill="var(--fill-0, #F3EBD1)" id="Vector_7" />
                  <path d={svgPaths.p2c2cb800} fill="var(--fill-0, #F3EBD1)" id="Vector_8" />
                </g>
                <defs>
                  <clipPath id="clip0_3_4620">
                    <rect fill="white" height="27" width="145" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <p className="font-['Neutraface_2_Text:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#f3ebd1] text-[32px]">ACADEMY</p>
          </div>
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Nav Container">
            <div className="content-stretch flex items-center justify-center py-[10px] relative shrink-0" data-name="Nav Item">
              <div aria-hidden="true" className="absolute border-[#f3ebd1] border-b-3 border-solid inset-0 pointer-events-none" />
              <p className="font-['Neutraface_2_Text:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#f3ebd1] text-[16px]">DİL ÖĞRENİMİ</p>
            </div>
            <NavItemText text="İNGİLİZCE" />
            <NavItemText text="İSPANYOLCA" />
            <NavItemText text="FRANSIZCA" />
            <NavItemText text="İTALYANCA" />
            <NavItemText text="ALMANCA" />
            <NavItemText text="RUSÇA" />
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex gap-[58px] h-[534px] items-center left-[145px] top-[362px] w-[1150px]" data-name="Article Container">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[20px] h-full items-start min-h-px min-w-px relative" data-name="Article Container">
          <div className="content-stretch flex flex-col gap-[20px] items-start leading-[normal] not-italic relative shrink-0 text-black w-full whitespace-pre-wrap" data-name="Article Content">
            <p className="font-['Neutraface_2_Text:Bold',sans-serif] relative shrink-0 text-[20px] w-full">ÇEVİRİ HASTALIĞI</p>
            <div className="font-['Neutraface_2_Text:Book',sans-serif] relative shrink-0 text-[14px] w-full">
              <p className="mb-0">Başlığı özellikle seçtik. Evet, çeviri, dil öğrenme sürecinizde ölümcül bir hastalıktır. Peşin olarak teşhisimizi söyledikten sonra izahına geçelim.</p>
              <p className="mb-0">&nbsp;</p>
              <p>{`Etrafımızda "anlıyorum ama konuşamıyorum" veya "biliyorum ama bir türlü konuşamıyorum" gibi cümleleri sıkça duyarız. Bu durum, dilin gramer yapısını denklemlerle, kavramları ise Türkçe açıklamaları ve karşılıkları ile ezberleyerek öğrenmekten kaynaklanır. Bu şekilde öğrendikten sonra, kendiliğinden gelen, çeviri yaparak konuşma çabası içerisinde oluruz.`}</p>
            </div>
          </div>
          <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Article Image">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgArticleImage} />
          </div>
        </div>
        <div className="content-stretch flex h-full items-center relative shrink-0" data-name="Divider">
          <div className="flex h-[551px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "153.5" } as React.CSSProperties}>
            <div className="-rotate-90 flex-none">
              <div className="h-0 relative w-[551px]">
                <div className="absolute inset-[-1px_0_0_0]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 551 1">
                    <line id="Line 22" stroke="var(--stroke-0, #334E48)" x2="551" y1="0.5" y2="0.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[47px] h-full items-start min-h-px min-w-px relative" data-name="Article Container">
          <div className="content-stretch flex flex-col gap-[20px] items-start leading-[normal] not-italic relative shrink-0 text-black w-full whitespace-pre-wrap" data-name="Article Content">
            <div className="font-['Neutraface_2_Text:Bold',sans-serif] relative shrink-0 text-[20px] w-full">
              <p className="mb-0">BİLİYORUM AMA</p>
              <p>KONUŞAMIYORUM</p>
            </div>
            <div className="font-['Neutraface_2_Text:Book',sans-serif] relative shrink-0 text-[14px] w-full">
              <p className="mb-0">Dil öğrenme sürecinde, teknik ve gramer bilgisine hâkim olsanız bile anlama ve konuşma becerilerinizi geliştiremeyişinizi anlamlandıramıyor olabilirsiniz.</p>
              <p className="mb-0">&nbsp;</p>
              <p className="mb-0">Bu yazıda, dil öğrenme sürecinde yapılan hataları ve dil öğrenme stratejilerini ele alarak, dil öğreniminde karşılaşılan zorlukları aşmanıza yardımcı olacağız.</p>
              <p className="mb-0">&nbsp;</p>
              <p>&nbsp;</p>
            </div>
          </div>
          <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Article Image">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgArticleImage1} />
          </div>
        </div>
        <div className="h-full relative shrink-0 w-0" data-name="Divider">
          <div className="absolute inset-[0_0_0_-1px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.00002 534">
              <g id="Divider">
                <line id="Line 22" stroke="var(--stroke-0, #334E48)" x1="0.5" x2="0.500023" y1="534" y2="2.18556e-08" />
              </g>
            </svg>
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[40px] h-full items-start min-h-px min-w-px relative" data-name="Article Container">
          <div className="content-stretch flex flex-col gap-[20px] items-start leading-[normal] not-italic relative shrink-0 text-black w-full whitespace-pre-wrap" data-name="Article Content">
            <div className="font-['Neutraface_2_Text:Bold',sans-serif] relative shrink-0 text-[20px] w-full">
              <p className="mb-0">DİL ÖĞRENİMİ:</p>
              <p className="mb-0">MOTOR BECERİ Mİ, MANTIKSAL</p>
              <p>BİLGİ EDİNİMİ Mİ?</p>
            </div>
            <div className="font-['Neutraface_2_Text:Book',sans-serif] relative shrink-0 text-[14px] w-full">
              <p className="mb-0">Dil öğrenmenin temel amacı, konuşma, anlama, okuma ve yazma gibi becerileri kullanarak iletişim kurabilmektir.</p>
              <p className="mb-0">&nbsp;</p>
              <p>Bu hedeflere ulaşmak için, öğrencilerin sadece teorik ve mantıksal bilgi edinimi değil, aynı zamanda dil becerilerini motor becerilere dönüştürmeleri gerekmektedir.</p>
            </div>
          </div>
          <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Article Image">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgArticleImage2} />
          </div>
        </div>
      </div>
      <div className="absolute contents left-px top-[2148px]" data-name="Footer Container">
        <div className="absolute contents left-px top-[2148px]" data-name="Footer Container">
          <div className="absolute h-[610px] left-px top-[2148px] w-[1440px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 610">
              <path d="M1440 0H0V610H1440V0Z" fill="var(--fill-0, #09090F)" id="Rectangle 276" />
            </svg>
          </div>
          <div className="absolute h-0 left-[calc(8.33%+105px)] top-[2612.42px] w-[992px]">
            <div className="absolute inset-[-0.15px_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 992 0.3">
                <path d="M992 0.15H0" id="Line 20" stroke="var(--stroke-0, #D0D0D0)" strokeWidth="0.3" />
              </svg>
            </div>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] left-[calc(75%-41px)] not-italic text-white top-[2537.42px]"
            data-name="KULE PLÂZA KAT: 26
Selçuklu – KONYA"
          >
            <p className="absolute leading-[0] left-[calc(75%-41px)] text-[0px] top-[2537.42px]">
              <span className="leading-[normal] text-[16px]">{`KULE PLÂZA KAT: `}</span>
              <span className="leading-[normal] text-[22px]">26</span>
            </p>
            <p className="absolute leading-[normal] left-[calc(75%-41px)] text-[16px] top-[2562.42px]">Selçuklu – KONYA</p>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-41px)] not-italic text-white top-[2249.56px]"
            data-name="Sadece yazılı iletişim
WP: +905528674226"
          >
            <p className="absolute left-[calc(75%-41px)] text-[14px] top-[2249.56px]">Sadece yazılı iletişim</p>
            <p className="absolute left-[calc(75%-41px)] text-[20px] top-[2268.56px]">WP: +905528674226</p>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-41px)] not-italic text-white top-[2325.56px]"
            data-name="Satış Departmanı
sales@teachera.com.tr

Medya Soruları İçin
media@teachera.com.tr

Ortaklıklar için
partners@teachera.com.tr"
          >
            <p className="absolute left-[calc(75%-41px)] text-[14px] top-[2325.56px]">Satış Departmanı</p>
            <p className="absolute left-[calc(75%-41px)] text-[20px] top-[2339.56px]">sales@teachera.com.tr</p>
            <p className="absolute left-[calc(75%-41px)] text-[14px] top-[2385.56px]">Medya Soruları İçin</p>
            <p className="absolute left-[calc(75%-41px)] text-[20px] top-[2399.56px]">media@teachera.com.tr</p>
            <p className="absolute left-[calc(75%-41px)] text-[14px] top-[2445.56px]">Ortaklıklar için</p>
            <p className="absolute left-[calc(75%-41px)] text-[20px] top-[2459.56px]">partners@teachera.com.tr</p>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(25%+87px)] not-italic text-[14px] top-[2210px]"
            data-name="İŞ FIRSATLARI
MÜŞTERİ TEMSİLCİSİ OL
ELÇİ OL
SIKÇA SORULAN SORULAR
FİYATLAR
EĞİTİMLERİMİZ"
          >
            <p className="absolute left-[calc(25%+87px)] text-[#e05049] top-[2210px]">İŞ FIRSATLARI</p>
            <p className="absolute left-[calc(25%+87px)] text-[#e05049] top-[2260px]">MÜŞTERİ TEMSİLCİSİ OL</p>
            <p className="absolute left-[calc(25%+87px)] text-[#e05049] top-[2310px]">ELÇİ OL</p>
            <p className="absolute left-[calc(25%+87px)] text-white top-[2360px]">SIKÇA SORULAN SORULAR</p>
            <p className="absolute left-[calc(25%+87px)] text-white top-[2410px]">FİYATLAR</p>
            <p className="absolute left-[calc(25%+87px)] text-white top-[2460px]">EĞİTİMLERİMİZ</p>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(41.67%+101.5px)] not-italic text-[14px] text-white top-[2210px]"
            data-name="KİŞİSEL VERİLERİN KORUNMASI
Gizlilik Politikası
Çocukların Gizlilik Politikası
Çerez Politikası
Ebeveyn Muvafakatname
Yurt Dışına Aktarım Açık Rıza
WhatsApp Açık Rıza Metni
Müşteri Aydınlatma Metni
İletişim Aydınlatma Metni
Çağrı Merkezi Aydınlatma Metni M"
          >
            <p className="absolute left-[calc(41.67%+101.5px)] top-[2210px]">KİŞİSEL VERİLERİN KORUNMASI</p>
            <p className="absolute left-[calc(41.67%+101.5px)] top-[2235px]">Gizlilik Politikası</p>
            <p className="absolute left-[calc(41.67%+101.5px)] top-[2260px]">Çocukların Gizlilik Politikası</p>
            <p className="absolute left-[calc(41.67%+101.5px)] top-[2285px]">Çerez Politikası</p>
            <p className="absolute left-[calc(41.67%+101.5px)] top-[2310px]">Ebeveyn Muvafakatname</p>
            <p className="absolute left-[calc(41.67%+101.5px)] top-[2335px]">Yurt Dışına Aktarım Açık Rıza</p>
            <p className="absolute left-[calc(41.67%+101.5px)] top-[2360px]">WhatsApp Açık Rıza Metni</p>
            <p className="absolute left-[calc(41.67%+101.5px)] top-[2385px]">Müşteri Aydınlatma Metni</p>
            <p className="absolute left-[calc(41.67%+101.5px)] top-[2410px]">İletişim Aydınlatma Metni</p>
            <p className="absolute left-[calc(41.67%+101.5px)] top-[2435px]">Çağrı Merkezi Aydınlatma Metni Müşteri</p>
            <p className="absolute left-[calc(41.67%+101.5px)] top-[2460px]">İlgili Kişi Başvuru Formu</p>
          </div>
          <div className="absolute h-[19.569px] left-[calc(8.33%+105px)] top-[2212px] w-[107.22px]" data-name="Footer Icon Container">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 107.219 19.5692">
              <g id="Footer Icon Container">
                <path d={svgPaths.p1d8b0b80} fill="var(--fill-0, #C95748)" id="Path 1" />
                <path d={svgPaths.p1ce96600} fill="var(--fill-0, #C95748)" id="Path 2" />
                <path d={svgPaths.p23336480} fill="var(--fill-0, #C95748)" id="Path 3" />
                <path d={svgPaths.pdc35200} fill="var(--fill-0, #C95748)" id="Path 4" />
                <path d={svgPaths.p2057b280} fill="var(--fill-0, #C95748)" id="Path 5" />
                <path d={svgPaths.p303112f2} fill="var(--fill-0, #C95748)" id="Path 6" />
                <path d={svgPaths.p3c110200} fill="var(--fill-0, #C95748)" id="Path 7" />
                <path d={svgPaths.p2201ec00} fill="var(--fill-0, #C95748)" id="Path 8" />
              </g>
            </svg>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+105px)] not-italic text-[14px] text-white top-[2639.42px] whitespace-pre-wrap"
            data-name="Teachera, Avrupa standartlarına karşılık gelen bir müfredat kullanarak, İngilizce, İspanyolca, Fransızca, Almanca, İtalyanca, Rusça ve Arapça eğitimleri veren,
Milli Eğitim Bakanlığına bağlı faaliyet yürüten, online ve yüzyüze eğitim veren bir dil okuludur"
          >
            <p className="absolute left-[calc(8.33%+105px)] top-[2639.42px] w-[990.479px]">{`Teachera, Avrupa standartlarına karşılık gelen bir müfredat kullanarak, İngilizce, İspanyolca, Fransızca, Almanca, `}</p>
            <p className="absolute left-[calc(8.33%+105px)] top-[2654.42px] w-[389.497px]">İtalyanca, Rusça ve Arapça eğitimleri veren,</p>
            <p className="absolute left-[calc(8.33%+105px)] top-[2669.42px] w-[992px]">Milli Eğitim Bakanlığına bağlı faaliyet yürüten, online ve yüzyüze eğitim veren bir dil okuludur. C teachera ltd.şti</p>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+124.71px)] not-italic text-[26px] text-white top-[2291.83px]"
            data-name="09:00
21:30"
          >
            <p className="absolute left-[calc(8.33%+124.71px)] top-[2291.83px]">09:00</p>
            <p className="absolute left-[calc(8.33%+130.83px)] top-[2316.83px]">21:30</p>
          </div>
          <div className="absolute contents left-[calc(66.67%+45.02px)] top-[2206px]" data-name="Contact Info Container">
            <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-43px)] not-italic text-[26px] text-white top-[2206px]">0332 236 80 66</p>
            <div className="absolute h-[21.956px] left-[calc(66.67%+45.02px)] top-[2216.04px] w-[21.958px]" data-name="phone_solid">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.9585 21.9561">
                <g id="phone_solid">
                  <path clipRule="evenodd" d={svgPaths.p297a5f00} fill="var(--fill-0, white)" fillRule="evenodd" id="Path 68" />
                </g>
              </svg>
            </div>
          </div>
          <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+105px)] not-italic text-[#e05049] text-[14px] top-[2698px]">© Teachera 2024</p>
          <div className="absolute contents left-[calc(8.33%+105px)] top-[2565.93px]" data-name="Footer Icon Container">
            <div className="absolute contents left-[calc(8.33%+105px)] top-[2565.93px]" data-name="Clip path group">
              <div className="absolute h-[16.488px] left-[calc(8.33%+105px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[103.112px_16.488px] top-[2565.93px] w-[103.111px]" data-name="Footer Icon Container" style={{ maskImage: `url('${imgFooterIconContainer}')` }}>
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 103.112 16.4882">
                  <g id="Footer Icon Container">
                    <path d={svgPaths.pa084a00} fill="var(--fill-0, #959595)" id="Path 69" />
                    <path d={svgPaths.p327bf300} fill="var(--fill-0, #959595)" id="Path 70" />
                    <path d={svgPaths.p3333a500} fill="var(--fill-0, #959595)" id="Path 71" />
                    <path d={svgPaths.p14a32b00} fill="var(--fill-0, #959595)" id="Path 72" />
                    <path d={svgPaths.pc9560f2} fill="var(--fill-0, #959595)" id="Path 73" />
                    <path d={svgPaths.p3e6a6700} fill="var(--fill-0, #959595)" id="Path 74" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[30px] items-center left-[calc(50%+0.5px)] top-[1091px] w-[1139px]" data-name="FAQ Container">
        <div className="relative shrink-0 w-full" data-name="FAQ Header">
          <div className="flex flex-row items-center justify-center size-full">
            <div className="content-stretch flex items-center justify-center p-[10px] relative w-full">
              <p className="font-['Neutraface_2_Text:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#09090f] text-[32px] text-center">SIKÇA SORULAN SORULAR</p>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-name="FAQ Content">
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="FAQ Item">
            <div aria-hidden="true" className="absolute border-b-[0.3px] border-black border-solid inset-0 pointer-events-none" />
            <div className="content-stretch flex items-center justify-between py-[20px] relative shrink-0 w-full" data-name="FAQ Question Container">
              <p className="flex-[1_0_0] font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#09090f] text-[16px] whitespace-pre-wrap">1. Öğrenmek istediğim dili hiç bilmiyorum. Bu şekilde eğitimlerinize katılabilir miyim?</p>
              <div className="content-stretch flex items-center p-[10px] relative shrink-0" data-name="FAQ Icon Container">
                <VuesaxLinearAdd className="relative shrink-0 size-[20px]" />
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="FAQ Item">
            <div aria-hidden="true" className="absolute border-b-[0.3px] border-black border-solid inset-0 pointer-events-none" />
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="FAQ Item">
              <div className="content-stretch flex items-center justify-between py-[20px] relative shrink-0 w-full" data-name="FAQ Question Container">
                <p className="flex-[1_0_0] font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#09090f] text-[16px] whitespace-pre-wrap">2. Eğitimlerinizde Türkçe kullanılmıyor, dersleri nasıl anlayacağız? Öğretmenimizle nasıl iletişim kuracağız?</p>
                <div className="content-stretch flex items-center p-[10px] relative shrink-0" data-name="FAQ Icon Container">
                  <VuesaxLinearCloseCircle className="relative shrink-0 size-[20px]" />
                </div>
              </div>
              <FaqAnswerContainer>{`Teachera bünyesindeki tüm eğitmenler metodoloji eğitimlerine tabidir. Derslerde beden dili, illüstrasyonlar ve görsel materyaller yoğun olarak kullanılır. Bu sayede anadil kullanımından uzak durularak, dil öğreniminde sıkça karşılaşılan "öğrenme engelleri" önlenir. Ana dilinizi nasıl öğrendiğinizi düşünün; burada bunun daha sistematik haliyle eğitim alırsınız.`}</FaqAnswerContainer>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="FAQ Item">
            <div aria-hidden="true" className="absolute border-b-[0.3px] border-black border-solid inset-0 pointer-events-none" />
            <div className="content-stretch flex items-center justify-between py-[20px] relative shrink-0 w-full" data-name="FAQ Question Container">
              <p className="flex-[1_0_0] font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#09090f] text-[16px] whitespace-pre-wrap">3. Ücretsiz deneme dersine katılabilir miyim?</p>
              <div className="content-stretch flex items-center p-[10px] relative shrink-0" data-name="FAQ Icon Container">
                <VuesaxLinearAdd className="relative shrink-0 size-[20px]" />
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="FAQ Item">
            <div aria-hidden="true" className="absolute border-b-[0.3px] border-black border-solid inset-0 pointer-events-none" />
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="FAQ Item">
              <div className="content-stretch flex items-center justify-between py-[20px] relative shrink-0 w-full" data-name="FAQ Question Container">
                <p className="flex-[1_0_0] font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#09090f] text-[16px] whitespace-pre-wrap">4. Seviyemizi nasıl öğrenebiliriz?</p>
                <div className="content-stretch flex items-center p-[10px] relative shrink-0" data-name="FAQ Icon Container">
                  <VuesaxLinearCloseCircle className="relative shrink-0 size-[20px]" />
                </div>
              </div>
              <FaqAnswerContainer>İlgili bağlantı üzerinden formu doldurarak yazılı sınavı hemen başlatabilir ve seviyenizi öğrenebilirsiniz. Eğitim paketi satın aldıktan sonra danışmanlarımız sizinle iletişime geçerek sözlü seviye tespit için eğitmenlerimizle bir randevu planlar. Bu değerlendirme sonucunda net seviyeniz belirlenmiş olur.</FaqAnswerContainer>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="FAQ Item">
            <div aria-hidden="true" className="absolute border-b-[0.3px] border-black border-solid inset-0 pointer-events-none" />
            <div className="content-stretch flex items-center justify-between py-[20px] relative shrink-0 w-full" data-name="FAQ Question Container">
              <p className="flex-[1_0_0] font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#09090f] text-[16px] whitespace-pre-wrap">5. Eğitimler sadece yerli konuşmacılar tarafından mı veriliyor?</p>
              <div className="content-stretch flex items-center p-[10px] relative shrink-0" data-name="FAQ Icon Container">
                <VuesaxLinearAdd className="relative shrink-0 size-[20px]" />
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="FAQ Item">
            <div aria-hidden="true" className="absolute border-b-[0.3px] border-black border-solid inset-0 pointer-events-none" />
            <div className="content-stretch flex items-center justify-between py-[20px] relative shrink-0 w-full" data-name="FAQ Question Container">
              <p className="flex-[1_0_0] font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#09090f] text-[16px] whitespace-pre-wrap">6. Eğitmenlerinizin yeterliliğinden nasıl emin olabilirim?</p>
              <div className="content-stretch flex items-center p-[10px] relative shrink-0" data-name="FAQ Icon Container">
                <VuesaxLinearAdd className="relative shrink-0 size-[20px]" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#09090f] content-stretch flex gap-[5px] h-[40px] items-center justify-center px-[20px] py-[10px] relative rounded-[100px] shrink-0" data-name="button">
          <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">Tümünü Gör</p>
          <div className="flex items-center justify-center relative shrink-0">
            <div className="-scale-y-100 flex-none rotate-180">
              <div className="relative size-[16px]" data-name="Button Icon">
                <div className="absolute contents inset-0" data-name="vuesax/linear/send">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                    <g id="Send">
                      <path d="M2.33333 14.6667H13.6667" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
                      <g id="Group">
                        <path d={svgPaths.p37ae9ec0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
                        <path d="M3.33333 9.18V2.33333H10.18" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
                      </g>
                      <path d="M15.5 0.5V15.5H0.5V0.5H15.5Z" id="Vector_4" opacity="0" stroke="var(--stroke-0, white)" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
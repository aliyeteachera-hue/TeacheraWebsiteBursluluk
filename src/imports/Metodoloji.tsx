import clsx from "clsx";
import svgPaths from "./svg-6kcjwxyla6";
import imgImage from "figma:asset/5db0a48ea4e57d3dd7ccc6814666cec8876ff478.webp";
import imgImage1 from "figma:asset/ca54e997f7c2e93791b8c24b18f4ad2506c1a135.webp";
import { imgFooterIconContainer } from "./svg-9iada";

function FaqAnswerContainerBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="content-stretch flex items-center py-[10px] relative shrink-0 w-full">
      <p className="flex-[1_0_0] font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#09090f] text-[16px] whitespace-pre-wrap">{children}</p>
    </div>
  );
}

function BackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute contents inset-0">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}
type TeacheraLogoBackgroundImageProps = {
  additionalClassNames?: string;
};

function TeacheraLogoBackgroundImage({ additionalClassNames = "" }: TeacheraLogoBackgroundImageProps) {
  return (
    <div className={clsx("absolute h-[29px] w-[146px]", additionalClassNames)}>
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
  );
}

function VuesaxLinearAdd({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-name="vuesax/linear/add">
      <BackgroundImage>
        <g id="add">
          <path d="M6 12H18" id="Vector" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 18V6" id="Vector_2" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Vector_3" opacity="0" />
        </g>
      </BackgroundImage>
    </div>
  );
}

function VuesaxLinearCloseCircle({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-name="vuesax/linear/close-circle">
      <BackgroundImage>
        <g id="close-circle">
          <path d={svgPaths.p2933eac0} id="Vector" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p3ddd791c} id="Vector_2" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p1889e500} id="Vector_3" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Vector_4" opacity="0" />
        </g>
      </BackgroundImage>
    </div>
  );
}

export default function Metodoloji() {
  return (
    <div className="bg-white relative size-full" data-name="METODOLOJİ">
      <div className="absolute flex h-[80px] items-center justify-center left-0 top-0 w-[1440px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="bg-white border-[#c4c4c4] border-l border-solid h-[1440px] w-[80px]" data-name="Menu Indicator" />
        </div>
      </div>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] left-[calc(66.67%+9.5px)] not-italic text-[#09090f] text-[16px] text-center top-[30px]">Seviye Tespit</p>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] left-[calc(75%+6.5px)] not-italic text-[#09090f] text-[16px] text-center top-[30px]">İletişime Geç</p>
      <TeacheraLogoBackgroundImage additionalClassNames="left-[150px] top-[25px]" />
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
      <div className="absolute h-[563px] left-0 top-[80px] w-[1440px]" data-name="Image">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[255.77%] left-0 max-w-none top-[-40.19%] w-full" src={imgImage} />
        </div>
      </div>
      <div className="absolute h-[563px] left-0 top-[80px] w-[1440px]" data-name="Background" style={{ backgroundImage: "linear-gradient(-63.2191deg, rgb(37, 31, 27) 0%, rgba(37, 31, 27, 0) 69.427%)" }} />
      <p className="absolute font-['Retro_Signature:Regular',sans-serif] leading-[0] left-[calc(50%-197px)] not-italic text-[#f3ebd1] text-[0px] text-[96px] top-[478px]">
        <span className="leading-[128px]">Teaching</span>
        <span className="leading-[128px] tracking-[-19.2px]">{` `}</span>
        <span className="leading-[128px]">Method</span>
      </p>
      <TeacheraLogoBackgroundImage additionalClassNames="-translate-x-1/2 left-1/2 top-[470px]" />
      <div className="absolute flex h-[704px] items-center justify-center left-0 top-[2071px] w-[1440px]">
        <div className="-scale-y-100 flex-none">
          <div className="bg-[#69242f] h-[704px] w-[1440px]" data-name="Background" />
        </div>
      </div>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[40px] left-[calc(54.17%-48px)] not-italic text-[#09090f] text-[36px] text-center top-[1179px] tracking-[0.72px] w-[1086px] whitespace-pre-wrap">KONUŞMA PRATİĞİ SERBEST DEĞİL; SİSTEMATİK OLMALI.</p>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[35px] left-[calc(54.17%-48px)] not-italic text-[#09090f] text-[24px] text-center top-[1262px] w-[1062px] whitespace-pre-wrap">
        Teachera Teaching Method, anlama ve konuşma becerilerini sistemli bir diyalog yöntemiyle geliştirir.
        <br aria-hidden="true" />
        Derslerin %85'i, öğretmenin önceden verdiği kelime ve dil bilgisine dayalı sorularla yönlendirilir.
        <br aria-hidden="true" />
        Öğrenci, dili doğru bağlamda kullanarak öğrenir ve refleks geliştirir.
      </p>
      <div className="absolute contents left-0 top-[4043px]" data-name="Footer Container">
        <div className="absolute contents left-0 top-[4043px]" data-name="Footer Container">
          <div className="absolute h-[610px] left-0 top-[4043px] w-[1440px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 610">
              <path d="M1440 0H0V610H1440V0Z" fill="var(--fill-0, #09090F)" id="Rectangle 276" />
            </svg>
          </div>
          <div className="absolute h-0 left-[calc(8.33%+104px)] top-[4507.42px] w-[992px]">
            <div className="absolute inset-[-0.15px_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 992 0.3">
                <path d="M992 0.15H0" id="Line 20" stroke="var(--stroke-0, #D0D0D0)" strokeWidth="0.3" />
              </svg>
            </div>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] left-[calc(75%-42px)] not-italic text-white top-[4432.42px]"
            data-name="KULE PLÂZA KAT: 26
Selçuklu – KONYA"
          >
            <p className="absolute leading-[0] left-[calc(75%-42px)] text-[0px] top-[4432.42px]">
              <span className="leading-[normal] text-[16px]">{`KULE PLÂZA KAT: `}</span>
              <span className="leading-[normal] text-[22px]">26</span>
            </p>
            <p className="absolute leading-[normal] left-[calc(75%-42px)] text-[16px] top-[4457.42px]">Selçuklu – KONYA</p>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-42px)] not-italic text-white top-[4144.56px]"
            data-name="Sadece yazılı iletişim
WP: +905528674226"
          >
            <p className="absolute left-[calc(75%-42px)] text-[14px] top-[4144.56px]">Sadece yazılı iletişim</p>
            <p className="absolute left-[calc(75%-42px)] text-[20px] top-[4163.56px]">WP: +905528674226</p>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-42px)] not-italic text-white top-[4220.56px]"
            data-name="Satış Departmanı
sales@teachera.com.tr

Medya Soruları İçin
media@teachera.com.tr

Ortaklıklar için
partners@teachera.com.tr"
          >
            <p className="absolute left-[calc(75%-42px)] text-[14px] top-[4220.56px]">Satış Departmanı</p>
            <p className="absolute left-[calc(75%-42px)] text-[20px] top-[4234.56px]">sales@teachera.com.tr</p>
            <p className="absolute left-[calc(75%-42px)] text-[14px] top-[4280.56px]">Medya Soruları İçin</p>
            <p className="absolute left-[calc(75%-42px)] text-[20px] top-[4294.56px]">media@teachera.com.tr</p>
            <p className="absolute left-[calc(75%-42px)] text-[14px] top-[4340.56px]">Ortaklıklar için</p>
            <p className="absolute left-[calc(75%-42px)] text-[20px] top-[4354.56px]">partners@teachera.com.tr</p>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(25%+86px)] not-italic text-[14px] top-[4105px]"
            data-name="İŞ FIRSATLARI
MÜŞTERİ TEMSİLCİSİ OL
ELÇİ OL
SIKÇA SORULAN SORULAR
FİYATLAR
EĞİTİMLERİMİZ"
          >
            <p className="absolute left-[calc(25%+86px)] text-[#e05049] top-[4105px]">İŞ FIRSATLARI</p>
            <p className="absolute left-[calc(25%+86px)] text-[#e05049] top-[4155px]">MÜŞTERİ TEMSİLCİSİ OL</p>
            <p className="absolute left-[calc(25%+86px)] text-[#e05049] top-[4205px]">ELÇİ OL</p>
            <p className="absolute left-[calc(25%+86px)] text-white top-[4255px]">SIKÇA SORULAN SORULAR</p>
            <p className="absolute left-[calc(25%+86px)] text-white top-[4305px]">FİYATLAR</p>
            <p className="absolute left-[calc(25%+86px)] text-white top-[4355px]">EĞİTİMLERİMİZ</p>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(41.67%+100.5px)] not-italic text-[14px] text-white top-[4105px]"
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
            <p className="absolute left-[calc(41.67%+100.5px)] top-[4105px]">KİŞİSEL VERİLERİN KORUNMASI</p>
            <p className="absolute left-[calc(41.67%+100.5px)] top-[4130px]">Gizlilik Politikası</p>
            <p className="absolute left-[calc(41.67%+100.5px)] top-[4155px]">Çocukların Gizlilik Politikası</p>
            <p className="absolute left-[calc(41.67%+100.5px)] top-[4180px]">Çerez Politikası</p>
            <p className="absolute left-[calc(41.67%+100.5px)] top-[4205px]">Ebeveyn Muvafakatname</p>
            <p className="absolute left-[calc(41.67%+100.5px)] top-[4230px]">Yurt Dışına Aktarım Açık Rıza</p>
            <p className="absolute left-[calc(41.67%+100.5px)] top-[4255px]">WhatsApp Açık Rıza Metni</p>
            <p className="absolute left-[calc(41.67%+100.5px)] top-[4280px]">Müşteri Aydınlatma Metni</p>
            <p className="absolute left-[calc(41.67%+100.5px)] top-[4305px]">İletişim Aydınlatma Metni</p>
            <p className="absolute left-[calc(41.67%+100.5px)] top-[4330px]">Çağrı Merkezi Aydınlatma Metni Müşteri</p>
            <p className="absolute left-[calc(41.67%+100.5px)] top-[4355px]">İlgili Kişi Başvuru Formu</p>
          </div>
          <div className="absolute h-[19.569px] left-[calc(8.33%+104px)] top-[4107px] w-[107.219px]" data-name="Footer Icon Container">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 107.219 19.5693">
              <g id="Footer Icon Container">
                <path d={svgPaths.p17ed9ff2} fill="var(--fill-0, #C95748)" id="Path 1" />
                <path d={svgPaths.p280f1290} fill="var(--fill-0, #C95748)" id="Path 2" />
                <path d={svgPaths.p2d3ec680} fill="var(--fill-0, #C95748)" id="Path 3" />
                <path d={svgPaths.p222c7500} fill="var(--fill-0, #C95748)" id="Path 4" />
                <path d={svgPaths.p1d664dc0} fill="var(--fill-0, #C95748)" id="Path 5" />
                <path d={svgPaths.p3198b500} fill="var(--fill-0, #C95748)" id="Path 6" />
                <path d={svgPaths.p95bac00} fill="var(--fill-0, #C95748)" id="Path 7" />
                <path d={svgPaths.p7bc2000} fill="var(--fill-0, #C95748)" id="Path 8" />
              </g>
            </svg>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+104px)] not-italic text-[14px] text-white top-[4534.42px] whitespace-pre-wrap"
            data-name="Teachera, Avrupa standartlarına karşılık gelen bir müfredat kullanarak, İngilizce, İspanyolca, Fransızca, Almanca, İtalyanca, Rusça ve Arapça eğitimleri veren,
Milli Eğitim Bakanlığına bağlı faaliyet yürüten, online ve yüzyüze eğitim veren bir dil okuludur"
          >
            <p className="absolute left-[calc(8.33%+104px)] top-[4534.42px] w-[990.479px]">{`Teachera, Avrupa standartlarına karşılık gelen bir müfredat kullanarak, İngilizce, İspanyolca, Fransızca, Almanca, `}</p>
            <p className="absolute left-[calc(8.33%+104px)] top-[4549.42px] w-[389.497px]">İtalyanca, Rusça ve Arapça eğitimleri veren,</p>
            <p className="absolute left-[calc(8.33%+104px)] top-[4564.42px] w-[992px]">Milli Eğitim Bakanlığına bağlı faaliyet yürüten, online ve yüzyüze eğitim veren bir dil okuludur. C teachera ltd.şti</p>
          </div>
          <div
            className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+123.71px)] not-italic text-[26px] text-white top-[4186.83px]"
            data-name="09:00
21:30"
          >
            <p className="absolute left-[calc(8.33%+123.71px)] top-[4186.83px]">09:00</p>
            <p className="absolute left-[calc(8.33%+129.83px)] top-[4211.83px]">21:30</p>
          </div>
          <div className="absolute contents left-[calc(66.67%+44.02px)] top-[4101px]" data-name="Contact Info Container">
            <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-44px)] not-italic text-[26px] text-white top-[4101px]">0332 236 80 66</p>
            <div className="absolute h-[21.956px] left-[calc(66.67%+44.02px)] top-[4111.04px] w-[21.958px]" data-name="phone_solid">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.9585 21.9562">
                <g id="phone_solid">
                  <path clipRule="evenodd" d={svgPaths.p35a1e400} fill="var(--fill-0, white)" fillRule="evenodd" id="Path 68" />
                </g>
              </svg>
            </div>
          </div>
          <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+104px)] not-italic text-[#e05049] text-[14px] top-[4593px]">© Teachera 2024</p>
          <div className="absolute contents left-[calc(8.33%+104px)] top-[4460.93px]" data-name="Footer Icon Container">
            <div className="absolute contents left-[calc(8.33%+104px)] top-[4460.93px]" data-name="Clip path group">
              <div className="absolute h-[16.488px] left-[calc(8.33%+104px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[103.112px_16.488px] top-[4460.93px] w-[103.112px]" data-name="Footer Icon Container" style={{ maskImage: `url('${imgFooterIconContainer}')` }}>
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 103.112 16.488">
                  <g id="Group 516">
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
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[40px] left-[calc(54.17%-48px)] not-italic text-[#09090f] text-[36px] text-center top-[700px] tracking-[0.72px] w-[1060px] whitespace-pre-wrap">ÇÜNKÜ KONUŞURKEN DÜŞÜNÜR, DÜŞÜNÜRKEN KONUŞURUZ!</p>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[35px] left-[calc(54.17%-48px)] not-italic text-[#09090f] text-[24px] text-center top-[783px] tracking-[0.48px] w-[1062px] whitespace-pre-wrap">Geleneksel eğitim tecrübeleri gösteriyor ki; gramer kuralları ve kelime ezberleri, dili konuşmayı sağlamıyor.Ana dilinizi düşünün: Konuşurken kelimeleri, kuralları tek tek hesaplamıyorsunuz. Ne söyleyeceğinize karar verip, kelimeleri refleks olarak söylüyorsunuz.</p>
      <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[40px] left-[calc(54.17%-483px)] not-italic text-[#09090f] text-[36px] top-[948px] tracking-[0.72px] w-[870px] whitespace-pre-wrap">DİLDE DÜŞÜNÜRSEN, KONUŞMAK KAÇINILMAZDIR!</p>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[35px] left-[calc(54.17%-48px)] not-italic text-[24px] text-black text-center top-[1031px] tracking-[0.48px] w-[1062px] whitespace-pre-wrap">
        Teachera Teaching Method, 100 yılı aşkın kanıtlanmış dil öğretim tekniklerinin modern sentezidir.
        <br aria-hidden="true" />
        Ana dil kullanımı minimuma indirilir, dilsel refleksler geliştirilir.
        <br aria-hidden="true" />
        Amaç, öğrendiğin dilde düşünmeni sağlamak. Çünkü dilde düşünmek, konuşmayı doğal hale getirir.
      </p>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Bold',sans-serif] leading-[40px] left-[calc(50%-1px)] not-italic text-[#eeebf5] text-[32px] text-center top-[2872px]">DİL ÖĞRENMEDE</p>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Bold',sans-serif] leading-[64px] left-[calc(50%-1px)] not-italic text-[#eeebf5] text-[48px] text-center top-[2922px]">REFLEKS GELİŞTİREN</p>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[56px] left-[calc(50%-0.5px)] not-italic text-[#eeebf5] text-[40px] text-center top-[2996px] tracking-[8px]">METOT</p>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[28px] left-[calc(50%-1px)] not-italic text-[#eeebf5] text-[24px] text-center top-[2252px] w-[846px] whitespace-pre-wrap">Binlerce sistematik sorudan oluşan kaynaklarıyla dili refleks hâline getirir. Öğretmen, yeni kelimeleri tanıtarak bu kelimelerle sorular yöneltir. Öğrenci bu süreçte soruyu dinler, doğru telaffuz ve yapıyı öğrenir, öğretmen rehberliğinde konuşur ve düzeltmelerle tekrar eder.</p>
      <div className="absolute h-[394px] left-[79px] top-[2649px] w-[1280px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <p className="-translate-x-1/2 absolute font-['Luxury:Gold',sans-serif] font-['Neutraface_2_Text:Demi',sans-serif] leading-[0] left-[calc(50%-1px)] not-italic text-[#09090f] text-[38px] text-center top-[2417px] w-[846px] whitespace-pre-wrap">
        <span className="leading-[40px] text-[#eeebf5]">Bu “Dinle - Konuş -</span>
        <span className="leading-[40px]">{` `}</span>
        <span className="leading-[40px] text-[rgba(238,235,245,0.25)]">Düzelt - Tekrar Et” döngüsü sayesinde kas hafızası gelişir; öğrenci öğrendiği dilde düşünerek otomatik konuşmaya başlar.</span>
      </p>
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[30px] items-center left-[calc(50%-0.5px)] top-[3147px] w-[1139px]" data-name="FAQ Container">
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
              <FaqAnswerContainerBackgroundImage>{`Teachera bünyesindeki tüm eğitmenler metodoloji eğitimlerine tabidir. Derslerde beden dili, illüstrasyonlar ve görsel materyaller yoğun olarak kullanılır. Bu sayede anadil kullanımından uzak durularak, dil öğreniminde sıkça karşılaşılan "öğrenme engelleri" önlenir. Ana dilinizi nasıl öğrendiğinizi düşünün; burada bunun daha sistematik haliyle eğitim alırsınız.`}</FaqAnswerContainerBackgroundImage>
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
              <FaqAnswerContainerBackgroundImage>İlgili bağlantı üzerinden formu doldurarak yazılı sınavı hemen başlatabilir ve seviyenizi öğrenebilirsiniz. Eğitim paketi satın aldıktan sonra danışmanlarımız sizinle iletişime geçerek sözlü seviye tespit için eğitmenlerimizle bir randevu planlar. Bu değerlendirme sonucunda net seviyeniz belirlenmiş olur.</FaqAnswerContainerBackgroundImage>
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
      <p className="absolute font-['Retro_Signature:Regular',sans-serif] leading-[0] left-[calc(50%-198px)] not-italic text-[#f3ebd1] text-[0px] text-[96px] top-[2142px]">
        <span className="leading-[100px]">Teaching</span>
        <span className="leading-[100px] tracking-[-19.2px]">{` `}</span>
        <span className="leading-[100px]">Method</span>
      </p>
      <div className="-translate-x-1/2 absolute h-[29px] left-1/2 top-[2103px] w-[146px]" data-name="teachera_logo">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 146 29">
          <g clipPath="url(#clip0_3_1416)" id="teachera_logo">
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
            <clipPath id="clip0_3_1416">
              <rect fill="white" height="29" width="146" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <div className="absolute contents inset-[33.31%_34.47%_59.43%_34.44%]" data-name="FAQ Container">
        <div className="absolute inset-[33.31%_34.47%_59.43%_34.44%]" data-name="Group">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 447.693 337.799">
            <g id="Group">
              <path d={svgPaths.p4397700} fill="url(#paint0_linear_2_1059)" fillOpacity="0.3" id="Vector" />
              <path d={svgPaths.p3b7bf50} fill="url(#paint1_linear_2_1059)" fillOpacity="0.3" id="Vector_2" />
              <path d={svgPaths.p22086800} fill="url(#paint2_linear_2_1059)" fillOpacity="0.3" id="Vector_3" />
              <path d={svgPaths.pc078c80} fill="url(#paint3_linear_2_1059)" fillOpacity="0.3" id="Vector_4" />
              <path d={svgPaths.p2c176cc0} fill="url(#paint4_linear_2_1059)" fillOpacity="0.3" id="Vector_5" />
            </g>
            <defs>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1059" x1="178.748" x2="178.748" y1="0" y2="143.673">
                <stop stopColor="#345A51" />
                <stop offset="1" stopColor="#70C0AE" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_2_1059" x1="223.177" x2="223.177" y1="41.0428" y2="282.636">
                <stop stopColor="#345A51" />
                <stop offset="1" stopColor="#70C0AE" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_2_1059" x1="92.5105" x2="92.5105" y1="156.135" y2="236.457">
                <stop stopColor="#345A51" />
                <stop offset="1" stopColor="#70C0AE" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_2_1059" x1="355.486" x2="355.486" y1="81.2366" y2="161.894">
                <stop stopColor="#345A51" />
                <stop offset="1" stopColor="#70C0AE" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_2_1059" x1="259.983" x2="259.983" y1="179.587" y2="337.799">
                <stop stopColor="#345A51" />
                <stop offset="1" stopColor="#70C0AE" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
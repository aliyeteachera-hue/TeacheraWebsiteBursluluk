import clsx from "clsx";
import svgPaths from "./svg-o93a17mxm6";
import imgImage from "figma:asset/2060cbe8e93368901498b0f200d4a7cd60ff1640.webp";
import imgProgramImage from "figma:asset/02b766839c248454f8f5030f774c65aa95d044b9.webp";
import imgProgramImage1 from "figma:asset/a3eee87bc98a41528cab90825ede85bec9721483.webp";
import imgProgramImage2 from "figma:asset/ca54e997f7c2e93791b8c24b18f4ad2506c1a135.webp";
import { imgIcon, imgImage1 } from "./svg-i2nlh";

function FaqAnswerContainerBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="content-stretch flex items-center py-[10px] relative shrink-0 w-full">
      <p className="flex-[1_0_0] font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#09090f] text-[16px] whitespace-pre-wrap">{children}</p>
    </div>
  );
}

function BackgroundImage3({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute contents inset-0">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}
type BackgroundImage2Props = {
  additionalClassNames?: string;
};

function BackgroundImage2({ additionalClassNames = "" }: BackgroundImage2Props) {
  return (
    <div className={clsx("absolute left-[148px] size-[15px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
        <circle cx="7.5" cy="7.5" fill="var(--fill-0, #09090F)" id="Ellipse 196" r="7.5" />
      </svg>
    </div>
  );
}
type BackgroundImage1Props = {
  additionalClassNames?: string;
};

function BackgroundImage1({ additionalClassNames = "" }: BackgroundImage1Props) {
  return (
    <div className={clsx("absolute h-0 left-[149px] w-[473px]", additionalClassNames)}>
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 473 1">
          <line id="Line 23" stroke="var(--stroke-0, #09090F)" x2="473" y1="0.5" y2="0.5" />
        </svg>
      </div>
    </div>
  );
}
type BackgroundImageProps = {
  text: string;
  text1: string;
  text2: string;
};

function BackgroundImage({ text, text1, text2 }: BackgroundImageProps) {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid not-italic place-items-start relative shrink-0 text-center whitespace-pre-wrap">
      <div className="col-1 font-['Neutraface_2_Text:Demi',sans-serif] leading-[40px] ml-[30px] mt-0 relative row-1 text-[36px] text-black w-[362px]">
        <p className="mb-0">{text}</p>
        <p>{text1}</p>
      </div>
      <p className="col-1 font-['Neutraface_2_Text:Book',sans-serif] leading-[28px] ml-0 mt-[89px] relative row-1 text-[#484848] text-[24px] w-[422px]">{text2}</p>
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
      <BackgroundImage3>
        <g id="add">
          <path d="M6 12H18" id="Vector" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 18V6" id="Vector_2" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Vector_3" opacity="0" />
        </g>
      </BackgroundImage3>
    </div>
  );
}

function VuesaxLinearCloseCircle({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-name="vuesax/linear/close-circle">
      <BackgroundImage3>
        <g id="close-circle">
          <path d={svgPaths.p2933eac0} id="Vector" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p3ddd791c} id="Vector_2" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p1889e500} id="Vector_3" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Vector_4" opacity="0" />
        </g>
      </BackgroundImage3>
    </div>
  );
}

export default function Kurumsal() {
  return (
    <div className="bg-white relative size-full" data-name="kurumsal">
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
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
      </div>
      <div className="absolute h-[563px] left-0 top-[80px] w-[1440px]" data-name="Background" style={{ backgroundImage: "linear-gradient(-63.2191deg, rgb(37, 31, 27) 0%, rgba(37, 31, 27, 0) 69.427%)" }} />
      <div className="absolute content-stretch flex flex-col gap-[36.101px] items-center leading-[0] left-[69px] top-[942px] w-[1333px]" data-name="Frame">
        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid not-italic place-items-start relative shrink-0 text-center" data-name="Personalized Education Container">
          <p className="col-1 font-['Neutraface_2_Text:Demi',sans-serif] leading-[40px] ml-[75px] mt-0 relative row-1 text-[36px] text-black">Kişiye Özel Eğitim Sistemi</p>
          <p className="col-1 font-['Neutraface_2_Text:Book',sans-serif] leading-[28px] ml-0 mt-[50px] relative row-1 text-[#484848] text-[24px] w-[543px] whitespace-pre-wrap">Her öğrencinin öğrenme tarzına göre şekillenen sistemimiz, en uygun ve etkili öğrenme deneyimini sunar.</p>
        </div>
        <div className="content-stretch flex gap-[36.308px] items-center relative shrink-0 w-full" data-name="Teacher Training Container">
          <div className="content-stretch flex flex-[1_0_0] gap-[5px] items-center min-h-px min-w-px relative" data-name="Teacher Training Info Container">
            <BackgroundImage text="Native Speaker" text1="Eğitmenler" text2="Eğitim verdiği tüm dillerde, Native Speaker eğitmenler, dersin temposunu ve doğru telaffuzu doğal olarak taşır; Teachera Teaching Method ise bunu sistemli konuşma refleksine çevirir." />
            <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0" data-name="Logo">
              <div className="col-1 h-[337.798px] ml-0 mt-0 relative row-1 w-[447.692px]" data-name="Group">
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
          <BackgroundImage text="Öğretmen Eğitimleri ile" text1="Standart Kalite" text2="Tüm öğretmenlerimiz, geçmişte aldığı tüm eğitim ve tecrübelerin yanında, etkili dil öğretim yöntemleri üzerine özel eğitim alır. Bu sayede her yerde aynı standartta yüksek kaliteyi sunarız." />
        </div>
        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid not-italic place-items-start relative shrink-0 text-center" data-name="Dynamic Curriculum Container">
          <div className="col-1 font-['Neutraface_2_Text:Demi',sans-serif] leading-[40px] ml-[135px] mt-0 relative row-1 text-[36px] text-black whitespace-nowrap">
            <p className="mb-0">Hedefe Uygun</p>
            <p>Dinamik Müfredat</p>
          </div>
          <p className="col-1 font-['Neutraface_2_Text:Book',sans-serif] leading-[28px] ml-0 mt-[90px] relative row-1 text-[#484848] text-[24px] w-[543px] whitespace-pre-wrap">Müfredatımız, öğrencilerin yaşına, seviyesine ve hedeflerine göre özel olarak tasarlanır. Böylece herkes kendi hızında ve en verimli şekilde ilerler.</p>
        </div>
      </div>
      <div className="absolute contents left-[148px] top-[1863px]" data-name="Program Info Container">
        <p className="absolute font-['Luxury:Gold',sans-serif] font-['Neutraface_2_Display:Titling',sans-serif] leading-[0] left-[149px] not-italic text-[38px] text-black top-[1931px]">
          <span className="leading-[100px]">
            6 Yıl AR-GE
            <br aria-hidden="true" />
          </span>
          <span className="leading-[100px] text-[#b4b4b4]">
            6 Dilde Eğitim
            <br aria-hidden="true" />
            23 Özgün Program
          </span>
        </p>
        <div className="absolute h-[436px] left-[calc(41.67%+22px)] rounded-[30px] top-[1863px] w-[667px]" data-name="Program Image">
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[30px]">
            <img alt="" className="absolute h-[152.98%] left-0 max-w-none top-[-45.29%] w-full" src={imgProgramImage} />
          </div>
        </div>
        <p className="-translate-x-full absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[24px] left-[calc(70.83%+230px)] not-italic text-[#09090f] text-[20px] text-right top-[2329px] w-[459px] whitespace-pre-wrap">Dil eğitiminin en etkili yollarını belirlemek için sistemli ve kapsamlı araştırmalar yürüttük.</p>
        <BackgroundImage1 additionalClassNames="top-[2015px]" />
        <BackgroundImage2 additionalClassNames="top-[2007px]" />
      </div>
      <div className="absolute contents left-[148px] top-[2465px]" data-name="Program Info Container">
        <p className="absolute font-['Luxury:Gold',sans-serif] font-['Neutraface_2_Display:Titling',sans-serif] leading-[0] left-[149px] not-italic text-[38px] text-black top-[2533px]">
          <span className="leading-[100px] text-[#b4b4b4]">6 Yıl AR-GE</span>
          <span className="leading-[100px]">
            <br aria-hidden="true" />6
          </span>
          <span className="leading-[100px] text-[#09090f]">
            {` DİLDE EĞİTİM`}
            <br aria-hidden="true" />
          </span>
          <span className="leading-[100px] text-[#b4b4b4]">23 Özgün Program</span>
        </p>
        <div className="absolute h-[436px] left-[calc(41.67%+22px)] rounded-[30px] top-[2465px] w-[667px]" data-name="Program Image">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[30px] size-full" src={imgProgramImage1} />
        </div>
        <p className="-translate-x-full absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[24px] left-[calc(70.83%+230px)] not-italic text-[#09090f] text-[20px] text-right top-[2931px] w-[459px] whitespace-pre-wrap">İngilizce, İspanyolca, İtalyanca, Fransızca, Rusça, Almanca dillerinde programlar sunuyoruz.</p>
        <BackgroundImage1 additionalClassNames="top-[2723px]" />
        <BackgroundImage2 additionalClassNames="top-[2715px]" />
      </div>
      <div className="absolute contents left-[148px] top-[3067px]" data-name="Program Info Container">
        <p className="absolute font-['Luxury:Gold',sans-serif] font-['Neutraface_2_Display:Titling',sans-serif] leading-[0] left-[149px] not-italic text-[38px] text-black top-[3135px]">
          <span className="leading-[100px] text-[#b4b4b4]">6 Yıl AR-GE</span>
          <span className="leading-[100px]">
            <br aria-hidden="true" />
          </span>
          <span className="leading-[100px] text-[#b4b4b4]">6 DİLDE EĞİTİM</span>
          <span className="leading-[100px] text-[#09090f]">
            <br aria-hidden="true" />
            23 Özgün Program
          </span>
        </p>
        <div className="absolute h-[436px] left-[calc(41.67%+22px)] rounded-[30px] top-[3067px] w-[667px]" data-name="Program Image">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[30px] size-full" src={imgProgramImage2} />
        </div>
        <p className="-translate-x-full absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[24px] left-[calc(70.83%+230px)] not-italic text-[#09090f] text-[20px] text-right top-[3533px] w-[459px] whitespace-pre-wrap">Farklı yaş grupları ve öğrenme hedefleri için özelleştirilmiş 23 ayrı eğitim programı geliştirdik.</p>
        <BackgroundImage1 additionalClassNames="top-[3428px]" />
        <BackgroundImage2 additionalClassNames="top-[3420px]" />
      </div>
      <div className="-translate-x-1/2 absolute bg-[#09090f] h-[266px] left-[calc(50%-1px)] top-[3701px] w-[1280px]" data-name="Background Container" />
      <div className="absolute h-[610px] left-[-1px] top-[5072px] w-[1440px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 610">
          <path d="M1440 0H0V610H1440V0Z" fill="var(--fill-0, #09090F)" id="Rectangle 276" />
        </svg>
      </div>
      <div className="absolute h-0 left-[calc(8.33%+103px)] top-[5536.42px] w-[992px]">
        <div className="absolute inset-[-0.15px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 992 0.3">
            <path d="M992 0.15H0" id="Line 20" stroke="var(--stroke-0, #D0D0D0)" strokeWidth="0.3" />
          </svg>
        </div>
      </div>
      <div
        className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] left-[calc(75%-43px)] not-italic text-white top-[5461.42px]"
        data-name="KULE PLÂZA KAT: 26
Selçuklu – KONYA"
      >
        <p className="absolute leading-[0] left-[calc(75%-43px)] text-[0px] top-[5461.42px]">
          <span className="leading-[normal] text-[16px]">{`KULE PLÂZA KAT: `}</span>
          <span className="leading-[normal] text-[22px]">26</span>
        </p>
        <p className="absolute leading-[normal] left-[calc(75%-43px)] text-[16px] top-[5486.42px]">Selçuklu – KONYA</p>
      </div>
      <div
        className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-43px)] not-italic text-white top-[5173.56px]"
        data-name="Sadece yazılı iletişim
WP: +905528674226"
      >
        <p className="absolute left-[calc(75%-43px)] text-[14px] top-[5173.56px]">Sadece yazılı iletişim</p>
        <p className="absolute left-[calc(75%-43px)] text-[20px] top-[5192.56px]">WP: +905528674226</p>
      </div>
      <div
        className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-43px)] not-italic text-white top-[5249.56px]"
        data-name="Satış Departmanı
sales@teachera.com.tr

Medya Soruları İçin
media@teachera.com.tr

Ortaklıklar için
partners@teachera.com.tr"
      >
        <p className="absolute left-[calc(75%-43px)] text-[14px] top-[5249.56px]">Satış Departmanı</p>
        <p className="absolute left-[calc(75%-43px)] text-[20px] top-[5263.56px]">sales@teachera.com.tr</p>
        <p className="absolute left-[calc(75%-43px)] text-[14px] top-[5309.56px]">Medya Soruları İçin</p>
        <p className="absolute left-[calc(75%-43px)] text-[20px] top-[5323.56px]">media@teachera.com.tr</p>
        <p className="absolute left-[calc(75%-43px)] text-[14px] top-[5369.56px]">Ortaklıklar için</p>
        <p className="absolute left-[calc(75%-43px)] text-[20px] top-[5383.56px]">partners@teachera.com.tr</p>
      </div>
      <div
        className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(25%+85px)] not-italic text-[14px] top-[5134px]"
        data-name="İŞ FIRSATLARI
MÜŞTERİ TEMSİLCİSİ OL
ELÇİ OL
SIKÇA SORULAN SORULAR
FİYATLAR
EĞİTİMLERİMİZ"
      >
        <p className="absolute left-[calc(25%+85px)] text-[#e05049] top-[5134px]">İŞ FIRSATLARI</p>
        <p className="absolute left-[calc(25%+85px)] text-[#e05049] top-[5184px]">MÜŞTERİ TEMSİLCİSİ OL</p>
        <p className="absolute left-[calc(25%+85px)] text-[#e05049] top-[5234px]">ELÇİ OL</p>
        <p className="absolute left-[calc(25%+85px)] text-white top-[5284px]">SIKÇA SORULAN SORULAR</p>
        <p className="absolute left-[calc(25%+85px)] text-white top-[5334px]">FİYATLAR</p>
        <p className="absolute left-[calc(25%+85px)] text-white top-[5384px]">EĞİTİMLERİMİZ</p>
      </div>
      <div
        className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(41.67%+99.5px)] not-italic text-[14px] text-white top-[5134px]"
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
        <p className="absolute left-[calc(41.67%+99.5px)] top-[5134px]">KİŞİSEL VERİLERİN KORUNMASI</p>
        <p className="absolute left-[calc(41.67%+99.5px)] top-[5159px]">Gizlilik Politikası</p>
        <p className="absolute left-[calc(41.67%+99.5px)] top-[5184px]">Çocukların Gizlilik Politikası</p>
        <p className="absolute left-[calc(41.67%+99.5px)] top-[5209px]">Çerez Politikası</p>
        <p className="absolute left-[calc(41.67%+99.5px)] top-[5234px]">Ebeveyn Muvafakatname</p>
        <p className="absolute left-[calc(41.67%+99.5px)] top-[5259px]">Yurt Dışına Aktarım Açık Rıza</p>
        <p className="absolute left-[calc(41.67%+99.5px)] top-[5284px]">WhatsApp Açık Rıza Metni</p>
        <p className="absolute left-[calc(41.67%+99.5px)] top-[5309px]">Müşteri Aydınlatma Metni</p>
        <p className="absolute left-[calc(41.67%+99.5px)] top-[5334px]">İletişim Aydınlatma Metni</p>
        <p className="absolute left-[calc(41.67%+99.5px)] top-[5359px]">Çağrı Merkezi Aydınlatma Metni Müşteri</p>
        <p className="absolute left-[calc(41.67%+99.5px)] top-[5384px]">İlgili Kişi Başvuru Formu</p>
      </div>
      <div className="absolute h-[19.569px] left-[calc(8.33%+103px)] top-[5136px] w-[107.219px]" data-name="Icon Container">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 107.219 19.5691">
          <g id="Group 514">
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
        className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+103px)] not-italic text-[14px] text-white top-[5563.42px] whitespace-pre-wrap"
        data-name="Teachera, Avrupa standartlarına karşılık gelen bir müfredat kullanarak, İngilizce, İspanyolca, Fransızca, Almanca, İtalyanca, Rusça ve Arapça eğitimleri veren,
Milli Eğitim Bakanlığına bağlı faaliyet yürüten, online ve yüzyüze eğitim veren bir dil okuludur"
      >
        <p className="absolute left-[calc(8.33%+103px)] top-[5563.42px] w-[990.479px]">{`Teachera, Avrupa standartlarına karşılık gelen bir müfredat kullanarak, İngilizce, İspanyolca, Fransızca, Almanca, `}</p>
        <p className="absolute left-[calc(8.33%+103px)] top-[5578.42px] w-[389.497px]">İtalyanca, Rusça ve Arapça eğitimleri veren,</p>
        <p className="absolute left-[calc(8.33%+103px)] top-[5593.42px] w-[992px]">Milli Eğitim Bakanlığına bağlı faaliyet yürüten, online ve yüzyüze eğitim veren bir dil okuludur. C teachera ltd.şti</p>
      </div>
      <div
        className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+123.71px)] not-italic text-[26px] text-white top-[8508.83px]"
        data-name="09:00
21:30"
      >
        <p className="absolute left-[calc(8.33%+123.71px)] top-[8508.83px]">09:00</p>
        <p className="absolute left-[calc(8.33%+129.83px)] top-[8533.83px]">21:30</p>
      </div>
      <div className="absolute contents left-[calc(66.67%+43.02px)] top-[5130px]" data-name="Phone Container">
        <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-45px)] not-italic text-[26px] text-white top-[5130px]">0332 236 80 66</p>
        <div className="absolute h-[21.956px] left-[calc(66.67%+43.02px)] top-[5140.04px] w-[21.958px]" data-name="phone_solid">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.9585 21.9562">
            <g id="phone_solid">
              <path clipRule="evenodd" d={svgPaths.p35a1e400} fill="var(--fill-0, white)" fillRule="evenodd" id="Path 68" />
            </g>
          </svg>
        </div>
      </div>
      <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+103px)] not-italic text-[#e05049] text-[14px] top-[5622px]">© Teachera 2024</p>
      <div className="absolute contents left-[calc(8.33%+103px)] top-[5489.93px]" data-name="Icon Container">
        <div className="absolute contents left-[calc(8.33%+103px)] top-[5489.93px]" data-name="Clip path group">
          <div className="absolute h-[16.488px] left-[calc(8.33%+103px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[103.112px_16.488px] top-[5489.93px] w-[103.112px]" data-name="Icon" style={{ maskImage: `url('${imgIcon}')` }}>
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
      <div className="absolute contents left-[calc(16.67%+57px)] top-[3728.9px]" data-name="Location Container">
        <div className="absolute contents left-[calc(16.67%+57px)] top-[3891.84px]" data-name="Teachera, Milli Eğitim Bakanlığına bağlı olarak Konya’da Kule Plaza 26. katta yüz yüze eğitimlerimize devam ederken, aynı zamanda online eğitim platformumuz üzerinden tüm dünyadan öğrencilerimize hizmet vermekteyiz.">
          <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] left-[calc(16.67%+479.5px)] not-italic text-[#fffdfd] text-[16px] text-center top-[3891.83px] w-[845px] whitespace-pre-wrap">Teachera, Milli Eğitim Bakanlığına bağlı olarak Konya’da Kule Plaza 26. katta yüz yüze eğitimlerimize devam ederken, aynı zamanda online eğitim platformumuz üzerinden tüm dünyadan öğrencilerimize hizmet vermekteyiz.</p>
        </div>
        <div className="absolute contents left-[calc(33.33%+19.13px)] top-[3728.9px]" data-name="Location Info Container">
          <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(41.67%+35.36px)] not-italic text-[#fffdfd] text-[50px] top-[3803.83px]">Neredeyiz?</p>
          <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(41.67%+34.82px)] not-italic text-[#fffdfd] text-[24px] top-[3782.83px]">PEKİ</p>
          <div className="absolute contents left-[calc(33.33%+19.13px)] top-[3728.9px]" data-name="Location Text Container">
            <div className="absolute contents h-[136.194px] left-[calc(33.33%+19.13px)] top-[3728.9px] w-[200.003px]" data-name="Image Container">
              <div className="absolute contents h-[126.212px] left-[calc(33.33%+19.13px)] top-[3733.89px] w-[200.003px]" data-name="Clip path group">
                <div className="absolute flex h-[124.321px] items-center justify-center left-[calc(33.33%+19.13px)] top-[3734.83px] w-[200.02px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "153.5" } as React.CSSProperties}>
                  <div className="flex-none rotate-[-6.43deg] scale-x-102 scale-y-84 skew-x-[39.06deg]">
                    <div className="h-[152.448px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0.002px_0.003px] mask-size-[200.003px_124.318px] relative w-[81.865px]" data-name="Image" style={{ maskImage: `url('${imgImage1}')` }}>
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 81.8652 152.448">
                        <g id="Group 521">
                          <path d={svgPaths.pdb92680} fill="var(--fill-0, white)" id="Path 78" />
                          <path d={svgPaths.p3f599f80} fill="var(--fill-0, white)" id="Path 79" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute left-[calc(33.33%+109.57px)] size-[10px] top-[3792.02px]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
                <path d={svgPaths.p46c6500} fill="var(--fill-0, #09090F)" id="Ellipse 189" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[40px] left-1/2 not-italic text-[#09090f] text-[36px] text-center top-[726px] w-[942px] whitespace-pre-wrap">‘’TEACHERA bir dil okulundan çok daha fazlasıdır. Öğrenmeyi öğrenebileceğiniz, kültürler arası bir topluluğun inşa edildiği sosyal bir yaşam alanıdır.’’</p>
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[30px] items-center left-[calc(50%-0.5px)] top-[4067px] w-[1139px]" data-name="FAQ Container">
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
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Display:Titling',sans-serif] leading-[80px] left-[calc(83.33%-53px)] not-italic text-[#eeebf5] text-[48px] text-center top-[525px] tracking-[2.4px]">WHO WE ARE?</p>
      <TeacheraLogoBackgroundImage additionalClassNames="-translate-x-1/2 left-[calc(83.33%-53px)] top-[496px]" />
      <TeacheraLogoBackgroundImage additionalClassNames="-translate-x-1/2 left-1/2 top-[881px]" />
    </div>
  );
}
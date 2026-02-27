import svgPaths from "./svg-rkz8hqc1ku";
import imgHeroImage from "figma:asset/fcb51df5825a321832c36815f1179e4b9a400a77.webp";
import { imgFooterClipPathContent } from "./svg-ryxp2";

function Wrapper1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[20px]">
      <div aria-hidden="true" className="absolute border-[0.3px] border-black border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[20px] items-center p-[20px] relative w-full">{children}</div>
      </div>
    </div>
  );
}
type Text3Props = {
  text: string;
};

function Text3({ text, children }: React.PropsWithChildren<Text3Props>) {
  return (
    <div className="bg-[#09090f] content-stretch flex gap-[5px] h-[40px] items-center justify-center px-[20px] py-[10px] relative rounded-[100px] shrink-0">
      <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">{text}</p>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">{children}</div>
      </div>
    </div>
  );
}

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute contents inset-0">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Send">{children}</g>
      </svg>
    </div>
  );
}
type Text2Props = {
  text: string;
};

function Text2({ text }: Text2Props) {
  return (
    <div className="relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-b-[0.3px] border-solid border-white inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pl-[10px] py-[10px] relative w-full">
          <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[32px] not-italic relative shrink-0 text-[16px] text-white">{text}</p>
        </div>
      </div>
    </div>
  );
}

function VuesaxLinearSend() {
  return (
    <Wrapper>
      <path d="M2.33333 14.6667H13.6667" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
      <g id="Group">
        <path d={svgPaths.p37ae9ec0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d="M3.33333 9.18V2.33333H10.18" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
      </g>
      <g id="Vector_4" opacity="0" />
    </Wrapper>
  );
}
type Text1Props = {
  text: string;
};

function Text1({ text }: Text1Props) {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0">
      <p className="font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#959595] text-[14px] text-center">{text}</p>
    </div>
  );
}
type TextProps = {
  text: string;
};

function Text({ text }: TextProps) {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0">
      <p className="font-['Neutraface_2_Text:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-black text-center">{text}</p>
    </div>
  );
}

export default function DenemeDersi() {
  return (
    <div className="bg-white relative size-full" data-name="DENEME DERSİ">
      <div className="absolute h-[909px] left-0 top-[80px] w-[1440px]" data-name="Hero Image">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[112.65%] left-[-15.65%] max-w-none top-[-2.41%] w-[126.88%]" src={imgHeroImage} />
        </div>
      </div>
      <div className="absolute bg-[rgba(47,47,47,0.61)] h-[909px] left-0 top-[80px] w-[1440px]" data-name="Hero Image Background" />
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
      <div className="absolute bg-[#eeebf5] h-[384px] left-0 top-[989px] w-[1440px]" data-name="Journey Background" />
      <div className="absolute content-stretch flex flex-col gap-[30px] items-start left-[calc(8.33%+69px)] top-[1083px] w-[1062px]" data-name="FAQ Section Container">
        <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="FAQ Header Container">
          <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-black">Hâlâ sorularınız mı var? Size yardımcı olmak için buradayız.</p>
        </div>
        <div className="content-stretch flex gap-[20px] items-center relative shrink-0 w-full" data-name="FAQ and Contact Container">
          <Wrapper1>
            <div className="content-stretch flex flex-col gap-[10px] items-center relative shrink-0" data-name="FAQ Content Container">
              <Text text="SSS" />
              <Text1 text="Sık sorulan sorular bölümünü inceleyin." />
            </div>
            <div className="content-stretch flex items-center relative shrink-0" data-name="FAQ Button Container">
              <Text3 text="SSS’a Bakın">
                <div className="relative size-[16px]" data-name="FAQ Button Icon">
                  <VuesaxLinearSend />
                </div>
              </Text3>
            </div>
          </Wrapper1>
          <Wrapper1>
            <div className="content-stretch flex flex-col gap-[10px] items-center relative shrink-0" data-name="Contact Content Container">
              <Text text="Bize Ulaşın" />
              <Text1 text="Ekibimiz tüm sorularınızı yanıtlayacaktır." />
            </div>
            <div className="content-stretch flex items-center relative shrink-0" data-name="Contact Button Container">
              <Text3 text="Bize Ulaşın">
                <div className="relative size-[16px]" data-name="Contact Button Icon">
                  <VuesaxLinearSend />
                </div>
              </Text3>
            </div>
          </Wrapper1>
        </div>
      </div>
      <div className="absolute contents left-0 top-[1373px]" data-name="Footer Container">
        <div className="absolute h-[610px] left-0 top-[1373px] w-[1440px]">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 610">
            <path d="M1440 0H0V610H1440V0Z" fill="var(--fill-0, #09090F)" id="Rectangle 276" />
          </svg>
        </div>
        <div className="absolute h-0 left-[calc(8.33%+104px)] top-[1837.42px] w-[992px]">
          <div className="absolute inset-[-0.15px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 992 0.3">
              <path d="M992 0.15H0" id="Line 20" stroke="var(--stroke-0, #D0D0D0)" strokeWidth="0.3" />
            </svg>
          </div>
        </div>
        <div
          className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] left-[calc(75%-42px)] not-italic text-white top-[1762.42px]"
          data-name="KULE PLÂZA KAT: 26
Selçuklu – KONYA"
        >
          <p className="absolute leading-[0] left-[calc(75%-42px)] text-[0px] top-[1762.42px]">
            <span className="leading-[normal] text-[16px]">{`KULE PLÂZA KAT: `}</span>
            <span className="leading-[normal] text-[22px]">26</span>
          </p>
          <p className="absolute leading-[normal] left-[calc(75%-42px)] text-[16px] top-[1787.42px]">Selçuklu – KONYA</p>
        </div>
        <div
          className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-42px)] not-italic text-white top-[1474.56px]"
          data-name="Sadece yazılı iletişim
WP: +905528674226"
        >
          <p className="absolute left-[calc(75%-42px)] text-[14px] top-[1474.56px]">Sadece yazılı iletişim</p>
          <p className="absolute left-[calc(75%-42px)] text-[20px] top-[1493.56px]">WP: +905528674226</p>
        </div>
        <div
          className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-42px)] not-italic text-white top-[1550.56px]"
          data-name="Satış Departmanı
sales@teachera.com.tr

Medya Soruları İçin
media@teachera.com.tr

Ortaklıklar için
partners@teachera.com.tr"
        >
          <p className="absolute left-[calc(75%-42px)] text-[14px] top-[1550.56px]">Satış Departmanı</p>
          <p className="absolute left-[calc(75%-42px)] text-[20px] top-[1564.56px]">sales@teachera.com.tr</p>
          <p className="absolute left-[calc(75%-42px)] text-[14px] top-[1610.56px]">Medya Soruları İçin</p>
          <p className="absolute left-[calc(75%-42px)] text-[20px] top-[1624.56px]">media@teachera.com.tr</p>
          <p className="absolute left-[calc(75%-42px)] text-[14px] top-[1670.56px]">Ortaklıklar için</p>
          <p className="absolute left-[calc(75%-42px)] text-[20px] top-[1684.56px]">partners@teachera.com.tr</p>
        </div>
        <div
          className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(25%+86px)] not-italic text-[14px] top-[1435px]"
          data-name="İŞ FIRSATLARI
MÜŞTERİ TEMSİLCİSİ OL
ELÇİ OL
SIKÇA SORULAN SORULAR
FİYATLAR
EĞİTİMLERİMİZ"
        >
          <p className="absolute left-[calc(25%+86px)] text-[#e05049] top-[1435px]">İŞ FIRSATLARI</p>
          <p className="absolute left-[calc(25%+86px)] text-[#e05049] top-[1485px]">MÜŞTERİ TEMSİLCİSİ OL</p>
          <p className="absolute left-[calc(25%+86px)] text-[#e05049] top-[1535px]">ELÇİ OL</p>
          <p className="absolute left-[calc(25%+86px)] text-white top-[1585px]">SIKÇA SORULAN SORULAR</p>
          <p className="absolute left-[calc(25%+86px)] text-white top-[1635px]">FİYATLAR</p>
          <p className="absolute left-[calc(25%+86px)] text-white top-[1685px]">EĞİTİMLERİMİZ</p>
        </div>
        <div
          className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(41.67%+100.5px)] not-italic text-[14px] text-white top-[1435px]"
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
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1435px]">KİŞİSEL VERİLERİN KORUNMASI</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1460px]">Gizlilik Politikası</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1485px]">Çocukların Gizlilik Politikası</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1510px]">Çerez Politikası</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1535px]">Ebeveyn Muvafakatname</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1560px]">Yurt Dışına Aktarım Açık Rıza</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1585px]">WhatsApp Açık Rıza Metni</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1610px]">Müşteri Aydınlatma Metni</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1635px]">İletişim Aydınlatma Metni</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1660px]">Çağrı Merkezi Aydınlatma Metni Müşteri</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1685px]">İlgili Kişi Başvuru Formu</p>
        </div>
        <div className="absolute h-[19.569px] left-[calc(8.33%+104px)] top-[1437px] w-[107.218px]" data-name="Footer Icon Container">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 107.219 19.5691">
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
          className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+104px)] not-italic text-[14px] text-white top-[1864.42px] whitespace-pre-wrap"
          data-name="Teachera, Avrupa standartlarına karşılık gelen bir müfredat kullanarak, İngilizce, İspanyolca, Fransızca, Almanca, İtalyanca, Rusça ve Arapça eğitimleri veren,
Milli Eğitim Bakanlığına bağlı faaliyet yürüten, online ve yüzyüze eğitim veren bir dil okuludur"
        >
          <p className="absolute left-[calc(8.33%+104px)] top-[1864.42px] w-[990.479px]">{`Teachera, Avrupa standartlarına karşılık gelen bir müfredat kullanarak, İngilizce, İspanyolca, Fransızca, Almanca, `}</p>
          <p className="absolute left-[calc(8.33%+104px)] top-[1879.42px] w-[389.497px]">İtalyanca, Rusça ve Arapça eğitimleri veren,</p>
          <p className="absolute left-[calc(8.33%+104px)] top-[1894.42px] w-[992px]">Milli Eğitim Bakanlığına bağlı faaliyet yürüten, online ve yüzyüze eğitim veren bir dil okuludur. C teachera ltd.şti</p>
        </div>
        <div className="absolute contents left-[calc(66.67%+44.02px)] top-[1431px]" data-name="Footer Phone Container">
          <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-44px)] not-italic text-[26px] text-white top-[1431px]">0332 236 80 66</p>
          <div className="absolute h-[21.956px] left-[calc(66.67%+44.02px)] top-[1441.04px] w-[21.958px]" data-name="phone_solid">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.9585 21.9561">
              <g id="phone_solid">
                <path clipRule="evenodd" d={svgPaths.p2264cf00} fill="var(--fill-0, white)" fillRule="evenodd" id="Path 68" />
              </g>
            </svg>
          </div>
        </div>
        <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+104px)] not-italic text-[#e05049] text-[14px] top-[1923px]">© Teachera 2024</p>
        <div className="absolute contents left-[calc(8.33%+104px)] top-[1790.93px]" data-name="Footer Clip Path Container">
          <div className="absolute contents left-[calc(8.33%+104px)] top-[1790.93px]" data-name="Clip path group">
            <div className="absolute h-[16.488px] left-[calc(8.33%+104px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[103.113px_16.488px] top-[1790.93px] w-[103.113px]" data-name="Footer Clip Path Content" style={{ maskImage: `url('${imgFooterClipPathContent}')` }}>
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 103.112 16.4881">
                <g id="Footer Clip Path Content">
                  <path d={svgPaths.p7e5800} fill="var(--fill-0, #959595)" id="Path 69" />
                  <path d={svgPaths.p21d74e80} fill="var(--fill-0, #959595)" id="Path 70" />
                  <path d={svgPaths.p2814c930} fill="var(--fill-0, #959595)" id="Path 71" />
                  <path d={svgPaths.p2d6f4500} fill="var(--fill-0, #959595)" id="Path 72" />
                  <path d={svgPaths.p16a3da00} fill="var(--fill-0, #959595)" id="Path 73" />
                  <path d={svgPaths.p1ea01cf0} fill="var(--fill-0, #959595)" id="Path 74" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[24px] left-[calc(50%+0.5px)] not-italic text-[20px] text-center text-white top-[234px] w-[845px] whitespace-pre-wrap">Deneme dersi talebinde bulunmak için lütfen aşağıdaki formu eksiksiz doldurunuz. Formda SMS, e-posta, telefon numarası ve dil seviyesi gibi bilgilerinizi girmeniz gerekmektedir.</p>
      <p className="absolute font-['Neutraface_2_Text:Bold',sans-serif] leading-[40px] left-[calc(50%-111px)] not-italic text-[32px] text-white top-[174px]">DENEME DERSİ</p>
      <div className="-translate-x-1/2 absolute bg-[rgba(255,255,255,0.21)] content-stretch flex flex-col gap-[30px] items-start left-[calc(50%+0.5px)] p-[30px] rounded-[20px] top-[322px] w-[431px]" data-name="Age Selection Container">
        <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-name="Language Selection Container">
          <div className="content-stretch flex flex-col gap-[30px] items-start relative shrink-0 w-full" data-name="Name Field Container">
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Phone Field Container">
              <Text2 text="Ad Soyad" />
            </div>
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Email Field Container">
              <Text2 text="Telefon" />
            </div>
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Language Field Container">
              <Text2 text="E-mail" />
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Field Selection Container">
            <div className="content-stretch flex items-center justify-center pl-[20px] pr-[10px] py-[10px] relative shrink-0" data-name="Age Selection Header">
              <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-white">Dil Seçiniz</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.39)] relative rounded-[100px] shrink-0 w-full" data-name="Age Selection Dropdown">
              <div aria-hidden="true" className="absolute border-[0.3px] border-solid border-white inset-0 pointer-events-none rounded-[100px]" />
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center px-[20px] py-[10px] relative w-full">
                  <div className="content-stretch flex flex-[1_0_0] items-center justify-between min-h-px min-w-px relative" data-name="Age Selection Text Container">
                    <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#09090f] text-[16px]">Sınav İçin Dil Seçin</p>
                    <div className="content-stretch flex items-center relative shrink-0" data-name="Age Selection Icon Container">
                      <div className="relative shrink-0 size-[24px]" data-name="Age Selection Icon">
                        <div className="absolute contents inset-0" data-name="vuesax/linear/arrow-right">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                            <g id="arrow-right">
                              <path d={svgPaths.p1c2f080} id="Vector" stroke="var(--stroke-0, #09090F)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
                              <g id="Vector_2" opacity="0" />
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Button Container">
          <div className="content-stretch flex flex-[1_0_0] items-center justify-end min-h-px min-w-px relative" data-name="Continue Button Container">
            <div className="bg-white content-stretch flex gap-[5px] h-[40px] items-center justify-center px-[20px] py-[10px] relative rounded-[100px] shrink-0" data-name="Continue Button Icon Container">
              <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#09090f] text-[14px]">Gönder</p>
              <div className="flex items-center justify-center relative shrink-0">
                <div className="-scale-y-100 flex-none rotate-180">
                  <div className="relative size-[16px]" data-name="Continue Button Icon">
                    <Wrapper>
                      <path d="M2.33333 14.6667H13.6667" id="Vector" stroke="var(--stroke-0, #09090F)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
                      <g id="Group">
                        <path d={svgPaths.p37ae9ec0} id="Vector_2" stroke="var(--stroke-0, #09090F)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
                        <path d="M3.33333 9.18V2.33333H10.18" id="Vector_3" stroke="var(--stroke-0, #09090F)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
                      </g>
                      <g id="Vector_4" opacity="0" />
                    </Wrapper>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
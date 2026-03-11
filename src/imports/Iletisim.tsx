import clsx from "clsx";
import svgPaths from "./svg-3941zcuwdw";
import imgHeroImage from "figma:asset/e92edff3c0982a8a8470e3429b9e46a2480c8f06.webp";
import { imgContainer, imgFooterClipPathContent } from "./svg-ilcti";
type ContainerText1Props = {
  text: string;
};

function ContainerText1({ text }: ContainerText1Props) {
  return (
    <div className="relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-b-[0.3px] border-black border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pl-[10px] py-[10px] relative w-full">
          <p className="font-['Neutraface_2_Text:Book',sans-serif] leading-[32px] not-italic relative shrink-0 text-[#484848] text-[16px]">{text}</p>
        </div>
      </div>
    </div>
  );
}
type ContainerTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ContainerText({ text, additionalClassNames = "" }: ContainerTextProps) {
  return (
    <div className={clsx("absolute content-stretch flex items-center w-[365px]", additionalClassNames)}>
      <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[32px] not-italic relative shrink-0 text-[#09090f] text-[16px]">{text}</p>
    </div>
  );
}

export default function Iletisim() {
  return (
    <div className="bg-white relative size-full" data-name="İLETİŞİM">
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
      <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[24px] left-[150px] not-italic text-[#09090f] text-[20px] top-[234px] w-[449px] whitespace-pre-wrap">İletişim kanallarımızdan bize 7/24 ulaşabilir, randevu alarak deneme derslerimize katılabilirsiniz.</p>
      <p className="absolute font-['Neutraface_2_Text:Bold',sans-serif] leading-[40px] left-[calc(20.83%-150px)] not-italic text-[#09090f] text-[32px] top-[174px] w-[365px] whitespace-pre-wrap">BİZİMLE İLETİŞİME GEÇ</p>
      <div className="absolute h-[653px] left-[calc(41.67%+60px)] top-[80px] w-[780px]" data-name="Hero Image">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[171.36%] left-[-155.26%] max-w-none top-[-63.06%] w-[255.98%]" src={imgHeroImage} />
        </div>
      </div>
      <ContainerText text="İSTEDİĞİNİZ AN SİZİ ARAYALIM" additionalClassNames="left-[150px] top-[348px]" />
      <div className="absolute content-stretch flex flex-col gap-[30px] items-start left-[150px] top-[390px] w-[365px]" data-name="Container">
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
          <ContainerText1 text="Ad Soyad" />
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
          <ContainerText1 text="Telefon" />
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
          <ContainerText1 text="E-mail" />
        </div>
      </div>
      <div className="-translate-x-1/2 absolute bg-[#09090f] h-[664px] left-[calc(20.83%+70px)] top-[733px] w-[580px]" data-name="Background Container" />
      <div className="-translate-x-1/2 absolute bg-[#eeebf5] h-[664px] left-[calc(70.83%-10px)] top-[733px] w-[700px]" data-name="Hero Background Image" />
      <div className="-translate-x-1/2 absolute content-stretch flex gap-[10px] items-center left-[calc(87.5%-58px)] top-[1317px]" data-name="Button Container">
        <div className="bg-[#09090f] content-stretch flex h-[40px] items-center justify-center px-[20px] py-[10px] relative rounded-[100px] shrink-0" data-name="Button Icon Container">
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
                      <g id="Vector_4" opacity="0" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#09090f] text-[14px]">Talep Oluştur</p>
      </div>
      <div className="absolute contents left-[150px] top-[913.84px]" data-name="Teachera, Milli Eğitim Bakanlığına bağlı olarak Konya’da Kule Plaza 26. katta yüz yüze eğitimlerimize devam ederken, aynı zamanda online eğitim platformumuz üzerinden tüm dünyadan öğrencilerimize hizmet vermekteyiz.">
        <p className="absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[28px] left-[150px] not-italic text-[#fffdfd] text-[20px] top-[913.83px] w-[449px] whitespace-pre-wrap">Teachera, Milli Eğitim Bakanlığına bağlı olarak Konya’da Kule Plaza 26. katta yüz yüze eğitimlerimize devam ederken, aynı zamanda online eğitim platformumuz üzerinden tüm dünyadan öğrencilerimize hizmet vermekteyiz.</p>
      </div>
      <div className="absolute contents left-[150px] top-[1165px]" data-name="Teachera, Milli Eğitim Bakanlığına bağlı olarak Konya’da Kule Plaza 26. katta yüz yüze eğitimlerimize devam ederken, aynı zamanda online eğitim platformumuz üzerinden tüm dünyadan öğrencilerimize hizmet vermekteyiz.">
        <div className="absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[28px] left-[150px] not-italic text-[#fffdfd] text-[20px] top-[1165px] w-[365px] whitespace-pre-wrap">
          <p className="font-['Neutraface_2_Text:Demi',sans-serif] mb-0">KONYA / Kule Plaza 26. Kat</p>
          <p className="mb-0">Tel: 0332 236 80 66</p>
          <p className="mb-0">Gsm: 0552 867 42 26</p>
          <p>E mail: info@teachera.com.tr</p>
        </div>
      </div>
      <div className="absolute contents left-[92.16px] top-[752.58px]" data-name="Container">
        <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+62.08px)] not-italic text-[#fffdfd] text-[50px] top-[823.46px]">Neredeyiz?</p>
        <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+61.54px)] not-italic text-[#fffdfd] text-[24px] top-[802.46px]">PEKİ</p>
        <div className="absolute contents left-[92.16px] top-[752.58px]" data-name="Container">
          <div className="absolute contents h-[128.066px] left-[92.16px] top-[752.58px] w-[107.382px]" data-name="Container">
            <div className="absolute contents h-[125.353px] left-[92.16px] top-[753.94px] w-[107.382px]" data-name="Clip path group">
              <div className="absolute flex h-[124.964px] items-center justify-center left-[92.21px] top-[754.13px] w-[107.295px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
                <div className="flex-none rotate-[-14.31deg] scale-y-98 skew-x-[12.85deg]">
                  <div className="h-[125.202px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0.003px] mask-size-[107.281px_124.961px] relative w-[51.277px]" data-name="Container" style={{ maskImage: `url('${imgContainer}')` }}>
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 51.2772 125.202">
                      <g id="Container">
                        <path d={svgPaths.p1161bc00} fill="var(--fill-0, white)" id="Path 78" />
                        <path d={svgPaths.p1f1ee280} fill="var(--fill-0, white)" id="Path 79" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute left-[136.29px] size-[10px] top-[811.64px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
              <path d={svgPaths.p46c6500} fill="var(--fill-0, #09090F)" id="Ellipse 189" />
            </svg>
          </div>
        </div>
      </div>
      <ContainerText text="KURUMSAL TALEP FORMU" additionalClassNames="left-[calc(50%+12px)] top-[773px]" />
      <div className="absolute content-stretch flex flex-col gap-[30px] items-start left-[calc(50%+12px)] top-[815px] w-[543px]" data-name="Container">
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Firma Faaliyet Alanı">
          <ContainerText1 text="Firma Faaliyet Alanı" />
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
          <ContainerText1 text="İletişim Kişisi" />
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
          <ContainerText1 text="Yetkisi" />
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
          <ContainerText1 text="Mail Adresi" />
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
          <ContainerText1 text="Telefon" />
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
          <ContainerText1 text="Eğitim Talepleri ve Kişi Sayısı" />
        </div>
      </div>
      <div className="absolute contents left-0 top-[1477px]" data-name="Footer Container">
        <div className="absolute h-[610px] left-0 top-[1477px] w-[1440px]">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 610">
            <path d="M1440 0H0V610H1440V0Z" fill="var(--fill-0, #09090F)" id="Rectangle 276" />
          </svg>
        </div>
        <div className="absolute h-0 left-[calc(8.33%+104px)] top-[1941.42px] w-[992px]">
          <div className="absolute inset-[-0.15px_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 992 0.3">
              <path d="M992 0.15H0" id="Line 20" stroke="var(--stroke-0, #D0D0D0)" strokeWidth="0.3" />
            </svg>
          </div>
        </div>
        <div
          className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] left-[calc(75%-42px)] not-italic text-white top-[1866.42px]"
          data-name="KULE PLÂZA KAT: 26
Selçuklu – KONYA"
        >
          <p className="absolute leading-[0] left-[calc(75%-42px)] text-[0px] top-[1866.42px]">
            <span className="leading-[normal] text-[16px]">{`KULE PLÂZA KAT: `}</span>
            <span className="leading-[normal] text-[22px]">26</span>
          </p>
          <p className="absolute leading-[normal] left-[calc(75%-42px)] text-[16px] top-[1891.42px]">Selçuklu – KONYA</p>
        </div>
        <div
          className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-42px)] not-italic text-white top-[1578.56px]"
          data-name="Sadece yazılı iletişim
WP: +905528674226"
        >
          <p className="absolute left-[calc(75%-42px)] text-[14px] top-[1578.56px]">Sadece yazılı iletişim</p>
          <p className="absolute left-[calc(75%-42px)] text-[20px] top-[1597.56px]">WP: +905528674226</p>
        </div>
        <div
          className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-42px)] not-italic text-white top-[1654.56px]"
          data-name="Satış Departmanı
sales@teachera.com.tr

Medya Soruları İçin
media@teachera.com.tr

Ortaklıklar için
partners@teachera.com.tr"
        >
          <p className="absolute left-[calc(75%-42px)] text-[14px] top-[1654.56px]">Satış Departmanı</p>
          <p className="absolute left-[calc(75%-42px)] text-[20px] top-[1668.56px]">sales@teachera.com.tr</p>
          <p className="absolute left-[calc(75%-42px)] text-[14px] top-[1714.56px]">Medya Soruları İçin</p>
          <p className="absolute left-[calc(75%-42px)] text-[20px] top-[1728.56px]">media@teachera.com.tr</p>
          <p className="absolute left-[calc(75%-42px)] text-[14px] top-[1774.56px]">Ortaklıklar için</p>
          <p className="absolute left-[calc(75%-42px)] text-[20px] top-[1788.56px]">partners@teachera.com.tr</p>
        </div>
        <div
          className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(25%+86px)] not-italic text-[14px] top-[1539px]"
          data-name="İŞ FIRSATLARI
MÜŞTERİ TEMSİLCİSİ OL
ELÇİ OL
SIKÇA SORULAN SORULAR
FİYATLAR
EĞİTİMLERİMİZ"
        >
          <p className="absolute left-[calc(25%+86px)] text-[#e05049] top-[1539px]">İŞ FIRSATLARI</p>
          <p className="absolute left-[calc(25%+86px)] text-[#e05049] top-[1589px]">MÜŞTERİ TEMSİLCİSİ OL</p>
          <p className="absolute left-[calc(25%+86px)] text-[#e05049] top-[1639px]">ELÇİ OL</p>
          <p className="absolute left-[calc(25%+86px)] text-white top-[1689px]">SIKÇA SORULAN SORULAR</p>
          <p className="absolute left-[calc(25%+86px)] text-white top-[1739px]">FİYATLAR</p>
          <p className="absolute left-[calc(25%+86px)] text-white top-[1789px]">EĞİTİMLERİMİZ</p>
        </div>
        <div
          className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(41.67%+100.5px)] not-italic text-[14px] text-white top-[1539px]"
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
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1539px]">KİŞİSEL VERİLERİN KORUNMASI</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1564px]">Gizlilik Politikası</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1589px]">Çocukların Gizlilik Politikası</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1614px]">Çerez Politikası</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1639px]">Ebeveyn Muvafakatname</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1664px]">Yurt Dışına Aktarım Açık Rıza</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1689px]">WhatsApp Açık Rıza Metni</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1714px]">Müşteri Aydınlatma Metni</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1739px]">İletişim Aydınlatma Metni</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1764px]">Çağrı Merkezi Aydınlatma Metni Müşteri</p>
          <p className="absolute left-[calc(41.67%+100.5px)] top-[1789px]">İlgili Kişi Başvuru Formu</p>
        </div>
        <div className="absolute h-[19.569px] left-[calc(8.33%+104px)] top-[1541px] w-[107.218px]" data-name="Footer Icon Container">
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
          className="absolute contents font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+104px)] not-italic text-[14px] text-white top-[1968.42px] whitespace-pre-wrap"
          data-name="Teachera, Avrupa standartlarına karşılık gelen bir müfredat kullanarak, İngilizce, İspanyolca, Fransızca, Almanca, İtalyanca, Rusça ve Arapça eğitimleri veren,
Milli Eğitim Bakanlığına bağlı faaliyet yürüten, online ve yüzyüze eğitim veren bir dil okuludur"
        >
          <p className="absolute left-[calc(8.33%+104px)] top-[1968.42px] w-[990.479px]">{`Teachera, Avrupa standartlarına karşılık gelen bir müfredat kullanarak, İngilizce, İspanyolca, Fransızca, Almanca, `}</p>
          <p className="absolute left-[calc(8.33%+104px)] top-[1983.42px] w-[389.497px]">İtalyanca, Rusça ve Arapça eğitimleri veren,</p>
          <p className="absolute left-[calc(8.33%+104px)] top-[1998.42px] w-[992px]">Milli Eğitim Bakanlığına bağlı faaliyet yürüten, online ve yüzyüze eğitim veren bir dil okuludur. C teachera ltd.şti</p>
        </div>
        <div className="absolute contents left-[calc(66.67%+44.02px)] top-[1535px]" data-name="Footer Phone Container">
          <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(75%-44px)] not-italic text-[26px] text-white top-[1535px]">0332 236 80 66</p>
          <div className="absolute h-[21.956px] left-[calc(66.67%+44.02px)] top-[1545.04px] w-[21.958px]" data-name="phone_solid">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.9585 21.9561">
              <g id="phone_solid">
                <path clipRule="evenodd" d={svgPaths.p59fd280} fill="var(--fill-0, white)" fillRule="evenodd" id="Path 68" />
              </g>
            </svg>
          </div>
        </div>
        <p className="absolute font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] left-[calc(8.33%+104px)] not-italic text-[#e05049] text-[14px] top-[2027px]">© Teachera 2024</p>
        <div className="absolute contents left-[calc(8.33%+104px)] top-[1894.93px]" data-name="Footer Clip Path Container">
          <div className="absolute contents left-[calc(8.33%+104px)] top-[1894.93px]" data-name="Clip path group">
            <div className="absolute h-[16.488px] left-[calc(8.33%+104px)] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[103.113px_16.488px] top-[1894.93px] w-[103.113px]" data-name="Footer Clip Path Content" style={{ maskImage: `url('${imgFooterClipPathContent}')` }}>
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 103.112 16.4881">
                <g id="Footer Clip Path Content">
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
  );
}
import svgPaths from "./svg-rok6kyhowg";
import imgHeroImage from "figma:asset/fc31d891571779da1d514055d08ebb51d4ccb03e.webp";
type TextProps = {
  text: string;
};

function Text({ text }: TextProps) {
  return (
    <div className="bg-white h-[44px] relative rounded-[30px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[0.3px] border-black border-solid inset-0 pointer-events-none rounded-[30px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] py-[10px] relative size-full">
          <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#686767] text-[14px]">{text}</p>
        </div>
      </div>
    </div>
  );
}

export default function GirisYap() {
  return (
    <div className="bg-white relative size-full" data-name="GİRİŞ YAP">
      <div className="absolute h-[820px] left-0 top-[80px] w-[1440px]" data-name="Hero Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHeroImage} />
      </div>
      <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0.6)] h-[900px] left-0 mix-blend-multiply to-[rgba(45,62,64,0.6)] top-0 w-[1440px]" data-name="Hero Image" />
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
      <div className="absolute contents left-[calc(25%+100px)] top-[148px]" data-name="Giriş Formu">
        <div className="absolute bg-[rgba(51,78,72,0.6)] content-stretch flex flex-col gap-[20px] items-center left-[calc(25%+100px)] p-[60px] rounded-[30px] top-[148px] w-[520px]" data-name="Giriş Formu">
          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[30px]" />
          <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic relative shrink-0 text-white w-full whitespace-pre-wrap" data-name="Başlık ve Açıklama">
            <p className="font-['Neutraface_2_Text:Demi',sans-serif] relative shrink-0 text-[24px] w-full">Hoş Geldiniz</p>
            <p className="font-['Neutraface_2_Text:Book',sans-serif] relative shrink-0 text-[14px] w-full">Giriş yapın ve portalımızın sunduğu fırsatlardan yararlanın.</p>
          </div>
          <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="Email Giriş">
            <div className="flex flex-col font-['Neutraface_2_Text:Demi',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white w-full">
              <p className="leading-[20px] whitespace-pre-wrap">Email Adresiniz</p>
            </div>
            <Text text="Email Giriniz" />
          </div>
          <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="Şifre Giriş">
            <div className="flex flex-col font-['Neutraface_2_Text:Demi',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white w-full">
              <p className="leading-[20px] whitespace-pre-wrap">Şifreniz</p>
            </div>
            <Text text="Şifre Giriniz" />
          </div>
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Hatırla ve Unutulan Şifre">
            <div className="content-stretch flex gap-[10px] items-start relative shrink-0" data-name="Beni Hatırla">
              <div className="bg-white relative rounded-[3px] shrink-0 size-[16px]" data-name="Checkbox">
                <div aria-hidden="true" className="absolute border border-[#64748b] border-solid inset-0 pointer-events-none rounded-[3px]" />
              </div>
              <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">Beni Hatırla</p>
            </div>
            <div className="content-stretch flex items-center justify-center p-[10px] relative shrink-0" data-name="Unutulan Şifre">
              <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">Parolanızı mı Unuttunuz?</p>
            </div>
          </div>
          <div className="relative shrink-0 w-full" data-name="Giriş Yap Butonu">
            <div className="content-stretch flex flex-col items-start p-[10px] relative w-full">
              <div className="bg-[#09090f] h-[44px] relative rounded-[30px] shrink-0 w-full" data-name="Giriş Yap Butonu İçerik">
                <div aria-hidden="true" className="absolute border-[#09090f] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[30px]" />
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="content-stretch flex gap-[10px] items-center justify-center px-[20px] py-[10px] relative size-full">
                    <p className="font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">Giriş Yap</p>
                    <div className="flex items-center justify-center relative shrink-0">
                      <div className="-scale-y-100 flex-none rotate-180">
                        <div className="relative size-[16px]" data-name="Giriş Yap İkonu">
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
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full whitespace-pre-wrap" data-name="Hesap Oluştur">
            <p className="font-['Neutraface_2_Text:Book',sans-serif] relative shrink-0 w-full">Henüz bir hesabınız yok mu?</p>
            <p className="[text-decoration-skip-ink:none] decoration-[10%] decoration-solid font-['Neutraface_2_Text:Bold',sans-serif] relative shrink-0 underline w-full">Hesap Oluştur</p>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-name="ReCAPTCHA Bilgilendirme">
            <p className="flex-[1_0_0] font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-white whitespace-pre-wrap">ReCAPTCHA tarafından korunmaktadır ve Google Gizlilik Politikası ve Hizmet Şartları ’na tabidir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
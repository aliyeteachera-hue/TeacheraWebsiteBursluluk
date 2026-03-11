import clsx from "clsx";
import svgPaths from "./svg-55hvpso6lz";
import { imgMaskCopy } from "./svg-3kkz2";
import imgHeroImage from "figma:asset/fc31d891571779da1d514055d08ebb51d4ccb03e.webp";

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="content-stretch flex items-center px-[20px] py-[10px] relative size-full">
      <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#686767] text-[14px]">{children}</p>
    </div>
  );
}

function OnayKutulariOnayKutusu() {
  return (
    <div className="bg-white h-[16px] relative rounded-[3px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#64748b] border-solid inset-0 pointer-events-none rounded-[3px]" />
    </div>
  );
}
type Text1Props = {
  text: string;
  additionalClassNames?: string;
};

function Text1({ text, additionalClassNames = "" }: Text1Props) {
  return (
    <div className={clsx("flex flex-row items-center size-full", additionalClassNames)}>
      <Wrapper>{text}</Wrapper>
    </div>
  );
}
type TextProps = {
  text: string;
};

function Text({ text }: TextProps) {
  return (
    <div className="bg-white h-[44px] relative rounded-[30px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[0.3px] border-black border-solid inset-0 pointer-events-none rounded-[30px]" />
      <Text1 text={text} />
    </div>
  );
}

export default function GirisYap() {
  return (
    <div className="bg-white relative size-full" data-name="GİRİŞ YAP">
      <div className="absolute h-[1029px] left-0 top-[80px] w-[1440px]" data-name="Hero Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHeroImage} />
      </div>
      <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0.6)] h-[1109px] left-0 mix-blend-multiply to-[rgba(45,62,64,0.6)] top-0 w-[1440px]" data-name="Hero Image" />
      <div className="absolute flex h-[80px] items-center justify-center left-0 top-0 w-[1440px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="bg-white border-[#c4c4c4] border-l border-solid h-[1440px] w-[80px]" data-name="Menu Indicator" />
        </div>
      </div>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] left-[calc(66.67%+9.5px)] not-italic text-[#09090f] text-[16px] text-center top-[30px]">Seviye Tespit</p>
      <p className="-translate-x-1/2 absolute font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] left-[calc(75%+6.5px)] not-italic text-[#09090f] text-[16px] text-center top-[30px]">İletişime Geç</p>
      <div className="absolute h-[29px] left-[150px] top-[25px] w-[146px]" data-name="teachera_logo">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 146 29">
          <g clipPath="url(#clip0_8_9902)" id="teachera_logo">
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
            <clipPath id="clip0_8_9902">
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
          <g clipPath="url(#clip0_8_9899)" id="Menu Icon Container">
            <path d={svgPaths.p2b6e7a00} id="Icon" stroke="var(--stroke-0, #09090F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
          <defs>
            <clipPath id="clip0_8_9899">
              <rect fill="white" height="14" width="19" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <div className="absolute contents left-[calc(25%+100px)] top-[155px]" data-name="Hesap Oluştur Container">
        <div className="absolute bg-[rgba(51,78,72,0.6)] content-stretch flex flex-col gap-[20px] items-center left-[calc(25%+100px)] px-[60px] py-[50px] rounded-[30px] top-[155px] w-[520px]" data-name="Hesap Oluştur Container">
          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[30px]" />
          <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic relative shrink-0 text-white w-full whitespace-pre-wrap" data-name="Hesap Oluştur Header Container">
            <p className="font-['Neutraface_2_Text:Demi',sans-serif] relative shrink-0 text-[24px] w-full">Hesap Oluştur</p>
            <p className="font-['Neutraface_2_Text:Book',sans-serif] relative shrink-0 text-[14px] w-full">Hesap oluşturun ve portalımızın sunduğu fırsatları kullanın.</p>
          </div>
          <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="Adınız Soyadınız Container">
            <div className="flex flex-col font-['Neutraface_2_Text:Book',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white w-full">
              <p className="leading-[20px] whitespace-pre-wrap">Adınız Soyadınız</p>
            </div>
            <Text text="Adınız Soyadınız" />
          </div>
          <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="Telefon Numaranız Container">
            <div className="flex flex-col font-['Neutraface_2_Text:Book',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white w-full">
              <p className="leading-[20px] whitespace-pre-wrap">Telefon Numaranız</p>
            </div>
            <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Telefon Numaranız Input Container">
              <div className="bg-white content-stretch flex h-[44px] items-center p-[10px] relative rounded-[30px] shrink-0 w-[71px]" data-name="Telefon Kodu Container">
                <div aria-hidden="true" className="absolute border-[0.3px] border-black border-solid inset-0 pointer-events-none rounded-[30px]" />
                <div className="content-stretch flex gap-[2px] items-center justify-center relative shrink-0" data-name="Telefon Kodu Input Container">
                  <div className="h-[10px] relative shrink-0 w-[14px]" data-name="flags / TR">
                    <div className="absolute bg-white inset-0 rounded-[2px]" data-name="Mask" />
                    <div className="absolute bg-[#e92434] inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[14px_10px]" data-name="Mask Copy" style={{ maskImage: `url('${imgMaskCopy}')` }} />
                    <div className="absolute flex inset-[32.88%_22.66%_36.31%_55.76%] items-center justify-center">
                      <div className="-rotate-15 flex-none h-[2.533px] w-[2.45px]">
                        <div className="mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-7.806px_-3.288px] mask-size-[14px_10px] relative size-full" style={{ maskImage: `url('${imgMaskCopy}')` }}>
                          <div className="absolute inset-[0_-3.53%_4.76%_0]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.53615 2.41202">
                              <path clipRule="evenodd" d={svgPaths.p1e791a0} fill="var(--fill-0, white)" fillRule="evenodd" id="Star 8" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-[20%_37.87%_20%_23.81%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3.333px_-2px] mask-size-[14px_10px]" data-name="Oval 41" style={{ maskImage: `url('${imgMaskCopy}')` }}>
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.36426 6">
                        <path d={svgPaths.p1c5c4300} fill="var(--fill-0, white)" id="Oval 41" />
                      </svg>
                    </div>
                  </div>
                  <p className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[18px] not-italic relative shrink-0 text-[#302d2d] text-[14px]">{`+90 `}</p>
                  <div className="flex items-center justify-center relative shrink-0 size-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "153.5" } as React.CSSProperties}>
                    <div className="flex-none rotate-90">
                      <div className="relative size-[12px]" data-name="vuesax/linear/arrow-right">
                        <div className="absolute contents inset-0" data-name="vuesax/linear/arrow-right">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                            <g id="arrow-right">
                              <path d={svgPaths.p1c2f080} id="Vector" stroke="var(--stroke-0, #292D32)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
                              <g id="Vector_2" opacity="0" />
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white flex-[1_0_0] h-[44px] min-h-px min-w-px relative rounded-[30px]" data-name="Telefon Numarası Input Container">
                <div aria-hidden="true" className="absolute border-[0.3px] border-black border-solid inset-0 pointer-events-none rounded-[30px]" />
                <div className="flex flex-row items-center size-full">
                  <Wrapper>{`05.....   ...   ...  ...`}</Wrapper>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="E-mail Container">
            <div className="flex flex-col font-['Neutraface_2_Text:Book',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white w-full">
              <p className="leading-[20px] whitespace-pre-wrap">E-mail</p>
            </div>
            <Text text="E-mail" />
          </div>
          <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="Şifre Belirleyiniz Container">
            <div className="flex flex-col font-['Neutraface_2_Text:Book',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white w-full">
              <p className="leading-[20px] whitespace-pre-wrap">Şifre Belirleyiniz</p>
            </div>
            <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="Şifre Input Container">
              <div className="bg-white h-[44px] relative rounded-[30px] shrink-0 w-full" data-name="Şifre Input Container">
                <Text1 text="Şifre" additionalClassNames="overflow-clip rounded-[inherit]" />
                <div aria-hidden="true" className="absolute border-[0.3px] border-black border-solid inset-0 pointer-events-none rounded-[30px]" />
              </div>
              <div className="bg-white h-[44px] relative rounded-[30px] shrink-0 w-full" data-name="Şifre Tekrar Input Container">
                <Text1 text="Şifre Tekrar" additionalClassNames="overflow-clip rounded-[inherit]" />
                <div aria-hidden="true" className="absolute border-[0.3px] border-black border-solid inset-0 pointer-events-none rounded-[30px]" />
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full" data-name="Onay Kutuları Container">
            <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-[16px]" data-name="Onay Kutuları">
              <OnayKutulariOnayKutusu />
              <OnayKutulariOnayKutusu />
              <OnayKutulariOnayKutusu />
            </div>
            <div className="content-stretch flex flex-col font-['Neutraface_2_Text:Book',sans-serif] gap-[10px] items-start not-italic relative shrink-0 text-[14px] text-white w-[353.524px]" data-name="Onay Metinleri Container">
              <p className="leading-[normal] relative shrink-0 w-full whitespace-pre-wrap">Tarafımla pazarlama ve tanıtım amaçlı iletişime geçilmesine izin veriyorum.</p>
              <p className="leading-[0] overflow-hidden relative shrink-0 text-ellipsis w-full whitespace-nowrap">
                <span className="[text-decoration-skip-ink:none] decoration-[10%] decoration-solid font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] underline">Üyelik Sözleşmesi</span>
                <span className="leading-[normal]">{` `}</span>
                <span className="leading-[normal]">şartlarını okudum ve kabul ediyorum.</span>
              </p>
              <p className="leading-[0] relative shrink-0 w-full whitespace-pre-wrap">
                <span className="[text-decoration-skip-ink:none] decoration-[10%] decoration-solid font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal] underline">Kişisel Verilerin Korunması Politikası</span>
                <span className="font-['Neutraface_2_Text:Demi',sans-serif] leading-[normal]">{` `}</span>
                <span className="leading-[normal]">şartlarını okudum ve kabul ediyorum.</span>
              </p>
            </div>
          </div>
          <div className="bg-black h-[44px] relative rounded-[30px] shrink-0 w-full" data-name="Kayıt Ol Container">
            <div aria-hidden="true" className="absolute border-[0.3px] border-black border-solid inset-0 pointer-events-none rounded-[30px]" />
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[10px] items-center justify-center px-[20px] py-[10px] relative size-full">
                <p className="font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-white">Kayıt Ol</p>
                <div className="flex items-center justify-center relative shrink-0">
                  <div className="-scale-y-100 flex-none rotate-180">
                    <div className="relative size-[16px]" data-name="Kayıt Ol Button Icon">
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
          <div className="content-stretch flex flex-col gap-[5px] items-start leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full whitespace-pre-wrap" data-name="Giriş Yap Container">
            <p className="font-['Neutraface_2_Text:Book',sans-serif] relative shrink-0 w-full">Zaten bir hesabınız var mı?</p>
            <p className="[text-decoration-skip-ink:none] decoration-[10.5%] decoration-solid font-['Neutraface_2_Text:Demi',sans-serif] relative shrink-0 underline w-full">Giriş Yap</p>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-name="ReCAPTCHA Container">
            <p className="flex-[1_0_0] font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[14px] text-white whitespace-pre-wrap">ReCAPTCHA tarafından korunmaktadır ve Google Gizlilik Politikası ve Hizmet Şartları ’na tabidir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import svgPaths from "./svg-rofd939u6n";

export default function Button() {
  return (
    <div className="relative size-full" data-name="Button">
      <div className="absolute bg-[rgba(9,9,15,0.7)] content-stretch flex items-center justify-center left-[10px] px-[20px] py-[14px] rounded-[100px] top-[10px]" data-name="Button Text">
        <p className="font-['Neutraface_2_Text:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#eeebf5] text-[16px] text-center">Ücretsiz Deneme Seansı</p>
      </div>
      <div className="absolute h-[67px] left-0 top-0 w-[138px]">
        <div className="absolute inset-[-0.75%_0_-0.75%_-0.36%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 138.5 68">
            <path d={svgPaths.p3c62e100} fill="var(--stroke-0, #09090F)" fillOpacity="0.7" id="Rectangle 281" />
          </svg>
        </div>
      </div>
      <div className="absolute h-[67px] left-[118px] top-0 w-[102px]">
        <div className="absolute inset-[-1.49%_-0.98%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 104 69">
            <path d={svgPaths.p3d67ac80} id="Rectangle 282" stroke="var(--stroke-0, #09090F)" strokeLinecap="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}
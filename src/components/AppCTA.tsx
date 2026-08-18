import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { useInView } from '../hooks/useInView';

export default function AppCTA() {
  const { ref, inView } = useInView(0);
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Generate a 100% real, scannable QR Code encoding the Festivo website URL
    QRCode.toDataURL(window.location.origin, {
      width: 400,
      margin: 1,
      color: {
        dark: '#1b2e23',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, []);

  return (
    <section className="py-12 bg-white overflow-hidden" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-sage-50/80 border border-sage-200 rounded-3xl pt-8 px-8 md:pt-12 md:px-12 pb-0 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          
          {/* Left Text and Store Buttons */}
          <div className="flex-1 max-w-xl text-center md:text-left pb-8 md:pb-12">
            <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-sage-950 mb-3 tracking-tight">
              Download the app now!
            </h2>
            <p className="text-sage-700 text-base md:text-lg font-medium mb-8 leading-relaxed">
              Experience seamless event planning & vendor booking only on the Festivo app
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {/* Google Play Button */}
              <button
                onClick={() => navigate('/vendors')}
                className="flex items-center gap-3 bg-black text-white px-5 py-3 rounded-xl hover:bg-neutral-800 transition-all duration-200 active:scale-95 shadow-md"
              >
                <div className="w-6 h-6 flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                    <path d="M3.18 23.76c.37.21.8.27 1.21.16l12.86-7.41-2.83-2.83-11.24 10.08zM.32 2.31C.12 2.71 0 3.17 0 3.7v16.6c0 .53.12.99.32 1.39l.07.07 9.31-9.31v-.22L.39 2.24l-.07.07zM20.34 10.38l-2.61-1.5-3.18 3.18 3.18 3.18 2.63-1.52c.75-.43.75-1.14-.02-1.84zM4.39.08L17.25 7.49l-2.83 2.83L3.18.24c.41-.11.84-.05 1.21.16z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold leading-none">GET IT ON</p>
                  <p className="font-bold text-sm leading-tight mt-0.5">Google Play</p>
                </div>
              </button>

              {/* App Store Button */}
              <button
                onClick={() => navigate('/vendors')}
                className="flex items-center gap-3 bg-black text-white px-5 py-3 rounded-xl hover:bg-neutral-800 transition-all duration-200 active:scale-95 shadow-md"
              >
                <div className="w-6 h-6 flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold leading-none">Download on the</p>
                  <p className="font-bold text-sm leading-tight mt-0.5">App Store</p>
                </div>
              </button>
            </div>
          </div>

          {/* Right Phone Mockup with Premium iPhone 15 Pro Titanium Frame */}
          <div className="relative flex-shrink-0 w-72 sm:w-84 self-end">
            <div
              className={`transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) transform ${
                inView ? 'translate-y-2 opacity-100 scale-100' : 'translate-y-10 opacity-100 sm:opacity-0 sm:scale-95'
              }`}
            >
              {/* Outer Metallic Chassis (Titanium Gray / Obsidian) */}
              <div className="relative bg-gradient-to-b from-[#2d3134] via-[#1a1c1e] to-[#0f1011] rounded-t-[3.2rem] rounded-b-none p-[10px] pb-0 shadow-[0_-25px_60px_rgba(0,0,0,0.35)] border-t border-l border-r border-white/20 -mb-2">
                
                {/* Left Side Volume Buttons & Action Button */}
                <div className="absolute -left-[14px] top-24 w-[4px] h-7 bg-[#2d3134] rounded-l-md border-l border-white/10" />
                <div className="absolute -left-[14px] top-36 w-[4px] h-12 bg-[#2d3134] rounded-l-md border-l border-white/10" />
                <div className="absolute -left-[14px] top-52 w-[4px] h-12 bg-[#2d3134] rounded-l-md border-l border-white/10" />

                {/* Right Side Power Button */}
                <div className="absolute -right-[14px] top-32 w-[4px] h-16 bg-[#2d3134] rounded-r-md border-r border-white/10" />

                {/* Antenna Bands */}
                <div className="absolute top-10 -left-[10px] w-[2px] h-3 bg-neutral-600/50" />
                <div className="absolute top-10 -right-[10px] w-[2px] h-3 bg-neutral-600/50" />

                {/* Inner Bezel (Ultra thin OLED border) */}
                <div className="bg-black rounded-t-[2.7rem] rounded-b-none p-[6px] pb-0 relative overflow-hidden">
                  
                  {/* Screen Content Box */}
                  <div className="bg-white rounded-t-[2.4rem] rounded-b-none pt-14 pb-10 px-6 text-center relative overflow-hidden">
                    
                    {/* iPhone Dynamic Island */}
                    <div className="w-24 h-7 bg-black rounded-full mx-auto absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between px-2.5 shadow-sm">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#0a0a0d] border border-white/10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#151930]" />
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0d140f] border border-white/10" />
                    </div>

                    <p className="text-sage-950 font-extrabold text-sm mb-5 leading-snug px-1 relative z-20">
                      Scan the QR code to download the app
                    </p>
                    
                    {/* Premium QR Container Box */}
                    <div className="bg-white p-3 rounded-2xl border border-sage-200 shadow-card max-w-[200px] mx-auto relative z-20">
                      <div className="w-full aspect-square rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-white p-1">
                        {qrCodeUrl ? (
                          <img
                            src={qrCodeUrl}
                            alt="Festivo App Download QR Code"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-sage-50 animate-pulse rounded-lg flex items-center justify-center text-xs text-sage-600 font-bold">
                            Loading QR...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

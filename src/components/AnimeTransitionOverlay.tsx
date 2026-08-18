import { useEffect, useState } from 'react';
import { Store, Users, Zap, Sparkles, Shield, Flame, Star } from 'lucide-react';
import type { UserRole } from '../lib/auth';

interface AnimeTransitionOverlayProps {
  isOpen: boolean;
  targetRole: UserRole | null;
  onComplete: () => void;
}

export default function AnimeTransitionOverlay({
  isOpen,
  targetRole,
  onComplete,
}: AnimeTransitionOverlayProps) {
  const [phase, setPhase] = useState<'slash' | 'transform' | 'impact' | 'fade'>('slash');

  useEffect(() => {
    if (!isOpen) {
      setPhase('slash');
      return;
    }

    setPhase('slash');

    const timer1 = setTimeout(() => {
      setPhase('transform');
    }, 400);

    const timer2 = setTimeout(() => {
      setPhase('impact');
    }, 900);

    const timer3 = setTimeout(() => {
      setPhase('fade');
    }, 1400);

    const timer4 = setTimeout(() => {
      onComplete();
    }, 1700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen, onComplete]);

  if (!isOpen || !targetRole) return null;

  const isVendor = targetRole === 'vendor';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/95 select-none transition-opacity duration-300">
      {/* ── Manga Speed Lines Background ──────────────────────────────── */}
      <div className="absolute inset-0 opacity-40 animate-pulse pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            background: isVendor
              ? 'repeating-conic-gradient(from 0deg, rgba(212, 160, 23, 0.2) 0deg 10deg, transparent 10deg 20deg)'
              : 'repeating-conic-gradient(from 0deg, rgba(46, 204, 113, 0.2) 0deg 10deg, transparent 10deg 20deg)',
          }}
        />
      </div>

      {/* ── Energy Particles Burst ───────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[600px] h-[600px] rounded-full filter blur-3xl opacity-60 animate-ping ${
            isVendor ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-600' : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500'
          }`}
          style={{ animationDuration: '1s' }}
        />
      </div>

      {/* ── Anime Slash Effect Cut (Phase 1) ────────────────────────── */}
      {phase === 'slash' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="w-full h-2 bg-white shadow-[0_0_50px_#fff] transform -rotate-45 animate-pulse" />
          <div className="absolute font-black text-6xl italic text-yellow-300 tracking-wider tracking-widest uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] animate-bounce">
            ズバッ! (SWOOSH!)
          </div>
        </div>
      )}

      {/* ── Transformation & Impact Card (Phase 2 & 3) ────────────────── */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4">
        {/* Japanese Manga Action Sound Badge */}
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 border-2 border-yellow-400 text-yellow-300 font-extrabold text-sm uppercase tracking-widest animate-bounce shadow-[0_0_20px_rgba(250,204,21,0.5)]">
          <Zap className="w-4 h-4 text-yellow-400 animate-spin" />
          {isVendor ? '店舗変身! VENDOR POWER UP!' : '顧客変身! CUSTOMER TRANSFORMATION!'}
          <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
        </div>

        {/* Central Anime Hero Card */}
        <div
          className={`relative w-80 sm:w-96 p-8 rounded-3xl border-4 backdrop-blur-xl transition-all duration-500 transform ${
            phase === 'slash'
              ? 'scale-50 opacity-0 rotate-12'
              : phase === 'transform'
              ? 'scale-110 opacity-100 -rotate-3 shadow-[0_0_60px_rgba(255,215,0,0.6)]'
              : 'scale-100 opacity-100 rotate-0 shadow-[0_0_80px_rgba(255,255,255,0.8)]'
          } ${
            isVendor
              ? 'bg-gradient-to-b from-gray-900 via-amber-950 to-black border-amber-400 text-amber-200'
              : 'bg-gradient-to-b from-gray-900 via-emerald-950 to-black border-emerald-400 text-emerald-200'
          }`}
        >
          {/* Top Anime Badge */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-2xl bg-black border-2 border-white flex items-center gap-2 shadow-2xl">
            <Sparkles className={`w-5 h-5 ${isVendor ? 'text-amber-400' : 'text-emerald-400'} animate-spin`} />
            <span className="font-black text-xs uppercase tracking-widest text-white">
              {isVendor ? 'VENDOR HERO' : 'EVENT EXPLORER'}
            </span>
          </div>

          {/* Large Hero Icon */}
          <div className="my-6 relative flex justify-center">
            <div
              className={`w-28 h-28 rounded-3xl border-4 flex items-center justify-center shadow-2xl transform transition-transform duration-500 hover:scale-110 ${
                isVendor
                  ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 border-amber-200 text-black'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-400 border-emerald-200 text-black'
              }`}
            >
              {isVendor ? (
                <Store className="w-14 h-14 text-slate-950 animate-bounce" />
              ) : (
                <Users className="w-14 h-14 text-slate-950 animate-bounce" />
              )}
            </div>
            {/* Pulsing Aura Rings */}
            <div
              className={`absolute inset-0 rounded-3xl border-4 opacity-50 animate-ping ${
                isVendor ? 'border-amber-400' : 'border-emerald-400'
              }`}
            />
          </div>

          {/* Mode Title */}
          <h2 className="font-black text-3xl sm:text-4xl text-white tracking-tight uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] mb-2">
            {isVendor ? 'VENDOR PORTAL' : 'CUSTOMER PORTAL'}
          </h2>
          <p className={`font-bold text-xs uppercase tracking-widest mb-4 ${isVendor ? 'text-amber-400' : 'text-emerald-300'}`}>
            {isVendor ? '★ BUSINESS MODE UNLOCKED ★' : '★ EVENT PLANNER MODE UNLOCKED ★'}
          </p>

          {/* Anime Stats Pill */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-black/60 rounded-2xl border border-white/20 text-left text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-white">
              <Shield className="w-3.5 h-3.5 text-yellow-400" />
              <span>{isVendor ? 'Verified Partner' : 'Full Protection'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white">
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              <span>{isVendor ? 'Max Visibility' : '2,500+ Vendors'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Loading Bar */}
        <div className="mt-8 w-64 h-3 bg-gray-800 rounded-full overflow-hidden border border-white/30 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isVendor ? 'bg-gradient-to-r from-amber-500 to-yellow-300' : 'bg-gradient-to-r from-emerald-500 to-cyan-300'
            }`}
            style={{
              width: phase === 'slash' ? '10%' : phase === 'transform' ? '65%' : '100%',
            }}
          />
        </div>
        <p className="mt-2 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          INITIALIZING {isVendor ? 'VENDOR' : 'CUSTOMER'} ENGINE...
        </p>
      </div>
    </div>
  );
}

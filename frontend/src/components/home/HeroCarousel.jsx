import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import Button from '@/components/ui/Button';

export default function HeroCarousel({ videos = [] }) {
  const slides = videos.slice(0, 5);
  const [index, setIndex] = useState(0);
  const reduceMotion = useThemeStore((s) => s.reduceMotion);
  const navigate = useNavigate();
  const timer = useRef(null);
  const wrap = useRef(null);

  useEffect(() => {
    if (reduceMotion || slides.length < 2) return undefined;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer.current);
  }, [reduceMotion, slides.length]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (reduceMotion) return;
      const gsap = (await import('gsap')).default;
      if (cancelled || !wrap.current) return;
      gsap.fromTo(wrap.current.querySelectorAll('[data-hero]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.6 });
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [index, reduceMotion]);

  if (!slides.length) return null;
  const slide = slides[index];

  return (
    <section
      className="relative mb-4 overflow-hidden rounded-2xl aspect-video sm:aspect-[16/7]"
      onMouseEnter={() => clearInterval(timer.current)}
      ref={wrap}
    >
      <img src={slide.thumbnail} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-10 text-white">
        <p data-hero className="text-sm text-white/80">
          Featured • {slide.category}
        </p>
        <h2 data-hero className="mt-1 max-w-xl text-[32px] font-bold leading-[38px]">
          {slide.title}
        </h2>
        <p data-hero className="mt-2 max-w-lg text-sm text-white/80">
          {slide.description}
        </p>
        <div data-hero className="mt-4">
          <Button className="bg-white text-black hover:bg-white/90" onClick={() => navigate(`/watch/${slide.id}`)}>
            Watch Now
          </Button>
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`size-2.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </section>
  );
}

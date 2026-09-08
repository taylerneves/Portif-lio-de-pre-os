import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Tier, TierSite } from "./PricingBoxes";

interface StickyGalleryProps {
  tier: Tier | null;
  onClose: () => void;
  whatsappNumber: string;
}

const buildWaLink = (number: string, tierLabel: string) => {
  const category = tierLabel.replace(/^Site\s+/i, "");
  const message = `Vi o ${category} e quero ele.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

const StickyGallery = ({ tier, onClose, whatsappNumber }: StickyGalleryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSiteName, setActiveSiteName] = useState<string | undefined>(
    tier?.sites[0]?.name,
  );
  void activeSiteName;

  useEffect(() => {
    if (tier) setActiveSiteName(tier.sites[0]?.name);
  }, [tier]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isOpen = tier !== null;

  return (
    <div
      aria-hidden={!isOpen}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#0b0d10]  [scrollbar-width:none] [&::-webkit-scrollbar] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"
      style={{ transform: isOpen ? "translateY(0)" : "translateY(100%)" }}
    >
      <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-5 sm:gap-6 sm:px-6 sm:pt-7 md:px-12">
        <div>
          <h2 className="text-xl font-semibold text-[#f3f1ea] sm:text-2xl">
            {tier?.label ?? ""}
          </h2>
          <p className="mt-2 max-w-[56ch] text-xs leading-relaxed text-[#9aa0aa] sm:text-sm">
            {tier?.description ?? ""}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="grid h-9 w-9 flex-none place-items-center rounded-full border border-white/15 text-lg text-[#f3f1ea] transition-transform duration-200 hover:rotate-90 hover:border-white/40"
        >
          ×
        </button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-28 sm:px-6 md:px-12">
        <div className="flex flex-col items-center gap-6 pb-8 sm:gap-8">
          {tier?.sites.map((site, idx) => (
            <StickyCard
              key={site.name}
              site={site}
              onInView={() => setActiveSiteName(site.name)}
              isLast={idx === tier.sites.length - 1}
            />
          ))}
        </div>
      </div>

      {tier && (
        <a
          href={buildWaLink(whatsappNumber, tier.label)}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-safe-area fixed bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-xs font-semibold text-[#06210f] shadow-[0_16px_34px_-14px_rgba(37,211,102,0.6)] transition-transform duration-200 hover:-translate-y-1 sm:bottom-7 sm:right-5 sm:px-5 sm:py-3.5 sm:text-sm md:right-10"
        >
          Quero esse
        </a>
      )}
    </div>
  );
};

// Adaptado de StickyCard_003 (Skiper34): usa scrollY do próprio card + IntersectionObserver
// (via useInView) para escalar/desvanecer conforme o próximo card sobe por cima.
const StickyCard = ({
  site,
  onInView,
  isLast,
}: {
  site: TierSite;
  onInView: () => void;
  isLast: boolean;
}) => {
  const vertMargin = 6;
  const container = useRef<HTMLDivElement>(null);
  const [maxScrollY, setMaxScrollY] = useState(Infinity);

  const filter = useMotionValue(0);
  const negateFilter = useTransform(filter, (value) => -value);

  const { scrollY } = useScroll({ target: container });
  const scale = useTransform(scrollY, [maxScrollY, maxScrollY + 6000], [1, 0.9]);

  const isInView = useInView(container, {
    margin: `0px 0px -${100 - vertMargin}% 0px`,
    once: true,
  });

  useEffect(() => {
    if (isInView) {
      onInView();
      setMaxScrollY(scrollY.get());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  useEffect(() => {
    return scrollY.on("change", (value) => {
      let animationValue = 1;
      if (value > maxScrollY) {
        animationValue = Math.max(0, 1 - (value - maxScrollY) / 6000);
      }
      scale.set(0.9 + animationValue * 0.1);
      filter.set((1 - animationValue) * 60);
    });
  }, [scrollY, maxScrollY, scale, filter]);

  return (
    <motion.div
      ref={container}
      className="sticky top-[5vh] relative aspect-video h-auto w-full max-w-5xl shrink-0 overflow-hidden rounded-2xl bg-neutral-900 sm:rounded-[28px]"
      style={{
        scale,
        filter: useTransform(filter, (v) => `brightness(${1 - v / 100})`),
        rotate: negateFilter,
        marginBottom: isLast ? "0px" : "18vh",
      }}
    >
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block h-full w-full"
      >
        <img
          src={site.img}
          alt={site.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start justify-between gap-1 bg-gradient-to-t from-black/85 to-transparent px-4 py-4 sm:flex-row sm:items-baseline sm:gap-4 sm:px-6 sm:py-5">
          <h3 className="text-base font-semibold text-[#f3f1ea] sm:text-lg">{site.name}</h3>
          <span className="text-xs text-[#9aa0aa] sm:whitespace-nowrap sm:text-sm">
            Abrir em nova aba
          </span>
        </div>
      </a>
    </motion.div>
  );
};

export { StickyGallery };

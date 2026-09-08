import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TierSite {
  name: string;
  url: string;
  img: string;
}

export interface Tier {
  key: string;
  label: string;
  description: string;
  color: string;
  /** fração 0..1 da multidão que deve parar quando essa caixa está em hover */
  stopPercent: number;
  sites: TierSite[];
}

interface PricingBoxesProps {
  tiers: Tier[];
  onHoverTier: (tier: Tier | null, boxCenterX: number | null) => void;
  onSelectTier: (tier: Tier) => void;
  className?: string;
}

const PricingBoxes = ({
  tiers,
  onHoverTier,
  onSelectTier,
  className,
}: PricingBoxesProps) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  return (
    <div className={cn("flex w-full gap-4", className)}>
      {tiers.map((tier) => (
        <TierBox
          key={tier.key}
          tier={tier}
          isHovered={hoveredKey === tier.key}
          isDimmed={hoveredKey !== null && hoveredKey !== tier.key}
          onEnter={(centerX) => {
            setHoveredKey(tier.key);
            onHoverTier(tier, centerX);
          }}
          onLeave={() => {
            setHoveredKey(null);
            onHoverTier(null, null);
          }}
          onSelect={() => onSelectTier(tier)}
        />
      ))}
    </div>
  );
};

const TierBox = ({
  tier,
  isHovered,
  isDimmed,
  onEnter,
  onLeave,
  onSelect,
}: {
  tier: Tier;
  isHovered: boolean;
  isDimmed: boolean;
  onEnter: (centerX: number) => void;
  onLeave: () => void;
  onSelect: () => void;
}) => {
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (tier.sites.length < 2) return;
    const id = setInterval(
      () => setActiveImg((i) => (i + 1) % tier.sites.length),
      3000 + Math.random() * 900,
    );
    return () => clearInterval(id);
  }, [tier.sites.length]);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`Ver sites do plano ${tier.label}`}
      className="group relative h-[38vh] min-h-[300px] cursor-pointer overflow-hidden rounded-3xl border"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: "#12151a",
      }}
      initial={false}
      animate={{ flexGrow: isHovered ? 2.3 : isDimmed ? 0.72 : 1 }}
      transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onEnter(rect.left + rect.width / 2);
      }}
      onMouseLeave={onLeave}
      onFocus={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onEnter(rect.left + rect.width / 2);
      }}
      onBlur={onLeave}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* carrossel de imagens */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          {tier.sites.map(
            (site, i) =>
              i === activeImg && (
                <motion.img
                  key={site.name}
                  src={site.img}
                  alt={site.name}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute h-full w-full object-cover"
                />
              ),
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      </div>

      {/* conteúdo */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-[#f3f1ea]">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: tier.color }}
          />
          {tier.label}
        </h3>

        <AnimatePresence>
          {isHovered && (
            <motion.p
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-[42ch] overflow-hidden text-sm leading-relaxed text-[#9aa0aa]"
            >
              {tier.description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export { PricingBoxes };

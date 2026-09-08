import { useRef, useState } from "react";
import { CrowdField, type CrowdFieldHandle } from "@/components/CrowdField";
import { PricingBoxes, type Tier } from "@/components/PricingBoxes";
import { StickyGallery } from "@/components/StickyGallery";

// ---------------------------------------------------------------------------
// DADOS — troque textos, imagens e links reais de cada site aqui.
// ---------------------------------------------------------------------------
const WHATSAPP_NUMBER = "5599999999999"; // seu número com DDI + DDD, só dígitos

const TIERS: Tier[] = [
  {
    key: "simples",
    label: "Site Simples",
    description:
      "Uma página só, direta ao ponto: quem você é, o que você faz e como falar com você.",
    color: "#7c8591",
    stopPercent: 0.3,
    sites: [
      { name: "Estúdio Vero", url: "https://example.com/1", img: "https://picsum.photos/seed/simples1/1200/800" },
      { name: "Café da Praça", url: "https://example.com/2", img: "https://picsum.photos/seed/simples2/1200/800" },
      { name: "Ateliê Nina", url: "https://example.com/3", img: "https://picsum.photos/seed/simples3/1200/800" },
    ],
  },
  {
    key: "normal",
    label: "Normal",
    description:
      "Site com várias seções, identidade visual própria e pequenas animações de rolagem.",
    color: "#49c5b6",
    stopPercent: 0.68,
    sites: [
      { name: "Clínica Alma", url: "https://example.com/4", img: "https://picsum.photos/seed/normal1/1200/800" },
      { name: "Estúdio Lume", url: "https://example.com/5", img: "https://picsum.photos/seed/normal2/1200/800" },
      { name: "Oficina Bravo", url: "https://example.com/6", img: "https://picsum.photos/seed/normal3/1200/800" },
      { name: "Padaria Trigo", url: "https://example.com/7", img: "https://picsum.photos/seed/normal4/1200/800" },
    ],
  },
  {
    key: "premium",
    label: "Premium",
    description:
      "Projeto sob medida: interações exclusivas, animações autorais e performance no detalhe.",
    color: "#e8a33d",
    stopPercent: 1,
    sites: [
      { name: "Nortium Studio", url: "https://example.com/8", img: "https://picsum.photos/seed/premium1/1200/800" },
      { name: "Casa Aurora", url: "https://example.com/9", img: "https://picsum.photos/seed/premium2/1200/800" },
      { name: "Voo Coletivo", url: "https://example.com/10", img: "https://picsum.photos/seed/premium3/1200/800" },
    ],
  },
];

function App() {
  const crowdRef = useRef<CrowdFieldHandle>(null);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  const handleHoverTier = (tier: Tier | null, boxCenterX: number | null) => {
    if (!tier || boxCenterX === null) {
      crowdRef.current?.setAttention(0, 0, "#ffffff");
      return;
    }
    crowdRef.current?.setAttention(tier.stopPercent, boxCenterX, tier.color);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0b0d10] text-[#f3f1ea]">
      <header className="relative z-10 flex items-center justify-between px-5 pt-7 md:px-16">
        <span className="font-['Space_Grotesk'] text-sm font-semibold">
          Seu Nome — Sites
        </span>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-[#f3f1ea] px-4 py-2 text-xs font-medium text-[#0b0d10] transition-transform hover:-translate-y-0.5"
        >
          Falar no WhatsApp
        </a>
      </header>

      <main className="relative z-10 px-5 pt-[8vh] md:px-16">
        <h1 className="max-w-[14ch] font-['Space_Grotesk'] text-[clamp(30px,4.4vw,50px)] font-semibold leading-[1.12]">
          Escolha o quanto sua marca precisa aparecer.
        </h1>
        <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-[#9aa0aa]">
          Três formas de presença online — da vitrine simples e direta até o
          letreiro que faz todo mundo parar. Passe o mouse pelas caixas e
          clique para ver exemplos de cada uma.
        </p>

        <div className="relative mt-[6vh]">
          <PricingBoxes
            tiers={TIERS}
            onHoverTier={handleHoverTier}
            onSelectTier={setSelectedTier}
            className="relative z-10 max-w-[1100px]"
          />
        </div>

        {/* Campo interativo de brilhos em toda a tela. */}
        <div className="pointer-events-none fixed inset-0 z-0 h-screen w-full overflow-hidden">
          <CrowdField
            ref={crowdRef}
            count={98}
            className="pointer-events-auto absolute inset-0 h-full w-full"
          />
        </div>
      </main>

      <StickyGallery
        tier={selectedTier}
        onClose={() => setSelectedTier(null)}
        whatsappNumber={WHATSAPP_NUMBER}
      />
    </div>
  );
}

export default App;

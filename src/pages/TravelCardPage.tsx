import { useState } from 'react'
import { ChevronLeft, Languages } from 'lucide-react'
import { readJson, writeJson } from '../lib/storage'

type Lang = 'nl' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt'

const CARDS: Record<Lang, { name: string; title: string; text: string }> = {
  nl: {
    name: 'Nederlands',
    title: 'Ik heb coeliakie',
    text: 'Ik mag geen gluten eten: geen tarwe, gerst, rogge, spelt of haver, ook niet in sauzen, paneermeel of gedeelde frituurolie. Kleine sporen maken me al ziek. Kunt u mij helpen een veilig gerecht te kiezen? Dank u wel!',
  },
  en: {
    name: 'English',
    title: 'I have coeliac disease',
    text: 'I cannot eat gluten: no wheat, barley, rye, spelt or oats, including in sauces, breadcrumbs or shared frying oil. Even small traces make me ill. Could you help me choose a safe dish? Thank you!',
  },
  de: {
    name: 'Deutsch',
    title: 'Ich habe Zöliakie',
    text: 'Ich darf kein Gluten essen: kein Weizen, keine Gerste, kein Roggen, kein Dinkel und kein Hafer, auch nicht in Soßen, Paniermehl oder gemeinsam genutztem Frittierfett. Schon kleine Spuren machen mich krank. Können Sie mir helfen, ein sicheres Gericht zu wählen? Vielen Dank!',
  },
  fr: {
    name: 'Français',
    title: 'Je suis cœliaque',
    text: "Je ne peux pas manger de gluten : ni blé, ni orge, ni seigle, ni épeautre, ni avoine, y compris dans les sauces, la chapelure ou l'huile de friture partagée. Même de petites traces me rendent malade. Pourriez-vous m'aider à choisir un plat sans risque ? Merci beaucoup !",
  },
  es: {
    name: 'Español',
    title: 'Soy celíaco/a',
    text: 'No puedo comer gluten: nada de trigo, cebada, centeno, espelta ni avena, tampoco en salsas, pan rallado o aceite de freír compartido. Incluso pequeñas trazas me hacen daño. ¿Podría ayudarme a elegir un plato seguro? ¡Muchas gracias!',
  },
  it: {
    name: 'Italiano',
    title: 'Sono celiaco/a',
    text: "Non posso mangiare glutine: niente frumento, orzo, segale, farro o avena, nemmeno in salse, pangrattato o olio di frittura condiviso. Anche piccole tracce mi fanno male. Potrebbe aiutarmi a scegliere un piatto sicuro? Grazie mille!",
  },
  pt: {
    name: 'Português',
    title: 'Tenho doença celíaca',
    text: 'Não posso comer glúten: nada de trigo, cevada, centeio, espelta ou aveia, nem em molhos, pão ralado ou óleo de fritura partilhado. Mesmo pequenos vestígios fazem-me mal. Pode ajudar-me a escolher um prato seguro? Muito obrigado/a!',
  },
}

const LANG_KEY = 'glutenscanner.travelLang.v1'

/** Kaart om aan de bediening te laten zien, in de taal van het land waar je bent. */
export function TravelCardPage({ onBack }: { onBack: () => void }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = readJson<string>(LANG_KEY, 'es')
    return saved in CARDS ? (saved as Lang) : 'es'
  })
  const card = CARDS[lang]

  function choose(next: Lang) {
    setLang(next)
    writeJson(LANG_KEY, next)
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pb-6 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="relative flex h-11 items-center justify-center">
        <button
          onClick={onBack}
          className="absolute left-0 -ml-2 rounded-full p-2 text-safe active:opacity-60"
          aria-label="Terug naar start"
        >
          <ChevronLeft size={28} />
        </button>
        <span className="flex items-center gap-1.5 text-[17px] font-semibold">
          <Languages size={18} className="text-safe" />
          Reiskaart
        </span>
      </header>

      <p className="text-center text-[15px] text-muted">Kies de taal en laat dit scherm aan de bediening zien.</p>

      <div className="flex flex-wrap justify-center gap-2" role="tablist">
        {(Object.keys(CARDS) as Lang[]).map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={id === lang}
            onClick={() => choose(id)}
            className={`rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
              id === lang ? 'bg-safe text-black' : 'bg-surface text-white/80 active:bg-surface-raised'
            }`}
          >
            {CARDS[id].name}
          </button>
        ))}
      </div>

      <article
        lang={lang}
        className="animate-slide-up flex flex-col items-center gap-4 rounded-[28px] bg-white p-7 text-center text-black"
        key={lang}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-danger text-3xl font-black text-white">
          !
        </span>
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">{card.title}</h1>
        <p className="text-[19px] leading-relaxed">{card.text}</p>
      </article>
    </main>
  )
}

import { useState } from 'react'
import { ChevronDown, Eye, EyeOff, MapPin, X } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { BLOCK_STYLE, CARDS, zoneLang, type Lang } from '../data/travelCards'

/**
 * Kaart voor de bediening: in de taal van het land laat je zien wat je niet mag,
 * waar de keuken op moet letten en wat meestal wél kan. Eigen tekst en opbouw.
 */

export function TravelCardPage({ onBack }: { onBack: () => void }) {
  const here = zoneLang()
  // Thuis altijd Nederlands; op reis meteen de taal van het land.
  const [lang, setLang] = useState<Lang>(() => here ?? 'nl')
  const [picker, setPicker] = useState(false)
  const [readAlong, setReadAlong] = useState(false)
  const card = CARDS[lang]

  function choose(next: Lang) {
    setLang(next)
    setPicker(false)
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6">
      <PageHeader title="Kaart voor de bediening" onBack={onBack} className="-mx-4" />

      <button
        onClick={() => setPicker(true)}
        className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-left ring-1 ring-white/10 active:bg-surface-raised"
        aria-haspopup="dialog"
      >
        <span className="text-[30px] leading-none" aria-hidden>
          {card.flag}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[13px] text-muted">Taal van de kaart</span>
          <span className="text-[19px] font-semibold leading-tight">{card.name}</span>
        </span>
        {here === lang && here !== 'nl' && (
          <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-1 text-[12px] font-semibold text-accent">
            <MapPin size={13} /> Hier
          </span>
        )}
        <ChevronDown size={22} className="shrink-0 text-muted" />
      </button>

      <article lang={lang} key={lang} className="animate-slide-up flex flex-col gap-4 rounded-[28px] bg-white p-6 text-black">
        <header>
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight">{card.title}</h1>
          <p className="mt-1 text-[19px] font-semibold leading-snug">{card.intro}</p>
        </header>
        {card.blocks.map(([head, text], i) => {
          const { icon: Icon, cls } = BLOCK_STYLE[i]
          return (
            <section key={head} className={`rounded-2xl p-4 ${cls}`}>
              <h2 className="flex items-center gap-2 text-[17px] font-bold">
                <Icon size={20} className="shrink-0" />
                {head}
              </h2>
              <p className="mt-1 text-[17px] leading-snug text-black/85">{text}</p>
            </section>
          )
        })}
        <p className="text-[17px] italic leading-snug text-black/70">{card.close}</p>
      </article>

      {lang !== 'nl' && (
        <button
          onClick={() => setReadAlong((v) => !v)}
          className="flex items-center justify-center gap-2 rounded-full bg-surface py-3 text-[16px] font-semibold text-white/85 active:bg-surface-raised"
          aria-expanded={readAlong}
        >
          {readAlong ? <EyeOff size={18} /> : <Eye size={18} />}
          {readAlong ? 'Verberg Nederlands' : 'Lees mee in het Nederlands'}
        </button>
      )}
      {readAlong && lang !== 'nl' && (
        <div className="animate-slide-up rounded-[22px] bg-surface p-5 text-[15px] leading-snug text-white/80">
          <p className="font-semibold text-white">{CARDS.nl.intro}</p>
          {CARDS.nl.blocks.map(([head, text]) => (
            <p key={head} className="mt-2">
              <b className="text-white">{head}:</b> {text}
            </p>
          ))}
        </div>
      )}

      <p className="px-2 text-center text-[13px] leading-relaxed text-muted">
        Ook met deze kaart kan een keuken een fout maken. Vraag gerust hoe je eten gemaakt wordt.
      </p>

      {picker && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setPicker(false)} role="dialog" aria-label="Kies een taal">
          <div
            className="animate-slide-up w-full rounded-t-[28px] bg-surface p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-[19px] font-bold">Kies een taal</h2>
              <button onClick={() => setPicker(false)} className="rounded-full bg-white/10 p-2" aria-label="Sluiten">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CARDS) as Lang[]).map((id) => (
                <button
                  key={id}
                  onClick={() => choose(id)}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-[17px] font-medium ${
                    id === lang ? 'bg-accent text-white' : 'bg-black/30 active:bg-black/50'
                  }`}
                >
                  <span className="text-[24px] leading-none" aria-hidden>
                    {CARDS[id].flag}
                  </span>
                  <span className="flex-1">{CARDS[id].name}</span>
                  {id === here && <MapPin size={16} className="shrink-0 opacity-80" aria-label="Hier" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

import type { ReactNode } from 'react'
import { Clock3, Smartphone, Star, UserRound, Vibrate, WifiOff } from 'lucide-react'
import { Phone, ScreenAlternative, ScreenMenu, ScreenReadAlong, ScreenRecipe, ScreenSafe } from './PhoneScreens'

/**
 * "Wat de scanner nog meer kan" als raster: één grote kaart (talen) en vier kleinere,
 * elk met een nagebouwd telefoonscherm. Eigen teksten en eigen schermen.
 */

/** Kleine telefoon, onderkant valt weg zodat het netjes in de kaart past. */
function MiniPhone({ children, badge }: { children: ReactNode; badge?: ReactNode }) {
  return (
    <div className="relative h-[190px] w-[112px] shrink-0 lg:h-[220px] lg:w-[128px]">
      <div className="absolute left-0 top-0 origin-top-left scale-[0.42] lg:scale-[0.48]">
        <Phone>{children}</Phone>
      </div>
      {badge}
    </div>
  )
}

function SmallTile({ phone, title, text, badge }: { phone: ReactNode; title: string; text: string; badge?: ReactNode }) {
  return (
    <article data-reveal className="flex items-center gap-5 overflow-hidden rounded-[32px] bg-white px-5 pt-5 shadow-sm ring-1 ring-neutral-200 lg:gap-6 lg:px-6 lg:pt-6">
      <div className="self-end">
        <MiniPhone badge={badge}>{phone}</MiniPhone>
      </div>
      <div className="pb-5 lg:pb-6">
        <h3 className="font-display text-[22px] font-bold leading-tight lg:text-[24px]">{title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-600 lg:text-[16px]">{text}</p>
      </div>
    </article>
  )
}

const WORDS = [
  ['trigo', 'Spaans'],
  ['blé', 'Frans'],
  ['Weizen', 'Duits'],
  ['frumento', 'Italiaans'],
] as const

const MORE: [typeof Star, string][] = [
  [UserRound, 'Jouw profiel: streng of gevoelig'],
  [Clock3, 'Geschiedenis van je scans'],
  [Star, 'Ster voor je vaste producten'],
  [Vibrate, 'Uitslag voelen: 1, 2 of 3 tikjes'],
  [Smartphone, 'Op je beginscherm, zonder app-winkel'],
]

export function Features() {
  return (
    <>
      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1fr] lg:grid-rows-2 lg:gap-5">
        {/* Grote kaart: talen */}
        <article data-reveal className="relative flex min-h-[520px] flex-col overflow-hidden rounded-[36px] bg-[#10140f] p-7 text-white lg:row-span-2 lg:p-8">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[360px] w-[520px] -translate-x-1/2 rounded-full bg-accent/30 blur-[100px]" />
          <h3 className="relative font-display text-[30px] font-bold leading-tight lg:text-[34px]">Snapt 11 talen</h3>
          <p className="relative mt-3 text-[16px] leading-relaxed text-white/70 lg:text-[17px]">
            Op vakantie of een product uit het buitenland? Hij vindt de glutenwoorden en leest mee in het Nederlands.
          </p>
          <div className="relative mt-6 flex-1">
            <div className="absolute left-1/2 top-0 origin-top -translate-x-1/2 scale-[0.9]">
              <Phone className="ring-1 ring-white/10">
                <ScreenReadAlong />
              </Phone>
            </div>
            {WORDS.map(([w, lang], i) => (
              <span
                key={w}
                className={`absolute z-10 flex items-center gap-1 whitespace-nowrap rounded-xl bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#14130f] shadow-xl ${
                  ['-left-2 top-[4%] animate-float', '-right-2 top-[20%] animate-float-slow', '-left-2 bottom-[26%] animate-float-slow', '-right-2 bottom-[8%] animate-float'][i]
                }`}
              >
                <span className="text-danger">{w}</span>→ tarwe
                <span className="text-[10px] font-normal text-neutral-400">{lang}</span>
              </span>
            ))}
          </div>
        </article>

        <SmallTile
          phone={<ScreenSafe />}
          title="Ook zonder internet"
          text="Slecht bereik in de winkel? De gids, het lezen van etiketten en je eerdere scans werken gewoon. Gratis."
          badge={
            <span className="absolute -right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-danger text-white shadow-lg ring-4 ring-white">
              <WifiOff size={18} />
            </span>
          }
        />
        <SmallTile
          phone={<ScreenRecipe />}
          title="Merkt een nieuw recept"
          text="Scan je een vast product en staat er iets anders op dan vorige keer? Dan zie je meteen: het recept is veranderd."
        />
        <SmallTile
          phone={<ScreenMenu />}
          title="Weet wat je moet vragen"
          text="Op een menukaart staat niet alles. Je krijgt per gerecht de vraag voor de bediening, ook in de taal van het land."
        />
        <SmallTile
          phone={<ScreenAlternative />}
          title="Geeft een betere keus"
          text="Is het rood? Dan zie je glutenvrije producten van dezelfde soort. Zo sta je niet met lege handen."
        />
      </div>

      {/* De rest kort op een rij */}
      <ul data-reveal className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-2.5">
        {MORE.map(([Icon, label]) => (
          <li key={label} className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[15px] font-semibold text-neutral-700 ring-1 ring-neutral-200">
            <Icon size={17} className="text-accent" />
            {label}
          </li>
        ))}
      </ul>
    </>
  )
}

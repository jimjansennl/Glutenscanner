import { useState } from 'react'
import { Lightbulb, RotateCcw, Trophy } from 'lucide-react'
import { ALL_ITEMS, type Item } from '../../data/guideItems'
import type { RiskLevel } from '../../data/glutenGuide'
import { RISK_UI } from './guideUi'

/**
 * Quiz "Weet jij het?": tien vragen uit de gids. Zo leer je zelf etiketten lezen, ook als je
 * een keer geen telefoon bij je hebt. Extra kans op de verrassende: dingen die je verkeerd zou gokken.
 */

const ROUND = 10
/** Verrassend: lijkt glutenvrij maar is het niet, of andersom. */
const TRICKY = ['Boekweit', 'Orzo', 'Drop', 'Sojasaus', 'Gnocchi', 'Haver', 'Moutazijn', 'Rijstwafels', 'Quinoa', 'Couscous', 'Spelt', 'Taaitaai', 'Ontbijtkoek & peperkoek', 'Popcorn', 'Teff', 'Gerstekoffie', 'Bouillonblokjes', 'Matze', 'Tapioca', 'Gistextract']

function pickRound(): Item[] {
  const food = ALL_ITEMS.filter((i) => i.food)
  const shuffle = <T,>(a: T[]) => a.map((x) => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map(([, x]) => x)
  const tricky = shuffle(food.filter((i) => TRICKY.includes(i.name))).slice(0, 5)
  const rest = shuffle(food.filter((i) => !tricky.includes(i))).slice(0, ROUND - tricky.length)
  return shuffle([...tricky, ...rest])
}

const CHOICES: RiskLevel[] = ['laag', 'middel', 'hoog']

export function Quiz() {
  const [round, setRound] = useState(pickRound)
  const [n, setN] = useState(0)
  const [answer, setAnswer] = useState<RiskLevel | null>(null)
  const [score, setScore] = useState(0)

  if (n >= round.length) {
    const praise = score >= 9 ? 'Top! Jij bent een echte etiketlezer.' : score >= 6 ? 'Goed bezig! Een paar verrassingen nog.' : 'Lastig hè? Gluten zitten op rare plekken.'
    return (
      <div className="mt-6 flex flex-col items-center gap-4 rounded-[28px] bg-surface p-6 text-center">
        <Trophy size={44} className="text-warning" />
        <p className="text-[28px] font-extrabold">
          {score} van de {round.length} goed
        </p>
        <p className="text-[17px] text-white/80">{praise}</p>
        <button
          onClick={() => {
            setRound(pickRound())
            setN(0)
            setScore(0)
            setAnswer(null)
          }}
          className="mt-2 flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[17px] font-bold text-black active:scale-95"
        >
          <RotateCcw size={18} />
          Nog een keer
        </button>
      </div>
    )
  }

  const item = round[n]
  const right = answer === item.risk
  const ui = RISK_UI[item.risk]
  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {round.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < n ? 'bg-accent' : i === n ? 'bg-white/60' : 'bg-white/15'}`} />
        ))}
      </div>
      <div className="rounded-[28px] bg-surface p-6 text-center">
        <p className="text-[15px] text-muted">Vraag {n + 1} van {round.length}</p>
        <p className="mt-1 text-[30px] font-extrabold leading-tight">{item.name}</p>
        <p className="mt-1 text-[17px] text-white/80">Kan dit?</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {CHOICES.map((c) => {
          const cu = RISK_UI[c]
          const picked = answer === c
          const isRight = answer && c === item.risk
          return (
            <button
              key={c}
              disabled={!!answer}
              onClick={() => {
                setAnswer(c)
                if (c === item.risk) setScore((s) => s + 1)
              }}
              className={`rounded-[18px] py-4 text-[18px] font-bold transition ${
                !answer ? `bg-surface ${cu.text} active:scale-95` : isRight ? cu.solid : picked ? 'bg-surface text-white/40 line-through' : 'bg-surface text-white/30'
              }`}
            >
              {cu.word}
            </button>
          )
        })}
      </div>

      {answer && (
        <div className={`rounded-[24px] p-5 ring-1 ${ui.soft}`}>
          <p className={`text-[20px] font-bold ${right ? 'text-safe' : 'text-warning'}`}>{right ? 'Goed zo!' : `Het is: ${ui.word}`}</p>
          <p className="mt-1 text-[16px] leading-snug text-white/85">{item.why}</p>
          {item.tip && (
            <p className="mt-2 flex gap-2 text-[15px] leading-snug text-white/75">
              <Lightbulb size={18} className="mt-0.5 shrink-0 text-warning" />
              {item.tip}
            </p>
          )}
          <button
            onClick={() => {
              setN(n + 1)
              setAnswer(null)
            }}
            className="mt-4 w-full rounded-full bg-white py-3 text-[17px] font-bold text-black active:scale-[0.98]"
          >
            {n + 1 < round.length ? 'Volgende vraag' : 'Bekijk je score'}
          </button>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Store } from 'lucide-react'
import { RestaurantSheet } from './RestaurantSheet'

/** Onder een menukaart of gerecht: dit restaurant bewaren en beoordelen. */
export function SaveRestaurantButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2.5 rounded-[22px] bg-surface p-3.5 text-[16px] font-semibold active:opacity-70"
      >
        <Store size={20} className="text-safe" />
        Bewaar dit restaurant
      </button>
      {open && <RestaurantSheet onClose={() => setOpen(false)} />}
    </>
  )
}

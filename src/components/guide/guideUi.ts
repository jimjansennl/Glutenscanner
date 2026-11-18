import {
  AlertTriangle,
  Backpack,
  CandyCane,
  CheckCircle2,
  Croissant,
  Gift,
  SearchCheck,
  ShoppingCart,
  Soup,
  Tag,
  TreePine,
  Wheat,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { GuideCategory, RiskLevel } from '../../data/glutenGuide'

export const THEME_ICONS: Record<GuideCategory['icon'], LucideIcon> = {
  gift: Gift,
  candy: CandyCane,
  soup: Soup,
  croissant: Croissant,
  wheat: Wheat,
  search: SearchCheck,
  cart: ShoppingCart,
  tree: TreePine,
  school: Backpack,
  label: Tag,
}

export const RISK_UI: Record<RiskLevel, { word: string; long: string; icon: LucideIcon; solid: string; soft: string; text: string }> = {
  hoog: { word: 'Nee', long: 'Bevat gluten', icon: XCircle, solid: 'bg-danger text-white', soft: 'bg-danger/15 ring-danger/40', text: 'text-danger' },
  middel: { word: 'Let op', long: 'Kan gluten bevatten', icon: AlertTriangle, solid: 'bg-warning text-black', soft: 'bg-warning/15 ring-warning/40', text: 'text-warning' },
  laag: { word: 'Mag', long: 'Glutenvrij', icon: CheckCircle2, solid: 'bg-safe text-black', soft: 'bg-safe/15 ring-safe/40', text: 'text-safe' },
}


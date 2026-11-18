export type PanelId = 'functies' | 'in-actie' | 'gids' | 'vragen'

export const PANELS: { id: PanelId; label: string; title: string }[] = [
  { id: 'functies', label: 'Functies', title: 'Wat kan de scanner?' },
  { id: 'in-actie', label: 'In actie', title: 'Zo ziet het eruit' },
  { id: 'gids', label: 'Glutengids', title: 'Waar gluten schuilen' },
  { id: 'vragen', label: 'Vragen', title: 'Veelgestelde vragen' },
]

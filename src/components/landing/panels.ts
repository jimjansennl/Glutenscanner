export type PanelId = 'hoe' | 'in-actie' | 'gids' | 'vragen'

/** Dezelfde onderdelen als in de kop van de website; op de telefoon achter het hamburgermenu. */
export const PANELS: { id: PanelId; label: string; title: string }[] = [
  { id: 'hoe', label: 'Hoe het werkt', title: 'Hoe het werkt' },
  { id: 'in-actie', label: 'In actie', title: 'Zo ziet het eruit' },
  { id: 'gids', label: 'Glutengids', title: 'Waar gluten schuilen' },
  { id: 'vragen', label: 'Vragen', title: 'Veelgestelde vragen' },
]

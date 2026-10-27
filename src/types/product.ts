export type GlutenStatus = 'gluten_free' | 'contains_gluten' | 'may_contain' | 'unknown'

export interface Product {
  barcode: string
  name: string
  brand?: string
  glutenStatus: GlutenStatus
}

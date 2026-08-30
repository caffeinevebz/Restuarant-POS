import type { Category, ModifierGroup, Product, Settings } from '../types'

// -------------------------------------------------------------------------
// The Caffeine Ministry — default menu, modifiers and store settings.
// This data seeds localStorage on first run; afterwards the Menu Manager and
// Settings pages own it.
// -------------------------------------------------------------------------

export const SEED_SETTINGS: Settings = {
  storeName: 'The Caffeine Ministry',
  tagline: 'Preaching the good brew since 2019',
  address: '12 Roastery Lane, Bean District',
  phone: '(555) 018-2277',
  currencySymbol: '$',
  taxRate: 10,
  taxLabel: 'GST',
  cashierName: 'Barista',
}

export const SEED_CATEGORIES: Category[] = [
  { id: 'cat_espresso', name: 'Espresso', icon: '☕', color: '#6f4e37' },
  { id: 'cat_coffee', name: 'Coffee', icon: '🥛', color: '#a9744f' },
  { id: 'cat_tea', name: 'Tea & Matcha', icon: '🍵', color: '#4b7f52' },
  { id: 'cat_cold', name: 'Cold Drinks', icon: '🧊', color: '#3a7ca5' },
  { id: 'cat_pastry', name: 'Pastries', icon: '🥐', color: '#c98a3a' },
  { id: 'cat_food', name: 'Kitchen', icon: '🍳', color: '#b5533a' },
]

export const SEED_MODIFIER_GROUPS: ModifierGroup[] = [
  {
    id: 'mg_size',
    name: 'Size',
    required: true,
    multiple: false,
    options: [
      { id: 'opt_small', name: 'Small', priceDelta: -0.5 },
      { id: 'opt_regular', name: 'Regular', priceDelta: 0 },
      { id: 'opt_large', name: 'Large', priceDelta: 0.7 },
    ],
  },
  {
    id: 'mg_milk',
    name: 'Milk',
    required: true,
    multiple: false,
    options: [
      { id: 'opt_full', name: 'Full Cream', priceDelta: 0 },
      { id: 'opt_skim', name: 'Skim', priceDelta: 0 },
      { id: 'opt_oat', name: 'Oat', priceDelta: 0.6 },
      { id: 'opt_almond', name: 'Almond', priceDelta: 0.6 },
      { id: 'opt_soy', name: 'Soy', priceDelta: 0.5 },
    ],
  },
  {
    id: 'mg_extras',
    name: 'Extras',
    required: false,
    multiple: true,
    options: [
      { id: 'opt_shot', name: 'Extra Shot', priceDelta: 0.8 },
      { id: 'opt_decaf', name: 'Decaf', priceDelta: 0 },
      { id: 'opt_vanilla', name: 'Vanilla Syrup', priceDelta: 0.6 },
      { id: 'opt_caramel', name: 'Caramel Syrup', priceDelta: 0.6 },
      { id: 'opt_hazelnut', name: 'Hazelnut Syrup', priceDelta: 0.6 },
    ],
  },
  {
    id: 'mg_tea_extras',
    name: 'Extras',
    required: false,
    multiple: true,
    options: [
      { id: 'opt_honey', name: 'Honey', priceDelta: 0.4 },
      { id: 'opt_lemon', name: 'Lemon', priceDelta: 0.2 },
      { id: 'opt_extra_hot', name: 'Extra Hot', priceDelta: 0 },
    ],
  },
]

const milkDrink = ['mg_size', 'mg_milk', 'mg_extras']
const blackDrink = ['mg_size', 'mg_extras']

export const SEED_PRODUCTS: Product[] = [
  // Espresso bar
  { id: 'p_espresso', name: 'Espresso', categoryId: 'cat_espresso', price: 3.5, icon: '☕', available: true, description: 'Single shot', modifierGroupIds: ['mg_extras'] },
  { id: 'p_doppio', name: 'Doppio', categoryId: 'cat_espresso', price: 4.2, icon: '☕', available: true, description: 'Double shot', modifierGroupIds: ['mg_extras'] },
  { id: 'p_macchiato', name: 'Macchiato', categoryId: 'cat_espresso', price: 4.0, icon: '☕', available: true, description: 'Espresso, dot of foam', modifierGroupIds: ['mg_extras'] },
  { id: 'p_cortado', name: 'Cortado', categoryId: 'cat_espresso', price: 4.5, icon: '☕', available: true, modifierGroupIds: ['mg_milk', 'mg_extras'] },
  { id: 'p_americano', name: 'Americano', categoryId: 'cat_espresso', price: 4.2, icon: '☕', available: true, modifierGroupIds: blackDrink },

  // Milk coffee
  { id: 'p_latte', name: 'Latte', categoryId: 'cat_coffee', price: 5.0, icon: '🥛', available: true, description: 'Silky steamed milk', modifierGroupIds: milkDrink },
  { id: 'p_cappuccino', name: 'Cappuccino', categoryId: 'cat_coffee', price: 5.0, icon: '☕', available: true, modifierGroupIds: milkDrink },
  { id: 'p_flatwhite', name: 'Flat White', categoryId: 'cat_coffee', price: 5.0, icon: '🥛', available: true, modifierGroupIds: milkDrink },
  { id: 'p_mocha', name: 'Mocha', categoryId: 'cat_coffee', price: 5.6, icon: '🍫', available: true, description: 'Chocolate + espresso', modifierGroupIds: milkDrink },
  { id: 'p_chai', name: 'Chai Latte', categoryId: 'cat_coffee', price: 5.4, icon: '🫖', available: true, modifierGroupIds: milkDrink },

  // Tea & matcha
  { id: 'p_english', name: 'English Breakfast', categoryId: 'cat_tea', price: 4.0, icon: '🍵', available: true, modifierGroupIds: ['mg_tea_extras'] },
  { id: 'p_earlgrey', name: 'Earl Grey', categoryId: 'cat_tea', price: 4.0, icon: '🍵', available: true, modifierGroupIds: ['mg_tea_extras'] },
  { id: 'p_green', name: 'Green Tea', categoryId: 'cat_tea', price: 4.0, icon: '🍵', available: true, modifierGroupIds: ['mg_tea_extras'] },
  { id: 'p_matcha', name: 'Matcha Latte', categoryId: 'cat_tea', price: 5.8, icon: '🍵', available: true, description: 'Ceremonial grade', modifierGroupIds: milkDrink },
  { id: 'p_peppermint', name: 'Peppermint', categoryId: 'cat_tea', price: 4.0, icon: '🌿', available: true, modifierGroupIds: ['mg_tea_extras'] },

  // Cold drinks
  { id: 'p_coldbrew', name: 'Cold Brew', categoryId: 'cat_cold', price: 5.5, icon: '🧊', available: true, description: '18h steeped', modifierGroupIds: blackDrink },
  { id: 'p_icedlatte', name: 'Iced Latte', categoryId: 'cat_cold', price: 5.6, icon: '🧊', available: true, modifierGroupIds: milkDrink },
  { id: 'p_frappe', name: 'Caramel Frappe', categoryId: 'cat_cold', price: 6.5, icon: '🥤', available: true, modifierGroupIds: milkDrink },
  { id: 'p_oj', name: 'Fresh Orange Juice', categoryId: 'cat_cold', price: 4.8, icon: '🍊', available: true, modifierGroupIds: [] },
  { id: 'p_sparkling', name: 'Sparkling Water', categoryId: 'cat_cold', price: 3.0, icon: '💧', available: true, modifierGroupIds: [] },
  { id: 'p_smoothie', name: 'Berry Smoothie', categoryId: 'cat_cold', price: 6.8, icon: '🫐', available: true, modifierGroupIds: [] },

  // Pastries
  { id: 'p_croissant', name: 'Butter Croissant', categoryId: 'cat_pastry', price: 4.2, icon: '🥐', available: true, modifierGroupIds: [] },
  { id: 'p_painchoc', name: 'Pain au Chocolat', categoryId: 'cat_pastry', price: 4.6, icon: '🥐', available: true, modifierGroupIds: [] },
  { id: 'p_muffin', name: 'Blueberry Muffin', categoryId: 'cat_pastry', price: 4.0, icon: '🧁', available: true, modifierGroupIds: [] },
  { id: 'p_banana', name: 'Banana Bread', categoryId: 'cat_pastry', price: 4.5, icon: '🍌', available: true, description: 'Toasted, with butter', modifierGroupIds: [] },
  { id: 'p_cinnamon', name: 'Cinnamon Roll', categoryId: 'cat_pastry', price: 5.0, icon: '🌀', available: true, modifierGroupIds: [] },
  { id: 'p_cookie', name: 'Choc Chip Cookie', categoryId: 'cat_pastry', price: 3.5, icon: '🍪', available: true, modifierGroupIds: [] },

  // Kitchen
  { id: 'p_avotoast', name: 'Avocado Toast', categoryId: 'cat_food', price: 12.5, icon: '🥑', available: true, description: 'Sourdough, feta, chilli', modifierGroupIds: [] },
  { id: 'p_baconegg', name: 'Bacon & Egg Roll', categoryId: 'cat_food', price: 11.0, icon: '🥓', available: true, modifierGroupIds: [] },
  { id: 'p_toastie', name: 'Ham & Cheese Toastie', categoryId: 'cat_food', price: 9.5, icon: '🧀', available: true, modifierGroupIds: [] },
  { id: 'p_granola', name: 'Granola Bowl', categoryId: 'cat_food', price: 10.5, icon: '🥣', available: true, description: 'Yoghurt, berries, honey', modifierGroupIds: [] },
  { id: 'p_bagel', name: 'Smoked Salmon Bagel', categoryId: 'cat_food', price: 13.5, icon: '🥯', available: true, modifierGroupIds: [] },
]

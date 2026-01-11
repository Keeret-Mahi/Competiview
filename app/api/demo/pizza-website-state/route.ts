import { NextRequest, NextResponse } from 'next/server';

// TypeScript declaration for global state
declare global {
  // eslint-disable-next-line no-var
  var pizzaWebsiteState: {
    version: number;
    products: Array<{
      id: number;
      name: string;
      price: string;
      description: string;
    }>;
    specialOffer: string | null;
    lastChange: string | null;
    priceChangesCount: number; // Track how many price changes have been made
  } | undefined;
}

// Initialize default state (matching the HTML design)
const defaultState = {
  version: 1,
  products: [
    { id: 1, name: 'The Margherita', price: '$14', description: 'San Marzano tomato sauce, fresh buffalo mozzarella, garden basil, olive oil.' },
    { id: 2, name: 'Pepperoni Classic', price: '$16', description: 'Double layer of spicy pepperoni, mozzarella blend, oregano, chili flakes.' },
    { id: 3, name: 'Truffle Mushroom', price: '$18', description: 'Roasted wild mushrooms, white truffle oil, parmesan cream sauce, thyme.' },
  ],
  specialOffer: null,
  lastChange: null,
  priceChangesCount: 0, // Track price changes
};

/**
 * GET /api/demo/pizza-website-state
 * Gets the current state of the demo pizza website
 */
export async function GET() {
  // Initialize state if needed
  if (!global.pizzaWebsiteState) {
    global.pizzaWebsiteState = { ...defaultState };
  }

  // Ensure priceChangesCount exists (for backwards compatibility)
  const state = global.pizzaWebsiteState;
  if (state.priceChangesCount === undefined) {
    state.priceChangesCount = 0;
  }

  return NextResponse.json(global.pizzaWebsiteState);
}

/**
 * POST /api/demo/pizza-website-state
 * Updates the state of the demo pizza website (adds product, changes price, etc.)
 * 
 * Body: { action: 'add-product' | 'change-price' | 'reset', productId?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    console.log(`🍕 Pizza website state update requested: ${action}`);

    // Initialize state if needed
    if (!global.pizzaWebsiteState) {
      global.pizzaWebsiteState = { ...defaultState };
      console.log('📦 Initialized pizza website state');
    }

    const state = global.pizzaWebsiteState;
    
    // Initialize priceChangesCount if it doesn't exist (for backwards compatibility)
    if (state.priceChangesCount === undefined) {
      state.priceChangesCount = 0;
    }

    state.version += 1;
    state.lastChange = new Date().toISOString();

    if (action === 'add-product') {
      console.log(`➕ Adding new product. Current product count: ${state.products.length}`);
      // Add one new pizza from a list of 6 unique pizzas (will repeat after all 6 are used)
      const newProducts = [
        { name: 'Veggie Supreme', price: '$15', description: 'Peppers, mushrooms, olives, and mozzarella' },
        { name: 'Meat Lovers', price: '$17', description: 'Pepperoni, sausage, ham, and bacon' },
        { name: 'Buffalo Chicken', price: '$16', description: 'Spicy buffalo chicken and blue cheese' },
        { name: 'BBQ Chicken', price: '$18', description: 'BBQ chicken, red onions, and mozzarella' },
        { name: 'Hawaiian', price: '$15', description: 'Ham, pineapple, and mozzarella' },
        { name: 'Four Cheese', price: '$16', description: 'Mozzarella, cheddar, parmesan, and gorgonzola' },
      ];
      
      // Get the highest ID to continue numbering
      const maxId = Math.max(...state.products.map(p => p.id), 0);
      const nextId = maxId + 1;
      
      // Calculate which pizza to add based on how many have been added (excluding the original 3)
      const addedCount = state.products.length - 3; // Subtract the original 3
      const productIndex = addedCount % newProducts.length; // Cycle through the 6 pizzas
      const selectedProduct = newProducts[productIndex];
      
      // Create new product with unique ID
      const newProduct = {
        id: nextId,
        name: selectedProduct.name,
        price: selectedProduct.price,
        description: selectedProduct.description,
      };
      
      state.products.push(newProduct);
      console.log(`✅ Added product: ${newProduct.name} (ID: ${newProduct.id}). Total products: ${state.products.length}`);
    } else if (action === 'change-price') {
      // Change a specific product's price (productId from body)
      const { productId } = body;
      
      if (!productId) {
        return NextResponse.json(
          { error: 'productId is required for change-price action' },
          { status: 400 }
        );
      }

      const product = state.products.find(p => p.id === parseInt(productId));
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      const currentPrice = parseFloat(product.price.replace('$', ''));
      
      // Randomly increase or decrease by 10-20%
      const changePercent = (Math.random() < 0.5 ? -1 : 1) * (0.1 + Math.random() * 0.1);
      const newPrice = Math.max(0.01, currentPrice * (1 + changePercent)); // Ensure price is positive
      product.price = `$${newPrice.toFixed(2)}`;
    } else if (action === 'reset') {
      // Reset to original state
      global.pizzaWebsiteState = {
        version: 1,
        products: [
          { id: 1, name: 'The Margherita', price: '$14', description: 'San Marzano tomato sauce, fresh buffalo mozzarella, garden basil, olive oil.' },
          { id: 2, name: 'Pepperoni Classic', price: '$16', description: 'Double layer of spicy pepperoni, mozzarella blend, oregano, chili flakes.' },
          { id: 3, name: 'Truffle Mushroom', price: '$18', description: 'Roasted wild mushrooms, white truffle oil, parmesan cream sauce, thyme.' },
        ],
        specialOffer: null,
        lastChange: null,
        priceChangesCount: 0,
      };
      console.log(`🔄 Reset pizza website state to original`);
    }

    console.log(`✅ Pizza website state updated. Version: ${global.pizzaWebsiteState.version}, Products: ${global.pizzaWebsiteState.products.length}`);
    
    return NextResponse.json({
      success: true,
      state: global.pizzaWebsiteState,
      message: `State updated: ${action}`,
    });
  } catch (error: any) {
    console.error('Error updating pizza website state:', error);
    return NextResponse.json(
      { error: 'Failed to update state', details: error.message },
      { status: 500 }
    );
  }
}

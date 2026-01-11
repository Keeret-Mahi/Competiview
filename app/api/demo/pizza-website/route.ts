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
    priceChangesCount: number;
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
  priceChangesCount: 0,
};

/**
 * GET /api/demo/pizza-website
 * Returns the pizza website as HTML (for scraping)
 * This is what the monitoring system will scrape
 */
export async function GET() {
  // Get current state
  if (!global.pizzaWebsiteState) {
    global.pizzaWebsiteState = { ...defaultState };
  }
  const state = global.pizzaWebsiteState;

  // Pizza images - 3 for original pizzas, 6 more for new pizzas (9 total)
  const pizzaImages = [
    // Original 3 pizzas (index 0-2)
    'https://lh3.googleusercontent.com/aida-public/AB6AXuASgwcxMAuP1Iw5bb5zl16MOn4vH8kWsskR4eerW6GT0H5R5AWgruICTGehKntrwFtUFVE2UcC_Euto54880TWPh1--kT9MlcaoVTWtik7NgojrgioXPiR-vNvimg7Lg027QvQ1rOlzG5rg-igkGOvFHLMu0vbclW9RO8L2nW8tAWLTgXr7TNVAUSowL1GvXq21Tip-AqpIFgrHdhK5egXiyNJl68kiMeRPkTQpgVy-Te7s07wEWfAtPGACockohs1ARCjy5WZegwWy',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCwrBG50BaFWryN9OTjlPNc37iX_DvDX7NE_1ZerWe-4Q9iOm_xsclUx_5O-ueQnVJ-Bu9HlMgQKsLIs-jcHmJSU2jHYN5Q7819ld93ChYUuz-Oa30_soe86ZSF76lutVNRLlHcB8yugS67Vv6wqWl96969Ch8F47UyspxD166mozd1Elet_IP7li1y5X8Fl1A_UHPzisMttTXb_F1YwxQFw4mf-cCXenpl-DuR4w64n4btZfjn8SX0_YhW3E6rNBmFIM822T9-PMV3',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA8F60Jz2mDPFsI04iFi7BQqgk3R5dDj4ArSrLRwTyqYtJKR6GWNy4a0J-zDZOJBskCXGgl9uB3Hu1sEYw7mmyjoZkHgzdPczxMtU1UUjrNXPROXl8wat6VYINSpWaq3RzLTkah752WK2RxA1CJUalE2995G14q_uyV4vGlY84uv-0COtOrAeObxUqarE1DWFR0-OPJ4WWbenNXz1FyipCg1MqtCLY90glcurMKWkNqUztitbFXJpiKtElR9SXVfCuxsIHz6XAdPS7S',
    // Additional 6 pizzas for new menu items (index 3-8) - unique images
    '/pizza-images/Veggie PIzza.jpg', // Veggie Supreme (index 3)
    '/pizza-images/Meat Lovers Pizza.jpg', // Meat Lovers (index 4)
    '/pizza-images/Buffalo Chicken Pizza.jpg', // Buffalo Chicken (index 5)
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDSmf_5hWdQCb9x-2JTmEnpwgnTdwZjB6QuBn7H06XGUXHGZP5p5SvAG4wPqSWG3Hfhj2GW1P1LR30BKPH3O1XKGJwUtIs1yJCXrfdUSfb7tW1UPIPv7_uT6Yfk85r6vo6MvXP-tepHVtnYplF9kirhyb9V-3d0VqHR2uC8koUNhUODvYVaEjuF8NWoo-H2lMbv294IPQxFNrvRqa_aWHmIMnGhsAlpJQkz2vnglA_iMn1THI6kAAfEj7n0Ji3yoxL9S3MZ1oqMVLKS',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCwrBG50BaFWryN9OTjlPNc37iX_DvDX7NE_1ZerWe-4Q9iOm_xsclUx_5O-ueQnVJ-Bu9HlMgQKsLIs-jcHmJSU2jHYN5Q7819ld93ChYUuz-Oa30_soe86ZSF76lutVNRLlHcB8yugS67Vv6wqWl96969Ch8F47UyspxD166mozd1Elet_IP7li1y5X8Fl1A_UHPzisMttTXb_F1YwxQFw4mf-cCXenpl-DuR4w64n4btZfjn8SX0_YhW3E6rNBmFIM822T9-PMV3',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA8F60Jz2mDPFsI04iFi7BQqgk3R5dDj4ArSrLRwTyqYtJKR6GWNy4a0J-zDZOJBskCXGgl9uB3Hu1sEYw7mmyjoZkHgzdPczxMtU1UUjrNXPROXl8wat6VYINSpWaq3RzLTkah752WK2RxA1CJUalE2995G14q_uyV4vGlY84uv-0COtOrAeObxUqarE1DWFR0-OPJ4WWbenNXz1FyipCg1MqtCLY90glcurMKWkNqUztitbFXJpiKtElR9SXVfCuxsIHz6XAdPS7S',
  ];

  // Default product names (for fallback matching)
  const defaultNames = ['The Margherita', 'Pepperoni Classic', 'Truffle Mushroom'];

  // Generate HTML from state (show all products)
  const productsHtml = state.products
    .map((product, index) => {
      // Original 3 pizzas (id 1-3) use images 0-2
      // New pizzas (id 4+) cycle through images 3-8 (6 images for the 6 new pizza types)
      let imageIndex;
      if (product.id <= 3) {
        // Original pizzas
        imageIndex = product.id - 1; // id 1 -> index 0, id 2 -> index 1, id 3 -> index 2
      } else {
        // New pizzas - calculate which of the 6 new pizza types this is
        // Products are added in order: first new pizza is index 0 of new pizzas, uses image index 3
        const newPizzaIndex = index - 3; // Subtract the original 3
        const imageOffset = (newPizzaIndex % 6); // Cycle through 6 images
        imageIndex = 3 + imageOffset; // Start from index 3 (after original 3 images)
      }
      const imageUrl = pizzaImages[imageIndex] || pizzaImages[0];
      const priceNum = product.price.replace('$', '');
      return `
    <div class="product">
      <div class="product-image" style="background-image: url('${imageUrl}');"></div>
      <div class="product-info">
        <div class="product-header">
          <h3 class="product-name">${product.name}</h3>
          <span class="product-price clickable-price" onclick="changePrice(${product.id})" data-product-id="${product.id}">$${priceNum}</span>
        </div>
        <p class="product-description">${product.description}</p>
        <button class="product-button">Add to Cart</button>
      </div>
    </div>
  `;
    })
    .join('');


  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slice & Wood - Authentic Pizzeria</title>
  <meta name="description" content="Slice & Wood - Authentic Wood-Fired Pizza. Fresh ingredients, handmade dough, and classic recipes delivered piping hot to your door.">
  <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Work Sans', sans-serif;
      background-color: #fcf9f8;
      color: #1b100d;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    header {
      background-color: #fcf9f8;
      border-bottom: 1px solid #f3e9e7;
      padding: 0.75rem 0;
    }
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #1b100d;
    }
    .logo svg {
      width: 2rem;
      height: 2rem;
      color: #ec3713;
    }
    .hero {
      min-height: 560px;
      background-image: linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDSmf_5hWdQCb9x-2JTmEnpwgnTdwZjB6QuBn7H06XGUXHGZP5p5SvAG4wPqSWG3Hfhj2GW1P1LR30BKPH3O1XKGJwUtIs1yJCXrfdUSfb7tW1UPIPv7_uT6Yfk85r6vo6MvXP-tepHVtnYplF9kirhyb9V-3d0VqHR2uC8koUNhUODvYVaEjuF8NWoo-H2lMbv294IPQxFNrvRqa_aWHmIMnGhsAlpJQkz2vnglA_iMn1THI6kAAfEj7n0Ji3yoxL9S3MZ1oqMVLKS');
      background-size: cover;
      background-position: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      border-radius: 0.75rem;
      margin: 1.25rem auto;
      position: relative;
    }
    .hero h1 {
      color: white;
      font-size: 3rem;
      font-weight: 900;
      text-align: center;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .hero p {
      color: #f3f4f6;
      font-size: 1.25rem;
      text-align: center;
      margin-bottom: 1rem;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .section-header {
      text-align: center;
      margin: 2rem 0 0.5rem;
      padding: 0 1rem;
    }
    .section-header h2 {
      font-size: 1.875rem;
      font-weight: bold;
      color: #1b100d;
      padding-bottom: 0.5rem;
      border-bottom: 4px solid rgba(236, 55, 19, 0.2);
      display: inline-block;
    }
    .menu {
      padding: 1.5rem 1rem;
    }
    .menu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      padding: 1.5rem 1rem;
    }
    .product {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .product-image {
      width: 100%;
      aspect-ratio: 4/3;
      background-size: cover;
      background-position: center;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .product-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    .product-name {
      font-weight: bold;
      font-size: 1.25rem;
      margin: 0;
      color: #1b100d;
    }
    .product-price {
      background-color: rgba(236, 55, 19, 0.1);
      color: #ec3713;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: bold;
      white-space: nowrap;
    }
    .clickable-price {
      cursor: pointer;
      transition: background-color 0.2s;
      user-select: none;
    }
    .clickable-price:hover {
      background-color: rgba(236, 55, 19, 0.2);
    }
    .product-description {
      color: #9a594c;
      font-size: 0.875rem;
      margin: 0;
      line-height: 1.5;
    }
    .product-button {
      margin-top: 0.75rem;
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ec3713;
      border-radius: 0.5rem;
      background-color: transparent;
      color: #ec3713;
      font-weight: bold;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .product-button:hover {
      background-color: #ec3713;
      color: white;
    }
    .demo-controls {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 1000;
      opacity: 0.15;
      transition: opacity 0.3s;
    }
    .demo-controls:hover {
      opacity: 1;
    }
    .demo-button {
      padding: 8px 12px;
      background-color: #1b100d;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    .demo-button:hover {
      background-color: #ec3713;
    }
    .demo-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    footer {
      background-color: #f3e9e7;
      padding: 2.5rem 1rem;
      text-align: center;
      margin-top: auto;
    }
    footer p {
      color: #9a594c;
      margin: 0.5rem 0;
    }
  </style>
</head>
<body>
  <header>
    <div class="header-content">
      <div class="logo">
        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path clip-rule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fill-rule="evenodd"></path>
          <path clip-rule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fill-rule="evenodd"></path>
        </svg>
        <h2 style="font-size: 1.25rem; font-weight: bold; margin: 0;">Slice & Wood</h2>
      </div>
    </div>
  </header>

  <div class="container">
    <div class="hero">
      <h1>Authentic Wood-Fired Taste</h1>
      <p>Fresh ingredients, handmade dough, and classic recipes delivered piping hot to your door.</p>
    </div>

    <div class="section-header">
      <h2>Chef's Specials</h2>
    </div>

    <div class="menu-grid container">
      ${productsHtml}
    </div>
  </div>

  <footer>
    <p>© 2024 Slice & Wood Pizzeria. All rights reserved.</p>
    <p>Hand-tossed, wood-fired, and made with love. Visit our locations or order online.</p>
  </footer>

  <!-- Hidden Demo Controls -->
  <div class="demo-controls">
    <button class="demo-button" onclick="addPizza()" id="add-product-btn">Add Pizza</button>
    <button class="demo-button" onclick="resetState()" id="reset-btn">Reset</button>
  </div>

  <script>
    async function addPizza() {
      const btn = document.getElementById('add-product-btn');
      btn.disabled = true;
      btn.textContent = 'Adding...';

      try {
        const response = await fetch('/api/demo/pizza-website-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'add-product' }),
        });

        if (response.ok) {
          // Reload the page to show the new pizza
          window.location.reload();
        } else {
          const errorData = await response.json();
          console.error('Failed to add pizza:', errorData);
          alert('Failed to add pizza. Please try again.');
          btn.disabled = false;
          btn.textContent = 'Add Pizza';
        }
      } catch (error) {
        console.error('Error adding pizza:', error);
        alert('Failed to add pizza. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Add Pizza';
      }
    }

    async function changePrice(productId) {
      try {
        const response = await fetch('/api/demo/pizza-website-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'change-price', productId: productId }),
        });

        if (response.ok) {
          // Reload the page to show the price change
          window.location.reload();
        } else {
          const errorData = await response.json();
          console.error('Failed to change price:', errorData);
          alert('Failed to change price. Please try again.');
        }
      } catch (error) {
        console.error('Error changing price:', error);
        alert('Failed to change price. Please try again.');
      }
    }

    async function resetState() {
      const btn = document.getElementById('reset-btn');
      btn.disabled = true;
      btn.textContent = 'Resetting...';

      try {
        const response = await fetch('/api/demo/pizza-website-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'reset' }),
        });

        if (response.ok) {
          // Reload the page to show the reset state
          window.location.reload();
        } else {
          const errorData = await response.json();
          console.error('Failed to reset state:', errorData);
          alert('Failed to reset state. Please try again.');
          btn.disabled = false;
          btn.textContent = 'Reset';
        }
      } catch (error) {
        console.error('Error resetting state:', error);
        alert('Failed to reset state. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Reset';
      }
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

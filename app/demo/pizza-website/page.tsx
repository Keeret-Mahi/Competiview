"use client";

import { useEffect, useState } from "react";

interface PizzaProduct {
  id: number;
  name: string;
  price: string;
  description: string;
}

interface PizzaWebsiteState {
  version: number;
  products: PizzaProduct[];
  specialOffer: string | null;
  lastChange: string | null;
}

export default function PizzaWebsitePage() {
  const [state, setState] = useState<PizzaWebsiteState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchState = async () => {
    try {
      const response = await fetch('/api/demo/pizza-website-state');
      if (response.ok) {
        const data = await response.json();
        setState(data);
      }
    } catch (error) {
      console.error('Error fetching state:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleAction = async (action: string) => {
    console.log(`🍕 Pizza website action triggered: ${action}`);
    console.log(`🔍 Current state before action:`, state);
    setActionLoading(action);
    try {
      const response = await fetch('/api/demo/pizza-website-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Pizza website state updated. Response:`, data);
        // Handle both response formats: { state: ... } or just the state directly
        const updatedState = data.state || data;
        console.log(`✅ Updated state. Products: ${updatedState.products?.length || 0}`);
        setState(updatedState);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to update pizza website state:', errorData);
        alert(`Failed to update website: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error updating state:', error);
      alert('Failed to update website. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !state) {
    return (
      <div className="min-h-screen bg-[#fcf9f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ec3713] mx-auto mb-4"></div>
          <p className="text-[#9a594c]">Loading...</p>
        </div>
      </div>
    );
  }

  // Default product names and descriptions (fallback)
  const defaultProducts = [
    { name: 'The Margherita', price: '$14', description: 'San Marzano tomato sauce, fresh buffalo mozzarella, garden basil, olive oil.' },
    { name: 'Pepperoni Classic', price: '$16', description: 'Double layer of spicy pepperoni, mozzarella blend, oregano, chili flakes.' },
    { name: 'Truffle Mushroom', price: '$18', description: 'Roasted wild mushrooms, white truffle oil, parmesan cream sauce, thyme.' },
  ];

  // Pizza images - same mapping as the API route
  const pizzaImages = [
    // Original 3 pizzas (index 0-2)
    'https://lh3.googleusercontent.com/aida-public/AB6AXuASgwcxMAuP1Iw5bb5zl16MOn4vH8kWsskR4eerW6GT0H5R5AWgruICTGehKntrwFtUFVE2UcC_Euto54880TWPh1--kT9MlcaoVTWtik7NgojrgioXPiR-vNvimg7Lg027QvQ1rOlzG5rg-igkGOvFHLMu0vbclW9RO8L2nW8tAWLTgXr7TNVAUSowL1GvXq21Tip-AqpIFgrHdhK5egXiyNJl68kiMeRPkTQpgVy-Te7s07wEWfAtPGACockohs1ARCjy5WZegwWy',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCwrBG50BaFWryN9OTjlPNc37iX_DvDX7NE_1ZerWe-4Q9iOm_xsclUx_5O-ueQnVJ-Bu9HlMgQKsLIs-jcHmJSU2jHYN5Q7819ld93ChYUuz-Oa30_soe86ZSF76lutVNRLlHcB8yugS67Vv6wqWl96969Ch8F47UyspxD166mozd1Elet_IP7li1y5X8Fl1A_UHPzisMttTXb_F1YwxQFw4mf-cCXenpl-DuR4w64n4btZfjn8SX0_YhW3E6rNBmFIM822T9-PMV3',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA8F60Jz2mDPFsI04iFi7BQqgk3R5dDj4ArSrLRwTyqYtJKR6GWNy4a0J-zDZOJBskCXGgl9uB3Hu1sEYw7mmyjoZkHgzdPczxMtU1UUjrNXPROXl8wat6VYINSpWaq3RzLTkah752WK2RxA1CJUalE2995G14q_uyV4vGlY84uv-0COtOrAeObxUqarE1DWFR0-OPJ4WWbenNXz1FyipCg1MqtCLY90glcurMKWkNqUztitbFXJpiKtElR9SXVfCuxsIHz6XAdPS7S',
    // Additional 6 pizzas for new menu items (index 3-8)
    '/pizza-images/Veggie PIzza.jpg', // Veggie Supreme (index 3)
    '/pizza-images/Meat Lovers Pizza.jpg', // Meat Lovers (index 4)
    '/pizza-images/Buffalo Chicken Pizza.jpg', // Buffalo Chicken (index 5)
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDSmf_5hWdQCb9x-2JTmEnpwgnTdwZjB6QuBn7H06XGUXHGZP5p5SvAG4wPqSWG3Hfhj2GW1P1LR30BKPH3O1XKGJwUtIs1yJCXrfdUSfb7tW1UPIPv7_uT6Yfk85r6vo6MvXP-tepHVtnYplF9kirhyb9V-3d0VqHR2uC8koUNhUODvYVaEjuF8NWoo-H2lMbv294IPQxFNrvRqa_aWHmIMnGhsAlpJQkz2vnglA_iMn1THI6kAAfEj7n0Ji3yoxL9S3MZ1oqMVLKS', // BBQ Chicken (index 6)
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCwrBG50BaFWryN9OTjlPNc37iX_DvDX7NE_1ZerWe-4Q9iOm_xsclUx_5O-ueQnVJ-Bu9HlMgQKsLIs-jcHmJSU2jHYN5Q7819ld93ChYUuz-Oa30_soe86ZSF76lutVNRLlHcB8yugS67Vv6wqWl96969Ch8F47UyspxD166mozd1Elet_IP7li1y5X8Fl1A_UHPzisMttTXb_F1YwxQFw4mf-cCXenpl-DuR4w64n4btZfjn8SX0_YhW3E6rNBmFIM822T9-PMV3', // Hawaiian (index 7)
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA8F60Jz2mDPFsI04iFi7BQqgk3R5dDj4ArSrLRwTyqYtJKR6GWNy4a0J-zDZOJBskCXGgl9uB3Hu1sEYw7mmyjoZkHgzdPczxMtU1UUjrNXPROXl8wat6VYINSpWaq3RzLTkah752WK2RxA1CJUalE2995G14q_uyV4vGlY84uv-0COtOrAeObxUqarE1DWFR0-OPJ4WWbenNXz1FyipCg1MqtCLY90glcurMKWkNqUztitbFXJpiKtElR9SXVfCuxsIHz6XAdPS7S', // Four Cheese (index 8)
  ];

  // Get display products (ALL products from state, or use defaults)
  // Map images similar to the API route logic
  console.log('🔍 Current state products:', state.products.length, state.products);
  const displayProducts = state.products.map((product, index) => {
    // Original 3 pizzas (id 1-3) use images 0-2
    // New pizzas (id 4+) cycle through images 3-8 (6 images for the 6 new pizza types)
    let imageIndex;
    if (product.id <= 3) {
      // Original pizzas
      imageIndex = product.id - 1; // id 1 -> index 0, id 2 -> index 1, id 3 -> index 2
    } else {
      // New pizzas - calculate which of the 6 new pizza types this is
      const newPizzaIndex = index - 3; // Subtract the original 3
      const imageOffset = newPizzaIndex % 6; // Cycle through 6 images
      imageIndex = 3 + imageOffset; // Start from index 3 (after original 3 images)
    }
    const imageUrl = pizzaImages[imageIndex] || pizzaImages[0];
    
    return {
      ...product,
      displayName: product.name || defaultProducts[index]?.name || `Pizza ${index + 1}`,
      displayPrice: product.price || defaultProducts[index]?.price || '$14',
      displayDescription: product.description || defaultProducts[index]?.description || 'Delicious wood-fired pizza',
      image: imageUrl,
    };
  });

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#fcf9f8] text-[#1b100d] antialiased">
      {/* Navigation */}
      <div className="w-full bg-[#fcf9f8] border-b border-solid border-[#f3e9e7]">
        <div className="px-4 md:px-10 py-3 flex items-center justify-between max-w-[1280px] mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center gap-4 text-[#1b100d] cursor-pointer">
            <div className="size-8 text-[#ec3713]">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Slice & Wood</h2>
          </div>
          {/* Desktop Nav & Cart */}
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-9">
              <a className="text-[#1b100d] text-sm font-medium leading-normal hover:text-[#ec3713] transition-colors cursor-pointer" href="#">Menu</a>
              <a className="text-[#1b100d] text-sm font-medium leading-normal hover:text-[#ec3713] transition-colors cursor-pointer" href="#">About Us</a>
              <a className="text-[#1b100d] text-sm font-medium leading-normal hover:text-[#ec3713] transition-colors cursor-pointer" href="#">Locations</a>
            </div>
            <button className="flex items-center gap-2 cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#ec3713] hover:bg-red-700 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              <span className="truncate hidden sm:inline">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full flex justify-center py-5 px-4 md:px-10">
        <div className="w-full max-w-[1280px]">
          <div className="flex min-h-[560px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-8 relative overflow-hidden" style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDSmf_5hWdQCb9x-2JTmEnpwgnTdwZjB6QuBn7H06XGUXHGZP5p5SvAG4wPqSWG3Hfhj2GW1P1LR30BKPH3O1XKGJwUtIs1yJCXrfdUSfb7tW1UPIPv7_uT6Yfk85r6vo6MvXP-tepHVtnYplF9kirhyb9V-3d0VqHR2uC8koUNhUODvYVaEjuF8NWoo-H2lMbv294IPQxFNrvRqa_aWHmIMnGhsAlpJQkz2vnglA_iMn1THI6kAAfEj7n0Ji3yoxL9S3MZ1oqMVLKS")`
          }}>
            <div className="flex flex-col gap-4 text-center z-10 max-w-[700px]">
              <h1 className="text-white text-5xl md:text-6xl font-black leading-tight tracking-[-0.033em] drop-shadow-md">
                Authentic Wood-Fired Taste
              </h1>
              <h2 className="text-gray-100 text-lg md:text-xl font-medium leading-relaxed drop-shadow-sm">
                Fresh ingredients, handmade dough, and classic recipes delivered piping hot to your door.
              </h2>
            </div>
            <button className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-[#ec3713] hover:bg-red-700 transition-all text-white text-base font-bold leading-normal tracking-[0.015em] z-10 shadow-lg mt-4">
              <span>Order Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="w-full flex justify-center pt-8 pb-2 px-4 md:px-10">
        <div className="w-full max-w-[1280px]">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-[#1b100d] text-3xl font-bold leading-tight tracking-[-0.015em] pb-2 border-b-4 border-[#ec3713]/20">Chef&apos;s Specials</h2>
          </div>
        </div>
      </div>

      {/* Image Grid (Specials) */}
      <div className="w-full flex justify-center pb-12 px-4 md:px-10">
        <div className="w-full max-w-[1280px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-6">
            {displayProducts.map((product, index) => {
              const price = product.displayPrice.replace('$', '');
              return (
                <div key={product.id || index} className="flex flex-col gap-4 group cursor-pointer">
                  <div 
                    className="w-full aspect-[4/3] bg-center bg-no-repeat bg-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow overflow-hidden relative" 
                    style={{ backgroundImage: `url("${product.image}")` }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <p className="text-[#1b100d] text-xl font-bold leading-normal">{product.displayName}</p>
                      <span className="bg-[#ec3713]/10 text-[#ec3713] px-2 py-1 rounded text-sm font-bold">${price}</span>
                    </div>
                    <p className="text-[#9a594c] text-sm font-normal leading-relaxed">{product.displayDescription}</p>
                    <button className="mt-3 w-full py-2 rounded-lg border border-[#ec3713] text-[#ec3713] hover:bg-[#ec3713] hover:text-white font-bold text-sm transition-colors cursor-pointer">Add to Cart</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="w-full flex justify-center pb-12 px-4 md:px-10">
        <div className="w-full max-w-[1280px]">
          <div className="mt-8 p-6 bg-gray-100 rounded-lg border-2 border-dashed border-gray-400">
            <h3 className="text-xl font-bold text-[#1b100d] mb-4">🎬 Demo Controls</h3>
            <p className="text-[#9a594c] mb-4 text-sm">
              Use these buttons to simulate website changes. These changes will be detected by the monitoring system.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔴 BUTTON CLICKED!');
                  handleAction('add-product');
                }}
                disabled={actionLoading !== null}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition-colors cursor-pointer"
              >
                {actionLoading === 'add-product' ? 'Adding...' : '➕ Add New Product'}
              </button>
              <button
                onClick={() => handleAction('change-price')}
                disabled={actionLoading !== null}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition-colors cursor-pointer"
              >
                {actionLoading === 'change-price' ? 'Changing...' : '💰 Change Price'}
              </button>
              <button
                onClick={() => handleAction('add-special')}
                disabled={actionLoading !== null}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition-colors cursor-pointer"
              >
                {actionLoading === 'add-special' ? 'Adding...' : '🎉 Add Special Offer'}
              </button>
              <button
                onClick={() => handleAction('reset')}
                disabled={actionLoading !== null}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition-colors cursor-pointer"
              >
                {actionLoading === 'reset' ? 'Resetting...' : '🔄 Reset to Original'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Version: {state.version} | Last Change: {state.lastChange ? new Date(state.lastChange).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-[#f3e9e7] mt-auto">
        <div className="px-4 md:px-40 py-10 flex justify-center">
          <footer className="flex flex-col gap-8 w-full max-w-[960px] text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-[#1b100d] mb-2">
                <svg className="size-6 text-[#ec3713]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                  <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
                <span className="font-bold text-lg">Slice & Wood</span>
              </div>
              <p className="text-[#9a594c] max-w-sm mx-auto">Hand-tossed, wood-fired, and made with love. Visit our locations or order online.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a className="text-[#9a594c] hover:text-[#ec3713] transition-colors text-base font-normal cursor-pointer" href="#">Privacy Policy</a>
              <a className="text-[#9a594c] hover:text-[#ec3713] transition-colors text-base font-normal cursor-pointer" href="#">Terms of Service</a>
              <a className="text-[#9a594c] hover:text-[#ec3713] transition-colors text-base font-normal cursor-pointer" href="#">Contact Us</a>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a className="group cursor-pointer" href="#">
                <span className="material-symbols-outlined text-[#9a594c] group-hover:text-[#ec3713] transition-colors text-[24px]">public</span>
              </a>
              <a className="group cursor-pointer" href="#">
                <span className="material-symbols-outlined text-[#9a594c] group-hover:text-[#ec3713] transition-colors text-[24px]">photo_camera</span>
              </a>
              <a className="group cursor-pointer" href="#">
                <span className="material-symbols-outlined text-[#9a594c] group-hover:text-[#ec3713] transition-colors text-[24px]">mail</span>
              </a>
            </div>
            <p className="text-[#9a594c]/70 text-sm font-normal">© 2024 Slice & Wood Pizzeria. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

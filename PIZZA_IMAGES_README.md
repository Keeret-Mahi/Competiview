# Pizza Images Setup

## Where to Add Your Images

Add your pizza images to the `public/pizza-images/` folder. For example:

```
public/
  pizza-images/
    margherita.jpg      (Original pizza 1)
    pepperoni.jpg       (Original pizza 2)
    truffle.jpg         (Original pizza 3)
    veggie-supreme.jpg  (New pizza 1 - Veggie Supreme)
    meat-lovers.jpg     (New pizza 2 - Meat Lovers)
    buffalo-chicken.jpg (New pizza 3 - Buffalo Chicken)
    bbq-chicken.jpg     (New pizza 4 - BBQ Chicken)
    hawaiian.jpg        (New pizza 5 - Hawaiian)
    four-cheese.jpg     (New pizza 6 - Four Cheese)
```

## How to Reference Images in Code

In Next.js, files in the `public` folder are served from the root path. So if you have:
- `public/pizza-images/margherita.jpg`

You reference it as:
- `/pizza-images/margherita.jpg`

## Current Image Array Structure

The images are defined in `app/api/demo/pizza-website/route.ts` in the `pizzaImages` array:

- **Index 0-2**: Original 3 pizzas (The Margherita, Pepperoni Classic, Truffle Mushroom)
- **Index 3**: Veggie Supreme (first new pizza)
- **Index 4**: Meat Lovers (second new pizza)
- **Index 5**: Buffalo Chicken (third new pizza)
- **Index 6**: BBQ Chicken (fourth new pizza)
- **Index 7**: Hawaiian (fifth new pizza)
- **Index 8**: Four Cheese (sixth new pizza)

## Example Code Update

To use your own images, update the `pizzaImages` array in `app/api/demo/pizza-website/route.ts`:

```typescript
const pizzaImages = [
  // Original 3 pizzas (index 0-2)
  '/pizza-images/margherita.jpg',
  '/pizza-images/pepperoni.jpg',
  '/pizza-images/truffle.jpg',
  // Additional 6 pizzas for new menu items (index 3-8)
  '/pizza-images/veggie-supreme.jpg',  // Veggie Supreme (index 3)
  '/pizza-images/meat-lovers.jpg',     // Meat Lovers (index 4)
  '/pizza-images/buffalo-chicken.jpg', // Buffalo Chicken (index 5)
  '/pizza-images/bbq-chicken.jpg',     // BBQ Chicken (index 6)
  '/pizza-images/hawaiian.jpg',        // Hawaiian (index 7)
  '/pizza-images/four-cheese.jpg',     // Four Cheese (index 8)
];
```

## Notes

- Supported image formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`
- Image names can be whatever you want, just make sure the paths match
- Images are served statically, so you'll need to restart the dev server after adding new images
- For production builds, images will be optimized automatically

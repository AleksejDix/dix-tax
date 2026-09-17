export default defineAppConfig({
  // Price per apartment for the first declaration, as shown in all copy.
  price: 'CHF 49.95',
  // Shown on the legal page. Replace with the real mailbox before launch.
  contactEmail: 'hello@dix.tax',
  // Independent reviews of the calculations. Leave empty until a review has really
  // happened: the "Independent review" block only renders entries listed here.
  // Example: { product: 'chZurich', name: 'Jane Doe', firm: 'Example Treuhand AG', date: '2026-11' }
  reviews: [] as { product: string; name: string; firm: string; date: string }[],
})

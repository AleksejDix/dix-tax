export default defineAppConfig({
  // Price per apartment for the first declaration, as shown in all copy.
  price: 'CHF 49.95',
  // Public contact address (an alias that delivers to the owner's mailbox).
  contactEmail: 'hello@dix.tax',
  // Operator details for the legal notice. Swiss law expects a name and a postal address
  // on a commercial website. Fill in what is empty; empty fields are simply not shown,
  // and the legal notice stays out of search engines until there is a street address.
  company: {
    name: 'Aleksej Dix',
    legalForm: '',
    street: '',
    postalCode: '',
    city: 'Zürich',
    // ISO code; the country name is shown in the reader's language
    countryCode: 'CH',
    uid: '',
  },
  // Date of the current privacy policy, shown at the top of that page.
  privacyUpdated: '2026-09-17',
  // Independent reviews of the calculations. Leave empty until a review has really
  // happened: the "Independent review" block only renders entries listed here.
  // Example: { product: 'chZurich', name: 'Jane Doe', firm: 'Example Treuhand AG', date: '2026-11' }
  reviews: [] as { product: string; name: string; firm: string; date: string }[],
})

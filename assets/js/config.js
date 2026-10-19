/*
 * Site settings. Edit this file instead of digging through main.js.
 */
window.SITE_CONFIG = {
  // GitHub username used for the "More on GitHub" section.
  githubUser: 'Georgezach24',

  // Repos that are already shown as featured cards, or that you don't want listed.
  hiddenRepos: ['personal', 'Real-Time-Graphics-Pattern-Renderer', 'NLP', 'Order-System'],

  // Maximum number of extra repos to show.
  maxRepos: 6,

  // Email is split up so simple scrapers can't harvest it from the HTML.
  email: { user: 'giorgoszaxos2003', domain: 'gmail.com' },

  /*
   * Where the contact form sends messages:
   *   ''                                  -> opens the visitor's email app, pre-filled (works anywhere, no setup)
   *   'https://formspree.io/f/<your-id>'  -> recommended on GitHub Pages (free; create a form at formspree.io)
   *   'api/contact.php'                   -> use on PHP hosting (see api/config.example.php)
   */
  contactEndpoint: ''
};

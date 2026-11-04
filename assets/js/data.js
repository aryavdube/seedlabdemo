/* ==========================================================================
   SEED Lab — CONTENT FILE
   --------------------------------------------------------------------------
   This is the ONE file to edit for people, publications and news.
   Everything on team.html, publications.html, news.html and the home page
   previews is generated from the arrays below.

   • To add a person: copy one object in TEAM and change the fields.
     - photo: leave '' to use the generated seed-pattern placeholder,
              or set e.g. 'assets/img/team/jane-doe.webp'
     - group: one of 'pi' | 'postdoc' | 'grad' | 'staff' | 'undergrad'
   • To add a publication: copy one object in PUBLICATIONS.
     - Bold the lab members by wrapping them in **double asterisks**.
   • To add news: copy one object in NEWS.
   • Links (doi, pdf, code, href, links.*): use full https:// URLs or site
     paths. Leave '' (or '#') while unknown — empty links are hidden.
   • email: only real, consented addresses. Leave '' for sample people.
   ========================================================================== */

window.SEED = window.SEED || {};

// Shows a "preview / placeholder content" notice on every page.
// Set to false once the sample people, papers, news and studies are replaced.
window.SEED.PREVIEW = true;

window.SEED.TEAM = [
  {
    name: 'Brittany Wolff, Ph.D.',
    role: 'Principal Investigator',
    group: 'pi',
    photo: '',
    email: 'bwolff@mednet.ucla.edu',
    focus: 'Developmental paraphenotypes · Psychosis & bipolar spectrum',
    bio: 'Dr. Wolff directs the SEED Laboratory at the UCLA Semel Institute for Neuroscience and Human Behavior, affiliated with Child & Adolescent Psychiatry and Psychology. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
    education: 'Ph.D. — Institution (Year)',
    links: { profile: '#', scholar: '#', cv: '#' }
  },
  { name: 'Group Member 1', role: 'Postdoctoral Scholar', group: 'postdoc', photo: '', email: '', focus: 'Research focus placeholder', bio: 'Short bio placeholder. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.', education: 'Ph.D. — Institution (Year)', links: { profile: '#' } },
  { name: 'Group Member 2', role: 'Postdoctoral Scholar', group: 'postdoc', photo: '', email: '', focus: 'Research focus placeholder', bio: 'Short bio placeholder. Donec ullamcorper nulla non metus auctor fringilla. Cras mattis consectetur purus sit amet fermentum.', education: 'Ph.D. — Institution (Year)', links: { profile: '#' } },
  { name: 'Group Member 3', role: 'Graduate Student', group: 'grad', photo: '', email: '', focus: 'Research focus placeholder', bio: 'Short bio placeholder. Aenean lacinia bibendum nulla sed consectetur. Maecenas faucibus mollis interdum.', education: 'B.A. — Institution (Year)', links: { profile: '#' } },
  { name: 'Group Member 4', role: 'Graduate Student', group: 'grad', photo: '', email: '', focus: 'Research focus placeholder', bio: 'Short bio placeholder. Nullam quis risus eget urna mollis ornare vel eu leo.', education: 'B.S. — Institution (Year)', links: { profile: '#' } },
  { name: 'Group Member 5', role: 'Research Coordinator', group: 'staff', photo: '', email: '', focus: 'Study coordination & family outreach', bio: 'Short bio placeholder. Etiam porta sem malesuada magna mollis euismod.', education: 'B.A. — Institution (Year)', links: {} },
  { name: 'Group Member 6', role: 'Data Scientist', group: 'staff', photo: '', email: '', focus: 'Computational methods', bio: 'Short bio placeholder. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh.', education: 'M.S. — Institution (Year)', links: { github: '#' } },
  { name: 'Group Member 7', role: 'Undergraduate Research Assistant', group: 'undergrad', photo: '', email: '', focus: 'Major · Class of 20XX', bio: 'Short bio placeholder. Sed posuere consectetur est at lobortis.', education: 'UCLA — Major (Expected 20XX)', links: {} },
  { name: 'Group Member 8', role: 'Undergraduate Research Assistant', group: 'undergrad', photo: '', email: '', focus: 'Major · Class of 20XX', bio: 'Short bio placeholder. Cum sociis natoque penatibus et magnis dis parturient montes.', education: 'UCLA — Major (Expected 20XX)', links: {} },
  { name: 'Group Member 9', role: 'Undergraduate Research Assistant', group: 'undergrad', photo: '', email: '', focus: 'Major · Class of 20XX', bio: 'Short bio placeholder. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.', education: 'UCLA — Major (Expected 20XX)', links: {} },
  { name: 'Group Member 10', role: 'Undergraduate Research Assistant', group: 'undergrad', photo: '', email: '', focus: 'Major · Class of 20XX', bio: 'Short bio placeholder. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.', education: 'UCLA — Major (Expected 20XX)', links: {} },
  { name: 'Group Member 11', role: 'Undergraduate Research Assistant', group: 'undergrad', photo: '', email: '', focus: 'Major · Class of 20XX', bio: 'Short bio placeholder. Vestibulum id ligula porta felis euismod semper.', education: 'UCLA — Major (Expected 20XX)', links: {} }
];

window.SEED.ALUMNI = [
  { name: 'Alum 1', next: 'Now: Position, Institution' },
  { name: 'Alum 2', next: 'Now: Position, Institution' },
  { name: 'Alum 3', next: 'Now: Position, Institution' },
  { name: 'Alum 4', next: 'Now: Position, Institution' },
  { name: 'Alum 5', next: 'Now: Position, Institution' },
  { name: 'Alum 6', next: 'Now: Position, Institution' }
];

window.SEED.PUBLICATIONS = [
  { title: 'Publication Title 1', authors: '**Wolff, B.**, Author, A., & Author, B.', venue: 'Journal Name', year: 2026, type: 'Journal Article', tags: ['Bipolar spectrum', 'Development'], doi: '#', pdf: '#', featured: true, image: 'assets/img/sprouts-field.webp' },
  { title: 'Publication Title 2', authors: 'Author, A., **Wolff, B.**, & Author, C.', venue: 'Journal Name', year: 2026, type: 'Preprint', tags: ['Digital phenotyping'], doi: '#', pdf: '#', featured: true, image: 'assets/img/phone-dark.webp' },
  { title: 'Publication Title 3', authors: '**Wolff, B.**, Author, D., Author, E., & Author, F.', venue: 'Journal Name', year: 2025, type: 'Journal Article', tags: ['Psychosis', 'Neurocognition'], doi: '#', pdf: '#', code: '#', featured: true, image: 'assets/img/glass-brain.webp' },
  { title: 'Publication Title 4', authors: 'Author, G., Author, H., & **Wolff, B.**', venue: 'Conference Name', year: 2025, type: 'Conference', tags: ['Computational methods'], doi: '#', featured: true, image: 'assets/img/canopy.webp' },
  { title: 'Publication Title 5', authors: '**Wolff, B.**, & Author, I.', venue: 'Journal Name', year: 2025, type: 'Journal Article', tags: ['Familial liability'], doi: '#', pdf: '#', image: 'assets/img/roots-falls.webp' },
  { title: 'Publication Title 6', authors: 'Author, J., **Wolff, B.**, Author, K., & Author, L.', venue: 'Journal Name', year: 2024, type: 'Journal Article', tags: ['EHR', 'Risk prediction'], doi: '#', image: 'assets/img/mri-grid.webp' },
  { title: 'Publication Title 7', authors: '**Wolff, B.**, Author, M., & Author, N.', venue: 'Book Title (Eds.)', year: 2024, type: 'Book Chapter', tags: ['Review'], doi: '#', image: 'assets/img/leaf-veins.webp' },
  { title: 'Publication Title 8', authors: 'Author, O., & **Wolff, B.**', venue: 'Journal Name', year: 2023, type: 'Journal Article', tags: ['Physiology'], doi: '#', pdf: '#', image: 'assets/img/moss.webp' },
  { title: 'Publication Title 9', authors: '**Wolff, B.**, Author, P., Author, Q., & Author, R.', venue: 'Journal Name', year: 2023, type: 'Journal Article', tags: ['Social determinants'], doi: '#', image: 'assets/img/kids-circle.webp' },
  { title: 'Publication Title 10', authors: 'Author, S., **Wolff, B.**, & Author, T.', venue: 'Conference Name', year: 2022, type: 'Conference', tags: ['Development'], doi: '#', image: 'assets/img/fern-dark.webp' },
  { title: 'Publication Title 11', authors: '**Wolff, B.**, & Author, U.', venue: 'Journal Name', year: 2022, type: 'Journal Article', tags: ['Bipolar spectrum'], doi: '#', pdf: '#', image: 'assets/img/fog-valley.webp' },
  { title: 'Publication Title 12', authors: 'Author, V., Author, W., & **Wolff, B.**', venue: 'Journal Name', year: 2021, type: 'Journal Article', tags: ['Psychosis'], doi: '#', image: 'assets/img/branches-muted.webp' }
];

window.SEED.NEWS = [
  { title: 'News Headline 1 — lab receives new funding', date: '2026-09-15', category: 'Funding', excerpt: 'Short summary placeholder. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.', image: 'assets/img/sprout-soil.webp', href: '#' },
  { title: 'News Headline 2 — welcome to our new members', date: '2026-09-01', category: 'Lab life', excerpt: 'Short summary placeholder. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.', image: 'assets/img/royce-arcade.webp', href: '#' },
  { title: 'News Headline 3 — new paper published', date: '2026-07-20', category: 'Publication', excerpt: 'Short summary placeholder. Duis aute irure dolor in reprehenderit in voluptate velit esse.', image: 'assets/img/dandelion-dark.webp', href: '#' },
  { title: 'News Headline 4 — talk at a conference', date: '2026-05-10', category: 'Talk', excerpt: 'Short summary placeholder. Excepteur sint occaecat cupidatat non proident.', image: 'assets/img/fog-forest.webp', href: '#' },
  { title: 'News Headline 5 — study recruitment opens', date: '2026-03-02', category: 'Study', excerpt: 'Short summary placeholder. Sunt in culpa qui officia deserunt mollit anim id est laborum.', image: 'assets/img/kids-running.webp', href: '#' },
  { title: 'News Headline 6 — award announcement', date: '2026-01-18', category: 'Award', excerpt: 'Short summary placeholder. Sed ut perspiciatis unde omnis iste natus error sit voluptatem.', image: 'assets/img/road-aerial.webp', href: '#' }
];

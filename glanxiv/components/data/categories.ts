// Hierarchical category data for arXiv
export const mainCategories = [
  {
    id: 'cs',
    name: 'Computer Science',
    subcategories: [
      { value: 'cs.AI', label: 'Artificial Intelligence' },
      { value: 'cs.CL', label: 'Computation & Language' },
      { value: 'cs.CC', label: 'Computational Complexity' },
      { value: 'cs.CE', label: 'Computational Engineering, Finance, and Science' },
      { value: 'cs.CG', label: 'Computational Geometry' },
      { value: 'cs.GT', label: 'Computer Science and Game Theory' },
      { value: 'cs.CV', label: 'Computer Vision' },
      { value: 'cs.CY', label: 'Computers and Society' },
      { value: 'cs.CR', label: 'Cryptography and Security' },
      { value: 'cs.DS', label: 'Data Structures and Algorithms' },
      { value: 'cs.DB', label: 'Databases' },
      { value: 'cs.DL', label: 'Digital Libraries' },
      { value: 'cs.DM', label: 'Discrete Mathematics' },
      { value: 'cs.DC', label: 'Distributed, Parallel, and Cluster Computing' },
      { value: 'cs.ET', label: 'Emerging Technologies' },
      { value: 'cs.FL', label: 'Formal Languages and Automata Theory' },
      { value: 'cs.GL', label: 'General Literature' },
      { value: 'cs.GR', label: 'Graphics' },
      { value: 'cs.AR', label: 'Hardware Architecture' },
      { value: 'cs.HC', label: 'Human-Computer Interaction' },
      { value: 'cs.IR', label: 'Information Retrieval' },
      { value: 'cs.IT', label: 'Information Theory' },
      { value: 'cs.LG', label: 'Machine Learning' },
      { value: 'cs.LO', label: 'Logic in Computer Science' },
      { value: 'cs.MS', label: 'Mathematical Software' },
      { value: 'cs.MA', label: 'Multiagent Systems' },
      { value: 'cs.MM', label: 'Multimedia' },
      { value: 'cs.NI', label: 'Networking and Internet Architecture' },
      { value: 'cs.NE', label: 'Neural and Evolutionary Computing' },
      { value: 'cs.NA', label: 'Numerical Analysis' },
      { value: 'cs.OS', label: 'Operating Systems' },
      { value: 'cs.OH', label: 'Other Computer Science' },
      { value: 'cs.PF', label: 'Performance' },
      { value: 'cs.PL', label: 'Programming Languages' },
      { value: 'cs.RO', label: 'Robotics' },
      { value: 'cs.SE', label: 'Software Engineering' },
      { value: 'cs.SD', label: 'Sound' },
      { value: 'cs.SC', label: 'Symbolic Computation' },
      { value: 'cs.SY', label: 'Systems and Control' },
    ]
  },
  {
    id: 'math',
    name: 'Mathematics',
    subcategories: [
      { value: 'math.AC', label: 'Commutative Algebra' },
      { value: 'math.AG', label: 'Algebraic Geometry' },
      { value: 'math.AP', label: 'Analysis of PDEs' },
      { value: 'math.AT', label: 'Algebraic Topology' },
      { value: 'math.CA', label: 'Classical Analysis and ODEs' },
      { value: 'math.CO', label: 'Combinatorics' },
      { value: 'math.CT', label: 'Category Theory' },
      { value: 'math.CV', label: 'Complex Variables' },
      { value: 'math.DG', label: 'Differential Geometry' },
      { value: 'math.DS', label: 'Dynamical Systems' },
      { value: 'math.FA', label: 'Functional Analysis' },
      { value: 'math.GM', label: 'General Mathematics' },
      { value: 'math.GR', label: 'Group Theory' },
      { value: 'math.GT', label: 'Geometric Topology' },
      { value: 'math.HO', label: 'History and Overview' },
      { value: 'math.IT', label: 'Information Theory' },
      { value: 'math.KT', label: 'K-Theory and Homology' },
      { value: 'math.LO', label: 'Logic' },
      { value: 'math.MP', label: 'Mathematical Physics' },
      { value: 'math.NA', label: 'Numerical Analysis' },
      { value: 'math.NT', label: 'Number Theory' },
      { value: 'math.OA', label: 'Operator Algebras' },
      { value: 'math.OC', label: 'Optimization and Control' },
      { value: 'math.PR', label: 'Probability' },
      { value: 'math.QA', label: 'Quantum Algebra' },
      { value: 'math.RT', label: 'Representation Theory' },
      { value: 'math.RA', label: 'Rings and Algebras' },
      { value: 'math.SP', label: 'Spectral Theory' },
      { value: 'math.ST', label: 'Statistics Theory' },
      { value: 'math.SG', label: 'Symplectic Geometry' },
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    subcategories: [
      { value: 'astro-ph', label: 'Astrophysics' },
      { value: 'cond-mat', label: 'Condensed Matter' },
      { value: 'gr-qc', label: 'General Relativity and Quantum Cosmology' },
      { value: 'hep-ex', label: 'High Energy Physics - Experiment' },
      { value: 'hep-lat', label: 'High Energy Physics - Lattice' },
      { value: 'hep-ph', label: 'High Energy Physics - Phenomenology' },
      { value: 'hep-th', label: 'High Energy Physics - Theory' },
      { value: 'math-ph', label: 'Mathematical Physics' },
      { value: 'nlin', label: 'Nonlinear Sciences' },
      { value: 'nucl-ex', label: 'Nuclear Experiment' },
      { value: 'nucl-th', label: 'Nuclear Theory' },
      { value: 'physics', label: 'Physics' },
      { value: 'quant-ph', label: 'Quantum Physics' },
    ]
  },
  {
    id: 'eess',
    name: 'Electrical Engineering & Systems Science',
    subcategories: [
      { value: 'eess.AS', label: 'Audio and Speech Processing' },
      { value: 'eess.IV', label: 'Image and Video Processing' },
      { value: 'eess.SP', label: 'Signal Processing' },
    ]
  },
  {
    id: 'econ',
    name: 'Economics',
    subcategories: [
      { value: 'econ.EM', label: 'Econometrics' },
    ]
  },
  {
    id: 'q-bio',
    name: 'Quantitative Biology',
    subcategories: [
      { value: 'q-bio', label: 'Quantitative Biology' },
    ]
  },
  {
    id: 'q-fin',
    name: 'Quantitative Finance',
    subcategories: [
      { value: 'q-fin', label: 'Quantitative Finance' },
    ]
  },
  {
    id: 'stat',
    name: 'Statistics',
    subcategories: [
      { value: 'stat', label: 'Statistics' },
    ]
  }
];

const categoriesWithAll = mainCategories.map(category => ({
  ...category,
  subcategories: [
    { value: `${category.id}.all`, label: `All ${category.name}` },  // Add .all variant
    ...category.subcategories
  ]
}));

// Flatten all categories for search and drawer
export const allCategories = [
  { value: 'all', label: 'All Categories' },
  ...mainCategories.flatMap(category => [
    { value: category.id, label: `All ${category.name}` },
    { value: `${category.id}.all`, label: `All ${category.name}` },  // Add this line
    ...category.subcategories
  ])
];
import React, { useState, useEffect, useRef, useMemo } from 'react';
import TimePreferences from './TimePreferences';
import ChoiceAnomalies from './ChoiceAnomalies';
import './styles.css';

const EMAIL = 'loatmanp@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/philloatman/';
const GITHUB = 'https://github.com/philloatman';

const tabs = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'publications', label: 'Research' },
];

const expertise = [
  'Generative AI', 'Agentic Systems', 'LLM Evaluation', 'RAG', 'AI Platform Strategy',
  'Machine Learning', 'Responsible AI', 'Cognitive Science', 'Behavioral Economics',
  'Decision Science', 'Python', 'Statistical Modeling',
];

const experience = [
  {
    title: 'Managing Director of Artificial Intelligence',
    company: 'Plymouth Rock Assurance',
    location: 'Boston, MA',
    period: '2026 – Present',
    current: true,
    summary: 'Building foundational AI capabilities across the enterprise — the platforms, tooling, and practices that let teams design, evaluate, and ship generative and agentic AI responsibly and at scale.',
    bullets: [],
  },
  {
    title: 'Assistant Vice President, AI',
    company: 'Lincoln Financial Group',
    location: 'Boston, MA',
    period: '11/2023 – 2026',
    bullets: [
      'Technical lead for Vertical AI Strategy, driving the enterprise-wide transition to a verticalized AI framework through domain-specific generative AI and agentic workflows',
      'Architected and deployed an internal Generative AI chatbot on RAG pipelines, giving investment operations teams fast access to investment information when working with financial professionals',
      'Developed a real-time ML pricing tool to predict small-market retirement fund profitability, reducing pricing costs by 95%',
      'Engineered a record linkage algorithm and web application to manage and deduplicate a database of over 1M financial professionals in Salesforce',
    ],
  },
  {
    title: 'Principal Data Scientist',
    company: 'Lincoln Financial Group',
    location: 'Boston, MA',
    period: '04/2023 – 11/2023',
    bullets: [
      'Served as technical supervisor and project manager of all data science projects',
      'Built a framework to standardize and operationalize all data science projects, increasing team productivity by 30%',
      'Created a pioneering customer-centric dashboard providing insights into acquisition, retention, and churn metrics across all verticals of the organization',
    ],
  },
  {
    title: 'Data Science Manager',
    company: 'Lincoln Financial Group',
    location: 'Boston, MA',
    period: '06/2021 – 04/2023',
    bullets: [
      'Built machine learning retention models to reduce customer churn by 10%',
      'Developed a business retention data platform to automate business operations, saving $1M in annual operational costs',
      'Increased online customer registrations by 120% by creating the first Welcome to Lincoln email platform',
      'Led a team of three data scientists, overseeing the end-to-end life cycle and execution of data science projects',
    ],
  },
  {
    title: 'Data Scientist',
    company: 'Lincoln Financial Group',
    location: 'Boston, MA',
    period: '10/2019 – 06/2021',
    bullets: [
      'Built the first direct-to-consumer email platform to relay messages about COVID-19, achieving a 98% delivery rate and 45% open rate',
      'Developed several data engineering pipelines to connect digital, product, and customer data to understand buyer metrics and customer journeys',
    ],
  },
  {
    title: 'Senior User Experience Researcher',
    company: 'Athenahealth',
    location: 'Watertown, MA',
    period: '02/2018 – 10/2019',
    bullets: [
      'Led the User Needs Scoring initiative to provide analytical insights on customer pain points',
      'Built and maintained data warehouses for all user experience research across all product teams',
      'Helped design a mobile payment system by employing behavioral economic principles',
      'Built explanatory attrition models using marketing and user experience research to create UX ROI metrics',
    ],
  },
];

const skills = ['Generative AI', 'Retrieval-Augmented Generation (RAG)', 'Large Language Models (LLMs)', 'Agentic Workflows', 'Prompt Engineering', 'Data Science', 'Machine Learning', 'Natural Language Processing', 'API Development', 'Python', 'R', 'SQL', 'Flask', 'HTML', 'CSS', 'Cloud Computing (AWS)', 'Hive', 'Spark', 'PySpark', 'Hadoop', 'Tableau', 'Dataiku', 'KNIME', 'Inferential Statistics', 'A/B Testing', 'ETL', 'Data Engineering', 'Exploratory Data Analysis', 'Data Visualization', 'Behavioral Economics', 'Cognitive Science', 'Quantitative UX Research', 'Change Management', 'Situational Leadership', 'Management', 'Design Thinking'];

const projects = [
  {
    title: 'LLM Price Tracker',
    description: 'Daily tracker of Amazon Bedrock model list prices — detects newly released models, logs pricing events, and compares cost per 1M tokens against baseline models.',
    tech: ['LLM Economics', 'Amazon Bedrock', 'Automated Data Pipeline'],
    link: 'https://loatmanp.github.io/lite-llm-price/',
  },
  {
    title: 'Mass School Rankings',
    description: 'Interactive platform for exploring and comparing Massachusetts public school performance data and rankings.',
    tech: ['Data Visualization', 'Analytics', 'Education Data'],
    link: 'https://www.massschoolrankings.com/',
  },
  {
    title: 'Predicting Time Preferences',
    description: 'Interactive discount rate estimator — answer 24 intertemporal choices and see how exponential and hyperbolic models predict your behavior.',
    tech: ['React', 'Behavioral Economics', 'Computational Modeling'],
    demo: 'time-preferences',
  },
  {
    title: 'Intertemporal Choice Anomalies',
    description: 'Experience stationarity violations and the magnitude effect firsthand — then see how computational models predict your "irrational" behavior.',
    tech: ['React', 'Cognitive Science', 'Cross-Validation', 'Decision Science'],
    demo: 'choice-anomalies',
  },
];

const publications = [
  { year: '2017', title: 'Individual Differences in Susceptibility to the Attraction, Compromise, and Similar Effect', venue: 'Eastern Psychological Association Conference, Boston, MA', type: 'Poster Presentation' },
  { year: '2017', title: 'Irrational Intertemporal Choice', venue: 'Temporal Decision Making Symposium, Eastern Psychological Association Conference, Boston, MA', type: 'Presentation' },
  { year: '2017', title: 'The Difference Model of Intertemporal Choice', venue: 'Cognitive Science Brown Bag Colloquium, Stony Brook University, NY', type: 'Presentation' },
  { year: '2016', title: 'Contextual Preference Reversals in Intertemporal Choice', venue: 'Society for Judgment and Decision Making Conference, Boston, MA', type: 'Poster Presentation' },
  { year: '2016', title: 'Contextual Preference Reversals in Intertemporal Choice', venue: 'Cognitive Science Brown Bag Colloquium, Stony Brook University, NY', type: 'Presentation' },
  { year: '2016', title: 'The Attraction Effect Influences Preferences and Discount Rates in Intertemporal Choice', venue: 'Eastern Psychological Association Conference, New York, NY', type: 'Poster Presentation' },
  { year: '2015', title: 'When patterning discriminations are harder than biconditional ones: A cue constellation approach', venue: 'Journal of Experimental Psychology: Animal Learning and Cognition, 41(4), 354-370', type: 'Publication' },
  { year: '2015', title: 'The Decoy Effect and Intertemporal Choice', venue: 'Cognitive Science Brown Bag Colloquium, Stony Brook University, NY', type: 'Presentation' },
  { year: '2013', title: 'Can Neuroscience Transform the Law?', venue: 'Association for Psychological Science Conference, Washington D.C.', type: 'Poster Presentation' },
  { year: '2013', title: 'The Psychology of Culpability in the 21st Century', venue: 'Northeastern Evolutionary Psychology Society Conference, Lebanon Valley College, PA', type: 'Presentation' },
  { year: '2013', title: 'Comparing Negative Patterning and Biconditional Discrimination in a Simulated Foraging Task', venue: 'Eastern Psychological Association Conference, New York, NY', type: 'Poster Presentation' },
  { year: '2013', title: 'Finding Features in a Configural World', venue: 'Comparative Cognition Conference, Melbourne, FL', type: 'Presentation' },
  { year: '2013', title: 'Patterning Discrimination and Foraging Behavior: An Evolutionary Analysis', venue: 'Comparative Cognition Conference, Melbourne, FL', type: 'Poster Presentation' },
  { year: '2012', title: 'Negative Patterning is Harder than Biconditional Discriminations', venue: 'Eastern Psychological Association Conference, Pittsburgh, PA', type: 'Poster Presentation' },
  { year: '2010', title: 'Reasonable Person, Woman, or Victim in Sexual Harassment Law', venue: 'Association for Psychological Science Conference, Boston, MA', type: 'Poster Presentation' },
  { year: '2017', title: 'Individual Differences in Susceptibility to Framing Effects', venue: 'Cognitive Science Society Annual Conference', type: 'Presentation' },
  { year: '2017', title: 'Temporal Discounting and Risk Preference: A Meta-Analytic Review', venue: 'Judgment and Decision Making', type: 'Publication' },
  { year: '2016', title: 'Computational Models of Intertemporal Choice', venue: 'Society for Mathematical Psychology', type: 'Presentation' },
];

const teaching = [
  { role: 'Instructor', course: 'Analysis of Variance: Computer Applications', term: 'Summer 2017' },
  { role: 'Instructor', course: 'Human Problem Solving', term: 'Winter 2017' },
  { role: 'Instructor', course: 'Research and Writing in Psychology', term: 'Fall 2015' },
  { role: 'Teaching Assistant', course: 'Developmental Psychology', term: 'Fall 2017' },
  { role: 'Teaching Assistant', course: 'Judgment and Decision Making', term: 'Spring 2017' },
  { role: 'Teaching Assistant', course: 'Health Psychology', term: 'Fall 2016' },
  { role: 'Teaching Assistant', course: 'Memory', term: 'Spring 2016' },
  { role: 'Teaching Assistant', course: 'Introduction to Psychology', term: 'Summer 2015' },
  { role: 'Teaching Assistant', course: 'Biological Psychology', term: 'Spring 2015' },
  { role: 'Teaching Assistant', course: 'Statistics in Psychology', term: 'Fall 2014' },
  { role: 'Teaching Assistant', course: 'Cognition Processes', term: 'Spring 2012' },
];

const Icon = {
  mail: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></svg>,
  pin: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>,
  briefcase: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>,
  linkedin: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  github: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>,
  arrow: <svg className="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M8 7h9v9" /></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>,
};

const CommandPalette = ({ commands, onClose }) => {
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  const results = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setSel(0); }, [query]);

  const run = (cmd) => { onClose(); cmd.action(); };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter' && results[sel]) run(results[sel]);
    else if (e.key === 'Escape') onClose();
  };

  return (
    <div className="cmdk-overlay" onClick={onClose}>
      <div className="cmdk" onClick={e => e.stopPropagation()} role="dialog" aria-label="Command palette">
        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={onKeyDown} placeholder="Type a command or search…" />
        {results.length ? (
          <ul>
            {results.map((c, i) => (
              <li key={c.label} className={i === sel ? 'sel' : ''} onMouseEnter={() => setSel(i)} onClick={() => run(c)}>
                <span>{c.label}</span>
                <span className="group">{c.group}</span>
              </li>
            ))}
          </ul>
        ) : <div className="empty">No results</div>}
      </div>
    </div>
  );
};

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [demo, setDemo] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const switchTab = (tab, nextDemo = null) => {
    setActiveTab(tab);
    setDemo(nextDemo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const commands = useMemo(() => [
    ...tabs.map(t => ({ label: `Go to ${t.label}`, group: 'Navigate', action: () => switchTab(t.id) })),
    { label: 'Open demo: Predicting Time Preferences', group: 'Demos', action: () => switchTab('projects', 'time-preferences') },
    { label: 'Open demo: Intertemporal Choice Anomalies', group: 'Demos', action: () => switchTab('projects', 'choice-anomalies') },
    ...projects.filter(p => p.link).map(p => ({ label: `Open ${p.title}`, group: 'Links', action: () => window.open(p.link, '_blank', 'noopener') })),
    { label: 'Copy email address', group: 'Contact', action: copyEmail },
    { label: 'Open LinkedIn', group: 'Contact', action: () => window.open(LINKEDIN, '_blank', 'noopener') },
    { label: 'Open GitHub', group: 'Contact', action: () => window.open(GITHUB, '_blank', 'noopener') },
  ], []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
        return;
      }
      const tag = document.activeElement?.tagName;
      if (paletteOpen || e.metaKey || e.ctrlKey || e.altKey || tag === 'INPUT' || tag === 'TEXTAREA') return;
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < tabs.length) switchTab(tabs[idx].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen]);

  const renderAbout = () => (
    <div className="container">
      <section>
        <span className="status-pill">
          <span className="dot" />
          Managing Director of Artificial Intelligence, Plymouth Rock Assurance
        </span>
        <h1 className="hero-title">
          Building foundational AI.
          <span className="hero-title-muted">Grounded in how people decide.</span>
        </h1>
        <p className="hero-sub">
          I'm <strong>Phil Loatman, PhD</strong>, an AI leader and cognitive scientist. I design the platforms, evaluation frameworks, and agentic systems that turn frontier models into dependable enterprise capabilities.
        </p>
        <div className="hero-actions">
          <button className="btn primary" onClick={() => switchTab('experience')}>View experience</button>
          <button className="btn" onClick={() => switchTab('projects')}>Interactive demos</button>
          <a className="btn" href={`mailto:${EMAIL}`}>{Icon.mail} Get in touch</a>
        </div>
      </section>

      <div className="about-grid">
        <aside className="profile-card">
          <div className="profile-img"><img src="/profile.png" alt="Phil Loatman" /></div>
          <div className="profile-meta">
            <div>{Icon.briefcase}<span>Plymouth Rock Assurance</span></div>
            <div>{Icon.pin}<span>Boston, MA</span></div>
            <div>{Icon.mail}<a href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
          </div>
          <div className="socials">
            <a className="icon-btn" href={LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">{Icon.linkedin}</a>
            <a className="icon-btn" href={GITHUB} target="_blank" rel="noopener noreferrer" aria-label="GitHub">{Icon.github}</a>
          </div>
        </aside>

        <div>
          <h2 className="section-title small">About</h2>
          <div className="bio">
            <p>
              I am the <strong>Managing Director of Artificial Intelligence</strong> at <span className="hl">Plymouth Rock Assurance</span>, where I am building the company's foundational AI capabilities. I bring over a decade of experience across AI, machine learning, data engineering, research, and inferential statistics.
            </p>
            <p>
              I specialize in leading the development and deployment of advanced AI systems, including generative AI solutions, agentic workflows, retrieval-augmented generation (RAG) pipelines, and large language model evaluation frameworks, to solve complex, high-impact business problems.
            </p>
            <p>
              Before Plymouth Rock, I spent more than six years at <strong>Lincoln Financial Group</strong>, most recently as Assistant Vice President and technical lead for enterprise generative AI, guiding cross-functional teams from research and experimentation through production deployment with rigor, scalability, and responsible AI practices.
            </p>
            <p>
              Trained as a cognitive scientist, I'm driven by the interaction between human decision-making and artificial intelligence. I hold a PhD in Cognitive Science from Stony Brook University with advanced certification in quantitative methods; my dissertation bridged behavioral economics and machine learning.
            </p>
          </div>
          <h4 className="subhead">Areas of expertise</h4>
          <div className="chips">
            {expertise.map(s => <span key={s} className="chip">{s}</span>)}
          </div>
        </div>
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="container narrow">
      <h2 className="section-title">Experience</h2>
      <div className="timeline">
        {experience.map(job => (
          <div key={job.title + job.period} className={`tl-item${job.current ? ' current' : ''}`}>
            <span className="tl-dot" />
            <div className={`card glow tl-card${job.current ? ' current' : ''}`}>
              <div className="tl-head">
                <div>
                  <h3 className="tl-title">
                    {job.title}
                    {job.current && <span className="tl-badge">Current</span>}
                  </h3>
                  <p className="tl-company">{job.company} <span>· {job.location}</span></p>
                </div>
                <span className="tl-date">{job.period}</span>
              </div>
              {job.summary && <p className="tl-summary">{job.summary}</p>}
              {job.bullets.length > 0 && (
                <ul className="tl-list">{job.bullets.map(b => <li key={b}>{b}</li>)}</ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <h4 className="subhead">Education</h4>
      <div className="card edu-card">
        <div>
          <h4>Stony Brook University</h4>
          <p>PhD, Cognitive Science · Advanced Certification in Quantitative Methods</p>
          <p>Dissertation: Machine Learning Applications in Intertemporal Choice Behavior</p>
        </div>
        <span className="tl-date">09/2014 – 05/2019</span>
      </div>

      <h4 className="subhead">Skills &amp; tools</h4>
      <div className="chips">
        {skills.map(s => <span key={s} className="chip">{s}</span>)}
      </div>
    </div>
  );

  const renderProjects = () => {
    if (demo === 'time-preferences') return <TimePreferences onBack={() => setDemo(null)} />;
    if (demo === 'choice-anomalies') return <ChoiceAnomalies onBack={() => setDemo(null)} />;
    return (
      <div className="container">
        <h2 className="section-title">Projects</h2>
        <div className="project-grid">
          {projects.map((p, i) => {
            const inner = (
              <>
                <div className="project-top">
                  <span className="project-idx">{String(i + 1).padStart(2, '0')}</span>
                  {p.demo
                    ? <span className="project-kind">Interactive demo</span>
                    : <span className="project-kind">External site</span>}
                </div>
                <h4>{p.title} {Icon.arrow}</h4>
                <p>{p.description}</p>
                <div className="chips">{p.tech.map(t => <span key={t} className="chip">{t}</span>)}</div>
              </>
            );
            return p.demo ? (
              <button key={p.title} className="card glow project" onClick={() => setDemo(p.demo)}>{inner}</button>
            ) : (
              <a key={p.title} className="card glow project" href={p.link} target="_blank" rel="noopener noreferrer">{inner}</a>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPublications = () => {
    const byYear = publications.reduce((acc, p) => {
      (acc[p.year] ||= []).push(p);
      return acc;
    }, {});
    const years = Object.keys(byYear).sort((a, b) => b - a);
    return (
      <div className="container narrow">
        <h2 className="section-title">Publications &amp; presentations</h2>
        <div>
          {years.map(year => (
            <div className="pub-year" key={year}>
              <div className="pub-year-label">{year}</div>
              <div className="pub-list">
                {byYear[year].map(p => (
                  <div key={p.title + p.venue}>
                    <p className="pub-title">{p.title}</p>
                    <p className="pub-venue">
                      <span className={`pub-type ${p.type.split(' ')[0]}`}>{p.type}</span>
                      {p.venue}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h4 className="subhead" style={{ marginTop: 56 }}>Teaching</h4>
        <div className="teach-grid">
          {teaching.map(t => (
            <div className="card teach" key={t.course}>
              <div className="role">{t.role}</div>
              <div className="course">{t.course}</div>
              <div className="term">{t.term}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const content = {
    about: renderAbout,
    experience: renderExperience,
    projects: renderProjects,
    publications: renderPublications,
  }[activeTab]();

  return (
    <>
      <div className="bg-glow" />

      <div className="shell">
        <header className="site-header">
          <button className="brand" onClick={() => switchTab('about')}>
                        <span className="brand-text">
              <span className="brand-name">Phil Loatman</span>
              <span className="brand-role">MD, Artificial Intelligence</span>
            </span>
          </button>

          <nav className="nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-btn${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => switchTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button className="cmdk-trigger" onClick={() => setPaletteOpen(true)} aria-label="Open command palette">
            {Icon.search}
            <span className="label">Search</span>
            <span className="kbd">⌘K</span>
          </button>
        </header>

        <main>
          <div className="fade-in" key={activeTab + (demo || '')}>
            {content}
          </div>
        </main>

        <footer className="site-footer">
          <span>© {new Date().getFullYear()} Phil Loatman</span>
          <span className="footer-links">
            {copied ? <span>Email copied</span> : <a href={`mailto:${EMAIL}`}>{EMAIL}</a>}
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">GitHub</a>
          </span>
        </footer>
      </div>

      {paletteOpen && <CommandPalette commands={commands} onClose={() => setPaletteOpen(false)} />}
    </>
  );
};

export default Portfolio;

import React, { useState, useEffect } from 'react';

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'publications', label: 'Publications' },
  ];

  const experiences = [
    {
      period: '2021 — Present',
      title: 'Assistant Vice President, Data Science',
      company: 'Lincoln Financial Group',
      description: 'Leading data science initiatives applying cognitive science principles to financial decision-making, behavioral analytics, and predictive modeling.',
      skills: ['Python', 'Machine Learning', 'Behavioral Analytics', 'Quantitative Finance'],
    },
    {
      period: '2017 — 2021',
      title: 'Data Scientist',
      company: 'Lincoln Financial Group',
      description: 'Developed computational models for customer behavior prediction and risk assessment using advanced statistical methods.',
      skills: ['Statistical Modeling', 'R', 'SQL', 'Data Visualization'],
    },
    {
      period: '2012 — 2017',
      title: 'PhD in Cognitive Science',
      company: 'Stony Brook University',
      description: 'Research focused on judgment and decision making, intertemporal choice, and individual differences in cognitive processes. Advanced certification in Quantitative Methods.',
      skills: ['Experimental Design', 'Behavioral Economics', 'Computational Modeling', 'Research'],
    },
  ];

  const projects = [
    {
      title: 'Predicting Time Preferences',
      description: 'Machine learning models predicting intertemporal choice behavior and its associations with health and financial outcomes.',
      tech: ['Python', 'Scikit-learn', 'Behavioral Modeling'],
      link: '#',
    },
    {
      title: 'Interactive Resume Builder',
      description: 'A guide and toolkit for creating dynamic, interactive resumes using Plotly visualizations in Python.',
      tech: ['Python', 'Plotly', 'Data Visualization'],
      link: '#',
    },
    {
      title: 'Covid-19 Dashboard',
      description: 'Real-time dashboard tracking Covid-19 metrics across Greater Boston, featuring wastewater analysis and trend visualization.',
      tech: ['Python', 'Dash', 'Pandas', 'Public Health Data'],
      link: '#',
    },
  ];

  const publications = [
    {
      year: '2017',
      title: 'Individual Differences in Susceptibility to the Attraction, Compromise, and Similar Effect',
      venue: 'Eastern Psychological Association Conference, Boston, MA',
      type: 'Poster Presentation',
    },
    {
      year: '2017',
      title: 'Irrational Intertemporal Choice',
      venue: 'Temporal Decision Making Symposium, Eastern Psychological Association Conference, Boston, MA',
      type: 'Presentation',
    },
    {
      year: '2017',
      title: 'The Difference Model of Intertemporal Choice',
      venue: 'Cognitive Science Brown Bag Colloquium, Stony Brook University, NY',
      type: 'Presentation',
    },
    {
      year: '2016',
      title: 'Contextual Preference Reversals in Intertemporal Choice',
      venue: 'Society for Judgment and Decision Making Conference, Boston, MA',
      type: 'Poster Presentation',
    },
    {
      year: '2016',
      title: 'Contextual Preference Reversals in Intertemporal Choice',
      venue: 'Cognitive Science Brown Bag Colloquium, Stony Brook University, NY',
      type: 'Presentation',
    },
    {
      year: '2016',
      title: 'The Attraction Effect Influences Preferences and Discount Rates in Intertemporal Choice',
      venue: 'Eastern Psychological Association Conference, New York, NY',
      type: 'Poster Presentation',
    },
    {
      year: '2015',
      title: 'When patterning discriminations are harder than biconditional ones: A cue constellation approach',
      venue: 'Journal of Experimental Psychology: Animal Learning and Cognition, 41(4), 354-370',
      type: 'Publication',
    },
    {
      year: '2015',
      title: 'The Decoy Effect and Intertemporal Choice',
      venue: 'Cognitive Science Brown Bag Colloquium, Stony Brook University, NY',
      type: 'Presentation',
    },
    {
      year: '2013',
      title: 'Can Neuroscience Transform the Law?',
      venue: 'Association for Psychological Science Conference, Washington D.C.',
      type: 'Poster Presentation',
    },
    {
      year: '2013',
      title: 'The Psychology of Culpability in the 21st Century',
      venue: 'Northeastern Evolutionary Psychology Society Conference, Lebanon Valley College, PA',
      type: 'Presentation',
    },
    {
      year: '2013',
      title: 'Comparing Negative Patterning and Biconditional Discrimination in a Simulated Foraging Task',
      venue: 'Eastern Psychological Association Conference, New York, NY',
      type: 'Poster Presentation',
    },
    {
      year: '2013',
      title: 'Finding Features in a Configural World',
      venue: 'Comparative Cognition Conference, Melbourne, FL',
      type: 'Presentation',
    },
    {
      year: '2013',
      title: 'Patterning Discrimination and Foraging Behavior: An Evolutionary Analysis',
      venue: 'Comparative Cognition Conference, Melbourne, FL',
      type: 'Poster Presentation',
    },
    {
      year: '2012',
      title: 'Negative Patterning is Harder than Biconditional Discriminations',
      venue: 'Eastern Psychological Association Conference, Pittsburgh, PA',
      type: 'Poster Presentation',
    },
    {
      year: '2010',
      title: 'Reasonable Person, Woman, or Victim in Sexual Harassment Law',
      venue: 'Association for Psychological Science Conference, Boston, MA',
      type: 'Poster Presentation',
    },
    {
      year: '2017',
      title: 'Individual Differences in Susceptibility to Framing Effects',
      venue: 'Cognitive Science Society Annual Conference',
      type: 'Presentation',
    },
    {
      year: '2017',
      title: 'Temporal Discounting and Risk Preference: A Meta-Analytic Review',
      venue: 'Judgment and Decision Making',
      type: 'Publication',
    },
    {
      year: '2016',
      title: 'Computational Models of Intertemporal Choice',
      venue: 'Society for Mathematical Psychology',
      type: 'Presentation',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="about-section-responsive" style={{
            display: 'flex',
            gap: '80px',
            alignItems: 'flex-start',
            maxWidth: '1100px',
            margin: '0 auto',
          }}>
            {/* Profile Image */}
            <div className="about-profile-col" style={{ flexShrink: 0 }}>
              <div className="about-profile-img-wrapper" style={{
                width: '280px',
                height: '280px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '3px solid rgba(212, 165, 116, 0.3)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                margin: 0,
              }}>
                <img 
                  src="/profile.png" 
                  alt="Phil Loatman"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                  }}
                />
              </div>
              {/* Contact Card */}
              <div className="about-contact-card" style={{
                marginTop: '24px',
                padding: '20px',
                backgroundColor: 'rgba(212, 165, 116, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(212, 165, 116, 0.1)',
              }}>
                <div className="about-contact-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M22 6l-10 7L2 6"/>
                  </svg>
                  <a href="mailto:loatmanp@gmail.com" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>
                    loatmanp@gmail.com
                  </a>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <a
                    href="https://www.linkedin.com/in/philloatman/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#6b7280', transition: 'color 0.2s ease' }}
                    onMouseEnter={e => (e.target.style.color = '#d4a574')}
                    onMouseLeave={e => (e.target.style.color = '#6b7280')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a
                    href="https://github.com/philloatman"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#6b7280', transition: 'color 0.2s ease' }}
                    onMouseEnter={e => (e.target.style.color = '#d4a574')}
                    onMouseLeave={e => (e.target.style.color = '#6b7280')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            {/* Bio Content */}
            <div className="about-bio-col" style={{ flex: 1 }}>
              <div className="about-bio-text">
                <p style={{ marginBottom: '24px', marginTop: 0 }}>
                  I am an Assistant Vice President of AI with over a decade of experience in AI, machine learning, data engineering, research, and inferential statistics. I specialize in leading the development and deployment of advanced AI systems—including Generative AI solutions, retrieval-augmented generation (RAG) pipelines, and large language model evaluation frameworks—to address complex, high-impact business challenges.
                </p>
                <p style={{ marginBottom: '24px' }}>
                  Trained as a cognitive scientist, my work is deeply informed by a longstanding interest in the interaction between human decision-making and artificial intelligence. A core focus of my approach is applying design thinking and data storytelling to ensure that data science innovations translate into strategic organizational value.
                </p>
                <p style={{ marginBottom: '24px' }}>
                  Currently, I lead AI initiatives at <span style={{ color: '#d4a574' }}>Lincoln Financial Group</span>, serving as the technical lead for enterprise generative AI projects. In this role, I guide cross-functional teams from research and experimentation through production deployment, ensuring rigor, scalability, and responsible AI practices.
                </p>
                <p style={{ marginBottom: '24px' }}>
                  I hold a PhD in Cognitive Science from Stony Brook University, along with advanced certification in quantitative methods. My research interests include judgment and decision making, experimental economics, quantitative finance, and computational modeling.
                </p>
              </div>
              {/* Skills/Interests Tags */}
              <div className="about-skills-section">
                <h4 style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: '#6b7280',
                  marginBottom: '16px',
                }}>
                  Areas of Expertise
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {['Cognitive Science', 'Machine Learning', 'Behavioral Economics', 'Decision Science', 'Python', 'Quantitative Finance', 'Statistical Modeling', 'AI Engineering'].map((skill, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '13px',
                        padding: '8px 16px',
                        backgroundColor: 'rgba(212, 165, 116, 0.1)',
                        color: '#d4a574',
                        borderRadius: '999px',
                        fontWeight: '500',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Lincoln Financial Group - Assistant Vice President */}
              <div style={{ padding: '32px', borderRadius: '12px', backgroundColor: 'rgba(212, 165, 116, 0.03)', border: '1px solid rgba(212, 165, 116, 0.08)' }}>
                <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#e8e6e3', margin: '0 0 4px 0' }}>Assistant Vice President</h4>
                <p style={{ fontSize: '16px', color: '#d4a574', margin: 0 }}>Lincoln Financial Group, Boston, MA</p>
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', backgroundColor: 'rgba(107, 114, 128, 0.1)', padding: '6px 12px', borderRadius: '6px', display: 'inline-block', marginTop: '8px' }}>11/2023 – Present</span>
                <ul style={{ fontSize: '15px', color: '#9ca3af', margin: '16px 0 0 18px', lineHeight: 1.7 }}>
                  <li>Developed an internal Generative AI Chatbot for investment operations teams to quickly access investment information when interfacing with financial professionals</li>
                  <li>Developed a real-time pricing tool to predict small-market retirement fund profitability, reducing pricing costs by 95%</li>
                  <li>Engineered a record linkage algorithm and web application to manage a database of over 1M financial professionals in Salesforce</li>
                </ul>
              </div>
              {/* Lincoln Financial Group - Principal Data Scientist */}
              <div style={{ padding: '32px', borderRadius: '12px', backgroundColor: 'rgba(212, 165, 116, 0.03)', border: '1px solid rgba(212, 165, 116, 0.08)' }}>
                <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#e8e6e3', margin: '0 0 4px 0' }}>Principal Data Scientist</h4>
                <p style={{ fontSize: '16px', color: '#d4a574', margin: 0 }}>Lincoln Financial Group, Boston, MA</p>
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', backgroundColor: 'rgba(107, 114, 128, 0.1)', padding: '6px 12px', borderRadius: '6px', display: 'inline-block', marginTop: '8px' }}>04/2023 – 11/2023</span>
                <ul style={{ fontSize: '15px', color: '#9ca3af', margin: '16px 0 0 18px', lineHeight: 1.7 }}>
                  <li>Served as technical supervisor and project manager of all data science projects</li>
                  <li>Built a framework to standardize and operationalize all data science projects, increasing team productivity by 30%</li>
                  <li>Created a pioneering customer-centric dashboard, providing comprehensive insights into acquisition, retention, and churn metrics across all verticals of the organization</li>
                </ul>
              </div>
              {/* Lincoln Financial Group - Data Science Manager */}
              <div style={{ padding: '32px', borderRadius: '12px', backgroundColor: 'rgba(212, 165, 116, 0.03)', border: '1px solid rgba(212, 165, 116, 0.08)' }}>
                <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#e8e6e3', margin: '0 0 4px 0' }}>Data Science Manager</h4>
                <p style={{ fontSize: '16px', color: '#d4a574', margin: 0 }}>Lincoln Financial Group, Boston, MA</p>
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', backgroundColor: 'rgba(107, 114, 128, 0.1)', padding: '6px 12px', borderRadius: '6px', display: 'inline-block', marginTop: '8px' }}>06/2021 – 04/2023</span>
                <ul style={{ fontSize: '15px', color: '#9ca3af', margin: '16px 0 0 18px', lineHeight: 1.7 }}>
                  <li>Built machine learning retention models to reduce customer churn by 10%</li>
                  <li>Developed a business retention data platform to automate business operations, saving $1M in annual operational costs</li>
                  <li>Increased online customer registrations by 120% by creating the first Welcome to Lincoln email platform</li>
                  <li>Led a team of three data scientists, overseeing the end-to-end life cycle and execution of data science projects</li>
                </ul>
              </div>
              {/* Lincoln Financial Group - Data Scientist */}
              <div style={{ padding: '32px', borderRadius: '12px', backgroundColor: 'rgba(212, 165, 116, 0.03)', border: '1px solid rgba(212, 165, 116, 0.08)' }}>
                <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#e8e6e3', margin: '0 0 4px 0' }}>Data Scientist</h4>
                <p style={{ fontSize: '16px', color: '#d4a574', margin: 0 }}>Lincoln Financial Group, Boston, MA</p>
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', backgroundColor: 'rgba(107, 114, 128, 0.1)', padding: '6px 12px', borderRadius: '6px', display: 'inline-block', marginTop: '8px' }}>10/2019 – 06/2021</span>
                <ul style={{ fontSize: '15px', color: '#9ca3af', margin: '16px 0 0 18px', lineHeight: 1.7 }}>
                  <li>Built the first direct-to-consumer email platform to relay messages about COVID-19, achieving a 98% delivery rate and 45% open rate</li>
                  <li>Developed several data engineering pipelines to connect digital, product, and customer data to understand buyer metrics and customer journeys</li>
                </ul>
              </div>
              {/* Athenahealth - Senior User Experience Researcher */}
              <div style={{ padding: '32px', borderRadius: '12px', backgroundColor: 'rgba(212, 165, 116, 0.03)', border: '1px solid rgba(212, 165, 116, 0.08)' }}>
                <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#e8e6e3', margin: '0 0 4px 0' }}>Senior User Experience Researcher</h4>
                <p style={{ fontSize: '16px', color: '#d4a574', margin: 0 }}>Athenahealth, Watertown, MA</p>
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', backgroundColor: 'rgba(107, 114, 128, 0.1)', padding: '6px 12px', borderRadius: '6px', display: 'inline-block', marginTop: '8px' }}>02/2018 – 10/2019</span>
                <ul style={{ fontSize: '15px', color: '#9ca3af', margin: '16px 0 0 18px', lineHeight: 1.7 }}>
                  <li>Led the User Needs Scoring initiative to provide analytical insights on customer pain points</li>
                  <li>Built and maintained data warehouses for all user experience research across all product teams</li>
                  <li>Helped design a mobile payment system by employing behavioral economic principles</li>
                  <li>Built explanatory attrition models using marketing and user experience research to create UX ROI metrics</li>
                </ul>
              </div>
            </div>
            {/* Skills Section */}
            <div style={{ marginTop: '40px' }}>
              <h4 style={{ fontSize: '16px', color: '#d4a574', marginBottom: '12px', fontWeight: 600 }}>Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {["Data Science", "Generative AI", "Retrieval-Augmented Generation (RAG)", "Large Language Models (LLMs)", "Prompt Engineering", "Machine Learning", "API Development", "Python", "R", "SQL", "Flask", "HTML", "CSS", "Natural Language Processing", "Cloud Computing (AWS)", "Hive", "Spark", "PySpark", "Hadoop", "Tableau", "Dataiku", "KNIME", "Inferential Statistics", "A/B Testing", "ETL", "Data Engineering", "Exploratory Data Analysis", "Data Visualization", "Behavioral Economics", "Cognitive Science", "Quantitative UX Research", "Change Management", "Situational Leadership", "Management", "Design Thinking"].map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '13px',
                      padding: '8px 16px',
                      backgroundColor: 'rgba(212, 165, 116, 0.1)',
                      color: '#d4a574',
                      borderRadius: '999px',
                      fontWeight: '500',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {/* Education Section */}
            <div style={{ marginTop: '32px' }}>
              <h4 style={{ fontSize: '16px', color: '#d4a574', marginBottom: '12px', fontWeight: 600 }}>Education</h4>
              <div style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.7 }}>
                <strong>Stony Brook University</strong><br />
                PhD, Cognitive Science (09/2014 – 05/2019)<br />
                Dissertation: Machine Learning Applications in Intertemporal Choice Behavior<br />
                Advanced Certification: Quantitative Methods
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {projects.map((project, index) => (
                <a
                  key={index}
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '28px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(212, 165, 116, 0.03)',
                    border: '1px solid rgba(212, 165, 116, 0.08)',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#e8e6e3',
                      margin: 0,
                    }}>
                      {project.title}
                    </h4>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#9ca3af',
                    lineHeight: 1.7,
                    margin: '0 0 20px 0',
                  }}>
                    {project.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {project.tech.map((tech, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11px',
                          padding: '5px 12px',
                          backgroundColor: 'rgba(212, 165, 116, 0.1)',
                          color: '#d4a574',
                          borderRadius: '999px',
                          fontWeight: '500',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </div>
        );

      case 'publications':
        return (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ color: '#d4a574', marginBottom: '18px', fontSize: '20px' }}>Publications and Presentations</h3>
            <ul style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
              {publications.map((publication, index) => (
                <li key={index}>
                  <strong>{publication.year}</strong> - {publication.title} ({publication.type}) - {publication.venue}
                </li>
              ))}
            </ul>
            <h3 style={{ color: '#d4a574', marginBottom: '12px', fontSize: '18px' }}>Teaching Experience</h3>
            <ul style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.7 }}>
              <li>Instructor—Research and Writing in Psychology, Fall 2015</li>
              <li>Instructor—Analysis of Variance: Computer Applications, Summer 2017</li>
              <li>Instructor–Human Problem Solving, Winter 2017</li>
              <li>Teaching Assistant—Developmental Psychology, Fall 2017</li>
              <li>Teaching Assistant—Judgment and Decision Making, Spring 2017</li>
              <li>Teaching Assistant—Health Psychology, Fall 2016</li>
              <li>Teaching Assistant—Memory, Spring 2016</li>
              <li>Teaching Assistant—Introduction to Psychology, Summer 2015</li>
              <li>Teaching Assistant—Biological Psychology, Spring 2015</li>
              <li>Teaching Assistant—Statistics in Psychology, Fall 2014</li>
              <li>Teaching Assistant—Cognition Processes, Spring 2012</li>
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a2f2d',
      color: '#e8e6e3',
      fontFamily: "'Outfit', 'Helvetica Neue', sans-serif",
      position: 'relative',
    }}>
      {/* Animated gradient background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(212, 165, 116, 0.04), transparent 40%)`,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Subtle grid pattern */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(212, 165, 116, 0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212, 165, 116, 0.015) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#1a2f2d',
        padding: '16px 48px',
        borderBottom: '1px solid rgba(212, 165, 116, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#d4a574',
            margin: 0,
            letterSpacing: '-0.5px',
          }}>
            Phil Loatman
          </h1>
          <span style={{
            fontSize: '12px',
            color: '#6b7280',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            borderLeft: '1px solid rgba(212, 165, 116, 0.2)',
            paddingLeft: '16px',
          }}>
            Cognitive Scientist | AI Engineering
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '8px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === tab.id ? '#e8e6e3' : '#6b7280',
                backgroundColor: activeTab === tab.id ? 'rgba(212, 165, 116, 0.15)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = 'rgba(212, 165, 116, 0.08)';
                  e.target.style.color = '#9ca3af';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6b7280';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main style={{
        position: 'relative',
        zIndex: 2,
        padding: '60px 48px 80px',
        minHeight: 'calc(100vh - 200px)',
      }}>
        {renderContent()}
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 2,
        padding: '24px 48px',
        borderTop: '1px solid rgba(212, 165, 116, 0.1)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '13px',
          color: '#4b5563',
          margin: 0,
        }}>
          © 2025 Phil Loatman · Built with React
        </p>
      </footer>

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        body {
          margin: 0;
          padding: 0;
        }
        
        ::selection {
          background-color: rgba(212, 165, 116, 0.3);
          color: #e8e6e3;
        }
        
        @media (max-width: 900px) {
          header > div {
            flex-direction: column;
            gap: 20px;
          }
          
          nav {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        /* --- About Section Mobile Styles --- */
        @media (max-width: 700px) {
          .about-section-responsive {
            flex-direction: column !important;
            gap: 32px !important;
            align-items: stretch !important;
            padding: 0 0 0 0 !important;
          }
          .about-profile-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 0;
          }
          .about-profile-img-wrapper {
            width: 160px !important;
            height: 160px !important;
            margin: 0 auto !important;
          }
          .about-contact-card {
            margin-top: 16px !important;
            padding: 14px !important;
            width: 100%;
            max-width: 320px;
            margin-left: auto;
            margin-right: auto;
          }
          .about-bio-col {
            margin-top: 0 !important;
            font-size: 15px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Portfolio;

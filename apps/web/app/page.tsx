'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Landing.module.css';

// SVG Icon Component
const Icon = ({ name, size = 24, color = 'currentColor' }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, JSX.Element> = {
    trophy: (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path d="M464 80h-60.1a4 4 0 01-4-4V63.92a32 32 0 00-32-32h-255.8a32 32 0 00-32 32V76a4 4 0 01-4 4H48a16 16 0 00-16 16v16c0 54.53 30 112.45 76.52 125.35a7.82 7.82 0 015.48 7.4V320h.75c0 59.06 41.36 113.63 96.1 121.87 4.64.7 8.15 4.73 8.15 9.46V472a24 24 0 0024 24h32a24 24 0 0024-24v-20.67c0-4.73 3.51-8.76 8.15-9.46 54.74-8.24 96.1-62.81 96.1-121.87h.75v-75.25a7.82 7.82 0 015.48-7.4C434 208.45 464 150.53 464 96V96a16 16 0 00-16-16zM112 198.22a4 4 0 01-6 3.45c-10.26-6.11-17.75-15.37-22.14-27.48-6.09-16.82-6.81-37.35-6.86-47.19a4 4 0 014-4h27a4 4 0 014 4v71.22zm272 0v-71.22a4 4 0 014-4h27a4 4 0 014 4c-.05 9.84-.77 30.37-6.86 47.19-4.39 12.11-11.88 21.37-22.14 27.48a4 4 0 01-6-3.45z"/>
      </svg>
    ),
    cash: (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <rect x="32" y="80" width="448" height="256" rx="16" ry="16" transform="rotate(180 256 208)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" fill="none" stroke={color}/>
        <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M64 384h384M96 432h320"/>
        <circle cx="256" cy="208" r="80" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
        <path d="M480 160a80 80 0 01-80-80M32 160a80 80 0 0080-80M480 256a80 80 0 00-80 80M32 256a80 80 0 0180 80" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
      </svg>
    ),
    'checkmark-circle': (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm108.25 138.29l-134.4 160a16 16 0 01-12 5.71h-.27a16 16 0 01-11.89-5.3l-57.6-64a16 16 0 1123.78-21.4l45.29 50.32 122.59-145.91a16 16 0 0124.5 20.58z"/>
      </svg>
    ),
    flash: (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path d="M315.27 33L96 304h128l-31.51 173.23a2.36 2.36 0 002.33 2.77h0a2.36 2.36 0 001.89-.95L416 208H288l31.66-173.25a2.45 2.45 0 00-2.44-2.75h0a2.42 2.42 0 00-1.95 1z"/>
      </svg>
    ),
    'shield-checkmark': (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path d="M479.07 111.35a16 16 0 00-13.15-14.75C379.89 81.18 363.15 79.91 256 32c-107.15 47.91-123.89 49.18-209.92 64.6a16 16 0 00-13.15 14.75c-3.85 61.1 4.34 118.72 24.36 171.4 19.36 51 46.6 94.54 80.94 129.34C174.63 445.59 219.78 467.4 256 480c36.22-12.6 81.37-34.41 117.77-67.91 34.34-34.8 61.58-78.34 80.94-129.34 20.02-52.68 28.21-110.3 24.36-171.4zM368.2 243.42l-96 96a16 16 0 01-22.62 0l-48-48a16 16 0 0122.62-22.63L256 300.62 345.37 211a16 16 0 0122.63 22.42z"/>
      </svg>
    ),
    time: (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path d="M256 64C150 64 64 150 64 256s86 192 192 192 192-86 192-192S362 64 256 64z" fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="32"/>
        <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M256 128v144h96"/>
      </svg>
    ),
    'document-text': (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path d="M416 221.25V416a48 48 0 01-48 48H144a48 48 0 01-48-48V96a48 48 0 0148-48h98.75a32 32 0 0122.62 9.37l141.26 141.26a32 32 0 019.37 22.62z" fill="none" stroke={color} strokeLinejoin="round" strokeWidth="32"/>
        <path d="M256 56v120a32 32 0 0032 32h120M176 288h160M176 368h160" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
      </svg>
    ),
    globe: (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path d="M256 48C141.13 48 48 141.13 48 256s93.13 208 208 208 208-93.13 208-208S370.87 48 256 48z" fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="32"/>
        <path d="M256 48c-58.07 0-112.67 93.13-112.67 208S197.93 464 256 464s112.67-93.13 112.67-208S314.07 48 256 48z" fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="32"/>
        <path d="M117.33 117.33c38.24 27.15 86.38 43.34 138.67 43.34s100.43-16.19 138.67-43.34M394.67 394.67c-38.24-27.15-86.38-43.34-138.67-43.34s-100.43 16.19-138.67 43.34" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
        <path fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="32" d="M256 48v416M464 256H48"/>
      </svg>
    ),
    analytics: (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M344 280l88-88M232 216l64 64M80 320l104-104"/>
        <circle cx="456" cy="168" r="24" fill={color}/>
        <circle cx="320" cy="304" r="24" fill={color}/>
        <circle cx="208" cy="192" r="24" fill={color}/>
        <circle cx="56" cy="344" r="24" fill={color}/>
      </svg>
    ),
    airplane: (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path d="M407.72 224c-3.4 0-14.79.1-18 .3l-64.9 1.7a1.83 1.83 0 01-1.69-.9L193.55 67.56a9 9 0 00-6.66-3.56H160l73 161a2.35 2.35 0 01-2.26 3.35l-121.69 1.8a8.06 8.06 0 01-6.6-3.1l-37-45c-3-3.9-8.62-6-13.51-6H33.08c-1.29 0-1.1 1.21-.75 2.43l19.84 71.41a16.3 16.3 0 010 11.9L32.31 332c-.59 1.95-.52 3 1.77 3H52c8.14 0 9.25-1.06 13.41-6.3l37.7-45.7a8.19 8.19 0 016.6-3.1l120.68 2.7a2.7 2.7 0 012.43 3.74L160 448h26.64a9 9 0 006.65-3.55L323.14 287c.39-.6 2-.9 2.69-.9l63.9 1.7c3.3.2 14.59.3 18 .3C452 288.1 480 275.93 480 256s-27.88-32-72.28-32z"/>
      </svg>
    ),
    wifi: (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M332.41 310.59a115 115 0 00-152.8 0M393.46 249.54a201.26 201.26 0 00-274.92 0M448 191.52a288 288 0 00-384 0"/>
        <path d="M300.45 348.1a4 4 0 00-4.9 0l-43.55 33.9-43.55-33.9a4 4 0 00-4.9 0l-39.79 30.95a4 4 0 00-.94 5.66L234.9 470a4 4 0 006.2 0l72.08-85.29a4 4 0 00-.94-5.66z"/>
      </svg>
    ),
    cart: (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <circle cx="176" cy="416" r="16" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
        <circle cx="400" cy="416" r="16" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
        <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M48 80h64l48 272h256"/>
        <path d="M160 288h249.44a8 8 0 007.85-6.43l28.8-144a8 8 0 00-7.85-9.57H128" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
      </svg>
    ),
    card: (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <rect x="48" y="96" width="416" height="320" rx="56" ry="56" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
        <path fill="none" stroke={color} strokeLinejoin="round" strokeWidth="60" d="M48 192h416M128 300h48v20h-48z"/>
      </svg>
    ),
    earth: (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path d="M414.39 97.61A224 224 0 1097.61 414.39 224 224 0 10414.39 97.61zM64 256.13a174.52 174.52 0 003.13 31.87 8 8 0 006.87 6.17l16.73 2.62a8 8 0 017.35 5.8l8.36 28.7a8 8 0 019.79 5.06l11.17 34.74a8 8 0 006.94 5.48l35.42 3.2a8 8 0 017.42 4.94l14.88 31.2a8 8 0 0010.24 3.71l35.2-14.4a8 8 0 017.51.31l27.42 16a8 8 0 0010.21-1.54l11.1-12.45a8 8 0 0010.86-1.42l17.46-21.73a8 8 0 006.1-4.52l14.88-41.21a8 8 0 00-1-7.68l-13.88-18.84a8 8 0 01-1-9.48l12.48-25.36a8 8 0 015.82-4.58l34.59-8.07a8 8 0 006.16-5.66l8.8-30.58a8 8 0 00-6.43-9.87l-30-4.84a8 8 0 01-6.43-5.71l-11.44-37.21a8 8 0 00-10.13-5.14L274.66 149a8 8 0 01-8.74-2.37l-13.19-16.49a8 8 0 01-1.41-8.93l8.8-18.75a8 8 0 00-6.26-11.07l-32-5.06a8 8 0 00-8.67 4.33l-13.85 29.87a8 8 0 01-7.24 4.5l-37.76 1.07a8 8 0 00-7.52 6.06l-9.62 34.52a8 8 0 01-7.5 6.13l-38.56 2.25a8 8 0 00-6.67 4.51l-10.22 20.44a8 8 0 00.45 8.48l16.39 24.57a8 8 0 01-.65 10.17L84 264.55a8 8 0 01-9.43.63L53 250.33A174.48 174.48 0 0164 256.13z"/>
      </svg>
    ),
    'arrow-forward': (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" d="M268 112l144 144-144 144M392 256H100"/>
      </svg>
    ),
    'play-circle-outline': (
      <svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke={color} strokeMiterlimit="10" strokeWidth="32"/>
        <path d="M216.32 334.44l114.45-69.14a10.89 10.89 0 000-18.6l-114.45-69.14a10.78 10.78 0 00-16.32 9.31v138.26a10.78 10.78 0 0016.32 9.31z" fill={color}/>
      </svg>
    ),
    'chatbox-ellipses': (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path d="M408 64H104a56.16 56.16 0 00-56 56v192a56.16 56.16 0 0056 56h40v80l93.72-78.14a8 8 0 015.13-1.86H408a56.16 56.16 0 0056-56V120a56.16 56.16 0 00-56-56z" fill="none" stroke={color} strokeLinejoin="round" strokeWidth="32"/>
        <circle cx="160" cy="216" r="32" fill={color}/>
        <circle cx="256" cy="216" r="32" fill={color}/>
        <circle cx="352" cy="216" r="32" fill={color}/>
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
        <path d="M394 480a16 16 0 01-9.39-3L256 383.76 127.39 477a16 16 0 01-24.55-18.08L153 310.35 23 221.2a16 16 0 019-29.2h160.38l48.4-148.95a16 16 0 0130.44 0l48.4 149H480a16 16 0 019.05 29.2L359 310.35l50.13 148.53A16 16 0 01394 480z"/>
      </svg>
    ),
  };

  return icons[name] || null;
};

type Feature = {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
};

type Stat = {
  id: string;
  value: string;
  label: string;
  sublabel: string;
  icon: string;
  gradient: string[];
};

const LandingPage = () => {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    winRate: 0,
    recovered: 0,
    cases: 0,
  });

  useEffect(() => {
    setIsVisible(true);

    // Animate counters
    const winRateInterval = setInterval(() => {
      setCounters((prev) => {
        if (prev.winRate >= 94) {
          clearInterval(winRateInterval);
          return prev;
        }
        return { ...prev, winRate: prev.winRate + 2 };
      });
    }, 20);

    const recoveredInterval = setInterval(() => {
      setCounters((prev) => {
        if (prev.recovered >= 24) {
          clearInterval(recoveredInterval);
          return prev;
        }
        return { ...prev, recovered: prev.recovered + 1 };
      });
    }, 50);

    const casesInterval = setInterval(() => {
      setCounters((prev) => {
        if (prev.cases >= 15247) {
          clearInterval(casesInterval);
          return prev;
        }
        return { ...prev, cases: prev.cases + 382 };
      });
    }, 1);

    return () => {
      clearInterval(winRateInterval);
      clearInterval(recoveredInterval);
      clearInterval(casesInterval);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const globalStats: Stat[] = [
    {
      id: '1',
      value: `${counters.winRate}%`,
      label: 'Success Rate',
      sublabel: 'Cases resolved in your favor',
      icon: 'trophy',
      gradient: ['#667eea', '#764ba2'],
    },
    {
      id: '2',
      value: `€${counters.recovered}M`,
      label: 'Recovered',
      sublabel: 'Total compensation won',
      icon: 'cash',
      gradient: ['#5f72bd', '#9b23ea'],
    },
    {
      id: '3',
      value: counters.cases.toLocaleString(),
      label: 'Cases Won',
      sublabel: 'Globally across all sectors',
      icon: 'checkmark-circle',
      gradient: ['#43cea2', '#185a9d'],
    },
  ];

  const features: Feature[] = [
    {
      id: '1',
      icon: 'flash',
      title: 'Automated Filing',
      description: 'AI-powered forms that adapt to your case. No legal expertise required.',
      color: '#667eea',
    },
    {
      id: '2',
      icon: 'shield-checkmark',
      title: 'Legal Compliance',
      description: 'Every submission follows local regulations and deadlines automatically.',
      color: '#f093fb',
    },
    {
      id: '3',
      icon: 'time',
      title: 'Smart Follow-ups',
      description: 'We track deadlines and escalate when companies ignore your rights.',
      color: '#4facfe',
    },
    {
      id: '4',
      icon: 'document-text',
      title: 'Evidence Manager',
      description: 'Upload receipts, emails, photos. We organize everything for you.',
      color: '#43e97b',
    },
    {
      id: '5',
      icon: 'globe',
      title: 'Multi-Jurisdiction',
      description: 'Works across EU, UK, US regulations. Expanding globally.',
      color: '#fa709a',
    },
    {
      id: '6',
      icon: 'analytics',
      title: 'Success Predictor',
      description: 'Know your chances before filing. Data from thousands of cases.',
      color: '#fee140',
    },
  ];

  const headerOpacity = Math.min(scrollY / 100, 1);
  const heroScale = Math.max(1 - scrollY / 3000, 0.9);

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.gradientBg} />

      {/* Animated Mesh Background */}
      <div className={styles.meshContainer}>
        <div className={`${styles.mesh} ${styles.mesh1}`} />
        <div className={`${styles.mesh} ${styles.mesh2}`} />
        <div className={`${styles.mesh} ${styles.mesh3}`} />
        <div className={`${styles.mesh} ${styles.mesh4}`} />
        <div className={`${styles.mesh} ${styles.mesh5}`} />
        <div className={`${styles.mesh} ${styles.mesh6}`} />
        <div className={`${styles.mesh} ${styles.mesh7}`} />
        <div className={`${styles.mesh} ${styles.mesh8}`} />
        <div className={`${styles.mesh} ${styles.mesh9}`} />
        <div className={`${styles.mesh} ${styles.mesh10}`} />
      </div>

      {/* Floating Particles */}
      <div className={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Grid Pattern Overlay */}
      <div className={styles.gridOverlay} />

      {/* Header */}
      <header className={styles.header} style={{ opacity: headerOpacity }}>
        <div className={styles.headerContent}>
          <div className={styles.logoContainer}>
            <span className={styles.logoText}>ESCALYN</span>
          </div>
          <button className={styles.loginButton}>Sign In</button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className={`${styles.hero} ${isVisible ? styles.visible : ''}`}
        style={{ transform: `scale(${heroScale})` }}
      >
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <div className={styles.badgeDot} />
            <span className={styles.badgeText}>Trusted by 50,000+ users</span>
          </div>

          <h1 className={styles.heroTitle}>
            Your Rights,
            <br />
            <span className={styles.heroGradientText}>Automated</span>
          </h1>

          <p className={styles.heroSubtitle}>
            File disputes, track claims, and win compensation
            <br />
            without lawyers or hassle. Powered by AI.
          </p>

          <div className={styles.ctaRow}>
            <button
              className={styles.primaryCta}
              onClick={() => router.push('/login')}
            >
              <span>Start Your Claim</span>
              <Icon name="arrow-forward" size={20} color="#fff" />
            </button>

            <button className={styles.secondaryCta}>
              <span>Watch Demo</span>
              <Icon name="play-circle-outline" size={20} color="#667eea" />
            </button>
          </div>

          {/* Proof Points */}
          <div className={styles.proofPoints}>
            <div className={styles.proofPoint}>
              <Icon name="checkmark-circle" size={16} color="#4ade80" />
              <span>No upfront costs</span>
            </div>
            <div className={styles.proofPoint}>
              <Icon name="checkmark-circle" size={16} color="#4ade80" />
              <span>5-min setup</span>
            </div>
            <div className={styles.proofPoint}>
              <Icon name="checkmark-circle" size={16} color="#4ade80" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Global Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>GLOBAL IMPACT</div>
          <h2 className={styles.sectionTitle}>
            Real Results,
            <br />
            Real Money
          </h2>
        </div>

        <div className={styles.statsGrid}>
          {globalStats.map((stat, index) => (
            <div
              key={stat.id}
              className={`${styles.statCard} ${isVisible ? styles.visible : ''}`}
              style={{
                background: `linear-gradient(135deg, ${stat.gradient[0]}, ${stat.gradient[1]})`,
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <div className={styles.statIcon}>
                <Icon name={stat.icon} size={32} color="#fff" />
              </div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statSublabel}>{stat.sublabel}</div>
              <div className={styles.statDecor1} />
              <div className={styles.statDecor2} />
            </div>
          ))}
        </div>

        {/* Global Map Visualization */}
        <div className={styles.mapContainer}>
          <div className={styles.mapHeader}>
            <Icon name="earth" size={24} color="#667eea" />
            <h3 className={styles.mapTitle}>Active in 28 Countries</h3>
          </div>

          <div className={styles.mapRegions}>
            <div className={styles.region}>
              <div className={styles.regionDot} style={{ backgroundColor: '#667eea' }} />
              <span className={styles.regionText}>Europe</span>
              <span className={styles.regionValue}>12,847 cases</span>
            </div>
            <div className={styles.region}>
              <div className={styles.regionDot} style={{ backgroundColor: '#f093fb' }} />
              <span className={styles.regionText}>North America</span>
              <span className={styles.regionValue}>1,892 cases</span>
            </div>
            <div className={styles.region}>
              <div className={styles.regionDot} style={{ backgroundColor: '#4facfe' }} />
              <span className={styles.regionText}>Asia Pacific</span>
              <span className={styles.regionValue}>508 cases</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>HOW IT WORKS</div>
          <h2 className={styles.sectionTitle}>
            Powerful Automation,
            <br />
            Simple Experience
          </h2>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <div key={feature.id} className={styles.featureCard}>
              <div
                className={styles.featureIcon}
                style={{ backgroundColor: `${feature.color}20` }}
              >
                <Icon name={feature.icon} size={24} color={feature.color} />
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
              <div className={styles.featureArrow} style={{ color: feature.color }}>
                <Icon name="arrow-forward" size={16} color={feature.color} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Industry Coverage */}
      <section className={styles.industrySection}>
        <div className={styles.sectionEyebrow}>DISPUTE TYPES</div>
        <h2 className={styles.sectionTitle}>
          Every Industry,
          <br />
          One Platform
        </h2>

        <div className={styles.industryGrid}>
          {[
            { icon: 'airplane', name: 'Airlines', color: '#667eea' },
            { icon: 'wifi', name: 'Telecom', color: '#f093fb' },
            { icon: 'cart', name: 'E-commerce', color: '#4facfe' },
            { icon: 'card', name: 'Banking', color: '#43e97b' },
            { icon: 'shield-checkmark', name: 'Insurance', color: '#fa709a' },
            { icon: 'flash', name: 'Utilities', color: '#fee140' },
          ].map((industry, index) => (
            <div key={index} className={styles.industryCard}>
              <Icon name={industry.icon} size={28} color={industry.color} />
              <span className={styles.industryName}>{industry.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className={styles.socialProof}>
        <div className={styles.socialProofContent}>
          <div className={styles.quoteMark}>
            <Icon name="chatbox-ellipses" size={32} color="#667eea" />
          </div>
          <p className={styles.testimonial}>
            "Got €600 for a flight delay in 3 days. The whole process was automatic. I
            just uploaded my boarding pass and Escalyn did everything else."
          </p>
          <div className={styles.testimonialAuthor}>
            <div className={styles.authorAvatar}>M</div>
            <div>
              <div className={styles.authorName}>Maria Schmidt</div>
              <div className={styles.authorLocation}>Berlin, Germany</div>
            </div>
          </div>

          <div className={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon key={star} name="star" size={16} color="#fbbf24" />
            ))}
            <span className={styles.ratingText}>4.8/5 from 2,847 reviews</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <h2 className={styles.finalCtaTitle}>Ready to Claim What's Yours?</h2>
        <p className={styles.finalCtaSubtitle}>
          Join thousands getting the compensation they deserve
        </p>

        <button className={styles.finalCtaButton}>
          <span>Get Started Free</span>
          <Icon name="arrow-forward" size={24} color="#fff" />
        </button>

        <p className={styles.finalCtaNote}>
          No credit card required • 2-minute setup • Cancel anytime
        </p>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>ESCALYN</div>
        <p className={styles.footerTagline}>Automated dispute resolution for everyone</p>
        <div className={styles.footerLinks}>
          <a href="#about">About</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>
        <p className={styles.copyright}>© 2024 Escalyn. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
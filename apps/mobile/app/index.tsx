import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

type Feature = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
};

type Stat = {
  id: string;
  value: string;
  label: string;
  sublabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
};

const LandingPage = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const [counters, setCounters] = useState({
    winRate: 0,
    recovered: 0,
    cases: 0,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 18,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

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

  const globalStats: Stat[] = [
    {
      id: "1",
      value: `${counters.winRate}%`,
      label: "Success Rate",
      sublabel: "Cases resolved in your favor",
      icon: "trophy",
      gradient: ["#667eea", "#764ba2"],
    },
    {
      id: "2",
      value: `€${counters.recovered}M`,
      label: "Recovered",
      sublabel: "Total compensation won",
      icon: "cash",
      gradient: ["#f093fb", "#f5576c"],
    },
    {
      id: "3",
      value: counters.cases.toLocaleString(),
      label: "Cases Won",
      sublabel: "Globally across all sectors",
      icon: "checkmark-circle",
      gradient: ["#4facfe", "#00f2fe"],
    },
  ];

  const features: Feature[] = [
    {
      id: "1",
      icon: "flash",
      title: "Automated Filing",
      description:
        "AI-powered forms that adapt to your case. No legal expertise required.",
      color: "#667eea",
    },
    {
      id: "2",
      icon: "shield-checkmark",
      title: "Legal Compliance",
      description:
        "Every submission follows local regulations and deadlines automatically.",
      color: "#f093fb",
    },
    {
      id: "3",
      icon: "time",
      title: "Smart Follow-ups",
      description:
        "We track deadlines and escalate when companies ignore your rights.",
      color: "#4facfe",
    },
    {
      id: "4",
      icon: "document-text",
      title: "Evidence Manager",
      description:
        "Upload receipts, emails, photos. We organize everything for you.",
      color: "#43e97b",
    },
    {
      id: "5",
      icon: "globe",
      title: "Multi-Jurisdiction",
      description: "Works across EU, UK, US regulations. Expanding globally.",
      color: "#fa709a",
    },
    {
      id: "6",
      icon: "analytics",
      title: "Success Predictor",
      description:
        "Know your chances before filing. Data from thousands of cases.",
      color: "#fee140",
    },
  ];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const heroScale = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Background */}
      <LinearGradient
        colors={["#0a0315", "#1a0b2e", "#2d1b4e"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated Mesh Background */}
      <View style={styles.meshContainer}>
        <View style={[styles.mesh, styles.mesh1]} />
        <View style={[styles.mesh, styles.mesh2]} />
        <View style={[styles.mesh, styles.mesh3]} />
        <View style={[styles.mesh, styles.mesh4]} />
      </View>

      {/* Floating Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
          <Text style={styles.headerLogo}>ESCALYN</Text>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
      >
        {/* Hero Section */}
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: heroScale }],
            },
          ]}
        >
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Trusted by 50,000+ users</Text>
            </View>

            <Text style={styles.heroTitle}>
              Your Rights,{"\n"}
              <Text style={styles.heroGradientText}>Automated</Text>
            </Text>

            <Text style={styles.heroSubtitle}>
              File disputes, track claims, and win compensation{"\n"}
              without lawyers or hassle. Powered by AI.
            </Text>

            <View style={styles.ctaRow}>
              <TouchableOpacity
                style={styles.primaryCta}
                activeOpacity={0.9}
                onPress={() => {
                  router.push("/login");
                }}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryCtaGradient}
                >
                  <Text style={styles.primaryCtaText}>Start Your Claim</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryCta}>
                <Text style={styles.secondaryCtaText}>Watch Demo</Text>
                <Ionicons
                  name="play-circle-outline"
                  size={20}
                  color="#667eea"
                />
              </TouchableOpacity>
            </View>
            

            {/* Proof Points */}
            <View style={styles.proofPoints}>
              <View style={styles.proofPoint}>
                <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                <Text style={styles.proofText}>No upfront costs</Text>
              </View>
              <View style={styles.proofPoint}>
                <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                <Text style={styles.proofText}>5-min setup</Text>
              </View>
              <View style={styles.proofPoint}>
                <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                <Text style={styles.proofText}>Cancel anytime</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Global Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsSectionHeader}>
            <Text style={styles.sectionEyebrow}>GLOBAL IMPACT</Text>
            <Text style={styles.sectionTitle}>
              Real Results,{"\n"}Real Money
            </Text>
          </View>

          <View style={styles.statsGrid}>
            {globalStats.map((stat, index) => (
              <Animated.View
                key={stat.id}
                style={[
                  styles.statCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 60],
                          outputRange: [0, 60 + index * 20],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={[...stat.gradient, stat.gradient[1] + "80"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCardGradient}
                >
                  <View style={styles.statIcon}>
                    <Ionicons name={stat.icon} size={32} color="#fff" />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statSublabel}>{stat.sublabel}</Text>

                  {/* Decorative elements */}
                  <View style={styles.statDecor1} />
                  <View style={styles.statDecor2} />
                </LinearGradient>
              </Animated.View>
            ))}
          </View>

          {/* Global Map Visualization */}
          <View style={styles.mapContainer}>
            <LinearGradient
              colors={["rgba(102, 126, 234, 0.1)", "rgba(102, 126, 234, 0.05)"]}
              style={styles.mapGradient}
            >
              <View style={styles.mapHeader}>
                <Ionicons name="earth" size={24} color="#667eea" />
                <Text style={styles.mapTitle}>Active in 28 Countries</Text>
              </View>

              <View style={styles.mapRegions}>
                <View style={styles.region}>
                  <View
                    style={[styles.regionDot, { backgroundColor: "#667eea" }]}
                  />
                  <Text style={styles.regionText}>Europe</Text>
                  <Text style={styles.regionValue}>12,847 cases</Text>
                </View>
                <View style={styles.region}>
                  <View
                    style={[styles.regionDot, { backgroundColor: "#f093fb" }]}
                  />
                  <Text style={styles.regionText}>North America</Text>
                  <Text style={styles.regionValue}>1,892 cases</Text>
                </View>
                <View style={styles.region}>
                  <View
                    style={[styles.regionDot, { backgroundColor: "#4facfe" }]}
                  />
                  <Text style={styles.regionText}>Asia Pacific</Text>
                  <Text style={styles.regionValue}>508 cases</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresSectionHeader}>
            <Text style={styles.sectionEyebrow}>HOW IT WORKS</Text>
            <Text style={styles.sectionTitle}>
              Powerful Automation,{"\n"}Simple Experience
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={feature.id}
                style={[
                  styles.featureCard,
                  index % 2 === 0
                    ? styles.featureCardLeft
                    : styles.featureCardRight,
                ]}
                activeOpacity={0.8}
              >
                <BlurView
                  intensity={60}
                  tint="dark"
                  experimentalBlurMethod="dimezisBlurView"
                  style={styles.featureGradient}
                >
                  <View
                    style={[
                      styles.featureIcon,
                      { backgroundColor: feature.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={feature.icon}
                      size={24}
                      color={feature.color}
                    />
                  </View>

                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>

                  <View style={styles.featureArrow}>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={feature.color}
                    />
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Industry Coverage */}
        <View style={styles.industrySection}>
          <Text style={styles.sectionEyebrow}>DISPUTE TYPES</Text>
          <Text style={styles.sectionTitle}>
            Every Industry,{"\n"}One Platform
          </Text>

          <View style={styles.industryGrid}>
            {[
              { icon: "airplane", name: "Airlines", color: "#667eea" },
              { icon: "wifi", name: "Telecom", color: "#f093fb" },
              { icon: "cart", name: "E-commerce", color: "#4facfe" },
              { icon: "card", name: "Banking", color: "#43e97b" },
              { icon: "shield-checkmark", name: "Insurance", color: "#fa709a" },
              { icon: "flash", name: "Utilities", color: "#fee140" },
            ].map((industry, index) => (
              <View key={index} style={styles.industryCard}>
                <LinearGradient
                  colors={[industry.color + "20", industry.color + "10"]}
                  style={styles.industryGradient}
                >
                  <Ionicons
                    name={industry.icon}
                    size={28}
                    color={industry.color}
                  />
                  <Text style={styles.industryName}>{industry.name}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        {/* Social Proof */}
        <View style={styles.socialProof}>
          <LinearGradient
            colors={["rgba(102, 126, 234, 0.15)", "rgba(118, 75, 162, 0.15)"]}
            style={styles.socialProofGradient}
          >
            <View style={styles.socialProofContent}>
              <View style={styles.quoteMark}>
                <Ionicons name="chatbox-ellipses" size={32} color="#667eea" />
              </View>
              <Text style={styles.testimonial}>
                "Got €600 for a flight delay in 3 days. The whole process was
                automatic. I just uploaded my boarding pass and Escalyn did
                everything else."
              </Text>
              <View style={styles.testimonialAuthor}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorInitial}>M</Text>
                </View>
                <View>
                  <Text style={styles.authorName}>Maria Schmidt</Text>
                  <Text style={styles.authorLocation}>Berlin, Germany</Text>
                </View>
              </View>

              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={16} color="#fbbf24" />
                ))}
                <Text style={styles.ratingText}>4.8/5 from 2,847 reviews</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Final CTA */}
        <View style={styles.finalCta}>
          <Text style={styles.finalCtaTitle}>Ready to Claim What's Yours?</Text>
          <Text style={styles.finalCtaSubtitle}>
            Join thousands getting the compensation they deserve
          </Text>

          <TouchableOpacity style={styles.finalCtaButton} activeOpacity={0.9}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.finalCtaGradient}
            >
              <Text style={styles.finalCtaButtonText}>Get Started Free</Text>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.finalCtaNote}>
            No credit card required • 2-minute setup • Cancel anytime
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>ESCALYN</Text>
          <Text style={styles.footerTagline}>
            Automated dispute resolution for everyone
          </Text>

          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Contact</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.copyright}>
            © 2024 Escalyn. All rights reserved.
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0315",
  },
  meshContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  mesh: {
    position: "absolute",
    borderRadius: 1000,
    opacity: 0.08,
  },
  mesh1: {
    width: 500,
    height: 500,
    backgroundColor: "#667eea",
    top: -150,
    right: -100,
  },
  mesh2: {
    width: 400,
    height: 400,
    backgroundColor: "#764ba2",
    top: 300,
    left: -150,
  },
  mesh3: {
    width: 350,
    height: 350,
    backgroundColor: "#f093fb",
    bottom: 400,
    right: -100,
  },
  mesh4: {
    width: 300,
    height: 300,
    backgroundColor: "#4facfe",
    bottom: 100,
    left: -80,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
  },
  loginButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  loginText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  hero: {
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  heroContent: {
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(102, 126, 234, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
    marginBottom: 24,
    gap: 8,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    lineHeight: 58,
    marginBottom: 20,
  },
  heroGradientText: {
    color: "#667eea",
  },
  heroSubtitle: {
    fontSize: 17,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 32,
  },
  ctaRow: {
    display: "flex",
    flexDirection: "row",

    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 50,
  },
  primaryCta: {
    borderRadius: 16,
    overflow: "hidden",
  },
  primaryCtaGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 8,
  },
  primaryCtaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  secondaryCta: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
    gap: 8,
  },
  secondaryCtaText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
  },
  proofPoints: {
    flexDirection: "row",
    gap: 20,
  },
  proofPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  proofText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 80,
  },
  statsSectionHeader: {
    marginBottom: 32,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#667eea",
    letterSpacing: 2,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 42,
  },
  statsGrid: {
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    borderRadius: 24,
    overflow: "hidden",
  },
  statCardGradient: {
    padding: 32,
    position: "relative",
    overflow: "hidden",
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  statValue: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  statSublabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  statDecor1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  statDecor2: {
    position: "absolute",
    bottom: -30,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  mapContainer: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  mapGradient: {
    padding: 24,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  mapRegions: {
    gap: 16,
  },
  region: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  regionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  regionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  regionValue: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 80,
  },
  featuresSectionHeader: {
    marginBottom: 32,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    width: (width - 60) / 2,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    height: 280,
  },
  featureCardLeft: {},
  featureCardRight: {},
  featureGradient: {
    padding: 20,
    height: "100%",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 19,
    flex: 1,
  },
  featureArrow: {
    marginTop: 12,
  },
  industrySection: {
    paddingHorizontal: 24,
    marginBottom: 80,
  },
  industryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
  },
  industryCard: {
    width: (width - 72) / 3,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  industryGradient: {
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  industryName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  socialProof: {
    paddingHorizontal: 24,
    marginBottom: 80,
  },
  socialProofGradient: {
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  socialProofContent: {
    alignItems: "center",
  },
  quoteMark: {
    marginBottom: 20,
  },
  testimonial: {
    fontSize: 17,
    color: "#fff",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 24,
  },
  testimonialAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  authorInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  authorLocation: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginLeft: 8,
  },
  finalCta: {
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 80,
  },
  finalCtaTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  finalCtaSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 32,
  },
  finalCtaButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  finalCtaGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 18,
    gap: 12,
  },
  finalCtaButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  finalCtaNote: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  footerLogo: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
    marginBottom: 8,
  },
  footerTagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 24,
  },
  footerLinks: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
  },
  footerLink: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  copyright: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  bottomSpace: {
    height: 40,
  },
});

export default LandingPage;

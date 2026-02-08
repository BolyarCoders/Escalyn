import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image } from "react-native";

const { width, height } = Dimensions.get("window");

type DisputeType = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
};

const Index = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const disputeTypes: DisputeType[] = [
    {
    id: "1",
    title: "Flight Compensation",
    subtitle: "EU261 claims & delays",
    icon: "airplane",
    gradient: ["#667eea", "#764ba2"], // original, perfect for Airlines
  },
  {
    id: "2",
    title: "Telecom Disputes",
    subtitle: "Bills & service issues",
    icon: "wifi",
    gradient: ["#5c6cef", "#7a85f5", "#4e59c2"], // soft blues and purple accents
  },
  {
    id: "3",
    title: "E-commerce Returns",
    subtitle: "Refunds & chargebacks",
    icon: "cart",
    gradient: ["#6b7ef8", "#a391f7", "#5260d1"], // light + medium + deep blues for depth
  },
  {
    id: "4",
    title: "Banking Claims",
    subtitle: "Unauthorized charges",
    icon: "card",
    gradient: ["#5f70ea", "#8c7ff2", "#3d50b5"], // muted blues + violet for a sleek feel
  },
  {
    id: "5",
    title: "Insurance Cases",
    subtitle: "Policies & claims",
    icon: "shield-checkmark",
    gradient: ["#667eea", "#8c7ef7", "#4b57c1"], // matching Airlines vibe
  },
  {
    id: "6",
    title: "Utilities Issues",
    subtitle: "Power, water, internet",
    icon: "flash",
    gradient: ["#5d6dee", "#7e83f4", "#3f4eb8"], // fresh blue gradient, soft but dynamic
  },
  ];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const router = useRouter();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Background */}
      <LinearGradient
        colors={["#0f0c29", "#302b63", "#24243e"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Orbs */}
      <View style={styles.orbContainer}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        <View style={[styles.orb, styles.orb3]} />
      </View>

      {/* Animated Header */}
      <Animated.View style={[styles.headerBar, { opacity: headerOpacity }]}>
         <BlurView
      intensity={80}
      tint="dark"
      experimentalBlurMethod="dimezisBlurView"
      style={styles.headerBlur}
    >
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/icons/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>ESCALYN</Text>
        </View>

        <TouchableOpacity>
          <Ionicons name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </BlurView>
      </Animated.View>

      <Animated.ScrollView
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
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>AUTOMATED DISPUTE RESOLUTION</Text>
            <Text style={styles.heroTitle}>
              Your Rights,{"\n"}
              <Text style={styles.heroTitleAccent}>Automated</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              We handle the complexity. You get what you deserve.
            </Text>

            {/* Stats Pills */}
            <View style={styles.statsRow}>
      <BlurView style={styles.statPill} intensity={30} tint="dark">
        <Text style={styles.statNumber}>94%</Text>
        <Text style={styles.statLabel}>Win Rate</Text>
      </BlurView>

      <BlurView style={styles.statPill} intensity={30} tint="dark" >
        <Text style={styles.statNumber}>€2.4M</Text>
        <Text style={styles.statLabel}>Recovered</Text>
      </BlurView>

      <BlurView style={styles.statPill} intensity={30} tint="dark">
        <Text style={styles.statNumber}>12k</Text>
        <Text style={styles.statLabel}>Cases</Text>
      </BlurView>
    </View>
          </View>
        </Animated.View>

        {/* Active Case - Floating Card */}
        <View style={styles.activeSection}>
          <Text style={styles.sectionLabel}>ACTIVE CASE</Text>

          <LinearGradient
            colors={["rgba(102, 126, 234, 0.15)", "rgba(118, 75, 162, 0.15)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activeCard}
          >
            <BlurView
              intensity={50}
              tint="dark"
              experimentalBlurMethod="dimezisBlurView"
              style={styles.activeCardBlur}
            >
              <View style={styles.activeCardHeader}>
                <View style={styles.activeCardIcon}>
                  <Ionicons name="airplane" size={24} color="#667eea" />
                </View>
                <View style={styles.activeCardInfo}>
                  <Text style={styles.activeCardTitle}>
                    British Airways - BA2847
                  </Text>
                  <Text style={styles.activeCardMeta}>
                    Filed Dec 28 • €600 claim
                  </Text>
                </View>
                <View style={styles.pulsingDot} />
              </View>

              <View style={styles.timelineContainer}>
                <View style={styles.timelineItem}>
                  <View
                    style={[styles.timelineDot, styles.timelineDotComplete]}
                  />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Claim Filed</Text>
                    <Text style={styles.timelineDate}>Dec 28, 2:14 PM</Text>
                  </View>
                </View>
                <View style={styles.timelineLine} />
                <View style={styles.timelineItem}>
                  <View
                    style={[styles.timelineDot, styles.timelineDotComplete]}
                  />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Evidence Submitted</Text>
                    <Text style={styles.timelineDate}>Dec 28, 2:18 PM</Text>
                  </View>
                </View>
                <View style={styles.timelineLine} />
                <View style={styles.timelineItem}>
                  <View
                    style={[styles.timelineDot, styles.timelineDotActive]}
                  />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Awaiting Response</Text>
                    <Text style={styles.timelineDate}>Expected by Jan 11</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewCaseButton}
                onPress={() => {
                  router.push("/cases");
                }}
              >
                <Text style={styles.viewCaseText}>View Details</Text>
                <Ionicons name="arrow-forward" size={16} color="#667eea" />
              </TouchableOpacity>
            </BlurView>
          </LinearGradient>
        </View>

        {/* Dispute Types - Bento Grid */}
        <View style={styles.disputeSection}>
          <Text style={styles.sectionLabel}>START NEW DISPUTE</Text>

          <View style={styles.bentoGrid}>
            {/* Large Featured Card */}
            <TouchableOpacity style={styles.bentoLarge} activeOpacity={0.9}>
              <LinearGradient
                colors={disputeTypes[0].gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bentoGradient}
              >
                <View style={styles.bentoContent}>
                  <View style={styles.bentoIconLarge}>
                    <Ionicons
                      name={disputeTypes[0].icon}
                      size={40}
                      color="#fff"
                    />
                  </View>
                  <Text style={styles.bentoTitleLarge}>
                    {disputeTypes[0].title}
                  </Text>
                  <Text style={styles.bentoSubtitleLarge}>
                    {disputeTypes[0].subtitle}
                  </Text>
                  <View style={styles.bentoArrow}>
                    <Ionicons
                      name="arrow-forward"
                      size={24}
                      color="rgba(255,255,255,0.8)"
                    />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Small Cards */}
            <View style={styles.bentoColumn}>
              {disputeTypes.slice(1, 3).map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={styles.bentoSmall}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={type.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.bentoGradient}
                  >
                    <View style={styles.bentoContentSmall}>
                      <Ionicons name={type.icon} size={28} color="#fff" />
                      <Text style={styles.bentoTitleSmall}>{type.title}</Text>
                      <Text style={styles.bentoSubtitleSmall}>
                        {type.subtitle}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bottom Featured */}
            <TouchableOpacity style={styles.bentoWide} activeOpacity={0.9}>
              <LinearGradient
                colors={disputeTypes[3].gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bentoGradient}
              >
                <View style={styles.bentoContentWide}>
                  <View style={styles.bentoLeft}>
                    <Ionicons
                      name={disputeTypes[3].icon}
                      size={32}
                      color="#fff"
                    />
                    <View style={styles.bentoTextWide}>
                      <Text style={styles.bentoTitleWide}>
                        {disputeTypes[3].title}
                      </Text>
                      <Text style={styles.bentoSubtitleWide}>
                        {disputeTypes[3].subtitle}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color="rgba(255,255,255,0.8)"
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Knowledge Base */}
         <View style={styles.knowledgeSection}>
      <Text style={styles.sectionLabel}>KNOW YOUR RIGHTS</Text>

      <TouchableOpacity style={styles.knowledgeCard}>
        <BlurView
          intensity={40}
          tint="dark"
          style={styles.knowledgeGradient}
          experimentalBlurMethod="dimezisBlurView"
        >
          <View style={styles.knowledgeIcon}>
            <Ionicons name="book-outline" size={24} color="#9575cd"  />
          </View>
          <View style={styles.knowledgeContent}>
            <Text style={styles.knowledgeTitle}>
              EU Flight Compensation Rights
            </Text>
            <Text style={styles.knowledgeSubtitle}>
              Learn about EU261/2004 regulation
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="rgba(255,255,255,0.5)"
          />
        </BlurView>
      </TouchableOpacity>

      <TouchableOpacity style={styles.knowledgeCard}>
        <BlurView
          intensity={40}
          tint="dark"
          style={styles.knowledgeGradient}
                    experimentalBlurMethod="dimezisBlurView"

        >
          <View style={styles.knowledgeIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color="#42a5f5"
            />
          </View>
          <View style={styles.knowledgeContent}>
            <Text style={styles.knowledgeTitle}>
              Consumer Protection Guide
            </Text>
            <Text style={styles.knowledgeSubtitle}>
              Your rights across all industries
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="rgba(255,255,255,0.5)"
          />
        </BlurView>
      </TouchableOpacity>
    </View>

        <View style={styles.bottomSpace} />
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => {
          router.push("/new-claim");
        }}
      >
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0c29",
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    borderRadius: 1000,
    opacity: 0.15,
  },
  orb1: {
    width: 400,
    height: 400,
    backgroundColor: "#667eea",
    top: -100,
    right: -100,
  },
  orb2: {
    width: 300,
    height: 300,
    backgroundColor: "#764ba2",
    bottom: 100,
    left: -50,
  },
  orb3: {
    width: 200,
    height: 200,
    backgroundColor: "#f093fb",
    top: height * 0.5,
    right: 20,
  },
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
   headerBlur: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerContainer: {
    marginTop:45,
    flexDirection: 'row',
    justifyContent: 'space-between', // логото в ляво, иконата в дясно
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center', // вертикално центриране на logo + текст
  },
  logo: {
    width: 30,
    height: 40,
    marginRight: 10, // отстояние между логото и текста
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  hero: {
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: "flex-start",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#667eea",
    letterSpacing: 2,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 52,
    marginBottom: 16,
  },
  heroTitleAccent: {
    color: "#667eea",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 24,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statPill: {
    overflow:'hidden',
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
  activeSection: {
    paddingHorizontal: 24,
    marginBottom: 48,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  activeCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  activeCardBlur: {
    padding: 24,
  },
  activeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  activeCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activeCardInfo: {
    flex: 1,
  },
  activeCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  activeCardMeta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4ade80",
  },
  timelineContainer: {
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
    borderWidth: 2,
  },
  timelineDotComplete: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  timelineDotActive: {
    backgroundColor: "transparent",
    borderColor: "#667eea",
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: "rgba(102, 126, 234, 0.3)",
    marginLeft: 5,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  viewCaseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(102, 126, 234, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
    gap: 8,
  },
  viewCaseText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#667eea",
  },
  disputeSection: {
    paddingHorizontal: 24,
    marginBottom: 48,
  },
  bentoGrid: {
    gap: 12,
  },
  bentoLarge: {
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
  },
  bentoColumn: {
    flexDirection: "row",
    gap: 12,
  },
  bentoSmall: {
    flex: 1,
    height: 160,
    borderRadius: 24,
    overflow: "hidden",
  },
  bentoWide: {
    height: 100,
    borderRadius: 24,
    overflow: "hidden",
  },
  bentoGradient: {
    flex: 1,
    padding: 24,
  },
  bentoContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  bentoIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  bentoTitleLarge: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginTop: 16,
  },
  bentoSubtitleLarge: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  bentoArrow: {
    alignSelf: "flex-end",
  },
  bentoContentSmall: {
    flex: 1,
    justifyContent: "space-between",
  },
  bentoTitleSmall: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
  },
  bentoSubtitleSmall: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  bentoContentWide: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bentoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bentoTextWide: {
    gap: 4,
  },
  bentoTitleWide: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  bentoSubtitleWide: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  knowledgeSection: {
    paddingHorizontal: 24,
    marginBottom: 48,
  },
  knowledgeCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  knowledgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  knowledgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  knowledgeContent: {
    flex: 1,
  },
  knowledgeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  knowledgeSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  bottomSpace: {
    height: 100,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    borderRadius: 30,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Index;

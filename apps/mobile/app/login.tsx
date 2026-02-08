import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouteInfo, useRouter } from 'expo-router/build/hooks';

const { width, height } = Dimensions.get('window');

const LoginPage = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const orbAnim = useRef(new Animated.Value(0)).current;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

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
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating orb animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(orbAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const orb1TranslateY = orbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const orb2TranslateY = orbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });
  const router= useRouter();
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Animated Background */}
      <LinearGradient
        colors={['#0a0315', '#1a0b2e', '#2d1b4e']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated Orbs */}
      <View style={styles.orbContainer}>
        <Animated.View
          style={[
            styles.orb,
            styles.orb1,
            { transform: [{ translateY: orb1TranslateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.orb,
            styles.orb2,
            { transform: [{ translateY: orb2TranslateY }] },
          ]}
        />
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <View style={styles.backButtonBg}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{marginTop:110}}></View>

        {/* Main Form Card */}
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 70],
                  }),
                },
              ],
            },
          ]}
        >
          <BlurView
            intensity={60} tint="dark" experimentalBlurMethod="dimezisBlurView"
            style={styles.formCard}
          >
            {/* Tab Switcher */}
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.tabActive]}
              >
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.tabActive]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.tabIndicator,
                  { left: isLogin ? 0 : '50%' },
                ]}
              />
            </View>



            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.5)" />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.5)" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="rgba(255,255,255,0.5)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            {isLogin && (
              <View style={styles.optionsRow}>
                <TouchableOpacity style={styles.checkboxContainer}>
                  <View style={styles.checkbox}>
                    <Ionicons name="checkmark" size={14} color="#667eea" />
                  </View>
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Terms for Sign Up */}
            {!isLogin && (
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By signing up, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            )}

           


            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} activeOpacity={0.9}  onPress={()=>{router.push('/home')}}
>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Toggle Auth Mode */}
            <View style={styles.toggleAuth}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.toggleLink}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>



                     {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
                         {/* Social Login */}
            <View style={styles.socialSection}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <View style={styles.socialIcon}>
                  <Ionicons name="logo-google" size={20} color="#fff" />
                </View>
                <Text style={styles.socialText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <View style={styles.socialIcon}>
                  <Ionicons name="logo-apple" size={20} color="#fff" />
                </View>
                <Text style={styles.socialText}>Continue with Apple</Text>
              </TouchableOpacity>
            </View>

       
          </BlurView>
          
        </Animated.View>



        {/* Trust Indicators */}
        <Animated.View
          style={[
            styles.trustSection,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark" size={16} color="#4ade80" />
            <Text style={styles.trustText}>256-bit encryption</Text>
          </View>
          
          <View style={styles.trustDot} />
          
          <View style={styles.trustItem}>
            <Ionicons name="lock-closed" size={16} color="#4ade80" />
            <Text style={styles.trustText}>GDPR compliant</Text>
          </View>
          
          <View style={styles.trustDot} />
          
          <View style={styles.trustItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
            <Text style={styles.trustText}>50k+ users</Text>
          </View>
        </Animated.View>



        <View style={styles.bottomSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0315',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.1,
  },
  orb1: {
    width: 400,
    height: 400,
    backgroundColor: '#667eea',
    top: -100,
    right: -150,
  },
  orb2: {
    width: 350,
    height: 350,
    backgroundColor: '#764ba2',
    bottom: -50,
    left: -100,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backButtonBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 120,
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  formContainer: {
    marginBottom: 32,
  },
  formCard: {
    overflow:'hidden',
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
    position: 'relative',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    // Active state handled by indicator
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    width: '50%',
    height: '100%',
    padding: 4,
  },
  socialSection: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  socialIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderWidth: 2,
    borderColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
    textAlign: 'center',
  },
  termsLink: {
    color: '#667eea',
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  toggleAuth: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  toggleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    flexWrap: 'wrap',
    gap: 12,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  bottomSpace: {
    height: 20,
  },
});

export default LoginPage;
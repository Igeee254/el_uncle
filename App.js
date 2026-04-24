import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, Platform, TouchableOpacity, TextInput, useColorScheme, Alert, BackHandler, ScrollView, Linking, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MasonryGrid from './components/MasonryGrid';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import ProfileSettings from './components/ProfileSettings';
import AuthPage from './components/AuthPage';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import FeedbackPage from './components/FeedbackPage';
import CheckoutPage from './components/CheckoutPage';
import AboutUsPage from './components/AboutUsPage';

const API_URL = 'http://localhost:5000'; // or 'http://10.0.2.2:5000' for Android emulator

const IMAGE_MAP = {
  'bracelet.png': require('./assets/bracelet.png'),
  'beaded.png': require('./assets/beaded.png'),
  'keychain.png': require('./assets/keychain.png'),
  'magnet.png': require('./assets/magnet.png'),
};

const STORAGE_KEY = '@user_session';

export default function App() {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system');
  const [currentRoute, setCurrentRoute] = useState('Landing');
  const [navigationStack, setNavigationStack] = useState(['Landing']);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Data state
  const [allProducts, setAllProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const [lastOffset, setLastOffset] = useState(0);
  const [isFilterBarVisible, setIsFilterBarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start(() => {
      setToastVisible(false);
    });
  }, [toastOpacity]);

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        showToast('Removed from Wishlist 💔');
        return prev.filter(item => item.id !== product.id);
      } else {
        showToast('Added to Wishlist ❤️');
        return [...prev, product];
      }
    });
  }, [showToast]);

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    // Only toggle if scrolled more than a threshold to avoid jitter
    if (Math.abs(currentOffset - lastOffset) < 10) return;

    if (currentOffset > lastOffset && currentOffset > 50) {
      if (isTabBarVisible) setIsTabBarVisible(false);
      if (isFilterBarVisible) setIsFilterBarVisible(false);
    } else {
      if (!isTabBarVisible) setIsTabBarVisible(true);
      if (!isFilterBarVisible) setIsFilterBarVisible(true);
    }
    setLastOffset(currentOffset);
  };

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    nickname: 'Guest User',
    profilePic: 'https://i.pravatar.cc/150?u=guest',
    primaryPhone: '',
    secondaryPhone: '',
  });

  // Load session on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedSession) {
          const profile = JSON.parse(savedSession);
          setUserProfile(profile);
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error('Failed to load session');
      }
    };

    const fetchProducts = async () => {
      try {
        const platformHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
        const response = await fetch(`http://${platformHost}:5000/api/products`);
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        // Map string image_uri back to local requires
        const mappedData = data.map(item => ({
          ...item,
          image: IMAGE_MAP[item.image_uri] || require('./assets/bracelet.png')
        }));
        setAllProducts(mappedData);
      } catch (e) {
        console.error("Could not fetch products:", e);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadSession();
    fetchProducts();
  }, []);

  const navigateTo = (route) => {
    if (isNavigating) return;

    if (route !== currentRoute) {
      setIsNavigating(true);
      setNavigationStack(prev => {
        const cleanStack = prev.filter(r => r !== route);
        return [...cleanStack, route];
      });
      setCurrentRoute(route);

      // Debounce to prevent multiple navigations
      setTimeout(() => {
        setIsNavigating(false);
      }, 500);
    }
  };

  const goBack = useCallback(() => {
    if (navigationStack.length > 1) {
      const newStack = [...navigationStack];
      newStack.pop(); // Remove current
      const previousRoute = newStack[newStack.length - 1];
      setNavigationStack(newStack);
      setCurrentRoute(previousRoute);
      return true; // Prevent default behavior (exiting app)
    }
    return false; // Allow default behavior (exit if on Landing)
  }, [navigationStack]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => backHandler.remove();
  }, [goBack]);

  const handleLogin = async (profile) => {
    setIsLoggedIn(true);
    setUserProfile(profile);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    navigateTo('Home');
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    navigateTo('ProductDetail');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigateTo('Shop');
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setUserProfile({ nickname: 'Guest User', profilePic: 'https://i.pravatar.cc/150?u=guest', primaryPhone: '', secondaryPhone: '' });
    await AsyncStorage.removeItem(STORAGE_KEY);
    navigateTo('Landing');
  };

  const onBuy = (item) => {
    if (!isLoggedIn) {
      Alert.alert(
        "Authentication Required",
        "Please create an account or log in to purchase items.",
        [
          { text: "Browse More", style: "cancel" },
          { text: "Sign Up / Log In", onPress: () => navigateTo('Auth') }
        ]
      );
    } else {
      setCart(prev => [...prev, item]);
      Alert.alert(
        "Added to Cart! 🛒",
        `${item.title} is waiting for you in the cart.`,
        [
          { text: "Keep Shopping", style: "cancel" },
          { text: "Checkout Now", onPress: () => navigateTo('Checkout') }
        ]
      );
    }
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCheckout = () => {
    Alert.alert(
      "Checkout Successful",
      "Thank you for your purchase! Our team will contact you shortly for delivery details.",
      [{
        text: "Great!", onPress: () => {
          clearCart();
          navigateTo('Home');
        }
      }]
    );
  };

  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => {
      if (prev === 'system') return 'light';
      if (prev === 'light') return 'dark';
      return 'system';
    });
  }, []);

  const theme = {
    background: isDark ? '#121212' : '#ffffff',
    text: isDark ? '#ffffff' : '#000000',
    headerText: isDark ? '#e94560' : '#d81b60',
    cardBackground: isDark ? '#1e1e1e' : '#f5f5f5',
    tabBar: isDark ? '#1a1a2e' : '#ffffff',
    border: isDark ? '#222' : '#eee',
    secondaryText: isDark ? '#aaa' : '#666',
    icon: isDark ? '#ffffff' : '#000000',
    accent: '#8da696',
    authBackground: isDark ? '#0a0a0a' : '#f9f9f9',
  };

  const HeaderActions = () => (
    <View style={styles.headerActions}>
      <TouchableOpacity onPress={toggleTheme} style={styles.headerIconButton}>
        <Ionicons
          name={themeMode === 'system' ? 'settings-outline' : (themeMode === 'dark' ? 'moon' : 'sunny')}
          size={20}
          color={theme.icon}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.headerIconButton} onPress={() => navigateTo('Cart')}>
        <Ionicons name="cart-outline" size={22} color={theme.icon} />
        {cart.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {isLoggedIn ? (
        <TouchableOpacity onPress={() => navigateTo('Settings')} style={styles.headerIconButton}>
          <Ionicons name="person-circle-outline" size={24} color={theme.icon} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => navigateTo('Auth')} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>LOG IN</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const BottomTab = () => {
    const tabs = [
      { name: 'Home', icon: 'home-outline', activeIcon: 'home' },
      { name: 'Shop', icon: 'grid-outline', activeIcon: 'grid' },
      { name: 'Cart', icon: 'cart-outline', activeIcon: 'cart', badge: cart.length },
      { name: 'Auth', icon: 'person-outline', activeIcon: 'person' },
    ];

    if (currentRoute === 'Landing') return null;
    // Hide on web — bottom nav is not needed on wider screens
    if (Platform.OS === 'web') return null;

    return (
      <View style={[
        styles.bottomTab,
        {
          borderTopColor: theme.border,
          backgroundColor: theme.background,
          transform: [{ translateY: isTabBarVisible ? 0 : 100 }],
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }
      ]}>
        {tabs.map((tab) => {
          const isActive = currentRoute === tab.name || (tab.name === 'Auth' && (currentRoute === 'Settings' || currentRoute === 'Auth'));
          const routeTo = tab.name === 'Auth' && isLoggedIn ? 'Settings' : tab.name;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => navigateTo(routeTo)}
            >
              <View>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={24}
                  color={isActive ? theme.accent : theme.secondaryText}
                />
                {tab.badge > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, { color: isActive ? theme.accent : theme.secondaryText }]}>
                {tab.name === 'Auth' ? 'Account' : tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderScreen = () => {
    switch (currentRoute) {
      case 'Landing':
        return <LandingPage onNavigate={navigateTo} theme={theme} isDark={isDark} headerActions={<HeaderActions />} />;
      case 'Home':
        return (
          <HomePage
            onNavigate={navigateTo}
            theme={theme}
            isDark={isDark}
            headerActions={<HeaderActions />}
            onCategorySelect={handleCategorySelect}
            onBuy={onBuy}
            onProductSelect={handleProductSelect}
            allProducts={allProducts}
            onScroll={handleScroll}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        );
      case 'Cart':
        return (
          <CartPage
            cart={cart}
            theme={theme}
            onNavigate={navigateTo}
            onRemove={removeFromCart}
            onClear={clearCart}
            onCheckout={() => navigateTo('Checkout')}
          />
        );
      case 'Checkout':
        return (
          <CheckoutPage
            cart={cart}
            theme={theme}
            onNavigate={navigateTo}
            onClear={clearCart}
          />
        );
      case 'About':
        return <AboutUsPage theme={theme} isDark={isDark} onNavigate={navigateTo} />;
      case 'Feedback':
        return <FeedbackPage theme={theme} isDark={isDark} onNavigate={navigateTo} />;
      case 'Settings':
        return <ProfileSettings onNavigate={navigateTo} onLogout={handleLogout} theme={theme} isDark={isDark} userProfile={userProfile} setUserProfile={setUserProfile} />;
      case 'Auth':
        return <AuthPage onNavigate={navigateTo} onLogin={handleLogin} theme={theme} isDark={isDark} />;
      case 'Shop':
        const filteredData = (selectedCategory === 'All'
          ? allProducts
          : allProducts.filter(item => item.category === selectedCategory)
        ).filter(item => !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()));

        return (
          <SafeAreaView style={[styles.shopContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.shopHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color={theme.accent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateTo('Home')}>
                <Text style={[styles.shopHeaderTitle, { color: theme.text }]}>GMK CATALOG</Text>
              </TouchableOpacity>
              <View style={styles.headerRight}>
                <HeaderActions />
              </View>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchBar, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Ionicons name="search" size={18} color={theme.secondaryText} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search products..."
                placeholderTextColor={theme.secondaryText}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={theme.secondaryText} />
                </TouchableOpacity>
              )}
            </View>

            <View style={[
              styles.filterBar,
              {
                transform: [{ translateY: isFilterBarVisible ? 0 : -60 }],
                overflow: 'hidden',
                maxHeight: isFilterBarVisible ? 60 : 0,
              }
            ]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {['All', 'Necklaces', 'Bracelets', 'Anklets', 'Souvenirs'].map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.filterChip,
                      { borderColor: theme.border },
                      selectedCategory === cat && { backgroundColor: theme.accent, borderColor: theme.accent }
                    ]}
                  >
                    <Text style={[
                      styles.filterText,
                      { color: theme.secondaryText },
                      selectedCategory === cat && { color: '#fff' }
                    ]}>{cat.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {filteredData.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={60} color={theme.secondaryText} />
                <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No products found</Text>
                <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>Try a different search or category</Text>
              </View>
            ) : (
              <MasonryGrid
                data={filteredData}
                theme={theme}
                isDark={isDark}
                onBuy={onBuy}
                onProductPress={handleProductSelect}
                onScroll={handleScroll}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />
            )}
          </SafeAreaView>
        );
      case 'ProductDetail':
        return (
          <ProductDetail
            product={selectedProduct}
            theme={theme}
            isDark={isDark}
            onNavigate={navigateTo}
            onBuy={onBuy}
            onProductSelect={handleProductSelect}
            relatedProducts={allProducts}
            onScroll={handleScroll}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            showToast={showToast}
          />
        );
      default:
        return <LandingPage onNavigate={navigateTo} theme={theme} isDark={isDark} headerActions={<HeaderActions />} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>
      <BottomTab />
      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shopContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    width: '100%',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 10,
  },
  shopHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 4,
  },
  headerRight: {
    position: 'absolute',
    right: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(128,128,128,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#8da696',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  filterBar: {
    paddingVertical: 10,
    marginBottom: 5,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  filterText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 8,
  },
  bottomTab: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 85 : 65,
    borderTopWidth: 0.5,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  tabBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#ff4757',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  }
});

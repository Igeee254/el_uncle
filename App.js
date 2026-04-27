import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform, TouchableOpacity, TextInput, useColorScheme, Alert, BackHandler, ScrollView, Linking, Animated } from 'react-native';
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
import AddressBook from './components/AddressBook';
import OrderHistory from './components/OrderHistory';

const API_URL = 'http://192.168.1.186:5000'; // Updated for physical phone connectivity

const IMAGE_MAP = {
  'bracelet.png': require('./assets/bracelet.png'),
  'beaded.png': require('./assets/beaded.png'),
  'keychain.png': require('./assets/keychain.png'),
  'magnet.png': require('./assets/magnet.png'),
};

const STORAGE_KEY = '@user_session';
const HISTORY_KEY = '@activity_history';



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
  const [categories, setCategories] = useState(['All']);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const [lastOffset, setLastOffset] = useState(0);
  const [isFilterBarVisible, setIsFilterBarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [preferredCategories, setPreferredCategories] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
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

  const recordActivity = useCallback(async (type, product) => {
    const newItem = {
      id: Date.now().toString(),
      type, // 'like' or 'cart'
      productName: product.title || product.name,
      productId: product.id,
      timestamp: new Date().toISOString(),
      category: product.category,
      image_uri: product.image_uri
    };

    setActivityHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 20); // Keep last 20
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);



  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        showToast('Removed from Wishlist 💔');
        return prev.filter(item => item.id !== product.id);
      } else {
        showToast('Added to Wishlist ❤️');
        // Add category to preferred categories if not already there
        setPreferredCategories(current => {
          if (!current.includes(product.category)) {
            const updated = [...current, product.category];
            AsyncStorage.setItem('@preferred_interests', JSON.stringify(updated)).catch(console.error);
            return updated;
          }
          return current;
        });
        recordActivity('like', product);
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
    username: 'Guest User',
    full_name: '',
    email: '',
    phone: '',
    secondary_phone: '',
    email_notifications: true,
    profilePic: 'https://i.pravatar.cc/150?u=guest',
  });

  // ---- fetchProducts: top-level so it can be reused for the refresh button ----
  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const url = `${API_URL}/api/products`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const data = await response.json();
      const mappedData = data.map(item => {
        let imageSource;
        if (IMAGE_MAP[item.image_uri]) {
          imageSource = IMAGE_MAP[item.image_uri];
        } else if (item.image_uri && item.image_uri.startsWith('http')) {
          // It's a full URL (e.g. from Cloudinary)
          imageSource = { uri: item.image_uri };
        } else if (item.image_uri) {
          // It's a local filename from the backend assets folder
          imageSource = { uri: `${API_URL}/assets/${item.image_uri}` };
        } else {
          imageSource = require('./assets/bracelet.png');
        }
        return { ...item, image: imageSource };
      });
      setAllProducts(mappedData);
    } catch (e) {
      console.warn("[API ERROR] Could not fetch products from backend:", e.message);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

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

    const loadInterests = async () => {
      try {
        const saved = await AsyncStorage.getItem('@preferred_interests');
        if (saved) {
          setPreferredCategories(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Fail to load interests');
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        if (response.ok) {
          const data = await response.json();
          const catNames = ['All', ...data.map(c => c.name)];
          setCategories(catNames);
        }
      } catch (e) {
        console.warn("[API ERROR] Could not fetch categories:", e.message);
      }
    };

    // fetchProducts is declared above useEffect — just call it here

    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem(HISTORY_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setActivityHistory(Array.isArray(parsed) ? parsed : []);
        }
      } catch (e) {
        console.error('Fail to load history');
      }
    };

    loadSession();
    loadInterests();
    loadHistory();
    fetchCategories();
    fetchProducts();
  }, [fetchProducts]);

  const navigateTo = (route) => {
    if (isNavigating) return;

    if (route !== currentRoute) {
      setIsNavigating(true);
      setNavigationStack(prev => {
        const cleanStack = prev.filter(r => r !== route);
        return [...cleanStack, route];
      });
      setCurrentRoute(route);

      // Clear wishlist when moving to another page as requested
      setWishlist([]);

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
    setUserProfile({
      username: 'Guest User',
      profilePic: 'https://i.pravatar.cc/150?u=guest',
      full_name: '',
      email: '',
      phone: '',
      secondary_phone: '',
      email_notifications: true
    });
    await AsyncStorage.removeItem(STORAGE_KEY);
    navigateTo('Landing');
  };

  const onBuy = (item, isDirect = false) => {
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
      recordActivity('cart', item);

      if (isDirect) {
        navigateTo('Checkout');
      } else {
        Alert.alert(
          "Added to Cart! 🛒",
          `${item.title} is waiting for you in the cart.`,
          [
            { text: "Keep Shopping", style: "cancel" },
            { text: "Checkout Now", onPress: () => navigateTo('Checkout') }
          ]
        );
      }
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
      {Platform.OS === 'web' && (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => navigateTo('Home')} style={styles.webNavLink}>
            <Text style={[styles.webNavLinkText, { color: theme.secondaryText }]}>HOME</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateTo('Shop')} style={styles.webNavLink}>
            <Text style={[styles.webNavLinkText, { color: theme.secondaryText }]}>SHOP</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={toggleTheme} style={styles.headerIconButton}>
        <Ionicons name={themeMode === 'system' ? 'settings-outline' : (themeMode === 'dark' ? 'moon' : 'sunny')} size={20} color={theme.icon} />
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
        <TouchableOpacity onPress={() => navigateTo('Settings')} style={[styles.headerIconButton, styles.profileBtn]}>
          <Ionicons name="person-circle-outline" size={24} color={theme.icon} />
          {Platform.OS === 'web' && (
            <Text style={[styles.webNavLinkText, { color: theme.text, marginLeft: 4 }]}>PROFILE & HISTORY</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigateTo('Auth')} style={[styles.loginButton, { marginRight: 8, backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.accent }]}>
            <Text style={[styles.loginButtonText, { color: theme.accent }]}>LOG IN</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateTo('Auth')} style={[styles.loginButton, { backgroundColor: theme.accent }]}>
            <Text style={styles.loginButtonText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
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
            categories={categories}
            onScroll={handleScroll}
            wishlist={wishlist}
            preferredCategories={preferredCategories}
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
        return <ProfileSettings
          onNavigate={navigateTo}
          onLogout={handleLogout}
          theme={theme}
          isDark={isDark}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          activityHistory={activityHistory}
          onProductSelect={handleProductSelect}
        />;
      case 'Auth':
        return <AuthPage onNavigate={navigateTo} onLogin={handleLogin} theme={theme} isDark={isDark} />;
      case 'AddressBook':
        return <AddressBook userProfile={userProfile} theme={theme} isDark={isDark} onNavigate={navigateTo} />;
      case 'OrderHistory':
        return <OrderHistory userProfile={userProfile} theme={theme} isDark={isDark} onNavigate={navigateTo} />;
      case 'Shop':
        const filteredData = (selectedCategory === 'All'
          ? allProducts
          : allProducts.filter(item => item.category === selectedCategory)
        ).filter(item => !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()));

        return (
          <View style={[styles.shopContainer, styles.safeContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.shopHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color={theme.accent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateTo('Home')}>
                <Text style={[styles.shopHeaderTitle, { color: theme.text }]}>KweliStoreKenya CATALOG</Text>
              </TouchableOpacity>
              <View style={styles.headerRight}>
                <TouchableOpacity onPress={fetchProducts} style={{ padding: 8, marginRight: 4 }}>
                  <Ionicons name="refresh" size={20} color={theme.accent} />
                </TouchableOpacity>
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
                {categories.map(cat => (
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
          </View>
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
    <View style={[styles.container, styles.safeContainer, { backgroundColor: theme.background }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeContainer: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 0,
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
  webNavLink: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  webNavLinkText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  profileBtn: {
    paddingRight: 15,
    backgroundColor: 'rgba(141, 166, 150, 0.1)',
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

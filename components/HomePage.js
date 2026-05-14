import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Image, useWindowDimensions, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


import ProductCard from './ProductCard';

const HomePage = ({ onNavigate, theme, isDark, headerActions, onCategorySelect, onBuy, onProductSelect, allProducts, categories, onScroll, wishlist, preferredCategories }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    // Recommendation Logic (Flash Sales)
    const getRecommendations = () => {
        if (!allProducts || allProducts.length === 0) return [];
        return [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 6);
    };

    const recommendations = getRecommendations();
    const currentCategories = categories && categories.length > 1 ? categories : ['All', 'Fashion', 'Electronics', 'Home & Office', 'Health & Beauty'];

    // Category Icons mapping
    const getCatIcon = (cat) => {
        switch (cat.toLowerCase()) {
            case 'fashion': return 'shirt-outline';
            case 'electronics': return 'phone-portrait-outline';
            case 'home & office': return 'business-outline';
            case 'health & beauty': return 'heart-half-outline';
            default: return 'apps-outline';
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* 1. KILIMALL SEARCH HEADER */}
            <View style={[styles.kiliHeader, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => onNavigate('Home')}>
                        <Text style={[styles.logo, { color: theme.primaryGreen }]}>Kweli<Text style={{ color: theme.accent }}>Store</Text></Text>
                    </TouchableOpacity>
                    <View style={styles.headerTopRight}>
                        {headerActions}
                    </View>
                </View>
                <View style={styles.searchRow}>
                    <View style={[styles.searchBox, { borderColor: theme.border }]}>
                        <Ionicons name="search" size={20} color="#999" />
                        <Text style={styles.searchPlaceholder}>Search for products...</Text>
                    </View>
                    <TouchableOpacity style={[styles.searchBtn, { backgroundColor: theme.primaryGreen }]}>
                        <Text style={styles.searchBtnText}>Search</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                {/* 2. HERO BANNER */}
                <View style={styles.heroWrapper}>
                    <ImageBackground
                        source={require('../assets/hero.png')}
                        style={[styles.heroImg, { height: isMobile ? 180 : 350 }]}
                        imageStyle={{ borderRadius: 8 }}
                    >
                        <View style={styles.heroOverlay}>
                            <Text style={styles.heroBadge}>MEGA DEALS</Text>
                            <Text style={styles.heroMainTitle}>UP TO 50% OFF</Text>
                            <Text style={styles.heroSubTitle}>Shop Premium Essentials</Text>
                        </View>
                    </ImageBackground>
                </View>

                {/* 3. CATEGORY BUBBLES */}
                <View style={[styles.catSection, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
                        {currentCategories.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={styles.catBubbleItem}
                                onPress={() => onCategorySelect(cat)}
                            >
                                <View style={[styles.catCircle, { backgroundColor: isDark ? '#222' : '#F9F9F9' }]}>
                                    <Ionicons name={getCatIcon(cat)} size={24} color={theme.primaryGreen} />
                                </View>
                                <Text style={[styles.catBubbleLabel, { color: theme.text }]} numberOfLines={1}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 4. FLASH SALE */}
                <View style={styles.flashSaleSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.flashSaleLabelRow}>
                            <Text style={styles.flashSaleTitle}>FLASH SALE</Text>
                            <View style={styles.timerContainer}>
                                <Text style={styles.timerBox}>12</Text>
                                <Text style={styles.timerSep}>:</Text>
                                <Text style={styles.timerBox}>45</Text>
                                <Text style={styles.timerSep}>:</Text>
                                <Text style={styles.timerBox}>09</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => onCategorySelect('All')}>
                            <Text style={{ color: theme.accent, fontWeight: '700', fontSize: 13 }}>View All {'>'}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashScroll}>
                        {recommendations.map(item => (
                            <View key={item.id} style={styles.flashCard}>
                                <ProductCard
                                    item={item}
                                    theme={theme}
                                    isDark={isDark}
                                    onBuy={onBuy}
                                    onProductPress={onProductSelect}
                                    variant="ecommerce"
                                />
                                <View style={styles.saleBadge}>
                                    <Text style={styles.saleBadgeText}>-20%</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* 5. MAIN PRODUCT GRID */}
                <View style={styles.mainGridSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.mainGridTitle}>RECOMMENDED FOR YOU</Text>
                    </View>
                    <View style={styles.productGrid}>
                        {allProducts.map(item => (
                            <View key={item.id} style={{ width: isMobile ? '50%' : '25%' }}>
                                <ProductCard
                                    item={item}
                                    theme={theme}
                                    isDark={isDark}
                                    onBuy={onBuy}
                                    onProductPress={onProductSelect}
                                    variant="ecommerce"
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* 6. DOWNLOAD APP (Web Only) */}
                {Platform.OS === 'web' && (
                    <View style={styles.downloadSection}>
                        <View style={[styles.downloadContent, { backgroundColor: theme.primaryGreen }]}>
                            <View style={styles.downloadTextContainer}>
                                <Text style={styles.downloadTitle}>Get 10% Discount on App</Text>
                                <Text style={styles.downloadSubtitle}>Download the KweliStore App for exclusive rewards</Text>
                                <TouchableOpacity
                                    style={styles.downloadActionBtn}
                                    onPress={() => Linking.openURL('/KweliStore.apk')}
                                >
                                    <Text style={[styles.downloadActionText, { color: theme.primaryGreen }]}>Download Now</Text>
                                </TouchableOpacity>
                            </View>
                            <Ionicons name="logo-android" size={100} color="rgba(255,255,255,0.1)" style={styles.phoneIconBg} />
                        </View>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    kiliHeader: {
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        paddingHorizontal: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 100,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTopRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchBox: {
        flex: 1,
        height: 40,
        backgroundColor: isDark ? '#222' : '#F2F2F2',
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    searchPlaceholder: {
        color: '#999',
        fontSize: 14,
        marginLeft: 8,
    },
    searchBtn: {
        paddingHorizontal: 15,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        marginLeft: -4, // Merge with search box
    },
    searchBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    heroWrapper: {
        padding: 15,
    },
    heroImg: {
        width: '100%',
        justifyContent: 'center',
        paddingLeft: 20,
    },
    heroOverlay: {
        justifyContent: 'center',
    },
    heroBadge: {
        backgroundColor: '#FFD700',
        color: '#333',
        fontSize: 10,
        fontWeight: '900',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    heroMainTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    heroSubTitle: {
        color: '#eee',
        fontSize: 14,
        fontWeight: '600',
    },
    catSection: {
        paddingVertical: 15,
        marginBottom: 10,
    },
    catScroll: {
        paddingHorizontal: 10,
    },
    catBubbleItem: {
        alignItems: 'center',
        width: 80,
    },
    catCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    catBubbleLabel: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    flashSaleSection: {
        backgroundColor: isDark ? '#1a1a1a' : '#fff',
        paddingVertical: 15,
        marginBottom: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 12,
    },
    flashSaleLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flashSaleTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#E62117', // Flash sale is always red-ish
        marginRight: 10,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerBox: {
        backgroundColor: '#333',
        color: '#fff',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 2,
        fontSize: 11,
        fontWeight: '700',
    },
    timerSep: {
        fontWeight: '900',
        paddingHorizontal: 2,
    },
    flashScroll: {
        paddingHorizontal: 10,
    },
    flashCard: {
        width: 150,
    },
    saleBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: '#E62117',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    saleBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '900',
    },
    mainGridSection: {
        paddingVertical: 15,
    },
    mainGridTitle: {
        fontSize: 15,
        fontWeight: '900',
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 4,
    },
    downloadSection: {
        padding: 15,
    },
    downloadContent: {
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    downloadTextContainer: {
        flex: 1,
    },
    downloadTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 4,
    },
    downloadSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginBottom: 15,
    },
    downloadActionBtn: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    downloadActionText: {
        fontWeight: '900',
        fontSize: 12,
    },
    phoneIconBg: {
        position: 'absolute',
        right: -20,
        bottom: -20,
    }
});

export default HomePage;

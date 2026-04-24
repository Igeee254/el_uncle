import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Image, useWindowDimensions } from 'react-native';

const MOCK_CATEGORIES = [
    { id: '1', title: 'Premium Necklaces', subtitle: 'Gold, Silver & Bronze', image: require('../assets/beaded.png'), category: 'Necklaces' },
    { id: '2', title: 'Traditional Bracelets', subtitle: 'Beads & Leather', image: require('../assets/bracelet.png'), category: 'Bracelets' },
    { id: '3', title: 'Artisan Anklets', subtitle: 'Beaded Elegance', image: require('../assets/beaded.png'), category: 'Anklets' },
    { id: '4', title: 'Special Souvenirs', subtitle: 'Magnets & Keychains', image: require('../assets/magnet.png'), category: 'Souvenirs' },
];

import ProductCard from './ProductCard';

const HomePage = ({ onNavigate, theme, isDark, headerActions, onCategorySelect, onBuy, onProductSelect, allProducts, onScroll }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const numColumns = isMobile ? 2 : 3;

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
        >
            {/* Navbar Minimal */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => onNavigate('Home')}>
                    <Text style={[styles.logo, { color: theme.text }]}>GMK KENYA</Text>
                </TouchableOpacity>
                <View style={styles.navBarRight}>
                    {!isMobile && (
                        <View style={styles.navLinks}>
                            <TouchableOpacity onPress={() => onNavigate('Shop')}><Text style={[styles.navLink, { color: theme.secondaryText }]}>CATALOG</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => onNavigate('Shop')}><Text style={[styles.navLink, { color: theme.secondaryText }]}>NEW ARRIVALS</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => onNavigate('Home')}><Text style={[styles.navLink, { color: theme.secondaryText }]}>ABOUT</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => onNavigate('Feedback')}><Text style={[styles.navLink, { color: theme.secondaryText }]}>FEEDBACK</Text></TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.headerActionsWrapper}>
                        {headerActions}
                    </View>
                </View>
            </View>

            {/* 1. HERO BANNER (Summer Special) */}
            <View style={[styles.heroBanner, { height: isMobile ? 350 : 500 }]}>
                <ImageBackground
                    source={require('../assets/hero.png')}
                    style={styles.heroImg}
                    imageStyle={{ opacity: 0.9 }}
                >
                    <View style={styles.heroTextOverlay}>
                        <Text style={styles.heroSubtitle}>Starting At Only KSh 500</Text>
                        <Text style={styles.heroTitle}>SUMMER SPECIAL{"\n"}COLLECTION</Text>
                        <TouchableOpacity style={[styles.shopNowBtn, { backgroundColor: theme.accent }]} onPress={() => onNavigate('Shop')}>
                            <Text style={styles.shopNowText}>Shop Now</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </View>

            {/* 2. CURATED COLLECTIONS (Carousel) */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Curated Collections</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                >
                    {MOCK_CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={styles.catCardCarousel}
                            onPress={() => onCategorySelect(cat.category)}
                        >
                            <Image source={cat.image} style={styles.catImage} resizeMode="cover" />
                            <View style={styles.catInfo}>
                                <Text style={[styles.catTitle, { color: theme.text }]}>{cat.category.toUpperCase()}</Text>
                                <TouchableOpacity style={[styles.catBtn, { backgroundColor: theme.accent }]} onPress={() => onCategorySelect(cat.category)}>
                                    <Text style={styles.catBtnText}>Shop Now</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* 3. JUST FOR YOU SECTION */}
            <View style={[styles.section, { paddingTop: 0 }]}>
                <Text style={[styles.justForYouTitle, { color: theme.text }]}>Just For You</Text>

                {/* Category Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {['All', 'Necklaces', 'Bracelets', 'Anklets', 'Souvenirs'].map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.chip, { borderColor: theme.border }]}
                            onPress={() => onCategorySelect(cat)}
                        >
                            <Text style={[styles.chipText, { color: theme.secondaryText }]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.productGrid}>
                    {allProducts.slice(0, 6).map(item => (
                        <View key={item.id} style={{ width: isMobile ? '50%' : '33.33%' }}>
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

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    navBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerActionsWrapper: {
        marginLeft: 10,
    },
    logo: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 2,
    },
    navLinks: {
        flexDirection: 'row',
        marginRight: 20,
    },
    navLink: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginLeft: 20,
    },
    heroBanner: {
        width: '100%',
        marginBottom: 30,
    },
    heroImg: {
        flex: 1,
        justifyContent: 'center',
    },
    heroTextOverlay: {
        paddingHorizontal: '10%',
    },
    heroSubtitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
        lineHeight: 40,
        marginBottom: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    shopNowBtn: {
        alignSelf: 'flex-start',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 4,
    },
    shopNowText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    section: {
        paddingVertical: 30,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    horizontalScroll: {
        paddingLeft: 20,
        paddingRight: 40,
    },
    catCardCarousel: {
        width: 220,
        marginRight: 20,
        alignItems: 'center',
        overflow: 'hidden',
    },
    catImage: {
        width: '100%',
        aspectRatio: 1.2,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    catInfo: {
        marginTop: 10,
        alignItems: 'center',
    },
    catTitle: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    catBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    catBtnText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    justForYouTitle: {
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 20,
    },
    chipScroll: {
        marginBottom: 20,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 4,
        borderWidth: 1,
        marginRight: 10,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    }
});

export default HomePage;

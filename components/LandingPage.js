import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Image, useWindowDimensions } from 'react-native';

const CAROUSEL_ITEMS = [
    { id: '1', title: 'Smart Gadgets', image: require('../assets/keychain.png') },
    { id: '2', title: 'Fashion Trends', image: require('../assets/hero.png') },
    { id: '3', title: 'Home Essentials', image: require('../assets/magnet.png') },
    { id: '4', title: 'Health & Beauty', image: require('../assets/beaded.png') },
];

const LandingPage = ({ onNavigate, theme, isDark, headerActions }) => {
    const { width, height } = useWindowDimensions();
    const isMobile = width < 768;

    const NavLinks = () => (
        <View style={[styles.navLinks, isMobile && styles.navLinksMobile]}>
            <TouchableOpacity onPress={() => onNavigate('Home')}><Text style={styles.navLink}>Home</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => onNavigate('Shop')}><Text style={styles.navLink}>Fashion</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => onNavigate('Shop')}><Text style={styles.navLink}>Electronics</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => onNavigate('Shop')}><Text style={styles.navLink}>Shop All</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => onNavigate('About')}><Text style={styles.navLink}>About Us</Text></TouchableOpacity>
        </View>
    );

    return (
        <ScrollView style={[styles.scrollView, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>

            {/* 1. HERO SECTION (Full Screen Height) */}
            <View style={{ height: height }}>
                <ImageBackground
                    source={require('../assets/background.png')}
                    style={styles.background}
                >
                    <View style={styles.overlay}>
                        {/* Top Navigation */}
                        <View style={styles.navBar}>
                            <TouchableOpacity onPress={() => onNavigate('Home')}>
                                <Text style={styles.logo}>KweliStoreKenya</Text>
                            </TouchableOpacity>
                            {!isMobile && <NavLinks />}
                            <View style={styles.headerRight}>
                                {headerActions}
                            </View>
                        </View>

                        {/* Center Card */}
                        <View style={[styles.cardContainer, isMobile && styles.cardContainerMobile]}>
                            <ImageBackground
                                source={require('../assets/hero.png')}
                                style={styles.heroBackground}
                                imageStyle={styles.heroBackgroundImage}
                            >
                                <View style={[styles.cardOverlay, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
                                    <Text style={[styles.headline, { fontSize: isMobile ? 28 : 50 }]}>Welcome to KweliStoreKenya</Text>
                                    <TouchableOpacity style={styles.button} onPress={() => onNavigate('Home')}>
                                        <Text style={styles.buttonText}>Start Shopping</Text>
                                    </TouchableOpacity>
                                </View>
                            </ImageBackground>
                        </View>
                    </View>
                </ImageBackground>
            </View>

            {/* 2. CAROUSEL SECTION */}
            <View style={[styles.carouselSection, { backgroundColor: theme.background }]}>
                <Text style={[styles.sectionTitle, { color: theme.text, fontSize: isMobile ? 22 : 32 }]}>Discover Our Marketplace</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.secondaryText, fontSize: isMobile ? 13 : 16 }]}>Handpicked quality products from Kenya's finest sellers.</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer}>
                    {CAROUSEL_ITEMS.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.carouselItem} onPress={() => onNavigate('Shop')}>
                            <Image source={item.image} style={styles.carouselImage} />
                            <Text style={[styles.carouselText, { color: theme.text, backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }]}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* 3. LOWER FEATURE IMAGE */}
            <View style={[styles.featureSection, { flexDirection: width >= 768 ? 'row' : 'column' }]}>
                <ImageBackground source={require('../assets/beaded.png')} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} resizeMode="cover">
                    <View style={[styles.featureOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)' }]}>
                        <Text style={[styles.featureTitle, { color: isDark ? '#fff' : '#000', textAlign: 'center' }]}>The Artisan Touch</Text>
                        <TouchableOpacity style={[styles.featureButton, { borderColor: isDark ? '#fff' : '#000' }]} onPress={() => onNavigate('Shop')}>
                            <Text style={[styles.featureButtonText, { color: isDark ? '#fff' : '#000' }]}>SHOP COLLECTION</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
                {/* Adding secondary image to stop leaving the right side mostly blank */}
                <Image source={require('../assets/bracelet.png')} style={{ flex: 1, width: '100%', height: '100%' }} resizeMode="cover" />
            </View>

            {/* Footer Space */}
            <View style={{ height: 100, backgroundColor: theme.background }} />

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    background: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
    },
    navBar: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 40,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 1,
    },
    navLinks: {
        flexDirection: 'row',
    },
    navLinksMobile: {
        display: 'none',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navLink: {
        color: '#fff',
        fontSize: 14,
        marginHorizontal: 15,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardContainer: {
        width: '60%',
        flex: 1,
        marginTop: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        overflow: 'hidden',
    },
    cardContainerMobile: {
        width: '100%',
        marginTop: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    heroBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    heroBackgroundImage: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    cardOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headline: {
        fontSize: 50,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 40,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    button: {
        backgroundColor: '#F15A24',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 35,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    carouselSection: {
        paddingVertical: 60,
    },
    sectionTitle: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 10,
    },
    sectionSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
    },
    carouselContainer: {
        paddingHorizontal: 20,
    },
    carouselItem: {
        width: 280,
        marginHorizontal: 15,
    },
    carouselImage: {
        width: '100%',
        height: 350,
        borderRadius: 15,
        marginBottom: 15,
    },
    carouselText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 1,
    },
    featureSection: {
        height: 500,
        width: '100%',
    },
    featureBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureOverlay: {
        padding: 40,
        borderRadius: 10,
        alignItems: 'center',
    },
    featureTitle: {
        fontSize: 38,
        fontWeight: '800',
        marginBottom: 20,
        letterSpacing: 2,
    },
    featureButton: {
        borderWidth: 2,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
    },
    featureButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});

export default LandingPage;

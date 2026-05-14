import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    useWindowDimensions,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MasonryGrid from './MasonryGrid';



const VARIETIES = [
    { id: 'v1', label: 'Circular', shape: 'circle', priceOffset: 0 },
    { id: 'v2', label: 'Cubical', shape: 'square', priceOffset: 200 },
    { id: 'v3', label: 'Heart', shape: 'heart', priceOffset: 350 },
    { id: 'v4', label: 'Star', shape: 'star', priceOffset: 500 },
];

const COLORS = [
    { id: 'c1', name: 'Original', hex: '#2E7D32' },
    { id: 'c2', name: 'Ebony', hex: '#1a1a1a' },
    { id: 'c3', name: 'Ocean', hex: '#0077be' },
    { id: 'c4', name: 'Sunset', hex: '#ff5e62' },
];

// Maps each color to a distinct product image (can be replaced with real photos)
const COLOR_IMAGES = {
    c1: { uri: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop' }, // sage/green
    c2: { uri: 'https://images.unsplash.com/photo-1573408302382-951c22502e60?q=80&w=600&auto=format&fit=crop' }, // dark/ebony
    c3: { uri: 'https://images.unsplash.com/photo-1624009664551-052026857640?q=80&w=600&auto=format&fit=crop' }, // ocean blue
    c4: { uri: 'https://images.unsplash.com/photo-1520004434532-668416a08753?q=80&w=600&auto=format&fit=crop' }, // sunset/red
};

// Maps each variety shape to a distinct product image
const VARIETY_IMAGES = {
    circle: { uri: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop' },
    square: { uri: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop' },
    heart: { uri: 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?q=80&w=600&auto=format&fit=crop' },
    star: { uri: 'https://images.unsplash.com/photo-1589128504746-c58296531867?q=80&w=600&auto=format&fit=crop' },
};

const ProductDetail = ({ product, theme, isDark, onNavigate, onBuy, relatedProducts, onProductSelect, onScroll, wishlist, toggleWishlist }) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const [selectedVariety, setSelectedVariety] = useState(VARIETIES[0]);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [displayImage, setDisplayImage] = useState(null);
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const currentImage = displayImage || product.image;
    const basePriceNum = parseInt(product.price.replace('KSh ', '').replace(',', ''));
    const currentPrice = `KSh ${(basePriceNum + selectedVariety.priceOffset).toLocaleString()}`;

    const handleVarietySelect = (v) => {
        setSelectedVariety(v);
        setDisplayImage(VARIETY_IMAGES[v.shape]);
    };

    const handleColorSelect = (c) => {
        setSelectedColor(c);
        setDisplayImage(COLOR_IMAGES[c.id]);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Premium Kilimall-Style Header */}
            <View style={[styles.header, { backgroundColor: isDark ? '#1a1a1a' : '#fff', borderBottomColor: theme.border, borderBottomWidth: 0.5 }]}>
                <TouchableOpacity onPress={() => onNavigate('Shop')} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>PRODUCT DETAILS</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.headerButton} onPress={() => toggleWishlist(product)}>
                        <Ionicons
                            name={wishlist?.find(i => i.id === product.id) ? "heart" : "heart-outline"}
                            size={22}
                            color={wishlist?.find(i => i.id === product.id) ? "#F15A24" : theme.text}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="share-social-outline" size={22} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ backgroundColor: theme.background }}
            >
                <View style={[styles.mainLayout, isDesktop && styles.desktopLayout]}>
                    {/* Image Section */}
                    <View style={[styles.imageContainer, isDesktop && styles.imageContainerDesktop]}>
                        <Image source={currentImage} style={styles.mainImage} resizeMode="cover" />
                    </View>

                    {/* Content Section */}
                    <View style={[styles.content, isDesktop && styles.contentDesktop, { backgroundColor: theme.background }]}>
                        <View style={styles.priceRow}>
                            <Text style={[styles.priceText, { color: '#F15A24' }]}>{currentPrice}</Text>
                            <View style={[styles.badge, { backgroundColor: 'rgba(46, 125, 50, 0.1)' }]}>
                                <Text style={[styles.badgeText, { color: '#2E7D32' }]}>TOP CHOICE</Text>
                            </View>
                        </View>

                        <Text style={[styles.title, { color: theme.text }]}>{product.title}</Text>

                        <View style={styles.ratingRow}>
                            <View style={styles.stars}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Ionicons key={s} name="star" size={14} color="#FFB800" />
                                ))}
                            </View>
                            <Text style={[styles.ratingCount, { color: theme.secondaryText }]}>4.9 (48 Reviews)</Text>
                        </View>

                        <View style={[styles.deliveryInfo, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9F9F9' }]}>
                            <Ionicons name="airplane-outline" size={18} color="#2E7D32" />
                            <Text style={[styles.deliveryText, { color: theme.text }]}>Free Delivery on orders above KSh 5,000</Text>
                        </View>

                        <View style={styles.divider} />

                        {/* Variety Selection */}
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>VARIETY: {selectedVariety.label}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                            {VARIETIES.map((v) => (
                                <TouchableOpacity
                                    key={v.id}
                                    onPress={() => handleVarietySelect(v)}
                                    style={[
                                        styles.varietyChip,
                                        { borderColor: theme.border },
                                        selectedVariety.id === v.id && { backgroundColor: '#2E7D32', borderColor: '#2E7D32' }
                                    ]}
                                >
                                    <Text style={[
                                        styles.varietyText,
                                        { color: theme.secondaryText },
                                        selectedVariety.id === v.id && { color: '#fff' }
                                    ]}>
                                        {v.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Color Selection */}
                        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 15 }]}>COLOR: {selectedColor.name}</Text>
                        <View style={styles.colorContainer}>
                            {COLORS.map((c) => (
                                <TouchableOpacity
                                    key={c.id}
                                    onPress={() => handleColorSelect(c)}
                                    style={[
                                        styles.colorCircle,
                                        { backgroundColor: c.hex },
                                        selectedColor.id === c.id && styles.selectedColorCircle
                                    ]}
                                />
                            ))}
                        </View>

                        <View style={styles.divider} />

                        <Text style={[styles.sectionTitle, { color: theme.text }]}>DESCRIPTION</Text>
                        <Text style={[styles.description, { color: theme.secondaryText }]}>
                            Premium quality handcrafted product from KweliStore. Made with locally sourced materials, ensuring durability and authentic Kenyan aesthetic.
                        </Text>

                        <View style={styles.divider} />

                        {/* Quantity & Action */}
                        <View style={styles.quantitySection}>
                            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>QUANTITY</Text>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={[styles.quantBtn, { borderColor: theme.border }]}>
                                    <Ionicons name="remove" size={18} color={theme.text} />
                                </TouchableOpacity>
                                <Text style={[styles.quantText, { color: theme.text }]}>{quantity}</Text>
                                <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={[styles.quantBtn, { borderColor: theme.border }]}>
                                    <Ionicons name="add" size={18} color={theme.text} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.buyButton, { backgroundColor: '#F15A24', flex: 1.5 }]}
                                onPress={() => {
                                    const contact = product.provider_contact || '254700000000';
                                    const cleanContact = contact.replace(/\D/g, '');
                                    const message = encodeURIComponent(
                                        `Hi! I'm interested in buying *${product.title}* from KweliStore.\n` +
                                        `• Variety: ${selectedVariety.label}\n` +
                                        `• Color: ${selectedColor.name}\n` +
                                        `• Quantity: ${quantity}\n` +
                                        `• Price: ${currentPrice}`
                                    );
                                    Linking.openURL(`https://wa.me/${cleanContact}?text=${message}`);
                                }}
                            >
                                <Text style={styles.buyButtonText}>INQUIRE TO BUY</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.cartButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0', flex: 1 }]}
                                onPress={() => onBuy({ ...product, price: currentPrice, variety: selectedVariety.label, color: selectedColor.name, quantity }, false)}
                            >
                                <Ionicons name="cart-outline" size={22} color={theme.text} />
                                <Text style={[styles.cartButtonText, { color: theme.text }]}>ADD TO CART</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.divider, { marginVertical: 30 }]} />

                        <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 18, textAlign: 'center' }]}>JUST FOR YOU</Text>
                    </View>
                </View>

                <View style={[styles.relatedContainer, { backgroundColor: theme.background }]}>
                    <MasonryGrid
                        data={relatedProducts.filter(p => p.id !== product.id)}
                        theme={theme}
                        isDark={isDark}
                        onBuy={onBuy}
                        onProductPress={(p) => {
                            onNavigate('ProductDetail');
                            onProductSelect(p);
                        }}
                        wishlist={wishlist}
                        toggleWishlist={toggleWishlist}
                    />
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>

            {/* Floating WhatsApp Button */}
            <TouchableOpacity
                style={styles.whatsappBtn}
                onPress={() => {
                    const contact = product.provider_contact || '254700000000';
                    const cleanContact = contact.replace(/\D/g, '');
                    const message = encodeURIComponent(`Hi! I'm interested in purchasing the "${product.title}". Is it available?`);
                    Linking.openURL(`https://wa.me/${cleanContact}?text=${message}`);
                }}
            >
                <Ionicons name="logo-whatsapp" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        zIndex: 10,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 2,
    },
    headerButton: {
        padding: 8,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f5f5f5',
    },
    imageContainerDesktop: {
        width: '45%',
        aspectRatio: 1,
        maxHeight: 600,
        borderRadius: 20,
        overflow: 'hidden',
    },
    mainLayout: {
        width: '100%',
    },
    desktopLayout: {
        flexDirection: 'row',
        padding: 40,
        justifyContent: 'center',
        maxWidth: 1200,
        alignSelf: 'center',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    contentDesktop: {
        flex: 1,
        paddingLeft: 50,
        paddingTop: 0,
    },
    content: {
        padding: 16,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    priceText: {
        fontSize: 24,
        fontWeight: '900',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 24,
        marginBottom: 10,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    stars: {
        flexDirection: 'row',
        marginRight: 8,
    },
    ratingCount: {
        fontSize: 12,
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    deliveryText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 8,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(128,128,128,0.1)',
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '900',
        marginBottom: 10,
        letterSpacing: 1,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
    },
    selectorScroll: {
        marginBottom: 5,
    },
    varietyChip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 5,
    },
    varietyText: {
        fontSize: 12,
        fontWeight: '700',
    },
    colorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    colorCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    selectedColorCircle: {
        borderColor: '#F15A24',
        transform: [{ scale: 1.15 }],
    },
    quantitySection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantText: {
        fontSize: 14,
        fontWeight: '900',
        marginHorizontal: 12,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    buyButton: {
        height: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
    },
    cartButton: {
        height: 50,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    cartButtonText: {
        fontSize: 12,
        fontWeight: '900',
    },
    relatedContainer: {
        paddingHorizontal: 5,
    },
    whatsappBtn: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#25D366',
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        zIndex: 999,
    }
});

export default ProductDetail;

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
    // Dynamic image: starts with product image, updates on color/variety change
    const [displayImage, setDisplayImage] = useState(null);
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const currentImage = displayImage || product.image;

    // Calculate base price (remove 'KSh ' and comma)
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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background }]}>
                <TouchableOpacity onPress={() => onNavigate('Shop')} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.accent} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>PRODUCT DETAILS</Text>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.headerButton} onPress={() => toggleWishlist(product)}>
                        <Ionicons
                            name={wishlist?.find(i => i.id === product.id) ? "heart" : "heart-outline"}
                            size={24}
                            color={wishlist?.find(i => i.id === product.id) ? "#ff4757" : theme.accent}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="share-outline" size={24} color={theme.accent} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
                <View style={[styles.mainLayout, isDesktop && styles.desktopLayout]}>
                    {/* Image Section */}
                    <View style={[styles.imageContainer, isDesktop && styles.imageContainerDesktop]}>
                        <Image source={currentImage} style={styles.mainImage} resizeMode="cover" />
                        {!isDesktop && (
                            <View style={[styles.priceTag, { backgroundColor: theme.accent }]}>
                                <Text style={styles.priceTagText}>{currentPrice}</Text>
                            </View>
                        )}
                    </View>

                    {/* Content */}
                    <View style={[styles.content, isDesktop && styles.contentDesktop]}>
                        <Text style={[styles.title, { color: theme.text }]}>{product.title}</Text>
                        <Text style={[styles.category, { color: theme.accent }]}>Premium Souvenir Collection</Text>

                        {product.uploader_name ? (
                            <View style={styles.providerBadge}>
                                <Ionicons name="shield-checkmark-outline" size={16} color={theme.accent} />
                                <Text style={[styles.providerText, { color: theme.accent, fontWeight: '700' }]}>Service by: {product.uploader_name}</Text>
                            </View>
                        ) : null}

                        {product.provider_contact ? (
                            <View style={styles.providerBadge}>
                                <Ionicons name="call-outline" size={16} color={theme.secondaryText} />
                                <Text style={[styles.providerText, { color: theme.secondaryText }]}>Contact: {product.provider_contact}</Text>
                            </View>
                        ) : null}

                        {isDesktop && (
                            <Text style={[styles.desktopPrice, { color: theme.text }]}>{currentPrice}</Text>
                        )}

                        <View style={styles.divider} />

                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
                        <Text style={[styles.description, { color: theme.secondaryText }]}>
                            This handcrafted piece is a testament to authentic craftsmanship. Made with premium materials sourced locally, it embodies the rich cultural heritage of Kenya. Perfect as a gift or a timeless addition to your personal collection.
                        </Text>

                        {/* Variety Selection */}
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Variety (Shape)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                            {VARIETIES.map((v) => (
                                <TouchableOpacity
                                    key={v.id}
                                    onPress={() => handleVarietySelect(v)}
                                    style={[
                                        styles.varietyChip,
                                        { borderColor: theme.border },
                                        selectedVariety.id === v.id && { backgroundColor: theme.accent, borderColor: theme.accent }
                                    ]}
                                >
                                    <Text style={[
                                        styles.varietyText,
                                        { color: theme.secondaryText },
                                        selectedVariety.id === v.id && { color: '#fff' }
                                    ]}>
                                        {v.label} {v.priceOffset > 0 ? `(+${v.priceOffset})` : ''}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Color Selection */}
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Color</Text>
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
                            <Text style={[styles.colorName, { color: theme.secondaryText }]}>{selectedColor.name}</Text>
                        </View>

                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quantity</Text>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={[styles.quantBtn, { borderColor: theme.border }]}>
                                <Ionicons name="remove" size={20} color={theme.text} />
                            </TouchableOpacity>
                            <Text style={[styles.quantText, { color: theme.text }]}>{quantity}</Text>
                            <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={[styles.quantBtn, { borderColor: theme.border }]}>
                                <Ionicons name="add" size={20} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.buyButton, { backgroundColor: theme.accent, flex: 2 }]}
                                onPress={() => {
                                    const contact = product.provider_contact || '254700000000';
                                    const cleanContact = contact.replace(/\D/g, '');
                                    const message = encodeURIComponent(
                                        `Hi! I'm interested in buying *${product.title}*.\n\n` +
                                        `• Variety: ${selectedVariety.label}\n` +
                                        `• Color: ${selectedColor.name}\n` +
                                        `• Quantity: ${quantity}\n` +
                                        `• Price: ${currentPrice}\n\n` +
                                        `Is it available?`
                                    );
                                    Linking.openURL(`https://wa.me/${cleanContact}?text=${message}`);
                                }}
                            >
                                <Text style={styles.buyButtonText}>INQUIRE TO BUY</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.cartButton, { borderColor: theme.accent, flex: 1, borderWidth: 2 }]}
                                onPress={() => onBuy({ ...product, price: currentPrice, variety: selectedVariety.label, color: selectedColor.name, quantity }, false)}
                            >
                                <Ionicons name="cart-outline" size={24} color={theme.accent} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        {/* Just For You Section */}
                        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 15 }]}>Just For You</Text>
                    </View>
                </View>

                <View style={styles.relatedContainer}>
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

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Floating WhatsApp Button */}
            <TouchableOpacity
                style={styles.whatsappBtn}
                onPress={() => {
                    const contact = product.provider_contact || '254700000000'; // Fallback
                    const cleanContact = contact.replace(/\D/g, ''); // Remove non-numeric
                    const message = encodeURIComponent(`Hi! I'm interested in purchasing the "${product.title}". Is it available?`);
                    Linking.openURL(`https://wa.me/${cleanContact}?text=${message}`);
                }}
            >
                <Ionicons name="logo-whatsapp" size={28} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
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
        paddingVertical: 10,
        marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
    },
    headerButton: {
        padding: 8,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        position: 'relative',
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
    desktopPrice: {
        fontSize: 32,
        fontWeight: '900',
        marginTop: 10,
    },
    priceTag: {
        position: 'absolute',
        bottom: 20,
        right: 0,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderTopLeftRadius: 30,
        borderBottomLeftRadius: 30,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    priceTagText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 5,
    },
    category: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 15,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(128,128,128,0.1)',
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 10,
    },
    selectorScroll: {
        marginBottom: 10,
    },
    varietyChip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1.5,
        marginRight: 10,
        marginBottom: 10,
    },
    varietyText: {
        fontSize: 13,
        fontWeight: '700',
    },
    colorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    colorCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedColorCircle: {
        borderColor: '#fff',
        transform: [{ scale: 1.1 }],
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    colorName: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 5,
    },
    buyButton: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        marginTop: 10,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    cartButton: {
        height: 58,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 15,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    quantBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantText: {
        fontSize: 16,
        fontWeight: '700',
        marginHorizontal: 15,
    },
    relatedContainer: {
        paddingHorizontal: 5,
    },
    whatsappBtn: {
        position: 'absolute',
        bottom: Platform.OS === 'android' ? 25 : 35,
        right: 20,
        backgroundColor: '#25D366',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        zIndex: 999,
    },
    providerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    providerText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 5,
    }
});

export default ProductDetail;

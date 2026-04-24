import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CartPage = ({ cart, onRemove, onClear, onCheckout, theme, onNavigate }) => {

    const totalPrice = cart.reduce((sum, item) => {
        const price = parseInt(item.price.replace('KSh ', '').replace(',', ''));
        return sum + (price * (item.quantity || 1));
    }, 0);

    const renderItem = ({ item, index }) => (
        <View style={[styles.cartItem, { borderBottomColor: theme.border }]}>
            <Image source={item.image} style={styles.itemImage} />
            <View style={styles.itemDetails}>
                <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.itemPrice, { color: theme.accent }]}>{item.price}</Text>
                {item.variety && (
                    <Text style={[styles.itemSubtitle, { color: theme.secondaryText }]}>
                        {item.variety} | {item.color}
                    </Text>
                )}
                {item.quantity && item.quantity > 1 && (
                    <Text style={[styles.itemSubtitle, { color: theme.accent, fontWeight: '700', marginTop: 4 }]}>
                        Qty: {item.quantity}  (KSh {(parseInt(item.price.replace('KSh ', '').replace(',', '')) * item.quantity).toLocaleString()})
                    </Text>
                )}
            </View>
            <TouchableOpacity onPress={() => onRemove(index)} style={styles.removeButton}>
                <Ionicons name="trash-outline" size={20} color="#ff5e62" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => onNavigate('Home')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.accent} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>MY SHOPPING CART</Text>
                <TouchableOpacity onPress={onClear} disabled={cart.length === 0}>
                    <Text style={[styles.clearText, { color: cart.length > 0 ? theme.secondaryText : '#ccc' }]}>Clear All</Text>
                </TouchableOpacity>
            </View>

            {cart.length > 0 ? (
                <>
                    <FlatList
                        data={cart}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                    />
                    <View style={[styles.footer, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.totalRow}>
                            <Text style={[styles.totalLabel, { color: theme.secondaryText }]}>Total Amount</Text>
                            <Text style={[styles.totalValue, { color: theme.text }]}>KSh {totalPrice.toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity style={[styles.checkoutBtn, { backgroundColor: theme.accent }]} onPress={onCheckout}>
                            <Text style={styles.checkoutText}>PROCEED TO CHECKOUT</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color={theme.secondaryText} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>Your cart is empty</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.secondaryText }]}>Looks like you haven't added anything yet.</Text>
                    <TouchableOpacity style={[styles.startShoppingBtn, { backgroundColor: theme.accent }]} onPress={() => onNavigate('Shop')}>
                        <Text style={styles.startShoppingText}>START SHOPPING</Text>
                    </TouchableOpacity>
                </View>
            )}
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
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },
    backBtn: {
        padding: 5,
    },
    clearText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        padding: 20,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 15,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 13,
        fontWeight: '800',
    },
    itemSubtitle: {
        fontSize: 11,
        marginTop: 2,
    },
    removeButton: {
        padding: 10,
    },
    footer: {
        padding: 25,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '900',
    },
    checkoutBtn: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
    },
    checkoutText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 20,
        marginBottom: 30,
    },
    startShoppingBtn: {
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
    },
    startShoppingText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    }
});

export default CartPage;

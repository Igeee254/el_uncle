import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OrderHistory = ({ userProfile, theme, isDark, onNavigate }) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://el-uncle-backend.onrender.com/api';
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/user/orders?email=${userProfile.email}`);
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (e) {
            console.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'delivered': return '#4caf50';
            case 'pending':
            case 'processing': return '#ff9800';
            case 'cancelled': return '#f44336';
            default: return theme.accent;
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.orderCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={[styles.orderHeader, { borderBottomColor: theme.border }]}>
                <View>
                    <Text style={[styles.orderId, { color: theme.text }]}>ORDER #{item.id}</Text>
                    <Text style={[styles.orderDate, { color: theme.secondaryText }]}>{item.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.orderBody}>
                {item.items && item.items.map((prod, idx) => (
                    <View key={idx} style={styles.itemRow}>
                        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>
                            {prod.qty}x {prod.name}
                        </Text>
                        <Text style={[styles.itemPrice, { color: theme.secondaryText }]}>
                            KSh {prod.price.toLocaleString()}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={[styles.orderFooter, { borderTopColor: theme.border }]}>
                <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount:</Text>
                <Text style={[styles.totalAmount, { color: theme.accent }]}>KSh {item.total.toLocaleString()}</Text>
            </View>

            <TouchableOpacity style={[styles.trackButton, { borderColor: theme.accent }]}>
                <Text style={[styles.trackButtonText, { color: theme.accent }]}>Track Order</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => onNavigate('Settings')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.accent} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>ORDER HISTORY</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.accent} />
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="receipt-outline" size={60} color={theme.secondaryText} />
                    <Text style={[styles.emptyText, { color: theme.text }]}>No Orders Yet</Text>
                    <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>When you buy something, it will appear here.</Text>
                    <TouchableOpacity
                        style={[styles.shopButton, { backgroundColor: theme.accent }]}
                        onPress={() => onNavigate('Shop')}
                    >
                        <Text style={styles.shopButtonText}>START SHOPPING</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: Platform.OS === 'android' ? 40 : 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
    headerTitle: { fontSize: 16, fontWeight: '800', letterSpacing: 2 },
    backButton: { padding: 5 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    listContent: { padding: 20, paddingBottom: 40 },
    emptyText: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
    emptySubtext: { fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 25 },
    shopButton: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
    shopButtonText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
    orderCard: { borderRadius: 15, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
    orderId: { fontSize: 14, fontWeight: 'bold' },
    orderDate: { fontSize: 12, marginTop: 4 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    orderBody: { padding: 15 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    itemName: { flex: 1, fontSize: 14, marginRight: 15 },
    itemPrice: { fontSize: 14, fontWeight: '500' },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderTopWidth: 1 },
    totalLabel: { fontSize: 14, fontWeight: '600' },
    totalAmount: { fontSize: 16, fontWeight: 'bold' },
    trackButton: { margin: 15, marginTop: 0, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
    trackButtonText: { fontWeight: 'bold', fontSize: 14 }
});

export default OrderHistory;

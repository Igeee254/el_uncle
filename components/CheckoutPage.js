import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, SafeAreaView, Platform, Alert, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CheckoutPage = ({ cart, theme, onNavigate, onClear, userProfile }) => {
    // Payment method state
    const [paymentMethod, setPaymentMethod] = useState('mpesa'); // 'mpesa' or 'paystack'
    const [mpesaPhone, setMpesaPhone] = useState(userProfile?.phone || '');
    const [paystackEmail, setPaystackEmail] = useState(userProfile?.email || '');
    const [ordered, setOrdered] = useState(false);
    const [isTriggeringPayment, setIsTriggeringPayment] = useState(false);
    const [paystackUrlAuth, setPaystackUrlAuth] = useState(null);

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://el-uncle.onrender.com/api';

    const total = cart.reduce((sum, item) => {
        const num = parseInt(String(item.price).replace('KSh ', '').replace(',', '')) || 0;
        return sum + (num * (item.quantity || 1));
    }, 0);

    const handlePlaceOrder = async () => {
        if (!mpesaPhone) {
            Alert.alert("Missing Phone", "Please provide an M-Pesa phone number.");
            return;
        }

        // Basic formatting to 254...
        let phone = mpesaPhone.replace(/\s+/g, '').replace(/\+/g, '');
        if (phone.startsWith('0')) phone = '254' + phone.substring(1);
        if (!phone.startsWith('254')) phone = '254' + phone;

        setIsTriggeringPayment(true);
        try {
            const res = await fetch(`${API_URL}/mpesa/stkpush`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, amount: total })
            });
            const data = await res.json();
            if (res.ok && data.ResponseCode === "0") {
                Alert.alert("STK Push Sent!", "Please check your phone and enter your M-Pesa PIN.");
                setOrdered(true);
            } else {
                Alert.alert("Payment Failed", data.errorMessage || data.error || "Could not trigger STK Push.");
            }
        } catch (e) {
            Alert.alert("Network Error", "Could not connect to payment server. Please try again.");
        } finally {
            setIsTriggeringPayment(false);
        }
    };

    const handlePaystackOrder = async () => {
        if (!paystackEmail) {
            Alert.alert("Missing Email", "Please provide an email address for Paystack receipt.");
            return;
        }

        setIsTriggeringPayment(true);
        try {
            const res = await fetch(`${API_URL}/paystack/initialize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: paystackEmail, amount: total })
            });
            const data = await res.json();
            if (res.ok && data.status && data.data && data.data.authorization_url) {
                // Open Paystack URL in browser
                Linking.openURL(data.data.authorization_url);
                setOrdered(true);
            } else {
                Alert.alert("Payment Failed", data.message || data.error || "Could not initialize Paystack payment.");
            }
        } catch (e) {
            Alert.alert("Network Error", "Could not connect to payment server. Please try again.");
        } finally {
            setIsTriggeringPayment(false);
        }
    };

    const submitPayment = () => {
        if (paymentMethod === 'mpesa') {
            handlePlaceOrder();
        } else {
            handlePaystackOrder();
        }
    };

    // ── SUCCESS SCREEN ───────────────────────────────────────────────
    if (ordered) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Ionicons name="checkmark-circle" size={100} color="#4caf50" />
                <Text style={[styles.successTitle, { color: theme.text, textAlign: 'center' }]}>
                    Payment Initiated!
                </Text>
                <Text style={[styles.successSub, { color: theme.secondaryText }]}>
                    {paymentMethod === 'mpesa'
                        ? "We have sent an STK push to your phone. Please enter your PIN to complete the transaction."
                        : "You are being redirected to Paystack to complete your payment securely. If the URL did not open automatically, please check your pop-up blocker."}
                </Text>

                <View style={{ marginTop: 40, width: '100%' }}>
                    <TouchableOpacity
                        style={[styles.nextBtn, { backgroundColor: theme.accent, width: '100%', marginBottom: 15 }]}
                        onPress={() => { onClear(); onNavigate('Home'); }}
                    >
                        <Text style={styles.nextBtnText}>BACK TO MARKETPLACE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.nextBtn, { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.accent, width: '100%' }]}
                        onPress={() => { onClear(); onNavigate('Profile'); }}
                    >
                        <Text style={[styles.nextBtnText, { color: theme.accent }]}>VIEW ORDER HISTORY</Text>
                        <Ionicons name="time-outline" size={16} color={theme.accent} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => onNavigate('Cart')} style={styles.headerBackBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.accent} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>SECURE CHECKOUT</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.formCard}>
                    <Text style={[styles.stepTitle, { color: theme.text, marginTop: 20 }]}>Order Summary</Text>

                    {/* Items List */}
                    <View style={[styles.summaryBox, { backgroundColor: theme.cardBackground }]}>
                        {cart.map((item, i) => (
                            <View key={i} style={[styles.summaryRow, i < cart.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: theme.border }]}>
                                <Text style={[styles.summaryItem, { color: theme.text }]} numberOfLines={1}>
                                    {item.quantity && item.quantity > 1 ? `${item.quantity}x ` : ''}{item.title}
                                </Text>
                                <Text style={[styles.summaryPrice, { color: theme.accent }]}>
                                    KSh {(parseInt(String(item.price).replace('KSh ', '').replace(',', '')) * (item.quantity || 1)).toLocaleString()}
                                </Text>
                            </View>
                        ))}
                        <View style={[styles.summaryRow, { borderTopWidth: 1.5, borderTopColor: theme.border, marginTop: 8, paddingTop: 12 }]}>
                            <Text style={[styles.summaryItem, { color: theme.text, fontWeight: '900' }]}>GRAND TOTAL</Text>
                            <Text style={[styles.summaryPrice, { color: theme.accent, fontSize: 20, fontWeight: '900' }]}>KSh {total.toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* Payment Method Selector */}
                    <Text style={[styles.label, { color: theme.text, marginTop: 25, marginBottom: 15 }]}>Choose Payment Method</Text>
                    <View style={styles.methodSelector}>
                        <TouchableOpacity
                            style={[
                                styles.methodCard,
                                { borderColor: theme.border, backgroundColor: theme.cardBackground },
                                paymentMethod === 'mpesa' && { borderColor: '#4caf50', backgroundColor: '#e8f5e9' }
                            ]}
                            onPress={() => setPaymentMethod('mpesa')}
                        >
                            <Ionicons name="phone-portrait" size={28} color={paymentMethod === 'mpesa' ? '#4caf50' : theme.text} />
                            <Text style={[styles.methodText, { color: theme.text }]}>M-PESA</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.methodCard,
                                { borderColor: theme.border, backgroundColor: theme.cardBackground },
                                paymentMethod === 'paystack' && { borderColor: '#00c3f8', backgroundColor: '#e0f7fa' }
                            ]}
                            onPress={() => setPaymentMethod('paystack')}
                        >
                            <Ionicons name="card" size={28} color={paymentMethod === 'paystack' ? '#00c3f8' : theme.text} />
                            <Text style={[styles.methodText, { color: theme.text }]}>PAYSTACK</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Dynamic Input based on method */}
                    <View style={[styles.mpesaBox, { backgroundColor: theme.cardBackground, borderColor: paymentMethod === 'mpesa' ? '#4caf50' : '#00c3f8', marginTop: 20 }]}>
                        {paymentMethod === 'mpesa' ? (
                            <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                                    <Ionicons name="phone-portrait-outline" size={24} color={'#4caf50'} />
                                    <Text style={[styles.label, { color: theme.text, marginLeft: 10, marginBottom: 0 }]}>M-Pesa STK Push</Text>
                                </View>
                                <Text style={[styles.mpesaDetail, { color: theme.secondaryText, fontSize: 13, fontWeight: '400', marginBottom: 20 }]}>
                                    Enter your number below. A secure payment prompt will be sent to your phone.
                                </Text>

                                <Text style={[styles.label, { color: theme.text }]}>M-Pesa Number</Text>
                                <TextInput
                                    style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                                    value={mpesaPhone}
                                    onChangeText={setMpesaPhone}
                                    placeholder="e.g. 0712 345 678"
                                    placeholderTextColor={theme.secondaryText}
                                    keyboardType="phone-pad"
                                />
                            </>
                        ) : (
                            <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                                    <Ionicons name="shield-checkmark" size={24} color={'#00c3f8'} />
                                    <Text style={[styles.label, { color: theme.text, marginLeft: 10, marginBottom: 0 }]}>Paystack Checkout</Text>
                                </View>
                                <Text style={[styles.mpesaDetail, { color: theme.secondaryText, fontSize: 13, fontWeight: '400', marginBottom: 20 }]}>
                                    Pay securely using your Card or Mobile Money via Paystack.
                                </Text>

                                <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
                                <TextInput
                                    style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                                    value={paystackEmail}
                                    onChangeText={setPaystackEmail}
                                    placeholder="your@email.com"
                                    placeholderTextColor={theme.secondaryText}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.nextBtn,
                            { backgroundColor: paymentMethod === 'mpesa' ? '#2E7D32' : '#00c3f8', flex: 1, marginTop: 20 }
                        ]}
                        onPress={submitPayment}
                        disabled={isTriggeringPayment}
                    >
                        <Ionicons name={paymentMethod === 'mpesa' ? "shield-checkmark" : "card"} size={18} color="#fff" style={{ marginRight: 10 }} />
                        <Text style={styles.nextBtnText}>
                            {isTriggeringPayment
                                ? (paymentMethod === 'mpesa' ? "SENDING PROMPT..." : "INITIALIZING...")
                                : `PAY KSH ${total.toLocaleString()}`}
                        </Text>
                    </TouchableOpacity>

                    <Text style={{ textAlign: 'center', color: theme.secondaryText, fontSize: 11, marginTop: 15 }}>
                        Secure Payment powered by {paymentMethod === 'mpesa' ? 'Safaricom Daraja API' : 'Paystack'}
                    </Text>
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1,
        marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    headerTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 2 },
    headerBackBtn: { padding: 5 },
    scrollContent: { paddingBottom: 20 },
    formCard: { marginHorizontal: 20 },
    stepTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
    input: {
        height: 55, borderWidth: 1, borderRadius: 12,
        paddingHorizontal: 15, marginBottom: 10, fontSize: 16, fontWeight: '600'
    },
    nextBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, borderRadius: 14, marginTop: 8,
    },
    nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
    methodSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    methodCard: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: 12, paddingVertical: 15, marginHorizontal: 5 },
    methodText: { fontSize: 14, fontWeight: '800', marginTop: 8 },
    mpesaBox: {
        borderWidth: 1.5, borderRadius: 16, padding: 20,
    },
    mpesaDetail: { fontSize: 16, fontWeight: '600', letterSpacing: 0 },
    summaryBox: { borderRadius: 16, padding: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
    summaryItem: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 10 },
    summaryPrice: { fontSize: 14, fontWeight: '800' },
    successTitle: { fontSize: 30, fontWeight: '900', marginTop: 20 },
    successSub: { fontSize: 15, textAlign: 'center', marginTop: 12, lineHeight: 24 },
});

export default CheckoutPage;

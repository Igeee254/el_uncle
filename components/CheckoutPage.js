import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, SafeAreaView, Platform, Alert, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STEPS = ['Address', 'Payment', 'Confirm'];

const PAYMENT_METHODS = [
    { id: 'mpesa', label: 'M-Pesa', icon: 'phone-portrait-outline', desc: 'Pay via M-Pesa Paybill' },
    { id: 'card', label: 'Card', icon: 'card-outline', desc: 'Visa / Mastercard' },
    { id: 'cash', label: 'Cash on Delivery', icon: 'cash-outline', desc: 'Pay when item arrives' },
];

const CheckoutPage = ({ cart, theme, onNavigate, onClear }) => {
    const [step, setStep] = useState(0);
    const [address, setAddress] = useState({ name: '', phone: '', county: '', town: '', street: '' });
    const [payMethod, setPayMethod] = useState('mpesa');
    const [mpesaCode, setMpesaCode] = useState('');
    const [mpesaPhone, setMpesaPhone] = useState('');
    const [ordered, setOrdered] = useState(false);

    const total = cart.reduce((sum, item) => {
        const num = parseInt(String(item.price).replace('KSh ', '').replace(',', '')) || 0;
        return sum + (num * (item.quantity || 1));
    }, 0);

    const validateAddress = () => {
        if (!address.name || !address.phone || !address.county || !address.town) {
            Alert.alert('Missing Info', 'Please fill all required fields.');
            return false;
        }
        return true;
    };

    const handlePlaceOrder = () => {
        setOrdered(true);
        setTimeout(() => {
            onClear();
            onNavigate('Home');
        }, 3500);
    };

    // ── STEP INDICATOR ──────────────────────────────────────────────
    const StepBar = () => (
        <View style={styles.stepBar}>
            {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                    <View style={styles.stepItem}>
                        <View style={[
                            styles.stepCircle,
                            { backgroundColor: i <= step ? theme.accent : theme.border }
                        ]}>
                            {i < step
                                ? <Ionicons name="checkmark" size={14} color="#fff" />
                                : <Text style={styles.stepNum}>{i + 1}</Text>
                            }
                        </View>
                        <Text style={[styles.stepLabel, { color: i <= step ? theme.accent : theme.secondaryText }]}>{s}</Text>
                    </View>
                    {i < STEPS.length - 1 && (
                        <View style={[styles.stepLine, { backgroundColor: i < step ? theme.accent : theme.border }]} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );

    // ── STEP 0: ADDRESS ─────────────────────────────────────────────
    const AddressStep = () => (
        <View>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Delivery Address</Text>
            {[
                { key: 'name', label: 'Full Name *', placeholder: 'e.g. Kamau Mwangi' },
                { key: 'phone', label: 'Phone Number *', placeholder: 'e.g. 0712 345 678', keyboardType: 'phone-pad' },
                { key: 'county', label: 'County *', placeholder: 'e.g. Nairobi' },
                { key: 'town', label: 'Town / Area *', placeholder: 'e.g. Westlands' },
                { key: 'street', label: 'Street / Building', placeholder: 'e.g. Moi Ave, Apt 3B' },
            ].map(f => (
                <View key={f.key}>
                    <Text style={[styles.label, { color: theme.text }]}>{f.label}</Text>
                    <TextInput
                        style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                        value={address[f.key]}
                        onChangeText={v => setAddress(prev => ({ ...prev, [f.key]: v }))}
                        placeholder={f.placeholder}
                        placeholderTextColor={theme.secondaryText}
                        keyboardType={f.keyboardType || 'default'}
                    />
                </View>
            ))}
            <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: theme.accent }]}
                onPress={() => { if (validateAddress()) setStep(1); }}
            >
                <Text style={styles.nextBtnText}>CONTINUE TO PAYMENT</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
        </View>
    );

    // ── STEP 1: PAYMENT ─────────────────────────────────────────────
    const PaymentStep = () => (
        <View>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Payment Method</Text>
            {PAYMENT_METHODS.map(pm => (
                <TouchableOpacity
                    key={pm.id}
                    style={[
                        styles.payCard,
                        { borderColor: payMethod === pm.id ? theme.accent : theme.border, backgroundColor: theme.cardBackground }
                    ]}
                    onPress={() => setPayMethod(pm.id)}
                >
                    <Ionicons name={pm.icon} size={26} color={payMethod === pm.id ? theme.accent : theme.secondaryText} />
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={[styles.payLabel, { color: theme.text }]}>{pm.label}</Text>
                        <Text style={[styles.payDesc, { color: theme.secondaryText }]}>{pm.desc}</Text>
                    </View>
                    {payMethod === pm.id && <Ionicons name="checkmark-circle" size={22} color={theme.accent} />}
                </TouchableOpacity>
            ))}

            {payMethod === 'mpesa' && (
                <View style={[styles.mpesaBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <Text style={[styles.label, { color: theme.text }]}>M-Pesa Paybill</Text>
                    <Text style={[styles.mpesaDetail, { color: theme.accent }]}>Paybill: 522522 • Acc: GMKENYA</Text>

                    <Text style={[styles.label, { color: theme.text, marginTop: 15 }]}>M-Pesa Phone Number</Text>
                    <TextInput
                        style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                        value={mpesaPhone}
                        onChangeText={setMpesaPhone}
                        placeholder="e.g. 0712 345 678"
                        placeholderTextColor={theme.secondaryText}
                        keyboardType="phone-pad"
                    />

                    <Text style={[styles.label, { color: theme.text, marginTop: 15 }]}>Enter M-Pesa Code</Text>
                    <TextInput
                        style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                        value={mpesaCode}
                        onChangeText={setMpesaCode}
                        placeholder="e.g. QHX3K1ABCD"
                        placeholderTextColor={theme.secondaryText}
                        autoCapitalize="characters"
                    />
                </View>
            )}

            <View style={styles.rowBtns}>
                <TouchableOpacity style={[styles.backBtn, { borderColor: theme.border }]} onPress={() => setStep(0)}>
                    <Ionicons name="arrow-back" size={16} color={theme.accent} />
                    <Text style={[styles.backBtnText, { color: theme.accent }]}>BACK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.nextBtn, { backgroundColor: theme.accent, flex: 1, marginLeft: 12 }]}
                    onPress={() => setStep(2)}
                >
                    <Text style={styles.nextBtnText}>REVIEW ORDER</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </View>
    );

    // ── STEP 2: CONFIRM ─────────────────────────────────────────────
    const ConfirmStep = () => (
        <View>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Order Summary</Text>

            {/* Items */}
            <View style={[styles.summaryBox, { backgroundColor: theme.cardBackground }]}>
                {cart.map((item, i) => (
                    <View key={i} style={[styles.summaryRow, i < cart.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: theme.border }]}>
                        <Text style={[styles.summaryItem, { color: theme.text }]} numberOfLines={1}>{item.quantity && item.quantity > 1 ? `${item.quantity}x ` : ''}{item.title}</Text>
                        <Text style={[styles.summaryPrice, { color: theme.accent }]}>KSh {(parseInt(String(item.price).replace('KSh ', '').replace(',', '')) * (item.quantity || 1)).toLocaleString()}</Text>
                    </View>
                ))}
                <View style={[styles.summaryRow, { borderTopWidth: 1.5, borderTopColor: theme.border, marginTop: 8, paddingTop: 12 }]}>
                    <Text style={[styles.summaryItem, { color: theme.text, fontWeight: '900' }]}>TOTAL</Text>
                    <Text style={[styles.summaryPrice, { color: theme.accent, fontSize: 18, fontWeight: '900' }]}>KSh {total.toLocaleString()}</Text>
                </View>
            </View>

            {/* Delivery */}
            <View style={[styles.summaryBox, { backgroundColor: theme.cardBackground, marginTop: 12 }]}>
                <Text style={[styles.label, { color: theme.secondaryText, marginBottom: 8 }]}>DELIVER TO</Text>
                <Text style={[styles.confirmDetail, { color: theme.text }]}>{address.name} • {address.phone}</Text>
                <Text style={[styles.confirmDetail, { color: theme.secondaryText }]}>{address.street ? `${address.street}, ` : ''}{address.town}, {address.county}</Text>
                <Text style={[styles.confirmDetail, { color: theme.text, marginTop: 8 }]}>Payment: <Text style={{ color: theme.accent, fontWeight: '700' }}>{PAYMENT_METHODS.find(p => p.id === payMethod)?.label}</Text></Text>
                {payMethod === 'mpesa' && (
                    <>
                        <Text style={[styles.confirmDetail, { color: theme.text, marginTop: 4 }]}>M-Pesa Number: <Text style={{ color: theme.accent, fontWeight: '700' }}>{mpesaPhone || 'N/A'}</Text></Text>
                        <Text style={[styles.confirmDetail, { color: theme.text, marginTop: 4 }]}>M-Pesa Code: <Text style={{ color: theme.accent, fontWeight: '700' }}>{mpesaCode || 'N/A'}</Text></Text>
                    </>
                )}
            </View>

            <View style={styles.rowBtns}>
                <TouchableOpacity style={[styles.backBtn, { borderColor: theme.border }]} onPress={() => setStep(1)}>
                    <Ionicons name="arrow-back" size={16} color={theme.accent} />
                    <Text style={[styles.backBtnText, { color: theme.accent }]}>BACK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.nextBtn, { backgroundColor: '#4caf50', flex: 1, marginLeft: 12 }]}
                    onPress={handlePlaceOrder}
                >
                    <Text style={styles.nextBtnText}>PLACE ORDER 🎉</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // ── SUCCESS SCREEN ───────────────────────────────────────────────
    if (ordered) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="checkmark-circle" size={100} color="#4caf50" />
                <Text style={[styles.successTitle, { color: theme.text }]}>Order Placed!</Text>
                <Text style={[styles.successSub, { color: theme.secondaryText }]}>Thank you for your purchase 🎁{'\n'}We'll be in touch soon via WhatsApp.</Text>
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
                <Text style={[styles.headerTitle, { color: theme.text }]}>CHECKOUT</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <StepBar />

                <View style={styles.formCard}>
                    {step === 0 && AddressStep()}
                    {step === 1 && PaymentStep()}
                    {step === 2 && ConfirmStep()}
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
    stepBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 25, paddingHorizontal: 20,
    },
    stepItem: { alignItems: 'center' },
    stepCircle: {
        width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
    },
    stepNum: { color: '#fff', fontSize: 13, fontWeight: '800' },
    stepLabel: { fontSize: 10, fontWeight: '700', marginTop: 5 },
    stepLine: { flex: 1, height: 2, marginBottom: 18 },
    scrollContent: { paddingBottom: 20 },
    formCard: { marginHorizontal: 20 },
    stepTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
    input: {
        height: 50, borderWidth: 1, borderRadius: 12,
        paddingHorizontal: 15, marginBottom: 18, fontSize: 14,
    },
    nextBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, borderRadius: 14, marginTop: 8,
    },
    nextBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
    payCard: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1.5, borderRadius: 16, padding: 18, marginBottom: 14,
    },
    payLabel: { fontSize: 15, fontWeight: '700' },
    payDesc: { fontSize: 12, marginTop: 3 },
    mpesaBox: {
        borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 18,
    },
    mpesaDetail: { fontSize: 16, fontWeight: '800', letterSpacing: 1, marginTop: 5 },
    rowBtns: { flexDirection: 'row', marginTop: 8 },
    backBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16,
    },
    backBtnText: { fontSize: 13, fontWeight: '800', marginLeft: 6 },
    summaryBox: { borderRadius: 16, padding: 18 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    summaryItem: { fontSize: 13, fontWeight: '600', flex: 1, marginRight: 10 },
    summaryPrice: { fontSize: 13, fontWeight: '800' },
    confirmDetail: { fontSize: 14, lineHeight: 22 },
    successTitle: { fontSize: 30, fontWeight: '900', marginTop: 20 },
    successSub: { fontSize: 15, textAlign: 'center', marginTop: 12, lineHeight: 24 },
});

export default CheckoutPage;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddressBook = ({ userProfile, theme, isDark, onNavigate }) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://el-uncle.onrender.com/api';
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form inputs
    const [label, setLabel] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState(userProfile.phone || '');
    const [isDefault, setIsDefault] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await fetch(`${API_URL}/user/address?email=${userProfile.email}`);
            if (response.ok) {
                const data = await response.json();
                setAddresses(data);
            }
        } catch (e) {
            console.error("Failed to fetch addresses");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!street || !city) {
            Alert.alert("Required", "Please provide at least a street name and city.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/user/address`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userProfile.email,
                    label: label || 'Home',
                    street,
                    city,
                    phone,
                    is_default: isDefault || addresses.length === 0
                })
            });

            if (res.ok) {
                setModalVisible(false);
                resetForm();
                fetchAddresses();
            }
        } catch (e) {
            Alert.alert("Error", "Could not save address. Try again later.");
        } finally {
            setIsSaving(false);
        }
    };

    const deleteAddress = async (id) => {
        try {
            await fetch(`${API_URL}/user/address?id=${id}`, { method: 'DELETE' });
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch (e) {
            Alert.alert("Error", "Could not delete address.");
        }
    };

    const resetForm = () => {
        setLabel('');
        setStreet('');
        setCity('');
        setPhone(userProfile.phone || '');
        setIsDefault(true);
    };

    const renderItem = ({ item }) => (
        <View style={[styles.addressCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
                <View style={styles.labelContainer}>
                    <Ionicons name={item.label.toLowerCase().includes('work') ? "briefcase" : "home"} size={16} color={theme.accent} />
                    <Text style={[styles.addressLabel, { color: theme.text }]}>{item.label}</Text>
                    {item.is_default && (
                        <View style={[styles.defaultBadge, { backgroundColor: theme.accent }]}>
                            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity onPress={() => deleteAddress(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ff4757" />
                </TouchableOpacity>
            </View>
            <Text style={[styles.addressText, { color: theme.secondaryText }]}>{item.street}</Text>
            <Text style={[styles.addressText, { color: theme.secondaryText }]}>{item.city}</Text>
            {item.phone ? <Text style={[styles.addressText, { color: theme.secondaryText, marginTop: 4 }]}>📞 {item.phone}</Text> : null}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => onNavigate('Settings')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.accent} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>ADDRESS BOOK</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.accent} />
                </View>
            ) : addresses.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="map-outline" size={60} color={theme.secondaryText} />
                    <Text style={[styles.emptyText, { color: theme.text }]}>No Addresses Saved</Text>
                    <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>Add a delivery location for faster checkouts.</Text>
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.accent }]}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.addButtonText}>ADD NEW ADDRESS</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>New Address</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>Label (e.g., Home, Work)</Text>
                        <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} value={label} onChangeText={setLabel} placeholder="Home" placeholderTextColor={theme.secondaryText} />

                        <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>Street / Building / Area</Text>
                        <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} value={street} onChangeText={setStreet} placeholder="CBD, Moi Avenue" placeholderTextColor={theme.secondaryText} />

                        <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>City / Town</Text>
                        <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} value={city} onChangeText={setCity} placeholder="Nairobi" placeholderTextColor={theme.secondaryText} />

                        <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>Delivery Phone Number</Text>
                        <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={theme.secondaryText} />

                        <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsDefault(!isDefault)}>
                            <Ionicons name={isDefault ? "checkbox" : "square-outline"} size={22} color={theme.accent} />
                            <Text style={[styles.checkboxText, { color: theme.text }]}>Set as default delivery address</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.accent }]} onPress={handleSaveAddress} disabled={isSaving}>
                            <Text style={styles.saveButtonText}>{isSaving ? 'SAVING...' : 'SAVE ADDRESS'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: Platform.OS === 'android' ? 40 : 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
    headerTitle: { fontSize: 16, fontWeight: '800', letterSpacing: 2 },
    backButton: { padding: 5 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    listContent: { padding: 20, paddingBottom: 100 },
    addressCard: { borderRadius: 12, padding: 15, borderWidth: 1, marginBottom: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    labelContainer: { flexDirection: 'row', alignItems: 'center' },
    addressLabel: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    defaultBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 10 },
    defaultBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    addressText: { fontSize: 14, marginTop: 2, lineHeight: 20 },
    emptyText: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
    emptySubtext: { fontSize: 14, textAlign: 'center', marginTop: 8 },
    addButton: { position: 'absolute', bottom: 30, left: 20, right: 20, height: 55, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 1, marginLeft: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { padding: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25, minHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 5, marginTop: 15 },
    input: { height: 50, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, fontSize: 15 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 25, marginBottom: 30 },
    checkboxText: { marginLeft: 10, fontSize: 14 },
    saveButton: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }
});

export default AddressBook;

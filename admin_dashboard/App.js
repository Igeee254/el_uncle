import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput, Platform, Alert, ActivityIndicator, Image, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://el-uncle.onrender.com/api';

const theme = {
    background: '#f8f9fa',
    card: '#ffffff',
    text: '#2d3436',
    secondary: '#636e72',
    accent: '#F15A24', // Kweli Orange
    primaryGreen: '#2E7D32', // Kweli Green
    error: '#ff7675',
    success: '#55efc4',
    border: '#dfe6e9'
};

function LoginScreen({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState('Checking...');

    useEffect(() => { checkServer(); }, []);

    const checkServer = async () => {
        try {
            const res = await fetch(`${API_URL}/status`);
            if (res.ok) setServerStatus('Online ✅');
            else setServerStatus('Offline ❌');
        } catch (e) { setServerStatus('Error ⚠️'); }
    };

    const handleAuth = async () => {
        if (!email || !password || (!isLogin && (!username || !fullName))) return;
        setLoading(true);
        try {
            const endpoint = isLogin ? '/admin/login' : '/admin/signup';
            const body = isLogin ? { email, password } : { email, password, username, full_name: fullName };
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (response.ok) {
                if (isLogin) {
                    await AsyncStorage.setItem('@admin_token', data.token);
                    console.log('LOGIN SUCCESS! Moving to Dashboard...'); onLoginSuccess(data.admin);
                } else {
                    Alert.alert("Success", data.message);
                    setIsLogin(true); // Switch back to login
                }
            } else { Alert.alert("Failed", data.error || data.message || "Authentication failed"); }
        } catch (e) { console.error('LOGIN ERROR:', e); Alert.alert('Error', 'Check Connection: ' + e.message); }
        finally { setLoading(false); }
    };

    return (
        <KeyboardAvoidingView style={styles.loginContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.loginCard}>
                <Image source={require('./pictures/kweli-logo.png')} style={{ width: 150, height: 80, alignSelf: 'center', marginBottom: 10 }} resizeMode="contain" />
                <Text style={styles.loginTitle}>{isLogin ? "ADMIN LOGIN" : "ADMIN SIGNUP"}</Text>
                <Text style={styles.serverText}>Server: {serverStatus}</Text>

                {!isLogin && (
                    <>
                        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
                        <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
                    </>
                )}

                <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.accent }]} onPress={handleAuth}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{isLogin ? "LOGIN" : "SIGNUP"}</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 15, alignSelf: 'center' }}>
                    <Text style={{ color: theme.secondary, fontSize: 13 }}>
                        {isLogin ? "Don't have an admin account? Sign Up" : "Already an admin? Login"}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalProducts: 0 });
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [showInventory, setShowInventory] = useState(false);

    const [productForm, setProductForm] = useState({
        title: '', price: '', category_id: '', image_uri: 'bracelet.png',
        stock: '10', height: '220', badgeColor: '#2E7D32', provider_contact: '', uploader_id: null
    });

    useEffect(() => { checkAuth(); }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('@admin_token');
            if (token) {
                setIsAuthenticated(true);
                fetchData();
            }
        } catch (e) { } finally { setLoading(false); }
    };

    const fetchData = async () => {
        try {
            const [statsRes, catRes] = await Promise.all([
                fetch(`${API_URL}/admin/stats`),
                fetch(`${API_URL}/categories`)
            ]);
            setStats(await statsRes.json());
            setCategories(await catRes.json());
            fetchInventory();
        } catch (e) { }
    };

    const fetchInventory = async (userId) => {
        const idToUse = userId || adminUser?.id;
        if (!idToUse) return;
        try {
            const res = await fetch(`${API_URL}/admin/my-products?uploader_id=${idToUse}`);
            const data = await res.json();
            setInventory(data);
        } catch (e) { }
    };

    const updateStock = async (productId, newStock) => {
        try {
            const res = await fetch(`${API_URL}/admin/update-stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId, stock: newStock })
            });
            if (res.ok) fetchInventory();
        } catch (e) { }
    };

    const handleLoginSuccess = (user) => {
        setAdminUser(user);
        setProductForm(prev => ({ ...prev, uploader_id: user?.id }));
        setIsAuthenticated(true);
        fetchData(user.id);
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('@admin_token');
        setIsAuthenticated(false);
    };

    const pickImage = async (useCamera) => {
        const { status } = useCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
        let result = await (useCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync)({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri) => {
        setSubmitting(true);
        const formData = new FormData();
        formData.append('file', { uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri, name: 'upload.jpg', type: 'image/jpeg' });
        try {
            const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
            const data = await res.json();
            if (data.filename) {
                setProductForm(prev => ({ ...prev, image_uri: data.filename }));
                setSelectedImage(uri);
                Alert.alert("Image Ready", "Your image has been uploaded successfully!");
            }
        } catch (e) { } finally { setSubmitting(false); }
    };

    const handleAddProduct = async () => {
        if (!productForm.title || !productForm.price) {
            Alert.alert("Error", "Please enter a title and price");
            return;
        }
        if (!productForm.category_id) {
            Alert.alert("Error", "Please select a category");
            return;
        }
        if (productForm.image_uri === 'bracelet.png') {
            Alert.alert("Caution", "You haven't uploaded an image yet! Please pick a photo first.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productForm)
            });
            const data = await res.json();
            if (res.ok) {
                Alert.alert("Success", "Product successfully posted to KweliStore!");
                setProductForm({
                    title: '', price: '', category_id: '',
                    image_uri: 'bracelet.png', // Reset to default
                    provider_contact: '', uploader_id: adminUser?.id
                });
                setSelectedImage(null);
                fetchData();
            } else {
                Alert.alert("Failed", data.error || "Could not add product");
            }
        } catch (e) {
            Alert.alert("Error", "Network connection failed");
        } finally { setSubmitting(false); }
    };

    if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={theme.accent} /></View>;
    if (!isAuthenticated) return <LoginScreen onLoginSuccess={handleLoginSuccess} />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>KWELI STORE KENYA</Text>
                    <Text style={{ fontSize: 10, color: theme.secondary }}>{adminUser?.username}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout}><Ionicons name="log-out-outline" size={24} color={theme.error} /></TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}><Text style={styles.statNum}>{stats.totalProducts}</Text><Text style={styles.statLabel}>Total Products</Text></View>
                    <View style={[styles.statCard, { backgroundColor: '#f1f2f6' }]}><Text style={styles.statNum}>---</Text><Text style={styles.statLabel}>Inventory Only</Text></View>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>NEW PRODUCT UPLOAD</Text>
                    <TouchableOpacity onPress={() => pickImage(false)} style={styles.imagePlaceholder}>
                        {selectedImage ? <Image source={{ uri: selectedImage }} style={styles.imagePreview} /> : <Ionicons name="image-outline" size={40} color="#ccc" />}
                    </TouchableOpacity>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Item Title</Text>
                        <TextInput style={styles.input} placeholder="e.g Leather Bag" value={productForm.title} onChangeText={t => setProductForm({ ...productForm, title: t })} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Price (KSh)</Text>
                        <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={productForm.price} onChangeText={t => setProductForm({ ...productForm, price: t })} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Provider Contact (Phone)</Text>
                        <TextInput style={styles.input} placeholder="07XX XXX XXX" keyboardType="phone-pad" value={productForm.provider_contact} onChangeText={t => setProductForm({ ...productForm, provider_contact: t })} />
                    </View>

                    <Text style={styles.label}>Select Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                        {categories.map(c => (
                            <TouchableOpacity key={c.id} style={[styles.catChip, productForm.category_id === c.id && { backgroundColor: theme.accent }]} onPress={() => setProductForm({ ...productForm, category_id: c.id })}>
                                <Text style={[styles.catChipText, productForm.category_id === c.id && { color: '#fff' }]}>{c.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.accent }, submitting && { opacity: 0.5 }]}
                        onPress={handleAddProduct}
                        disabled={submitting}
                    >
                        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>POST TO MARKETPLACE</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.accent, marginTop: 20 }]} onPress={() => setShowInventory(!showInventory)}>
                        <Text style={styles.submitText}>{showInventory ? "CLOSE INVENTORY" : "MANAGE MY INVENTORY"}</Text>
                    </TouchableOpacity>

                    {showInventory && (
                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.formTitle}>MY INVENTORY</Text>
                            {inventory.map(item => (
                                <View key={item.id} style={styles.inventoryItem}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
                                        <Text style={{ fontSize: 12, color: theme.secondary }}>Current Stock: {item.stock}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => updateStock(item.id, Math.max(0, item.stock - 1))} style={styles.stockBtn}><Ionicons name="remove" size={16} color="#fff" /></TouchableOpacity>
                                        <TouchableOpacity onPress={() => updateStock(item.id, item.stock + 1)} style={[styles.stockBtn, { backgroundColor: theme.accent }]}><Ionicons name="add" size={16} color="#fff" /></TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 2 },
    scrollContent: { padding: 20 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statCard: { width: '48%', padding: 15, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', elevation: 2 },
    statNum: { fontSize: 24, fontWeight: '900' },
    statLabel: { fontSize: 10, color: '#636e72' },
    formCard: { padding: 20, borderRadius: 20, backgroundColor: '#fff', elevation: 3 },
    formTitle: { fontSize: 14, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
    imagePlaceholder: { width: '100%', height: 150, borderRadius: 15, backgroundColor: '#f1f2f6', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    imagePreview: { width: '100%', height: 150, borderRadius: 15 },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 11, fontWeight: '700', color: theme.secondary, marginBottom: 5 },
    input: { backgroundColor: '#f1f2f6', padding: 12, borderRadius: 10 },
    submitBtn: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    submitText: { color: '#fff', fontWeight: 'bold' },
    catChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#f1f2f6' },
    catChipText: { fontSize: 10, fontWeight: '700' },
    loginContainer: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#f5f6fa' },
    loginCard: { backgroundColor: '#fff', padding: 30, borderRadius: 25 },
    loginTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center', marginVertical: 15 },
    serverText: { fontSize: 10, textAlign: 'center', color: '#666', marginBottom: 20 },
    inventoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f2f6', padding: 15, borderRadius: 15, marginBottom: 10 },
    stockBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ff4757', justifyContent: 'center', alignItems: 'center', marginLeft: 8 }
});

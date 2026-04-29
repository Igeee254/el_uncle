import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Platform, Linking, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const APP_VERSION = 'v1.2.0';
const SUPPORT_WHATSAPP = '+254 746 860 965';

const ProfileSettings = ({ onNavigate, onLogout, theme, isDark, userProfile, setUserProfile, activityHistory, onProductSelect }) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://el-uncle.onrender.com/api';

    const [fullName, setFullName] = useState(userProfile.full_name || '');
    const [nickname, setNickname] = useState(userProfile.username || '');
    const [secondaryPhone, setSecondaryPhone] = useState(userProfile.secondary_phone || '');
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(userProfile.email_notifications !== false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userProfile.email,
                    full_name: fullName,
                    username: nickname,
                    secondary_phone: secondaryPhone,
                    email_notifications: isNotificationsEnabled
                })
            });

            const data = await response.json();
            if (response.ok) {
                setUserProfile(data.user);
                Alert.alert("Success", "Profile updated successfully");
            } else {
                Alert.alert("Error", data.error || "Failed to update profile");
            }
        } catch (error) {
            Alert.alert("Error", "Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you absolutely sure? This will permanently remove your profile and all order history. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "DELETE FOREVER",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await fetch(`${API_URL}/user/account?email=${userProfile.email}`, {
                                method: 'DELETE'
                            });
                            if (response.ok) {
                                onLogout(); // Clears session and goes to Landing
                            } else {
                                Alert.alert("Error", "Failed to delete account");
                            }
                        } catch (e) {
                            Alert.alert("Error", "Network error");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const openWhatsApp = () => {
        const message = "Hello KweliStoreKenya Support, I need assistance with my account.";
        const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
        Linking.openURL(url);
    };

    const historyData = Array.isArray(activityHistory) ? activityHistory : [];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => onNavigate('Home')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.accent} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>SETTINGS</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* 1. Profile Pic Section */}
                <View style={styles.picSection}>
                    <Image source={{ uri: `https://i.pravatar.cc/150?u=${userProfile.email}` }} style={styles.profileImage} />
                    <TouchableOpacity style={styles.editPicButton}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={[styles.userName, { color: theme.text }]}>{fullName || nickname}</Text>
                    <Text style={[styles.userEmail, { color: theme.secondaryText }]}>{userProfile.email}</Text>
                </View>

                {/* 2. Personal Details Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.accent }]}>PERSONAL DETAILS</Text>
                </View>
                <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.secondaryText }]}>OFFICIAL FULL NAME</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Enter your official name"
                            placeholderTextColor={theme.secondaryText}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.secondaryText }]}>NICKNAME</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            value={nickname}
                            onChangeText={setNickname}
                            placeholder="Enter nickname"
                            placeholderTextColor={theme.secondaryText}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.secondaryText }]}>SECONDARY WHATSAPP NUMBER</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            value={secondaryPhone}
                            onChangeText={setSecondaryPhone}
                            placeholder="+254..."
                            placeholderTextColor={theme.secondaryText}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('AddressBook')}>
                        <Ionicons name="location-outline" size={22} color={theme.text} />
                        <Text style={[styles.menuText, { color: theme.text }]}>Manage Address Book</Text>
                        <Ionicons name="chevron-forward" size={18} color={theme.border} />
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('OrderHistory')}>
                        <Ionicons name="receipt-outline" size={22} color={theme.text} />
                        <Text style={[styles.menuText, { color: theme.text }]}>Track Order History</Text>
                        <Ionicons name="chevron-forward" size={18} color={theme.border} />
                    </TouchableOpacity>
                </View>

                {/* 3. Preferences Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.accent }]}>PREFERENCES</Text>
                </View>
                <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <View style={styles.settingRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.settingLabel, { color: theme.text }]}>Email Notifications</Text>
                            <Text style={[styles.settingDesc, { color: theme.secondaryText }]}>Receive updates about your inquiries and orders.</Text>
                        </View>
                        <Switch
                            value={isNotificationsEnabled}
                            onValueChange={setIsNotificationsEnabled}
                            trackColor={{ false: "#767577", true: theme.accent }}
                        />
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <View style={styles.settingRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                            <Text style={[styles.settingDesc, { color: theme.secondaryText }]}>Adjust the app's appearance.</Text>
                        </View>
                        <Text style={{ color: theme.accent, fontWeight: 'bold' }}>{isDark ? 'ON' : 'OFF'}</Text>
                    </View>
                </View>

                {/* 4. Support & About Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.accent }]}>SUPPORT & ABOUT</Text>
                </View>
                <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={openWhatsApp}>
                        <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
                        <Text style={[styles.menuText, { color: theme.text }]}>Chat with Support</Text>
                        <Ionicons name="chevron-forward" size={18} color={theme.border} />
                    </TouchableOpacity>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('About')}>
                        <Ionicons name="information-circle-outline" size={22} color={theme.accent} />
                        <Text style={[styles.menuText, { color: theme.text }]}>About KweliStoreKenya</Text>
                        <Ionicons name="chevron-forward" size={18} color={theme.border} />
                    </TouchableOpacity>
                </View>

                {/* 5. Account Security Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.accent }]}>ACCOUNT SECURITY</Text>
                </View>
                <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.accent }]} onPress={handleSave} disabled={loading}>
                        <Text style={styles.saveButtonText}>{loading ? 'SAVING...' : 'SAVE CHANGES'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                        <Ionicons name="log-out-outline" size={20} color={theme.error} />
                        <Text style={[styles.logoutText, { color: theme.error }]}>Log Out</Text>
                    </TouchableOpacity>
                    <View style={[styles.divider, { backgroundColor: theme.border, marginVertical: 10 }]} />
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                        <Text style={styles.deleteText}>Delete Account Permanently</Text>
                    </TouchableOpacity>
                </View>

                {/* 6. Recent Activity */}
                {historyData.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.accent }]}>RECENT ACTIVITY</Text>
                        </View>
                        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            {historyData.slice(0, 5).map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.historyItem}
                                    onPress={() => onProductSelect({ id: item.productId, title: item.productName, category: item.category, image_uri: item.image_uri })}
                                >
                                    <View style={[styles.historyIcon, { backgroundColor: item.type === 'like' ? '#fff0f3' : '#e8f5e9' }]}>
                                        <Ionicons name={item.type === 'like' ? "heart" : "cart"} size={18} color={item.type === 'like' ? "#ff4081" : "#4caf50"} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 15 }}>
                                        <Text style={[styles.historyName, { color: theme.text }]}>{item.productName}</Text>
                                        <Text style={[styles.historyAction, { color: theme.secondaryText }]}>
                                            {item.type === 'like' ? 'Saved to wishlist' : 'Added to cart'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                <Text style={[styles.versionText, { color: theme.secondaryText }]}>KweliStoreKenya {APP_VERSION}</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 2,
    },
    backButton: {
        padding: 5,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    picSection: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#2E7D32',
    },
    editPicButton: {
        position: 'absolute',
        top: 65,
        right: '37%',
        backgroundColor: '#2E7D32',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 15,
    },
    userEmail: {
        fontSize: 14,
        marginTop: 5,
    },
    sectionHeader: {
        marginTop: 25,
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    card: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 15,
        fontSize: 15,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    settingDesc: {
        fontSize: 12,
        marginTop: 4,
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 10,
        opacity: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    menuText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 15,
        fontWeight: '600',
    },
    saveButton: {
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    deleteButton: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    deleteText: {
        color: '#ff4d4d',
        fontSize: 13,
        fontWeight: '600',
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    historyIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyName: {
        fontSize: 14,
        fontWeight: '700',
    },
    historyAction: {
        fontSize: 12,
        marginTop: 2,
    },
    versionText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 12,
        opacity: 0.6,
    }
});

export default ProfileSettings;

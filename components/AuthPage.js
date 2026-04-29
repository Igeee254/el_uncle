import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AuthPage = ({ onNavigate, onLogin, theme, isDark }) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://el-uncle.onrender.com/api';
    const [isLogin, setIsLogin] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [nickname, setNickname] = useState('');
    const [fullName, setFullName] = useState(''); // Official Name
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');

    const handleSubmit = async () => {
        if (!email || !password || (!isLogin && (!nickname || !fullName))) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const endpoint = isLogin ? '/login' : '/signup';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: nickname,
                    full_name: fullName,
                    email,
                    password
                })
            });

            const data = await response.json();
            if (response.ok) {
                if (!isLogin) {
                    setPendingEmail(email);
                    setIsVerifying(true);
                } else {
                    onLogin(data.user);
                }
            } else {
                if (data.is_unverified) {
                    setPendingEmail(email);
                    setIsVerifying(true);
                } else {
                    alert(data.error || "Authentication failed");
                }
            }
        } catch (e) {
            alert("Could not connect to server");
        } finally {
            setLoading(false);
        }
    };

    const checkVerificationStatus = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/check-verification/${pendingEmail}`);
            const data = await response.json();
            if (data.verified) {
                onLogin(data.user);
            } else {
                alert("Email not yet verified. Please check your inbox.");
            }
        } catch (e) {
            alert("Error checking verification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, styles.safeContainer, { backgroundColor: theme.authBackground }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('Landing')}>
                        <Ionicons name="close-outline" size={32} color={theme.icon} />
                    </TouchableOpacity>

                    {isVerifying ? (
                        <View style={styles.authBox}>
                            <Ionicons name="mail-unread-outline" size={60} color={theme.accent} style={{ alignSelf: 'center', marginBottom: 20 }} />
                            <Text style={[styles.title, { color: theme.text, textAlign: 'center' }]}>Verify Email</Text>
                            <Text style={[styles.subtitle, { color: theme.secondaryText, textAlign: 'center' }]}>
                                We've sent a link to <Text style={{ fontWeight: 'bold', color: theme.accent }}>{pendingEmail}</Text>.
                                Click it to activate your account.
                            </Text>

                            <TouchableOpacity style={[styles.submitButton, { backgroundColor: '#2E7D32' }]} onPress={checkVerificationStatus} disabled={loading}>
                                <Text style={styles.submitButtonText}>{loading ? 'CHECKING...' : "I'VE VERIFIED - LOG IN"}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setIsVerifying(false)} style={{ marginTop: 20 }}>
                                <Text style={[styles.toggleAction, { color: theme.secondaryText, textAlign: 'center' }]}>Back to Login</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.authBox}>
                            <Image
                                source={require('../pictures/kweli-logo.png')}
                                style={styles.authLogo}
                                resizeMode="contain"
                            />
                            <Text style={[styles.title, { color: theme.text }]}>
                                {isLogin ? 'Welcome Back' : 'Join KweliStoreKenya'}
                            </Text>
                            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
                                {isLogin ? 'Log in to continue your art journey' : 'Create an account to start collecting'}
                            </Text>

                            <View style={styles.form}>
                                {!isLogin && (
                                    <>
                                        <View style={styles.inputGroup}>
                                            <Text style={[styles.label, { color: theme.secondaryText }]}>FULL NAMES</Text>
                                            <TextInput
                                                style={[styles.input, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                                                placeholder="Enter your official full names"
                                                placeholderTextColor={theme.secondaryText}
                                                value={fullName}
                                                onChangeText={setFullName}
                                            />
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={[styles.label, { color: theme.secondaryText }]}>NICKNAME</Text>
                                            <TextInput
                                                style={[styles.input, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                                                placeholder="e.g. ArtCollector254"
                                                placeholderTextColor={theme.secondaryText}
                                                value={nickname}
                                                onChangeText={setNickname}
                                            />
                                        </View>
                                    </>
                                )}

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.secondaryText }]}>EMAIL ADDRESS</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                                        placeholder="user@example.com"
                                        placeholderTextColor={theme.secondaryText}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.secondaryText }]}>PASSWORD</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                                        placeholder="••••••••"
                                        placeholderTextColor={theme.secondaryText}
                                        secureTextEntry
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                </View>

                                <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.accent }]} onPress={handleSubmit} disabled={loading}>
                                    <Text style={styles.submitButtonText}>{loading ? 'PROCESSING...' : (isLogin ? 'LOG IN' : 'SIGN UP')}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.toggleContainer}>
                                <Text style={[styles.toggleText, { color: theme.secondaryText }]}>
                                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                                </Text>
                                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                                    <Text style={[styles.toggleAction, { color: theme.accent }]}>
                                        {isLogin ? ' Sign Up' : ' Log In'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    authBox: {
        width: '100%',
        maxWidth: 450,
        alignSelf: 'center',
        padding: 20,
    },
    authLogo: {
        width: 180,
        height: 100,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 10,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 40,
        lineHeight: 22,
    },
    form: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 10,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: 1,
    },
    input: {
        height: 55,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    submitButton: {
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 2,
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    toggleText: {
        fontSize: 14,
    },
    toggleAction: {
        fontSize: 14,
        fontWeight: '700',
    }
});

export default AuthPage;

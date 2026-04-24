import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AuthPage = ({ onNavigate, onLogin, theme, isDark }) => {
    const [isLogin, setIsLogin] = useState(false); // Default to Signup as requested: "direct them to the sign up"
    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        // Basic validation
        if (!phone || !password || (!isLogin && !nickname)) {
            alert("Please fill in all fields");
            return;
        }

        const profile = {
            nickname: isLogin ? 'Art Enthusiast' : nickname,
            profilePic: `https://i.pravatar.cc/150?u=${phone}`,
            primaryPhone: phone,
            secondaryPhone: '',
        };

        onLogin(profile);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.authBackground }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('Landing')}>
                        <Ionicons name="close-outline" size={32} color={theme.icon} />
                    </TouchableOpacity>

                    <View style={styles.authBox}>
                        <Text style={[styles.title, { color: theme.text }]}>
                            {isLogin ? 'Welcome Back' : 'Join GMK'}
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
                            {isLogin ? 'Log in to continue your art journey' : 'Create an account to start collecting'}
                        </Text>

                        <View style={styles.form}>
                            {!isLogin && (
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
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.secondaryText }]}>PHONE NUMBER</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                                    placeholder="+254..."
                                    placeholderTextColor={theme.secondaryText}
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={setPhone}
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

                            <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.accent }]} onPress={handleSubmit}>
                                <Text style={styles.submitButtonText}>{isLogin ? 'LOG IN' : 'SIGN UP'}</Text>
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
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
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

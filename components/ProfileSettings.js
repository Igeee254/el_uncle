import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileSettings = ({ onNavigate, onLogout, theme, isDark, userProfile, setUserProfile }) => {
    const [nickname, setNickname] = useState(userProfile.nickname);
    const [secondaryPhone, setSecondaryPhone] = useState(userProfile.secondaryPhone);
    const [profilePic, setProfilePic] = useState(userProfile.profilePic);

    const handleSave = () => {
        setUserProfile({
            ...userProfile,
            nickname,
            secondaryPhone,
            profilePic
        });
        onNavigate('Home');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => onNavigate('Home')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.icon} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>PROFILE SETTINGS</Text>
                <View style={{ width: 40 }} /> {/* Spacer */}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Picture Section */}
                <View style={styles.picSection}>
                    <View style={styles.picWrapper}>
                        <Image source={{ uri: profilePic }} style={styles.profileImage} />
                        <TouchableOpacity style={styles.editPicButton}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.picHint, { color: theme.secondaryText }]}>Tap to change profile picture</Text>
                </View>

                {/* Input Fields */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.secondaryText }]}>NICKNAME</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                            value={nickname}
                            onChangeText={setNickname}
                            placeholder="Enter nickname"
                            placeholderTextColor={theme.secondaryText}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.secondaryText }]}>PRIMARY PHONE (SIGNUP)</Text>
                        <TextInput
                            style={[styles.input, { color: theme.secondaryText, backgroundColor: theme.cardBackground, borderColor: theme.border, opacity: 0.6 }]}
                            value={userProfile.primaryPhone}
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.secondaryText }]}>SECONDARY PHONE</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                            value={secondaryPhone}
                            onChangeText={setSecondaryPhone}
                            placeholder="Add another number"
                            placeholderTextColor={theme.secondaryText}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.accent }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.logoutButton, { borderColor: theme.border }]}
                        onPress={onLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#e91e63" />
                        <Text style={styles.logoutButtonText}>LOG OUT</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => onNavigate('Home')}
                    >
                        <Text style={[styles.cancelButtonText, { color: theme.secondaryText }]}>CANCEL</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
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
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 2,
    },
    backButton: {
        padding: 5,
    },
    scrollContent: {
        padding: 30,
        alignItems: 'center',
    },
    picSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    picWrapper: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#8da696',
    },
    editPicButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#8da696',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    picHint: {
        fontSize: 12,
        fontWeight: '500',
    },
    form: {
        width: '100%',
        maxWidth: 400,
    },
    inputGroup: {
        marginBottom: 25,
    },
    label: {
        fontSize: 10,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: 1,
    },
    input: {
        height: 50,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
    },
    actions: {
        width: '100%',
        maxWidth: 400,
        marginTop: 20,
    },
    saveButton: {
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    logoutButton: {
        height: 55,
        borderRadius: 15,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    logoutButtonText: {
        color: '#e91e63',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 10,
        letterSpacing: 1,
    },
    cancelButton: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
    }
});

export default ProfileSettings;

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MOCK_TESTIMONIALS = [
    { id: '1', name: 'James W. from Nairobi', rating: 5, comment: 'Excellent quality! The Arsenal bracelet was a perfect gift. Highly recommended.', date: 'Dec 12, 2025' },
    { id: '2', name: 'Achieng O. from Kisumu', rating: 4, comment: 'Beautiful maasai beadwork. The anklet arrived quickly and looks even better in person.', date: 'Jan 28, 2026' },
    { id: '3', name: 'Kimani N. from Nakuru', rating: 5, comment: 'Premium materials. The sterling silver chain is thick and high-end. 5/5 stars.', date: 'Feb 15, 2026' },
];

const FeedbackPage = ({ theme, isDark, onNavigate }) => {
    const [suggestion, setSuggestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!name || !comment) {
            alert('Please provide your name and a comment.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://el-uncle.onrender.com/api'}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, rating, comment, suggestion })
            });

            if (response.ok) {
                setSubmitted(true);
                setName('');
                setRating(5);
                setComment('');
                setSuggestion('');
                setTimeout(() => setSubmitted(false), 5000);
            } else {
                alert('Failed to submit feedback. Try again.');
            }
        } catch (e) {
            alert('Network error. Check connection to backend.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => onNavigate('Home')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.accent} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>FEEDBACK & TESTIMONIALS</Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* 1. TESTIMONIALS SECTION */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>What Our Customers Say</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialScroll}>
                    {MOCK_TESTIMONIALS.map((t) => (
                        <View key={t.id} style={[styles.testimonialCard, { backgroundColor: theme.cardBackground, shadowColor: '#000' }]}>
                            <View style={styles.starRow}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Ionicons key={s} name={s <= t.rating ? "star" : "star-outline"} size={14} color="#FFD700" />
                                ))}
                            </View>
                            <Text style={[styles.testimonialComment, { color: theme.text }]}>"{t.comment}"</Text>
                            <View style={styles.testimonialFooter}>
                                <Text style={[styles.testimonialName, { color: theme.accent }]}>{t.name}</Text>
                                <Text style={[styles.testimonialDate, { color: theme.secondaryText }]}>{t.date}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* 2. FEEDBACK FORM */}
                <View style={[styles.formContainer, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.formTitle, { color: theme.text }]}>Leave Your Feedback</Text>
                    <Text style={[styles.formSubtitle, { color: theme.secondaryText }]}>Share your experience with KweliStoreKenya</Text>

                    <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
                    <TextInput
                        style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Kamau Mwangi"
                        placeholderTextColor={theme.secondaryText}
                    />

                    <Text style={[styles.label, { color: theme.text }]}>Rating</Text>
                    <View style={styles.ratingPicker}>
                        {[1, 2, 3, 4, 5].map((r) => (
                            <TouchableOpacity key={r} onPress={() => setRating(r)} style={styles.starBtn}>
                                <Ionicons name={r <= rating ? "star" : "star-outline"} size={30} color={r <= rating ? "#FFD700" : theme.secondaryText} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { color: theme.text }]}>Your Comment</Text>
                    <TextInput
                        style={[styles.textArea, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Write your review here..."
                        placeholderTextColor={theme.secondaryText}
                        multiline
                        numberOfLines={4}
                    />

                    {rating <= 2 && (
                        <View style={{ marginBottom: 20 }}>
                            <Text style={[styles.label, { color: theme.error || '#ff7675' }]}>What can we do to make it better?</Text>
                            <TextInput
                                style={[styles.textArea, { borderColor: theme.error || '#ff7675', color: theme.text, backgroundColor: theme.background }]}
                                value={suggestion}
                                onChangeText={setSuggestion}
                                placeholder="Your constructive feedback helps us improve..."
                                placeholderTextColor={theme.secondaryText}
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.accent }]}
                        onPress={handleSubmit}
                        disabled={isSubmitting || submitted}
                    >
                        <Text style={styles.submitBtnText}>{isSubmitting ? "SENDING..." : "SUBMIT FEEDBACK"}</Text>
                    </TouchableOpacity>

                    {submitted && (
                        <View style={styles.successMsg}>
                            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                            <Text style={styles.successText}>Thank you! Your feedback has been submitted.</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
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
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    backBtn: {
        padding: 5,
    },
    scrollContent: {
        paddingVertical: 30,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        paddingHorizontal: 25,
        marginBottom: 20,
    },
    testimonialScroll: {
        paddingLeft: 25,
        marginBottom: 40,
    },
    testimonialCard: {
        width: 300,
        padding: 20,
        borderRadius: 20,
        marginRight: 20,
        elevation: 5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    starRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    testimonialComment: {
        fontSize: 15,
        fontStyle: 'italic',
        lineHeight: 22,
        marginBottom: 15,
    },
    testimonialFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    testimonialName: {
        fontSize: 13,
        fontWeight: '700',
    },
    testimonialDate: {
        fontSize: 11,
    },
    formContainer: {
        marginHorizontal: 20,
        padding: 25,
        borderRadius: 25,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 5,
    },
    formSubtitle: {
        fontSize: 13,
        marginBottom: 25,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    ratingPicker: {
        flexDirection: 'row',
        marginBottom: 25,
    },
    starBtn: {
        marginRight: 10,
    },
    textArea: {
        height: 120,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 15,
        textAlignVertical: 'top',
        marginBottom: 25,
    },
    submitBtn: {
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1,
    },
    successMsg: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    successText: {
        color: '#4caf50',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 8,
    }
});

export default FeedbackPage;

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutUsPage = ({ theme, isDark, onNavigate }) => {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => onNavigate('Landing')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.accent} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>ABOUT US</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Image
                    source={require('../assets/hero.png')}
                    style={styles.heroImage}
                    resizeMode="cover"
                />

                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>Our Dedication to Quality</Text>
                    <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
                        At Gift Masters Kenya, our driving force is a relentless dedication to providing only the best products the market has to offer. We believe that true quality speaks for itself, and we pour our passion into sourcing and curating traditional, premium handcrafted goods that resonate with our rich heritage.
                    </Text>

                    <Text style={[styles.subtitle, { color: theme.text }]}>The Best in the Market</Text>
                    <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
                        We don't just sell souvenirs; we deliver memorable experiences crafted carefully by skilled artisans. Our commitment means every bracelet, necklace, and keychain we offer is thoroughly tested for durability, authenticity, and aesthetic appeal. When you choose us, you are choosing unmatched craftsmanship.
                    </Text>

                    <Text style={[styles.subtitle, { color: theme.text }]}>Why Choose Us?</Text>
                    <View style={styles.bullets}>
                        <Text style={[styles.bulletPoint, { color: theme.secondaryText }]}><Text style={{ color: theme.accent, fontWeight: 'bold' }}>•</Text> Authentic, locally sourced materials</Text>
                        <Text style={[styles.bulletPoint, { color: theme.secondaryText }]}><Text style={{ color: theme.accent, fontWeight: 'bold' }}>•</Text> Unwavering commitment to quality assurance</Text>
                        <Text style={[styles.bulletPoint, { color: theme.secondaryText }]}><Text style={{ color: theme.accent, fontWeight: 'bold' }}>•</Text> Products that tell a story and carry meaning</Text>
                        <Text style={[styles.bulletPoint, { color: theme.secondaryText }]}><Text style={{ color: theme.accent, fontWeight: 'bold' }}>•</Text> Exceptional customer support and experience</Text>
                    </View>

                    <Text style={[styles.subtitle, { color: theme.text, marginTop: 10 }]}>Our Craftsmanship</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScrollView} contentContainerStyle={styles.galleryContainer}>
                        <Image source={{ uri: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop' }} style={styles.galleryImage} />
                        <Image source={{ uri: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop' }} style={styles.galleryImage} />
                        <Image source={{ uri: 'https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=600&auto=format&fit=crop' }} style={styles.galleryImage} />
                    </ScrollView>

                    <Text style={[styles.subtitle, { color: theme.text, marginTop: 30 }]}>Our Core Values</Text>
                    <View style={[styles.valueCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <Ionicons name="hammer-outline" size={28} color={theme.accent} />
                        <View style={{ marginLeft: 15, flex: 1 }}>
                            <Text style={[styles.valueTitle, { color: theme.text }]}>Handcrafted Authenticity</Text>
                            <Text style={[styles.valueDesc, { color: theme.secondaryText }]}>Every piece is uniquely shaped by skilled local artisans.</Text>
                        </View>
                    </View>
                    <View style={[styles.valueCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <Ionicons name="leaf-outline" size={28} color={theme.accent} />
                        <View style={{ marginLeft: 15, flex: 1 }}>
                            <Text style={[styles.valueTitle, { color: theme.text }]}>Sustainability</Text>
                            <Text style={[styles.valueDesc, { color: theme.secondaryText }]}>We ensure our footprint is small and materials are ethically sourced.</Text>
                        </View>
                    </View>
                    <View style={[styles.valueCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <Ionicons name="heart-half-outline" size={28} color={theme.accent} />
                        <View style={{ marginLeft: 15, flex: 1 }}>
                            <Text style={[styles.valueTitle, { color: theme.text }]}>Community First</Text>
                            <Text style={[styles.valueDesc, { color: theme.secondaryText }]}>Fair wages and community reinvestment in every sale.</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.shopButton, { backgroundColor: theme.accent, marginTop: 40 }]}
                        onPress={() => onNavigate('Shop')}
                    >
                        <Text style={styles.shopButtonText}>DISCOVER OUR COLLECTION</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
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
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
    },
    content: {
        paddingBottom: 40,
    },
    heroImage: {
        width: '100%',
        height: 250,
        marginBottom: 20,
    },
    textContainer: {
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 16,
        lineHeight: 34,
    },
    subtitle: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 24,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 26,
    },
    bullets: {
        marginTop: 10,
        marginBottom: 10,
    },
    bulletPoint: {
        fontSize: 16,
        lineHeight: 28,
        marginBottom: 6,
    },
    galleryScrollView: {
        marginHorizontal: -24, // Break out of container padding
    },
    galleryContainer: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    galleryImage: {
        width: 200,
        height: 250,
        borderRadius: 12,
        marginRight: 15,
    },
    valueCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 15,
    },
    valueTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 5,
    },
    valueDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    shopButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 30,
        marginTop: 10,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    }
});

export default AboutUsPage;

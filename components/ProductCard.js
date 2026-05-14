import React, { useState } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductCard = ({ item, theme, isDark, onBuy, onProductPress, variant = 'modern', wishlist, toggleWishlist }) => {
  const isEcommerce = variant === 'ecommerce';
  const isWishlisted = wishlist?.some(w => w.id === item.id);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Skeleton shimmer opacity pulse
  const skeletonOpacity = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    if (!imageLoaded) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(skeletonOpacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [imageLoaded]);

  return (
    <View style={[styles.cardWrapper, isEcommerce && styles.ecommerceCardWrapper]}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.cardBackground,
            height: isEcommerce ? 'auto' : item.height || 260,
            marginBottom: isEcommerce ? 0 : 15
          }
        ]}
        onPress={() => onProductPress(item)}
        activeOpacity={0.9}
      >
        {/* Skeleton while image loads */}
        {!imageLoaded && (
          <Animated.View
            style={[
              styles.skeleton,
              {
                opacity: skeletonOpacity,
                backgroundColor: isDark ? '#2a2a2a' : '#e0e0e0',
                height: isEcommerce ? undefined : (item.height || 260),
                aspectRatio: isEcommerce ? 1 : undefined,
              }
            ]}
          />
        )}

        <ImageBackground
          source={item.image}
          style={[styles.image, isEcommerce && { height: (item.height * 0.75) || 180 }]}
          imageStyle={[styles.imageStyle, { transform: [{ scale: 1.05 }] }]}
          resizeMode="cover"
          onLoadEnd={() => setImageLoaded(true)}
        >
          <TouchableOpacity
            style={[styles.wishlistBtn, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)' }]}
            onPress={(e) => { e.stopPropagation(); toggleWishlist && toggleWishlist(item); }}
          >
            <Ionicons name={isWishlisted ? "heart" : "heart-outline"} size={22} color={isWishlisted ? "#ff4757" : "#fff"} />
          </TouchableOpacity>

          {!isEcommerce && (
            <View style={styles.badgeWrapper}>
              <View style={[styles.badge, { backgroundColor: item.badgeColor || theme.accent }]}>
                <Text style={styles.badgeText}>{item.price}</Text>
              </View>
            </View>
          )}

          {!isEcommerce && (
            <View style={styles.overlay}>
              <View style={styles.overlayContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <TouchableOpacity
                  style={[styles.buyBtn, { backgroundColor: theme.accent }]}
                  onPress={() => onBuy(item, true)}
                >
                  <Text style={styles.buyBtnText}>BUY NOW</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ImageBackground>

        {isEcommerce && (
          <View style={styles.detailsContainer}>
            <Text style={[styles.ecommerceTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name={s <= (item.rating || 5) ? "star" : "star-outline"} size={10} color="#FFD700" />
              ))}
              <Text style={[styles.reviewsCount, { color: theme.secondaryText }]}>({item.reviewsCount || 0})</Text>
            </View>
            {item.uploader_name && (
              <View style={styles.providerRow}>
                <Ionicons name="shield-checkmark" size={10} color={theme.accent} />
                <Text style={[styles.providerSmallText, { color: theme.accent }]}>{item.uploader_name}</Text>
              </View>
            )}

            {/* Stock Indicator */}
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: item.stock > 0 ? (item.stock < 10 ? '#ff4757' : '#2E7D32') : '#666' }}>
                {item.stock > 0 ? (item.stock < 10 ? `ONLY ${item.stock} LEFT!` : `${item.stock} IN STOCK`) : 'OUT OF STOCK'}
              </Text>
            </View>
            <View style={styles.ecommerceFooter}>
              <Text style={[styles.ecommercePrice, { color: theme.accent }]}>{item.price}</Text>
              <TouchableOpacity
                style={[styles.ecommerceBuyBtn, { backgroundColor: theme.accent }]}
                onPress={() => onBuy(item, true)}
              >
                <Text style={styles.ecommerceBuyText}>BUY</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallBuyBtn, { backgroundColor: theme.cardBackground, borderColor: theme.accent, borderWidth: 1 }]}
                onPress={() => onBuy(item, false)}
              >
                <Ionicons name="cart" size={14} color={theme.accent} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
  },
  ecommerceCardWrapper: {
    padding: 6,
    paddingBottom: 12,
  },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  badgeWrapper: {
    position: 'absolute',
    top: 8,
    right: 0,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    elevation: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  overlay: {
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 10,
  },
  overlayContent: {
    alignItems: 'center',
  },
  itemTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  buyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  detailsContainer: {
    padding: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  ecommerceTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    height: 32, // Fixed height for 2 lines
    lineHeight: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewsCount: {
    fontSize: 9,
    marginLeft: 4,
    fontWeight: '500',
  },
  ecommerceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  ecommercePrice: {
    fontSize: 15,
    fontWeight: '800',
  },
  ecommerceBuyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 4,
  },
  ecommerceBuyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  smallBuyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeleton: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 8,
    zIndex: 1,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 15,
    padding: 5,
    zIndex: 10,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerSmallText: {
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 3,
  }
});

export default ProductCard;

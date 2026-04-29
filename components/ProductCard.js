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
            style={styles.wishlistBtn}
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
    paddingBottom: 15,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  badgeWrapper: {
    position: 'absolute',
    top: 12,
    right: 0,
  },
  badge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    elevation: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  overlay: {
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  overlayContent: {
    alignItems: 'center',
  },
  itemTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  buyBtn: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  detailsContainer: {
    padding: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  ecommerceTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewsCount: {
    fontSize: 9,
    marginLeft: 4,
    fontWeight: '600',
  },
  ecommerceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ecommercePrice: {
    fontSize: 15,
    fontWeight: '900',
  },
  ecommerceBuyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 6,
  },
  ecommerceBuyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  smallBuyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeleton: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 20,
    zIndex: 1,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  providerSmallText: {
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  }
});

export default ProductCard;

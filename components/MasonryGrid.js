import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import ProductCard from './ProductCard';

const MasonryGrid = ({ data, theme, isDark, onBuy, onProductPress, onScroll, wishlist, toggleWishlist }) => {
    const { width } = useWindowDimensions();

    // Responsive columns (2 columns on mobile, 3-4 on desktop)
    const numColumns = width > 1024 ? 4 : width > 768 ? 3 : 2;

    // Split data into columns
    const columns = Array.from({ length: numColumns }, () => []);

    data.forEach((item, index) => {
        // A simple round-robin distribution
        columns[index % numColumns].push(item);
    });

    return (
        <ScrollView
            contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
        >
            {columns.map((col, i) => (
                <View key={i} style={styles.column}>
                    {col.map((item) => (
                        <ProductCard
                            key={item.id}
                            item={item}
                            theme={theme}
                            isDark={isDark}
                            onBuy={onBuy}
                            onProductPress={onProductPress}
                            variant="ecommerce"
                            wishlist={wishlist}
                            toggleWishlist={toggleWishlist}
                        />
                    ))}
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 10,
    },
    column: {
        flex: 1,
        marginHorizontal: 8,
    }
});

export default MasonryGrid;

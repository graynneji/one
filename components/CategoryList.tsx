import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Category {
    id: number;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

interface CategoryListProps {
    categories: Category[];
    activeCategory: number;
    setActiveCategory: (categoryId: number) => void;
    setShowCategories: (show: boolean) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
    categories,
    activeCategory,
    setActiveCategory,
    setShowCategories
}) => {
    const handleCategoryPress = (categoryId: number): void => {
        setActiveCategory(categoryId);
        setShowCategories(false); // Hide categories after selection
    };

    return (
        <View style={styles.container}>
            {/* <View style={styles.header}>
                <Text style={styles.title}>Categories</Text>
                <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setShowCategories(false)}
                >
                    <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
            </View> */}

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryBtn,
                            activeCategory === category.id && styles.categoryBtnActive,
                        ]}
                        onPress={() => handleCategoryPress(category.id)}
                    >
                        <View
                            style={[
                                styles.iconContainer,
                                { backgroundColor: category.color }
                            ]}
                        >
                            <Ionicons name={category.icon} size={16} color="white" />
                        </View>
                        <Text
                            style={[
                                styles.categoryText,
                                activeCategory === category.id && styles.categoryTextActive,
                            ]}
                        >
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // backgroundColor: 'white',
        borderRadius: 12,
        marginVertical: 8,
        // elevation: 1,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.1,
        // shadowRadius: 3,
        // borderColor: "#DEE2E6",
        // borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    closeBtn: {
        padding: 4,
    },
    scrollContainer: {
        paddingBottom: 16,
    },
    scrollContent: {
        // paddingHorizontal: 16,
        gap: 8,
    },
    categoryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f9fafb',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    categoryBtnActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#dbeafe',
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    categoryTextActive: {
        color: '#1d4ed8',
    },
});

export default CategoryList;
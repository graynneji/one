import { Colors } from '@/constants/Colors';
import React, { useLayoutEffect, useState } from 'react';
import { Image, ImageStyle, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import ImageViewerModal from './ImageViewerModal';

interface ImageViewerProps {
    images?: string[];
}

interface ImageDimensions {
    [key: number]: { width: number; height: number };
}

const ImageViewer: React.FC<ImageViewerProps> = ({ images }) => {
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({});
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);

    // IMPORTANT: Move useLayoutEffect BEFORE the early return
    // Hooks must always be called in the same order
    useLayoutEffect(() => {
        // Add check inside the effect instead
        if (!images || images.length === 0) return;

        const fetchDimensions = async () => {
            const dimensions: ImageDimensions = {};

            for (let i = 0; i < images.length; i++) {
                try {
                    await new Promise((resolve, reject) => {
                        Image.getSize(
                            images[i],
                            (width, height) => {
                                dimensions[i] = { width, height };
                                resolve(null);
                            },
                            reject
                        );
                    });
                } catch (error) {
                    console.warn(`Failed to get dimensions for image ${i}:`, error);
                    dimensions[i] = { width: 1, height: 1 }; // Fallback to square
                }
            }

            setImageDimensions(dimensions);
        };

        fetchDimensions();
    }, [images]);

    // NOW it's safe to do the early return after all hooks are called
    if (!images || images.length === 0) return null;

    const openViewer = (index: number) => {
        setSelectedImageIndex(index);
        setViewerVisible(true);
    };

    const closeViewer = () => {
        setViewerVisible(false);
    };

    const imageCount = images.length;

    const renderImageLayout = () => {
        if (imageCount === 1) {
            const dims = imageDimensions[0];
            let aspectRatio = dims ? dims.width / dims.height : 1;

            if (dims && aspectRatio < 0.6) {
                aspectRatio = 0.76;
            }

            return (
                <View style={styles.imageContainer}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => openViewer(0)}
                        style={[styles.singleImageWrapper, { aspectRatio }]}
                    >
                        <Image
                            source={{ uri: images[0] }}
                            style={styles.singleImage as ImageStyle}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                </View>
            );
        }

        if (imageCount === 2) {
            return (
                <View style={styles.imageContainer}>
                    <View style={styles.twoImageGrid}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => openViewer(0)}
                            style={styles.gridImageWrapper}
                        >
                            <Image
                                source={{ uri: images[0] }}
                                style={styles.gridImage as ImageStyle}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => openViewer(1)}
                            style={styles.gridImageWrapper}
                        >
                            <Image
                                source={{ uri: images[1] }}
                                style={styles.gridImage as ImageStyle}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        if (imageCount === 3) {
            return (
                <View style={styles.imageContainer}>
                    <View style={styles.threeImageGrid}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => openViewer(0)}
                            style={styles.largeImageWrapper}
                        >
                            <Image
                                source={{ uri: images[0] }}
                                style={styles.largeImage as ImageStyle}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                        <View style={styles.smallImagesColumn}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => openViewer(1)}
                                style={styles.smallImageWrapper}
                            >
                                <Image
                                    source={{ uri: images[1] }}
                                    style={styles.smallImage as ImageStyle}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => openViewer(2)}
                                style={styles.smallImageWrapper}
                            >
                                <Image
                                    source={{ uri: images[2] }}
                                    style={styles.smallImage as ImageStyle}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.imageContainer}>
                <View style={styles.fourImageGrid}>
                    {images.slice(0, 4).map((img, idx) => (
                        <TouchableOpacity
                            key={idx}
                            activeOpacity={0.9}
                            onPress={() => openViewer(idx)}
                            style={styles.quarterImageWrapper}
                        >
                            <Image
                                source={{ uri: img }}
                                style={styles.quarterImage as ImageStyle}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <>
            {renderImageLayout()}
            {/* Full Image Viewer Modal */}
            <ImageViewerModal
                images={images}
                viewerVisible={viewerVisible}
                closeViewer={closeViewer}
                selectedImageIndex={selectedImageIndex}
                setSelectedImageIndex={setSelectedImageIndex}
            />
        </>
    );
};

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    imageContainer: {
        marginTop: 12,
        marginBottom: 8,
        borderRadius: 16,
        overflow: 'hidden',
    },
    singleImageWrapper: {
        width: '100%',
        height: undefined,
    },
    singleImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        backgroundColor: colors.surface,
    },
    twoImageGrid: {
        flexDirection: 'row',
        gap: 2,
    },
    gridImageWrapper: {
        flex: 1,
        aspectRatio: 1,
    },
    gridImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f3f4f6',
    },
    threeImageGrid: {
        flexDirection: 'row',
        gap: 2,
        height: 300,
    },
    largeImageWrapper: {
        flex: 2,
    },
    largeImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f3f4f6',
    },
    smallImagesColumn: {
        flex: 1,
        gap: 2,
    },
    smallImageWrapper: {
        flex: 1,
    },
    smallImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f3f4f6',
    },
    fourImageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
        height: 300,
    },
    quarterImageWrapper: {
        width: '49%',
        height: 149,
    },
    quarterImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f3f4f6',
    },
});

export default ImageViewer;
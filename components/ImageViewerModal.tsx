import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from 'expo-media-library';
import React, { Dispatch, SetStateAction, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, ImageStyle, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


interface ImageViewer {
    images: string[];
    viewerVisible: boolean;
    selectedImageIndex: number;
    setSelectedImageIndex: Dispatch<SetStateAction<number>>
    closeViewer: () => void
}
const ImageViewerModal: React.FC<ImageViewer> = ({ images, viewerVisible, closeViewer, selectedImageIndex, setSelectedImageIndex }) => {
    const [isSaving, setIsSaving] = useState(false);

    const saveImage = async () => {
        if (isSaving) return; // Prevent multiple simultaneous saves

        setIsSaving(true);

        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please grant permission to save images to your device.',
                    [{ text: 'OK' }]
                );
                setIsSaving(false);
                return;
            }

            const imageUrl = images[selectedImageIndex];
            const filename = imageUrl.split('/').pop() || `image_${Date.now()}.jpg`;
            const fileUri = FileSystem.documentDirectory + filename;

            // Download the image with timeout
            const downloadResumable = FileSystem.createDownloadResumable(
                imageUrl,
                fileUri,
                {},
                (downloadProgress) => {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    console.log(`Download progress: ${(progress * 100).toFixed(0)}%`);
                }
            );

            const result = await downloadResumable.downloadAsync();

            if (!result || !result.uri) {
                throw new Error('Download failed');
            }

            // Save to media library
            const asset = await MediaLibrary.createAssetAsync(result.uri);

            try {
                await MediaLibrary.createAlbumAsync('Betterspace', asset, false);
            } catch (e) {
                // Album might already exist, try to add to existing album
                const album = await MediaLibrary.getAlbumAsync('Betterspace');
                if (album) {
                    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                }
            }

            // Clean up downloaded file
            try {
                await FileSystem.deleteAsync(result.uri, { idempotent: true });
            } catch (e) {
                console.log('Could not delete temp file');
            }

            Alert.alert(
                'Success',
                'Image saved to your gallery!',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Error saving image:', error);
            Alert.alert(
                'Error',
                'Failed to save image. Please check your internet connection and try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            visible={viewerVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeViewer}
        >
            <View style={styles.modalContainer}>
                {/* Close Button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeViewer}
                    disabled={isSaving}
                >
                    <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={saveImage}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Ionicons name="download-outline" size={24} color="white" />
                    )}
                </TouchableOpacity>

                {/* Image Counter */}
                {images.length > 1 && (
                    <View style={styles.counterContainer}>
                        <View style={styles.counter}>
                            <Ionicons name="images" size={16} color="white" />
                            <Text style={styles.counterText}>
                                {selectedImageIndex + 1} / {images.length}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Saving Indicator */}
                {isSaving && (
                    <View style={styles.savingOverlay}>
                        <View style={styles.savingContainer}>
                            <ActivityIndicator size="large" color="white" />
                            <Text style={styles.savingText}>Saving image...</Text>
                        </View>
                    </View>
                )}

                {/* Scrollable Images */}
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                        const index = Math.round(
                            event.nativeEvent.contentOffset.x / SCREEN_WIDTH
                        );
                        setSelectedImageIndex(index);
                    }}
                    contentOffset={{ x: selectedImageIndex * SCREEN_WIDTH, y: 0 }}
                    scrollEnabled={!isSaving}
                >
                    {images.map((img, idx) => (
                        <View key={idx} style={styles.fullImageWrapper}>
                            <Image
                                source={{ uri: img }}
                                style={styles.fullImage as ImageStyle}
                                resizeMode="contain"
                            />
                        </View>
                    ))}
                </ScrollView>

                {/* Navigation Dots */}
                {images.length > 1 && (
                    <View style={styles.dotsContainer}>
                        {images.map((_, idx) => (
                            <View
                                key={idx}
                                style={[
                                    styles.dot,
                                    selectedImageIndex === idx && styles.activeDot
                                ]}
                            />
                        ))}
                    </View>
                )}
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 8,
    },
    saveButton: {
        position: 'absolute',
        top: 50,
        right: 75,
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 8,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    counterContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    counter: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    counterText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    savingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    savingContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 32,
        paddingVertical: 24,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
    },
    savingText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    fullImageWrapper: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    activeDot: {
        backgroundColor: 'white',
        width: 24,
    },
})

export default ImageViewerModal
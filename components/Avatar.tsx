import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

interface AvatarProps {
    anonymous?: boolean;
    author?: string;
    profile_picture?: string;
    size?: number;
}

const lightenColor = (hex: string, percent: number = 70): string => {
    hex = hex.replace(/^#/, "");
    const num = parseInt(hex, 16);
    const r = Math.min(255, (num >> 16) + Math.round((255 - (num >> 16)) * (percent / 100)));
    const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round((255 - ((num >> 8) & 0x00ff)) * (percent / 100)));
    const b = Math.min(255, (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * (percent / 100)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

const Avatar: React.FC<AvatarProps> = ({ profile_picture, size = 40 }) => {
    const isColorOnly = profile_picture?.startsWith("#") ?? false;
    const mainColor = (isColorOnly ? profile_picture : "#3b82f6") ?? '#3b82f6';
    const lightColor = lightenColor(mainColor, 70);

    // 👇 dynamic styles generated from props
    const dynamicStyles = {
        avatar: {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: lightColor,
            borderColor: lightenColor(mainColor, 50),
        },
        authorAvatar: {
            width: size,
            height: size,
            borderRadius: size / 2,
        },
    };

    // 🖼️ If it's an image URL
    if (profile_picture && !isColorOnly) {
        return <Image source={{ uri: profile_picture || 'https://via.placeholder.com/40' }} style={[styles.authorAvatar, dynamicStyles.authorAvatar]} />;
    }

    // 🎨 Color-only avatar
    return (
        <View style={[styles.avatar, dynamicStyles.avatar]}>
            <Ionicons name="person" size={size * 0.45} color={mainColor} />
        </View>
    );
};

const styles = StyleSheet.create({
    avatar: {
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    authorAvatar: {
        resizeMode: "cover",
    },
});

export default Avatar;

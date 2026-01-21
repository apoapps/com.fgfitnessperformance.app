import React from 'react';
import { View, Pressable } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { getEmbedUrl, detectVideoProvider } from '@/utils/video';

interface VideoPlayerProps {
  url: string;
  thumbnailUrl?: string | null;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  const { colors } = useTheme();

  const embedUrl = getEmbedUrl(url);
  const provider = detectVideoProvider(url);

  const handleOpenExternal = async () => {
    await WebBrowser.openBrowserAsync(url);
  };

  // If we can't generate an embed URL, show fallback
  if (!embedUrl) {
    return (
      <View
        testID="video-player-fallback"
        style={{
          width: '100%',
          aspectRatio: 16 / 9,
          backgroundColor: colors.surface,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 24, color: colors.background }}>
            {provider === 'tiktok' ? '♪' : '▶'}
          </Text>
        </View>
        <Pressable
          onPress={handleOpenExternal}
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.primaryDark : colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          })}
        >
          <Text variant="bodySm" style={{ color: colors.background, fontWeight: '600' }}>
            Abrir Video
          </Text>
        </Pressable>
      </View>
    );
  }

  // Web platform uses iframe directly
  return (
    <View
      testID="video-player"
      style={{
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.surface,
      }}
    >
      <iframe
        src={embedUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </View>
  );
}

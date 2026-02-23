import React, { useState, useCallback } from 'react';
import { View, Pressable, Image, Dimensions, ActivityIndicator } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { getYouTubeVideoId, detectVideoProvider, getThumbnailUrl } from '@/utils/video';

interface VideoPlayerProps {
  url: string;
  thumbnailUrl?: string | null;
}

const { width: screenWidth } = Dimensions.get('window');
// YouTube videos use 16:9 aspect ratio - calculate once
const PLAYER_HEIGHT = (screenWidth * 9) / 16;

export function VideoPlayer({ url, thumbnailUrl }: VideoPlayerProps) {
  const { colors } = useTheme();
  const [isPlaying, setIsPlaying] = useState(true); // Autoplay
  const [isReady, setIsReady] = useState(false);

  const provider = detectVideoProvider(url);
  const youtubeVideoId = provider === 'youtube' ? getYouTubeVideoId(url) : null;
  const thumbnail = thumbnailUrl || getThumbnailUrl(url);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setIsPlaying(false);
    }
  }, []);

  const onReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const handleOpenExternal = async () => {
    await WebBrowser.openBrowserAsync(url);
  };

  // Get provider info for display
  const getProviderInfo = () => {
    switch (provider) {
      case 'youtube':
        return { icon: 'logo-youtube' as const, label: 'YouTube', color: '#FF0000' };
      case 'vimeo':
        return { icon: 'play-circle' as const, label: 'Vimeo', color: '#1AB7EA' };
      case 'instagram':
        return { icon: 'logo-instagram' as const, label: 'Instagram', color: '#E4405F' };
      case 'tiktok':
        return { icon: 'logo-tiktok' as const, label: 'TikTok', color: '#000000' };
      default:
        return { icon: 'play-circle' as const, label: 'Ver Video', color: colors.primary };
    }
  };

  const providerInfo = getProviderInfo();

  // For YouTube videos, show player directly with autoplay
  if (provider === 'youtube' && youtubeVideoId) {
    return (
      <View
        testID="video-player"
        style={{
          width: screenWidth,
          height: PLAYER_HEIGHT,
          backgroundColor: '#000',
        }}
      >
        {/* Loading indicator while player loads */}
        {!isReady && (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            {/* Show thumbnail behind loader */}
            {thumbnail && (
              <Image
                source={{ uri: thumbnail }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                }}
                resizeMode="cover"
              />
            )}
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.4)',
              }}
            />
            <ActivityIndicator size="large" color="#FF0000" />
          </View>
        )}
        <YoutubeIframe
          height={PLAYER_HEIGHT}
          width={screenWidth}
          videoId={youtubeVideoId}
          play={isPlaying}
          onChangeState={onStateChange}
          onReady={onReady}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
        />
      </View>
    );
  }

  // For non-YouTube videos, show thumbnail with external link
  return (
    <Pressable
      testID="video-player"
      onPress={handleOpenExternal}
      style={({ pressed }) => ({
        width: screenWidth,
        height: PLAYER_HEIGHT,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {thumbnail && (
        <Image
          source={{ uri: thumbnail }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
          resizeMode="cover"
        />
      )}
      <View
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
      />
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: providerInfo.color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons name={providerInfo.icon} size={32} color="#FFFFFF" />
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(0,0,0,0.6)',
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 16,
        }}
      >
        <Ionicons name="open-outline" size={14} color="#FFFFFF" />
        <Text variant="caption" style={{ color: '#FFFFFF' }}>
          Abrir en {providerInfo.label}
        </Text>
      </View>
    </Pressable>
  );
}

import React, { useState, useCallback } from 'react';
import { View, Pressable, Image, Dimensions } from 'react-native';
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

export function VideoPlayer({ url, thumbnailUrl }: VideoPlayerProps) {
  const { colors } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const provider = detectVideoProvider(url);
  const videoId = provider === 'youtube' ? getYouTubeVideoId(url) : null;
  const thumbnail = thumbnailUrl || getThumbnailUrl(url);

  const handleOpenExternal = async () => {
    await WebBrowser.openBrowserAsync(url);
  };

  const onReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const onError = useCallback(() => {
    setHasError(true);
  }, []);

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

  // Calculate player height for 16:9 aspect ratio
  const playerHeight = (screenWidth * 9) / 16;

  // If not YouTube or no video ID, show fallback with thumbnail
  if (provider !== 'youtube' || !videoId) {
    return (
      <Pressable
        testID="video-player-fallback"
        onPress={handleOpenExternal}
        style={({ pressed }) => ({
          width: '100%',
          aspectRatio: 16 / 9,
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

  // Show error state with fallback button
  if (hasError) {
    return (
      <Pressable
        testID="video-player-error"
        onPress={handleOpenExternal}
        style={({ pressed }) => ({
          width: '100%',
          aspectRatio: 16 / 9,
          backgroundColor: colors.surface,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Ionicons name="warning-outline" size={32} color={colors.textMuted} />
        <Text variant="body" color="textMuted">
          No se pudo cargar el video
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Ionicons name="open-outline" size={16} color={colors.background} />
          <Text variant="bodySm" style={{ color: colors.background, fontWeight: '600' }}>
            Abrir en Navegador
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View
      testID="video-player"
      style={{
        width: '100%',
        backgroundColor: '#000',
      }}
    >
      {/* Loading thumbnail while player initializes */}
      {!isReady && thumbnail && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: playerHeight,
            zIndex: 1,
          }}
        >
          <Image
            source={{ uri: thumbnail }}
            style={{
              width: '100%',
              height: '100%',
            }}
            resizeMode="cover"
          />
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.3)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#FF0000',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="logo-youtube" size={32} color="#FFFFFF" />
            </View>
          </View>
        </View>
      )}

      {/* YouTube Player */}
      <YoutubeIframe
        height={playerHeight}
        width={screenWidth}
        videoId={videoId}
        play={false}
        onReady={onReady}
        onError={onError}
        initialPlayerParams={{
          controls: true,
          modestbranding: true,
          rel: false,
          showClosedCaptions: false,
          preventFullScreen: false,
        }}
        webViewProps={{
          allowsFullscreenVideo: true,
          allowsInlineMediaPlayback: true,
        }}
        webViewStyle={{
          opacity: isReady ? 1 : 0,
        }}
      />

      {/* External link button overlay */}
      <Pressable
        onPress={handleOpenExternal}
        style={({ pressed }) => ({
          position: 'absolute',
          top: 8,
          right: 8,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: pressed ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
        })}
      >
        <Ionicons name="open-outline" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

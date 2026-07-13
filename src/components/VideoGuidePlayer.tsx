import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

export interface VideoGuidePlayerProps {
  videoUri: string | null;
  posterIcon: string;
}

/** videoUri가 아직 없으면(촬영 전) 준비 중 표시만 하고, 있으면 영상 플레이어를 보여준다. */
export function VideoGuidePlayer({ videoUri, posterIcon }: VideoGuidePlayerProps) {
  if (!videoUri) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderIcon}>{posterIcon}</Text>
        <Text style={styles.placeholderText}>안내 영상 준비 중</Text>
      </View>
    );
  }
  return <VideoGuidePlayerWithSource videoUri={videoUri} />;
}

function VideoGuidePlayerWithSource({ videoUri }: { videoUri: string }) {
  // player.play()를 호출하지 않아 자동재생 없이 대기 상태로 시작 — 환자가 직접 재생 버튼을 눌러야 한다.
  const player = useVideoPlayer(videoUri, (instance) => {
    instance.loop = true;
  });

  return (
    <VideoView
      style={styles.video}
      player={player}
      nativeControls
      allowsPictureInPicture={false}
    />
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#000000',
  },
  placeholder: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#F5F7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 15,
    color: '#78909C',
  },
});

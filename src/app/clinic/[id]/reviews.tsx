import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MessageCircle, Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageCanvasColor } from '@/constants/theme';
import { clinics } from '@/data/clinics';
import { getClinicReviewData, type ClinicReviewData } from '@/services/api/reviews';

export default function ClinicReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const clinic = clinics.find((item) => item.id === id);
  const [reviewData, setReviewData] = useState<ClinicReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setReviewData(null);

    if (!id) {
      setLoading(false);
      setLoadError('Clinic id is missing.');
      return () => {
        cancelled = true;
      };
    }

    getClinicReviewData(id)
      .then((data) => {
        if (!cancelled) setReviewData(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Could not load reviews.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, retryToken]);

  if (!clinic) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.notFoundTitle}>Clinic not found</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.primaryButton}>
          <ThemedText style={styles.primaryButtonText}>Go back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const reviews = reviewData?.reviews ?? [];
  const reviewCount = reviewData?.reviewCount ?? 0;
  const average = reviewData?.averageRating ?? 0;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} accessibilityLabel="Back to clinic" style={styles.backButton}>
            <ArrowLeft size={20} color="#183b36" />
          </Pressable>
          <ThemedText style={styles.topBarTitle}>Clinic reviews</ThemedText>
          <View style={styles.backSpacer} />
        </View>

        <ThemedView style={styles.hero}>
          <ThemedText style={styles.eyebrow}>COMMUNITY FEEDBACK</ThemedText>
          <ThemedText style={styles.clinicName}>{clinic.name}</ThemedText>
          <View style={styles.ratingSummary}>
            <View style={styles.averageBlock}>
              <ThemedText style={styles.average}>{reviewCount ? average.toFixed(1) : '—'}</ThemedText>
              <View style={styles.averageStars}>
                <Stars rating={Math.round(average)} size={15} />
                <ThemedText style={styles.reviewCount}>
                  {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </ThemedText>
              </View>
            </View>
            {reviewCount > 0 && (
              <View style={styles.ratingBreakdown}>
                {[5, 4, 3, 2, 1].map((score) => {
                  const count = reviews.filter((review) => review.rating === score).length;
                  return (
                    <View key={score} style={styles.ratingRow}>
                      <ThemedText style={styles.ratingNumber}>{score}</ThemedText>
                      <Star size={11} color="#e5a52a" fill="#e5a52a" />
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: `${(count / reviewCount) * 100}%` }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ThemedView>

        <View style={styles.sectionHeading}>
          <View>
            <ThemedText style={styles.sectionTitle}>What pet owners say</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Published reviews for this clinic</ThemedText>
          </View>
          <Pressable
            onPress={() => router.push({ pathname: '/clinic/[id]/review', params: { id: clinic.id } })}
            style={styles.writeButton}>
            <Star size={14} color="#147d72" />
            <ThemedText style={styles.writeButtonText}>Write</ThemedText>
          </Pressable>
        </View>

        {loading ? (
          <ThemedView style={styles.emptyCard}>
            <ThemedText style={styles.sectionSubtitle}>Loading clinic reviews…</ThemedText>
          </ThemedView>
        ) : loadError ? (
          <ThemedView style={styles.emptyCard}>
            <MessageCircle size={24} color="#147d72" />
            <ThemedText style={styles.emptyTitle}>Reviews unavailable</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>{loadError}</ThemedText>
            <Pressable onPress={() => setRetryToken((token) => token + 1)}>
              <ThemedText style={styles.retryText}>Try again</ThemedText>
            </Pressable>
          </ThemedView>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <ThemedView key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.avatar}>
                  <ThemedText style={styles.avatarText}>{review.reviewer.slice(0, 1)}</ThemedText>
                </View>
                <View style={styles.reviewerInfo}>
                  <ThemedText style={styles.reviewerName}>{review.reviewer}</ThemedText>
                  <ThemedText style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</ThemedText>
                </View>
                <View style={styles.scorePill}>
                  <Star size={13} color="#d99a18" fill="#d99a18" />
                  <ThemedText style={styles.scoreText}>{review.rating}.0</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.comment}>{review.comment}</ThemedText>
            </ThemedView>
          ))
        ) : (
          <ThemedView style={styles.emptyCard}>
            <MessageCircle size={24} color="#147d72" />
            <ThemedText style={styles.emptyTitle}>No reviews yet</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Be the first to share your experience.</ThemedText>
          </ThemedView>
        )}
      </View>
    </ScrollView>
  );
}

function Stars({ rating, size }: { rating: number; size: number }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={size} color="#e5a52a" fill={star <= rating ? '#e5a52a' : 'transparent'} />
      ))}
    </View>
  );
}

function formatReviewDate(date: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: PageCanvasColor },
  content: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36, backgroundColor: PageCanvasColor },
  container: { width: '100%', maxWidth: 720, gap: 15, paddingBottom: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24, backgroundColor: PageCanvasColor },
  notFoundTitle: { color: '#183b36', fontSize: 23, fontWeight: '800' },
  topBar: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5ece8' },
  topBarTitle: { color: '#59706a', fontSize: 14, fontWeight: '700' },
  backSpacer: { width: 40 },
  hero: { gap: 12, padding: 20, borderRadius: 23, backgroundColor: '#173f38' },
  eyebrow: { color: '#b9ddd0', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  clinicName: { color: '#fff', fontSize: 22, lineHeight: 28, fontWeight: '800' },
  ratingSummary: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingTop: 4 },
  averageBlock: { alignItems: 'flex-start', gap: 3 },
  average: { color: '#fff', fontSize: 38, lineHeight: 42, fontWeight: '800' },
  averageStars: { gap: 4 },
  stars: { flexDirection: 'row', gap: 2 },
  reviewCount: { color: '#d5e8df', fontSize: 11 },
  ratingBreakdown: { flex: 1, gap: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingNumber: { width: 10, color: '#d5e8df', fontSize: 10 },
  barTrack: { flex: 1, height: 5, overflow: 'hidden', borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.17)' },
  barFill: { height: 5, borderRadius: 3, backgroundColor: '#efc666' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 3 },
  sectionTitle: { color: '#1c3934', fontSize: 18, fontWeight: '800' },
  sectionSubtitle: { color: '#83918d', fontSize: 12, lineHeight: 17 },
  writeButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, backgroundColor: '#e2f1ec' },
  writeButtonText: { color: '#147d72', fontSize: 12, fontWeight: '800' },
  reviewCard: { gap: 13, padding: 16, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8eeeb' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#e8f4ef' },
  avatarText: { color: '#147d72', fontSize: 14, fontWeight: '800' },
  reviewerInfo: { flex: 1, gap: 2 },
  reviewerName: { color: '#243e38', fontSize: 13, fontWeight: '800' },
  reviewDate: { color: '#8a9994', fontSize: 10 },
  scorePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12, backgroundColor: '#fff7e5' },
  scoreText: { color: '#625132', fontSize: 11, fontWeight: '800' },
  comment: { color: '#546861', fontSize: 13, lineHeight: 20 },
  emptyCard: { alignItems: 'center', gap: 9, padding: 28, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8eeeb' },
  emptyTitle: { color: '#1c3934', fontSize: 16, fontWeight: '800' },
  retryText: { color: '#147d72', fontWeight: '800', padding: 8 },
  primaryButton: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, backgroundColor: '#147d72' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});

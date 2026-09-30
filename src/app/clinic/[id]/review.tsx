import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageCanvasColor } from '@/constants/theme';
import { clinics } from '@/data/clinics';
import { submitReview } from '@/services/api/reviews';

const MAX_COMMENT_LENGTH = 1000;

export default function ClinicReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const clinic = clinics.find((item) => item.id === id);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!clinic) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.pageTitle}>Clinic not found</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.secondaryButton}>
          <ThemedText style={styles.secondaryButtonText}>Go back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }
  const clinicId = clinic.id;

  async function handleSubmit() {
    if (rating === 0) {
      setError('Choose a star rating to continue.');
      return;
    }
    if (!comment.trim()) {
      setError('Add a comment about your visit.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await submitReview({ clinicId, rating, comment: comment.trim() });
      setSubmitted(true);
    } catch {
      setError('Your review could not be submitted. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <ThemedView style={styles.centered}>
        <View style={styles.successIcon}><Check size={30} color="#fff" strokeWidth={3} /></View>
        <ThemedText style={styles.pageTitle}>Thanks for sharing!</ThemedText>
        <ThemedText style={styles.subtitle}>Your review for {clinic.name} has been submitted.</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.submitButton}>
          <ThemedText style={styles.submitButtonText}>Back to clinic</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} accessibilityLabel="Back to clinic" style={styles.backButton}>
            <ArrowLeft size={20} color="#183b36" />
          </Pressable>
          <ThemedText style={styles.topBarTitle}>Write a review</ThemedText>
          <View style={styles.backButtonSpacer} />
        </View>

        <ThemedView style={styles.hero}>
          <ThemedText style={styles.eyebrow}>YOUR EXPERIENCE MATTERS</ThemedText>
          <ThemedText style={styles.pageTitle}>How was your visit?</ThemedText>
          <ThemedText style={styles.subtitle}>{clinic.name}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.fieldTitle}>Your rating</ThemedText>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((value) => {
              const selected = value <= rating;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={`Rate ${value} out of 5 stars`}
                  accessibilityState={{ selected: rating === value }}
                  onPress={() => {
                    setRating(value);
                    setError('');
                  }}
                  hitSlop={7}
                  style={({ pressed }) => [styles.starButton, pressed && styles.pressed]}>
                  <Star size={36} color={selected ? '#e5a52a' : '#cbd5d0'} fill={selected ? '#e5a52a' : 'transparent'} />
                </Pressable>
              );
            })}
          </View>
          <ThemedText style={styles.ratingHint}>
            {rating === 0 ? 'Tap a star to rate your experience' : ratingLabels[rating]}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <View style={styles.commentHeader}>
            <ThemedText style={styles.fieldTitle}>Your comments</ThemedText>
            <ThemedText style={styles.characterCount}>{comment.length}/{MAX_COMMENT_LENGTH}</ThemedText>
          </View>
          <TextInput
            value={comment}
            onChangeText={(value) => {
              setComment(value.slice(0, MAX_COMMENT_LENGTH));
              setError('');
            }}
            placeholder="Share details that may help other pet owners..."
            placeholderTextColor="#8a9994"
            multiline
            maxLength={MAX_COMMENT_LENGTH}
            textAlignVertical="top"
            accessibilityLabel="Review comment"
            style={styles.commentInput}
          />
        </ThemedView>

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        <Pressable
          onPress={() => void handleSubmit()}
          disabled={isSubmitting}
          style={({ pressed }) => [styles.submitButton, pressed && styles.pressed, isSubmitting && styles.disabled]}>
          <ThemedText style={styles.submitButtonText}>{isSubmitting ? 'Submitting…' : 'Submit review'}</ThemedText>
        </Pressable>
        <ThemedText style={styles.disclaimer}>Please keep your review kind, honest, and based on your experience.</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const ratingLabels: Record<number, string> = {
  1: 'Needs improvement',
  2: 'Fair experience',
  3: 'Good experience',
  4: 'Very good experience',
  5: 'Excellent experience',
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: PageCanvasColor },
  content: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36, backgroundColor: PageCanvasColor },
  container: { width: '100%', maxWidth: 620, gap: 16, paddingBottom: 24 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, backgroundColor: PageCanvasColor },
  topBar: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5ece8' },
  backButtonSpacer: { width: 40 },
  topBarTitle: { color: '#59706a', fontSize: 14, fontWeight: '700' },
  hero: { gap: 7, paddingHorizontal: 2, paddingVertical: 9 },
  eyebrow: { color: '#147d72', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  pageTitle: { color: '#183b36', fontSize: 28, lineHeight: 34, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#74837e', fontSize: 14, textAlign: 'center' },
  card: { gap: 14, padding: 18, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8eeeb' },
  fieldTitle: { color: '#1c3934', fontSize: 16, fontWeight: '800' },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 4 },
  starButton: { padding: 2 },
  ratingHint: { color: '#768780', fontSize: 13, textAlign: 'center' },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  characterCount: { color: '#8a9994', fontSize: 11 },
  commentInput: { minHeight: 150, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e0e9e4', backgroundColor: '#fafcfb', color: '#203b36', fontSize: 15, lineHeight: 22 },
  error: { color: '#b42318', fontSize: 13 },
  submitButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#147d72' },
  submitButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  disclaimer: { color: '#83918d', fontSize: 11, lineHeight: 16, textAlign: 'center' },
  successIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#147d72' },
  secondaryButton: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, backgroundColor: '#e2f1ec' },
  secondaryButtonText: { color: '#147d72', fontWeight: '700' },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.6 },
});

import { supabase } from '@/services/supabase';

export type Review = { clinicId: string; rating: number; comment: string };

export type ClinicReviewRecord = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: string;
};

export type ClinicReviewData = {
  averageRating: number | null;
  reviewCount: number;
  reviews: ClinicReviewRecord[];
};

type ReviewRow = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_profiles: { display_name: string } | { display_name: string }[] | null;
};

export async function getClinicReviewData(clinicId: string): Promise<ClinicReviewData> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const [summaryResult, reviewsResult] = await Promise.all([
    supabase
      .from('clinic_rating_summary')
      .select('average_rating, review_count')
      .eq('clinic_id', clinicId)
      .maybeSingle(),
    supabase
      .from('clinic_reviews')
      .select('id, rating, comment, created_at, user_profiles(display_name)')
      .eq('clinic_id', clinicId)
      .eq('status', 'published')
      .order('created_at', { ascending: false }),
  ]);

  if (summaryResult.error) {
    throw new Error(`Could not load clinic rating: ${summaryResult.error.message}`);
  }
  if (reviewsResult.error) {
    throw new Error(`Could not load clinic reviews: ${reviewsResult.error.message}`);
  }

  const rows = (reviewsResult.data ?? []) as unknown as ReviewRow[];
  const summary = summaryResult.data;

  return {
    averageRating: summary?.average_rating == null ? null : Number(summary.average_rating),
    reviewCount: summary?.review_count ?? 0,
    reviews: rows.map((row) => {
      const profile = Array.isArray(row.user_profiles) ? row.user_profiles[0] : row.user_profiles;
      return {
        id: row.id,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at,
        reviewer: profile?.display_name ?? 'Pet owner',
      };
    }),
  };
}

export async function submitReview(review: Review) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Check the app environment variables.');
  }

  const clinicId = review.clinicId.trim();
  const comment = review.comment.trim();
  if (!clinicId) throw new Error('A clinic must be selected before submitting a review.');
  if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
    throw new Error('Rating must be a whole number from 1 to 5.');
  }
  if (!comment || comment.length > 1000) {
    throw new Error('Comment must contain between 1 and 1000 characters.');
  }

  const { data: userResult, error: authError } = await supabase.auth.getUser();
  if (authError || !userResult.user) {
    throw new Error('Please sign in before submitting a clinic review.');
  }

  const user = userResult.user;
  const metadataName = user.user_metadata?.display_name ?? user.user_metadata?.name;
  const displayName = (typeof metadataName === 'string' && metadataName.trim())
    || user.email?.split('@')[0]
    || 'Pet owner';

  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(
      { user_id: user.id, display_name: displayName.slice(0, 80) },
      { onConflict: 'user_id' },
    );

  if (profileError) {
    throw new Error(`Could not prepare your reviewer profile: ${profileError.message}`);
  }

  const { data, error } = await supabase
    .from('clinic_reviews')
    .insert({
      clinic_id: clinicId,
      user_id: user.id,
      rating: review.rating,
      comment,
      status: 'pending',
    })
    .select('id, clinic_id, rating, comment, status, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already reviewed this clinic.');
    }
    throw new Error(`Could not submit your review: ${error.message}`);
  }

  return data;
}

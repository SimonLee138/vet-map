export type Review = { clinicId: string; rating: number; comment: string };

export async function submitReview(review: Review) {
  return review;
}

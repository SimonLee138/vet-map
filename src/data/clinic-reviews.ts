export type ClinicReview = {
  id: string;
  clinicId: string;
  reviewer: string;
  rating: number;
  date: string;
  comment: string;
  isSample: true;
};

// Preview content for the prototype. Replace with persisted user reviews when a backend is connected.
export const clinicReviews: ClinicReview[] = [
  {
    id: 'buddy-review-1',
    clinicId: 'buddys-animal-medical-center',
    reviewer: 'Mia L.',
    rating: 5,
    date: '2026-09-12',
    comment: 'The team was kind and patient with my cat. They explained the treatment clearly and checked in after our visit.',
    isSample: true,
  },
  {
    id: 'buddy-review-2',
    clinicId: 'buddys-animal-medical-center',
    reviewer: 'Jason W.',
    rating: 4,
    date: '2026-09-03',
    comment: 'Easy to book and the consultation felt thorough. The staff answered all of my questions.',
    isSample: true,
  },
  {
    id: 'central-review-1',
    clinicId: 'central-animal-hospital',
    reviewer: 'Ava C.',
    rating: 5,
    date: '2026-09-15',
    comment: 'Friendly staff and a calm environment. The vet took time to walk me through the care plan.',
    isSample: true,
  },
  {
    id: 'central-review-2',
    clinicId: 'central-animal-hospital',
    reviewer: 'Noah T.',
    rating: 4,
    date: '2026-08-28',
    comment: 'Professional service and clear instructions for follow-up care.',
    isSample: true,
  },
  {
    id: 'petcare-review-1',
    clinicId: 'petcare-247',
    reviewer: 'Chloe K.',
    rating: 5,
    date: '2026-09-18',
    comment: 'It was reassuring to find help late at night. The team handled our urgent visit efficiently.',
    isSample: true,
  },
  {
    id: 'petcare-review-2',
    clinicId: 'petcare-247',
    reviewer: 'Ethan Y.',
    rating: 4,
    date: '2026-09-06',
    comment: 'Quick response and thoughtful care during an unexpected emergency.',
    isSample: true,
  },
  {
    id: 'happypaws-review-1',
    clinicId: 'happy-paws-veterinary-clinic',
    reviewer: 'Sophie P.',
    rating: 5,
    date: '2026-09-10',
    comment: 'Very gentle with my rabbit and happy to answer questions about ongoing care.',
    isSample: true,
  },
  {
    id: 'happypaws-review-2',
    clinicId: 'happy-paws-veterinary-clinic',
    reviewer: 'Lucas H.',
    rating: 4,
    date: '2026-08-30',
    comment: 'A welcoming clinic with helpful staff. Booking a follow-up was straightforward.',
    isSample: true,
  },
];

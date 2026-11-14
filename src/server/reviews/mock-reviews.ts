import type { Review } from "../../domain/reviews";

export const mockReviews: Review[] = [
  {
    id: "review-marcus",
    name: "accounts/mock-account/locations/location-brewhouse/reviews/mock-marcus",
    reviewId: "mock-marcus",
    location: { id: "location-brewhouse", name: "Brewhouse Koregaon Park" },
    reviewer: { displayName: "Marcus Webb", isAnonymous: false },
    starRating: "TWO",
    comment:
      "Waited 40 minutes for a cold pizza and nobody apologised at the table or at the counter.",
    createTime: "2026-11-13T14:12:00.000Z",
    updateTime: "2026-11-13T14:12:00.000Z",
    status: "pending",
  },
  {
    id: "review-priya",
    name: "accounts/mock-account/locations/location-brewhouse/reviews/mock-priya",
    reviewId: "mock-priya",
    location: { id: "location-brewhouse", name: "Brewhouse Koregaon Park" },
    reviewer: { displayName: "Priya Nair", isAnonymous: false },
    starRating: "FIVE",
    comment:
      "Loved the filter coffee and the quiet corner seating. Staff remembered my order from last week.",
    createTime: "2026-11-13T14:28:00.000Z",
    updateTime: "2026-11-13T14:28:00.000Z",
    status: "pending",
  },
  {
    id: "review-aisha",
    name: "accounts/mock-account/locations/location-brewhouse/reviews/mock-aisha",
    reviewId: "mock-aisha",
    location: { id: "location-brewhouse", name: "Brewhouse Koregaon Park" },
    reviewer: { displayName: "Aisha Khan", isAnonymous: false },
    starRating: "FOUR",
    comment:
      "Great ambience, slightly pricey. The dessert menu was the highlight of the evening for us.",
    createTime: "2026-11-13T13:30:00.000Z",
    updateTime: "2026-11-13T13:30:00.000Z",
    status: "pending",
  },
  {
    id: "review-tom",
    name: "accounts/mock-account/locations/location-brewhouse/reviews/mock-tom",
    reviewId: "mock-tom",
    location: { id: "location-brewhouse", name: "Brewhouse Koregaon Park" },
    reviewer: { displayName: "Tom Becker", isAnonymous: false },
    starRating: "ONE",
    comment:
      "Found a hair in my soup and the manager was dismissive about it when I raised it.",
    createTime: "2026-11-13T11:30:00.000Z",
    updateTime: "2026-11-13T11:30:00.000Z",
    status: "pending",
  },
  {
    id: "review-sofia",
    name: "accounts/mock-account/locations/location-brewhouse/reviews/mock-sofia",
    reviewId: "mock-sofia",
    location: { id: "location-brewhouse", name: "Brewhouse Koregaon Park" },
    reviewer: { displayName: "Sofia Rossi", isAnonymous: false },
    starRating: "FIVE",
    comment:
      "Best brunch in Koregaon Park, the avocado toast alone is worth the trip across town.",
    createTime: "2026-11-12T14:30:00.000Z",
    updateTime: "2026-11-12T14:30:00.000Z",
    status: "pending",
  },
];

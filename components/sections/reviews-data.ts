export interface ReviewMedia {
  type: 'image' | 'video'
  url: string
  thumbnail?: string
}

export interface Review {
  id: string
  customerName: string
  customerAvatar: string
  location: string
  rating: number
  comment: string
  productName: string
  productImage: string
  media: ReviewMedia[]
  likes: number
  date: string
  comments: ReviewComment[]
}

export interface ReviewComment {
  id: string
  authorName: string
  authorAvatar: string
  text: string
  date: string
  likes?: number
}

export const reviews: Review[] = [
  {
    id: "1",
    customerName: "Temitope Adeyemi",
    customerAvatar: "/placeholder-user.jpg",
    location: "Lagos, Nigeria",
    rating: 5,
    comment: "Absolutely stunning! The HD lace wig melts perfectly and looks so natural. Everyone keeps asking where I got it from. The quality is unmatched!",
    productName: "HD Transparent Lace Wig",
    productImage: "/placeholder.jpg",
    media: [
      { type: 'image', url: 'https://res.cloudinary.com/deafv5ovi/image/upload/f_auto,q_auto/v1785654580/c1_4_wxzhwv.jpg' },
      { type: 'image', url: 'https://res.cloudinary.com/deafv5ovi/image/upload/f_auto,q_auto/v1785654580/c1_2_rbb3gb.jpg' },
      { type: 'image', url: 'https://res.cloudinary.com/deafv5ovi/image/upload/f_auto,q_auto/v1785654581/c1_1_hvjaq1.jpg' },
      { type: 'image', url: 'https://res.cloudinary.com/deafv5ovi/image/upload/f_auto,q_auto/v1785654580/c1_3_mveynp.jpg' }
    ],
    likes: 124,
    date: "2024-01-15",
    comments: [
      {
        id: "c1",
        authorName: "Chioma N.",
        authorAvatar: "/placeholder-user.jpg",
        text: "I want one too! How long did it take to arrive?",
        date: "2024-01-16",
        likes: 5
      }
    ]
  },
  {
    id: "2",
    customerName: "Chioma Okonkwo",
    customerAvatar: "/placeholder-user.jpg",
    location: "Enugu, Nigeria",
    rating: 5,
    comment: "Finally found hair extensions that match my texture perfectly! No tangling, no shedding. Ammie Hair is the real deal. Worth every penny!",
    productName: "Brazilian Body Wave",
    productImage: "/placeholder.jpg",
    media: [
      { type: 'video', url: 'https://res.cloudinary.com/deafv5ovi/video/upload/v1785651879/2_2_afapbv.mp4', thumbnail: 'https://res.cloudinary.com/deafv5ovi/video/upload/w_400,h_400,c_fill/v1785651879/2_2_afapbv.jpg' },
      { type: 'image', url: '/placeholder.jpg' }
    ],
    likes: 89,
    date: "2024-01-14",
    comments: []
  },
  {
    id: "3",
    customerName: "Adesuwa Ogbomo",
    customerAvatar: "/placeholder-user.jpg",
    location: "Ibadan, Nigeria",
    rating: 5,
    comment: "The full lace wig is absolutely gorgeous! I can part it anywhere and it genuinely looks like my own hair. The lace is so thin and invisible!",
    productName: "Full Lace Wig",
    productImage: "/placeholder.jpg",
    media: [
      { type: 'video', url: 'https://res.cloudinary.com/deafv5ovi/video/upload/v1785651872/2_10_eu4kbh.mp4', thumbnail: 'https://res.cloudinary.com/deafv5ovi/video/upload/w_400,h_400,c_fill/v1785651872/2_10_eu4kbh.jpg' },
      { type: 'image', url: '/placeholder.jpg' }
    ],
    likes: 156,
    date: "2024-01-13",
    comments: [
      {
        id: "c2",
        authorName: "Adebimpe S.",
        authorAvatar: "/placeholder-user.jpg",
        text: "This is exactly what I needed! Ordering mine today",
        date: "2024-01-14",
        likes: 12
      }
    ]
  },
  {
    id: "4",
    customerName: "Chinwe Eze",
    customerAvatar: "/placeholder-user.jpg",
    location: "Awka, Nigeria",
    rating: 5,
    comment: "I've tried so many lace frontals, but nothing compares to the transparency of Ammie Hair's HD lace. Worth every naira.",
    productName: "Transparent Lace Frontal",
    productImage: "/placeholder.jpg",
    media: [
      { type: 'video', url: 'https://res.cloudinary.com/deafv5ovi/video/upload/v1785651894/2_4_yfaxbx.mp4', thumbnail: 'https://res.cloudinary.com/deafv5ovi/video/upload/w_400,h_400,c_fill/v1785651894/2_4_yfaxbx.jpg' }
    ],
    likes: 67,
    date: "2024-01-12",
    comments: []
  },
  {
    id: "5",
    customerName: "Adebimpe Salami",
    customerAvatar: "/placeholder-user.jpg",
    location: "Abeokuta, Nigeria",
    rating: 5,
    comment: "The packaging is elegant and the hair quality exceeded my expectations. I'll definitely be ordering again.",
    productName: "Glueless Wig",
    productImage: "/placeholder.jpg",
    media: [
      { type: 'video', url: 'https://res.cloudinary.com/deafv5ovi/video/upload/v1785651837/2_8_u7tuvr.mp4', thumbnail: 'https://res.cloudinary.com/deafv5ovi/video/upload/w_400,h_400,c_fill/v1785651837/2_8_u7tuvr.jpg' },
      { type: 'image', url: '/placeholder.jpg' }
    ],
    likes: 203,
    date: "2024-01-11",
    comments: [
      {
        id: "c3",
        authorName: "Yetunde A.",
        authorAvatar: "/placeholder-user.jpg",
        text: "The packaging is everything! So premium",
        date: "2024-01-12",
        likes: 8
      }
    ]
  },
  {
    id: "6",
    customerName: "Amarachi Umeh",
    customerAvatar: "/placeholder-user.jpg",
    location: "Owerri, Nigeria",
    rating: 5,
    comment: "My clip-in extensions blend seamlessly with my natural hair. They added instant volume without looking artificial.",
    productName: "Clip-In Extensions",
    productImage: "/placeholder.jpg",
    media: [
      { type: 'image', url: '/placeholder.jpg' },
      { type: 'image', url: '/placeholder.jpg' }
    ],
    likes: 91,
    date: "2024-01-10",
    comments: []
  }
]
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

// Sample media URLs to reuse
const sampleImages = [
  'https://res.cloudinary.com/deafv5ovi/image/upload/f_auto,q_auto/v1785654580/c1_4_wxzhwv.jpg',
  'https://res.cloudinary.com/deafv5ovi/image/upload/f_auto,q_auto/v1785654580/c1_2_rbb3gb.jpg',
  'https://res.cloudinary.com/deafv5ovi/image/upload/f_auto,q_auto/v1785654581/c1_1_hvjaq1.jpg',
  'https://res.cloudinary.com/deafv5ovi/image/upload/f_auto,q_auto/v1785654580/c1_3_mveynp.jpg'
]

const sampleVideos = [
  { url: 'https://res.cloudinary.com/deafv5ovi/video/upload/v1785651879/2_2_afapbv.mp4', thumbnail: 'https://res.cloudinary.com/deafv5ovi/video/upload/w_400,h_400,c_fill/v1785651879/2_2_afapbv.jpg' },
  { url: 'https://res.cloudinary.com/deafv5ovi/video/upload/v1785651872/2_10_eu4kbh.mp4', thumbnail: 'https://res.cloudinary.com/deafv5ovi/video/upload/w_400,h_400,c_fill/v1785651872/2_10_eu4kbh.jpg' },
  { url: 'https://res.cloudinary.com/deafv5ovi/video/upload/v1785651894/2_4_yfaxbx.mp4', thumbnail: 'https://res.cloudinary.com/deafv5ovi/video/upload/w_400,h_400,c_fill/v1785651894/2_4_yfaxbx.jpg' },
  { url: 'https://res.cloudinary.com/deafv5ovi/video/upload/v1785651837/2_8_u7tuvr.mp4', thumbnail: 'https://res.cloudinary.com/deafv5ovi/video/upload/w_400,h_400,c_fill/v1785651837/2_8_u7tuvr.jpg' }
]

const customerNames = [
  "Temitope Adeyemi", "Chioma Okonkwo", "Adesuwa Ogbomo", "Chinwe Eze", "Adebimpe Salami",
  "Amarachi Umeh", "Funke Bakare", "Ngozi Eze", "Bolanle Adeyemi", "Chiamaka Nwosu",
  "Yetunde Adeleke", "Oluchi Nnamani", "Folake Oladipo", "Blessing Ibeh", "Titilayo Ogunlesi",
  "Chidinma Okoro", "Aisha Mohammed", "Omolara Adeyemi", "Victoria Eze", "Hadiza Ibrahim",
  "Grace Okafor", "Rasheedat Bello", "Aminat Yusuf", "Maryam Garba", "Esther Adeyemi",
  "Precious Nwankwo", "Bisola Adeyemi", "Kemi Olatunji", "Nneka Okafor", "Adebisi Falola",
  "Tolu Adeyemi", "Chinyere Nwosu", "Modupe Oladele", "Ireti Adeyemi", "Folasade Adeleke",
  "Bukola Adeyemi", "Ronke Ogunsanya", "Damilola Adeyemi", "Titilope Ojo", "Bimbo Adeyemi",
  "Kikelomo Adeyemi", "Moji Adeyemi", "Toun Adeyemi", "Sisi Adeyemi", "Folashade Adeyemi",
  "Bola Adeyemi", "Titi Adeyemi", "Kemi Adeyemi", "Nike Adeyemi", "Sade Adeyemi"
]

const locations = [
  "Lagos, Nigeria", "Enugu, Nigeria", "Ibadan, Nigeria", "Awka, Nigeria", "Abeokuta, Nigeria",
  "Owerri, Nigeria", "Abuja, Nigeria", "Port Harcourt, Nigeria", "Calabar, Nigeria", "Benin City, Nigeria",
  "Kaduna, Nigeria", "Ilorin, Nigeria", "Akure, Nigeria", "Osogbo, Nigeria", "Uyo, Nigeria",
  "Asaba, Nigeria", "Aba, Nigeria", "Onitsha, Nigeria", "Warri, Nigeria", "Sokoto, Nigeria",
  "Kano, Nigeria", "Jos, Nigeria", "Maiduguri, Nigeria", "Yola, Nigeria", "Gombe, Nigeria",
  "Bauchi, Nigeria", "Katsina, Nigeria", "Zaria, Nigeria", "Minna, Nigeria", "Lokoja, Nigeria",
  "Ado-Ekiti, Nigeria", "Ikare, Nigeria", "Owo, Nigeria", "Ife, Nigeria", "Oshogbo, Nigeria",
  "Ilesha, Nigeria", "Ede, Nigeria", "Ile-Ife, Nigeria", "Abeokuta, Nigeria", "Ijebu-Ode, Nigeria",
  "Sagamu, Nigeria", "Lagos Island, Nigeria", "Victoria Island, Nigeria", "Ikeja, Nigeria", "Surulere, Nigeria",
  "Yaba, Nigeria", "Lekki, Nigeria", "Ajah, Nigeria", "Ikorodu, Nigeria", "Badagry, Nigeria"
]

const comments = [
  "Absolutely stunning! The quality exceeded my expectations. Will definitely order again!",
  "Best purchase I've made this year. The hair is so soft and beautiful!",
  "I'm in love with this product! It looks so natural and feels amazing.",
  "Customer service was excellent and the product quality is top-notch!",
  "This is my third order and I'm never buying from anywhere else. Ammie Hair is the best!",
  "The lace is so thin and invisible. Everyone thinks it's my natural hair!",
  "Fast delivery and excellent quality. Very happy with my purchase!",
  "The hair doesn't tangle or shed. Worth every penny!",
  "I've recommended Ammie Hair to all my friends. They're the real deal!",
  "The packaging was beautiful and the product is even better!",
  "I was skeptical at first but now I'm a loyal customer. Amazing quality!",
  "The wig fits perfectly and looks so natural. I get compliments everywhere!",
  "So happy with my purchase! The hair quality is unmatched.",
  "This brand never disappoints. Consistent quality every single time!",
  "The extensions blend perfectly with my natural hair. So happy!",
  "Professional service and premium products. Highly recommended!",
  "The hair is so soft and manageable. Best purchase ever!",
  "I've tried other brands but Ammie Hair is definitely superior!",
  "The color matches perfectly and the texture is beautiful!",
  "Fast shipping and excellent customer service. Will order again!",
  "The wig looks more expensive than it is. Great value for money!",
  "I'm so glad I found this brand. They never disappoint!",
  "The hair holds styles well and doesn't shed. Perfect!",
  "My stylist even asked where I got my hair from! That's how good it is!",
  "The quality is consistent and the prices are reasonable. Win-win!",
  "I've been a customer for 2 years and I'm still impressed!",
  "The lace front is so natural-looking. I love it!",
  "Best hair brand in Nigeria, hands down!",
  "The customer service team is so helpful and responsive!",
  "I get compliments on my hair every single day. Thank you Ammie!",
  "The hair is easy to maintain and style. Perfect for busy women!",
  "I was worried about the price but the quality is worth it!",
  "My hair has never looked better. Ammie Hair changed my life!",
  "The bundles are full and thick. Exactly what I wanted!",
  "So impressed with the quality. Will be ordering again soon!",
  "The wig is lightweight and comfortable. Perfect for everyday wear!",
  "I love how natural the hairline looks. No one can tell!",
  "The product arrived earlier than expected. Great service!",
  "The hair doesn't have any weird smell. Very clean and fresh!",
  "I've gotten so many compliments since I started using Ammie Hair!",
  "The quality is consistent across all my orders. Very reliable!",
  "The lace melts perfectly. No harsh lines at all!",
  "I feel like a queen when I wear this hair. So confident!",
  "The hair holds curls beautifully and for a long time!",
  "Best decision I ever made was ordering from Ammie Hair!",
  "The product photos don't even do it justice. It's even better in person!",
  "I love that I can style it any way I want. So versatile!",
  "The hair is true to length and the texture is perfect!",
  "My hair has never been this healthy-looking. Thank you Ammie!"
]

const productNames = [
  "HD Transparent Lace Wig", "Brazilian Body Wave", "Full Lace Wig", "Transparent Lace Frontal",
  "Glueless Wig", "Clip-In Extensions", "Bone Straight Hair", "Deep Wave Bundles",
  "Kinky Curly Hair", "Lace Front Wig", "360 Lace Frontal", "Human Hair Bundles",
  "Pre-Plucked Lace Wig", "Curly Human Hair", "Silky Straight Hair", "Water Wave Hair",
  "Jerry Curl Hair", "Loose Wave Hair", "Body Wave Bundles", "Straight Lace Closure",
  "Lace Closure Wig", "T-Part Wig", "13x4 Lace Frontal", "13x6 Lace Front",
  "360 Lace Wig", "U-Part Wig", "V-Part Wig", "Headband Wig", "Bob Wig", "Pixie Cut Wig",
  "Layered Wig", "Colored Hair Bundles", "Blonde Human Hair", "Burgundy Hair",
  "Ombre Hair", "Highlighted Hair", "Raw Indian Hair", "Peruvian Hair", "Malaysian Hair",
  "Cambodian Hair", "Brazilian Straight", "Brazilian Curly", "Brazilian Wave",
  "East Indian Hair", "Russian Hair", "Mongolian Hair", "Filipino Hair", "Burmese Hair",
  "Afro Kinky Curly", "Coily Hair Extensions"
]

function getRandomMedia(): ReviewMedia[] {
  const media: ReviewMedia[] = []
  const numMedia = Math.floor(Math.random() * 3) + 1 // 1-3 media items
  
  for (let i = 0; i < numMedia; i++) {
    if (Math.random() > 0.3) {
      // 70% chance of image
      media.push({ type: 'image', url: sampleImages[Math.floor(Math.random() * sampleImages.length)] })
    } else {
      // 30% chance of video
      const video = sampleVideos[Math.floor(Math.random() * sampleVideos.length)]
      media.push({ type: 'video', url: video.url, thumbnail: video.thumbnail })
    }
  }
  
  return media
}

function getRandomDate(index: number): string {
  const startDate = new Date('2024-01-01')
  const endDate = new Date('2024-06-30')
  const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
  return randomDate.toISOString().split('T')[0]
}

export const reviews: Review[] = Array.from({ length: 50 }, (_, index) => {
  const id = String(index + 1)
  const customerName = customerNames[index % customerNames.length]
  const location = locations[index % locations.length]
  const rating = Math.floor(Math.random() * 2) + 4 // 4-5 stars
  const comment = comments[index % comments.length]
  const productName = productNames[index % productNames.length]
  const likes = Math.floor(Math.random() * 200) + 10
  const date = getRandomDate(index)
  
  return {
    id,
    customerName,
    customerAvatar: "/placeholder-user.jpg",
    location,
    rating,
    comment,
    productName,
    productImage: "/placeholder.jpg",
    media: getRandomMedia(),
    likes,
    date,
    comments: []
  }
})
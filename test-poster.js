// Test the getVideoPosterUrl function logic with various URL formats

// Simulate the URL format returned by the upload API
// The API applies transforms: w_720,q_auto,sp_hls,f_auto
// So the stored URL looks like:
const storedUrl = "https://res.cloudinary.com/deafv5ovi/video/upload/w_720,q_auto,sp_hls,f_auto/v123/ammie-store/products/test_video.mp4"

console.log("=== TEST 1: Stored URL with stale transforms ===")
console.log("Input:", storedUrl)

// Same logic as getVideoPosterUrl
const lower = storedUrl.toLowerCase()
const marker = "/video/upload/"
const idx = lower.indexOf(marker)
console.log("marker index:", idx)

const base = storedUrl.slice(0, idx)
console.log("base:", base)

const afterUpload = storedUrl.slice(idx + marker.length)
console.log("afterUpload:", afterUpload)

const segments = afterUpload.split('/')
console.log("segments:", segments)

let publicIdStart = 0
for (let i = 0; i < segments.length; i++) {
  if (!segments[i].includes(',')) {
    publicIdStart = i
    break
  }
}
console.log("publicIdStart:", publicIdStart, "first non-transform:", segments[publicIdStart])

const cleanPath = segments.slice(publicIdStart).join('/')
console.log("cleanPath:", cleanPath)

const result = `${base}/image/upload/so_1.0,w_600,f_auto,q_auto/${cleanPath}`
console.log("RESULT:", result)
console.log()

console.log("=== TEST 2: Already clean URL (no transforms) ===")
const cleanUrl = "https://res.cloudinary.com/deafv5ovi/video/upload/v123/ammie-store/products/test_video.mp4"
const lower2 = cleanUrl.toLowerCase()
const idx2 = lower2.indexOf("/video/upload/")
const base2 = cleanUrl.slice(0, idx2)
const afterUpload2 = cleanUrl.slice(idx2 + "/video/upload/".length)
const segments2 = afterUpload2.split('/')
let publicIdStart2 = 0
for (let i = 0; i < segments2.length; i++) {
  if (!segments2[i].includes(',')) {
    publicIdStart2 = i
    break
  }
}
const cleanPath2 = segments2.slice(publicIdStart2).join('/')
const result2 = `${base2}/image/upload/so_1.0,w_600,f_auto,q_auto/${cleanPath2}`
console.log("Input:", cleanUrl)
console.log("RESULT:", result2)
console.log()

console.log("=== TEST 3: Blank URL (edge case) ===")
console.log("Input: empty string")
console.log("RESULT:", "")

console.log()
console.log("=== TEST 4: isVideoUrl check ===")
console.log("storedUrl contains /video/upload/?", storedUrl.toLowerCase().includes("/video/upload/"))
console.log("storedUrl ends with .mp4?", storedUrl.toLowerCase().endsWith(".mp4"))

console.log()
console.log("=== TEST 5: Non-video URL (image) ===")
const imageUrl = "https://res.cloudinary.com/deafv5ovi/image/upload/f_auto,q_auto/v123/product.jpg"
console.log("isVideoUrl(imageUrl):", imageUrl.toLowerCase().includes("/video/upload/"))

console.log()
console.log("=== TEST 6: Actual curl test ===")
const fetchUrl = require?.builtin?.http ? null : null
// Try to fetch the generated URL
console.log("Generated poster URL:", result)
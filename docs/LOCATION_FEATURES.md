# Location & Contact Features

## 🌍 Location Selector

The header now includes a fully functional location selector that allows users to:

### Features:
- **Click on "Mumbai, Maharashtra"** to open location selector
- **Search for any city** in India using real-time API
- **Popular cities** displayed by default
- **Current location detection** using browser geolocation
- **Persistent storage** - remembers user's selected location
- **Real-time search** with OpenStreetMap Nominatim API

### How it works:
1. **Click** on the location in the green header bar
2. **Search** for your city in the dropdown
3. **Select** from popular cities or search results
4. **Use Current Location** button for automatic detection
5. **Location persists** across browser sessions

### API Integration:
- Uses **OpenStreetMap Nominatim API** (free, no API key required)
- **Real-time city search** across all Indian cities
- **Reverse geocoding** for current location detection
- **Fallback** to popular cities if API fails

## 📞 Clickable Phone Number

The customer care phone number is now fully functional:

### Features:
- **Desktop**: Shows "📞 Customer Care: 1800-123-4567" in header
- **Mobile**: Shows phone icon button in main header
- **Click to call**: Both versions are clickable and will open phone dialer
- **Proper tel: links** for mobile compatibility

### Phone Numbers:
- **Display**: 1800-123-4567
- **Actual tel link**: +918001234567 (with country code)
- **Mobile optimized** with dedicated phone button

## 🛠️ Technical Implementation

### Components Created:
1. **LocationSelector.tsx** - Main location picker component
2. **use-location.ts** - Custom hook for location management
3. **Updated Header.tsx** - Integrated location and phone features

### Key Features:
- **TypeScript** fully typed components
- **Responsive design** for mobile and desktop
- **Accessibility** with proper ARIA labels
- **Error handling** for API failures
- **Loading states** for better UX
- **Local storage** for persistence

### API Details:
```typescript
// City search API
GET https://nominatim.openstreetmap.org/search
?format=json
&countrycodes=in
&city={searchTerm}
&limit=10
&addressdetails=1

// Reverse geocoding API
GET https://nominatim.openstreetmap.org/reverse
?format=json
&lat={latitude}
&lon={longitude}
&addressdetails=1
```

## 🎯 User Experience

### Location Selection Flow:
1. User sees "Mumbai, Maharashtra" in header
2. Clicks to open dropdown with search
3. Can search for any Indian city
4. Popular cities shown by default
5. "Use Current Location" for GPS detection
6. Selection is saved and persists

### Phone Contact Flow:
1. **Desktop**: Click phone number in top bar
2. **Mobile**: Click phone icon in main header
3. Opens native phone dialer
4. Ready to call customer care

## 🔧 Customization

### Adding More Cities:
Edit the `popularCities` array in `LocationSelector.tsx`:

```typescript
const [popularCities] = useState<City[]>([
  { name: "YourCity", state: "YourState", country: "India" },
  // ... more cities
])
```

### Changing Phone Number:
Update both places in `Header.tsx`:

```typescript
// Desktop version
<a href="tel:+91YOURNUMBER">

// Mobile version  
<a href="tel:+91YOURNUMBER">
```

### Styling:
- Uses Tailwind CSS classes
- Green theme matching GroFast branding
- Responsive breakpoints for mobile/desktop
- Hover and focus states included

## 🚀 Benefits

1. **Better UX**: Users can easily change delivery location
2. **Real Data**: Uses actual Indian cities from OpenStreetMap
3. **Mobile Friendly**: Touch-optimized for mobile users
4. **Persistent**: Remembers user preferences
5. **Accessible**: Screen reader friendly
6. **Fast**: Debounced search with caching
7. **Reliable**: Fallback to popular cities if API fails

## 🧪 Testing

### Test Location Selector:
1. Click on "Mumbai, Maharashtra" in header
2. Try searching for "Delhi", "Bangalore", etc.
3. Test "Use Current Location" (requires HTTPS)
4. Verify selection persists after page reload

### Test Phone Numbers:
1. **Desktop**: Click phone number in green top bar
2. **Mobile**: Click phone icon in main header
3. Verify phone dialer opens with correct number

### Browser Compatibility:
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Geolocation requires HTTPS in production
- ✅ Graceful fallback if geolocation denied

## 📱 Mobile Optimization

- **Touch targets** are 44px minimum
- **Responsive dropdown** adjusts to screen size
- **Dedicated phone button** for easy access
- **Swipe-friendly** interface elements
- **Fast loading** with optimized API calls

Your GroFast app now has professional location selection and contact features! 🎉
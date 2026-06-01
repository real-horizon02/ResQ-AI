# Profile Picture Management Feature

## Overview

Enhanced profile picture functionality with gender-based default avatars and the ability to remove profile pictures. Volunteers can now upload, view, and remove their profile pictures, with smart default avatars based on gender preference.

## New Features

### 🗑️ Remove Profile Picture
- **Red trash button** next to the camera icon
- **One-click removal** of current profile picture
- **Confirmation message** when removed successfully
- **Automatic fallback** to gender-based default avatar

### 👤 Gender-Based Default Avatars
- **Male Avatar**: Blue gradient with male figure icon
- **Female Avatar**: Pink gradient with female figure icon  
- **Generic Avatar**: Teal gradient with initials (for "other" or no preference)
- **Smart selection** based on gender field in profile

### ⚙️ Gender Selection
- **New gender field** in Edit Profile modal
- **Four options**: Male, Female, Other, Prefer not to say
- **Optional field** - defaults to generic avatar if not set
- **Used for default avatar selection** when no profile picture

### 🖼️ Enhanced Profile Viewer
- **Works with both** uploaded images and default avatars
- **Full-size view** of default avatars (200px)
- **Avatar type indicator** (Male Avatar, Female Avatar, Generic Avatar)
- **Consistent modal experience** for all avatar types

## User Experience

### Profile Picture States

#### 1. **No Profile Picture + No Gender**
- Shows generic avatar with initials
- Teal gradient background
- Click to view in modal

#### 2. **No Profile Picture + Male Gender**
- Shows male avatar with figure icon
- Blue gradient background
- Click to view enlarged version

#### 3. **No Profile Picture + Female Gender**
- Shows female avatar with figure icon
- Pink gradient background  
- Click to view enlarged version

#### 4. **Has Profile Picture**
- Shows uploaded image
- Remove button (🗑️) appears
- Click image to view full size
- Click remove to delete and show default

### Button Layout
```
[Profile Avatar Circle]
    📷 🗑️  <- Camera and trash buttons (bottom-right)
```

- **📷 Camera Button**: Upload new picture (always visible)
- **🗑️ Trash Button**: Remove current picture (only when picture exists)

## Technical Implementation

### Gender-Based Avatar Components

```typescript
function MaleAvatar({ size = 72 }) {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
      // ... male figure SVG
    }}>
      <svg>
        <circle cx="12" cy="8" r="3" fill="white" />
        <path d="M12 14c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" fill="white" />
      </svg>
    </div>
  );
}

function FemaleAvatar({ size = 72 }) {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #EC4899, #BE185D)',
      // ... female figure SVG with hair detail
    }}>
      <svg>
        <circle cx="12" cy="8" r="3" fill="white" />
        <path d="M9 6c0-1.5 1.5-3 3-3s3 1.5 3 3" stroke="white" />
        <path d="M12 14c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" fill="white" />
      </svg>
    </div>
  );
}
```

### Avatar Selection Logic
```typescript
function DefaultAvatar({ gender, initials, size = 72 }) {
  if (gender === 'female') return <FemaleAvatar size={size} />;
  if (gender === 'male') return <MaleAvatar size={size} />;
  return <InitialsAvatar initials={initials} size={size} />;
}
```

### Remove Functionality
```typescript
const handleRemoveAvatar = async () => {
  await updateProfile({ avatar_url: null });
  message.success('✅ Profile picture removed!');
};
```

## Database Schema

### Updated Profile Fields
```sql
-- Add gender field to profiles table
ALTER TABLE profiles ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other'));
```

### Profile Interface
```typescript
interface UserProfile {
  // ... existing fields
  avatar_url: string | null;
  gender?: 'male' | 'female' | 'other' | null;
}
```

## Visual Design

### Color Schemes
- **Male Avatar**: Blue gradient (#3B82F6 → #1E40AF)
- **Female Avatar**: Pink gradient (#EC4899 → #BE185D)  
- **Generic Avatar**: Teal gradient (#1E3A4A → #0D2535)

### Button Styling
- **Camera Button**: Cyan background (#00D4FF)
- **Remove Button**: Red background (#EF4444)
- **Both buttons**: 24px circle with 2px dark border

### Modal Enhancements
- **Default avatar view**: 200px size with description
- **Avatar type label**: "Male Avatar", "Female Avatar", "Generic Avatar"
- **Consistent styling** with uploaded image modals

## User Workflow

### Setting Up Profile Picture

1. **New User (No Picture)**:
   - Sees generic avatar with initials
   - Can set gender in Edit Profile
   - Avatar updates automatically based on gender

2. **Upload Picture**:
   - Click 📷 camera button
   - Select image file
   - Picture uploads and displays
   - Remove button (🗑️) appears

3. **Remove Picture**:
   - Click 🗑️ trash button  
   - Picture removed immediately
   - Reverts to gender-based default avatar
   - Remove button disappears

4. **Change Gender**:
   - Edit Profile → Select gender
   - Default avatar updates automatically
   - Only affects display when no uploaded picture

### Privacy Considerations

- **Gender is optional** - defaults to generic avatar
- **"Prefer not to say" option** available
- **No gender required** for basic functionality
- **Easy removal** of profile pictures for privacy

## Files Modified

- `src/store/useAuthStore.ts` - Added gender field to UserProfile interface
- `src/pages/Volunteer.tsx` - Complete avatar management system:
  - Gender-based avatar components (MaleAvatar, FemaleAvatar, DefaultAvatar)
  - Remove profile picture functionality
  - Enhanced ProfilePictureModal for all avatar types
  - Gender selection in EditProfileModal
  - Updated avatar display logic

## Benefits

### For Users
- **Privacy control** - can remove pictures anytime
- **Professional defaults** - gender-appropriate avatars
- **Personal choice** - optional gender selection
- **Consistent experience** - same modal for all avatar types

### For Application
- **Better user identification** - visual avatars vs just initials
- **Inclusive design** - supports all gender preferences
- **Professional appearance** - polished default avatars
- **Reduced storage** - fewer uploaded images needed

The profile picture management system now provides a complete, inclusive, and user-friendly experience for avatar management in the ResQ AI volunteer dashboard.
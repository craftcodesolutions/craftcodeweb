# HomeSection Component Fix

## Issue
The HomeSection component was causing a webpack/build error related to the AOS (Animate On Scroll) library import.

## Root Cause
The original code was importing AOS synchronously which can cause SSR (Server-Side Rendering) issues and build problems:

```tsx
import AOS from 'aos';
import 'aos/dist/aos.css';
```

## Fix Applied

### 1. Dynamic AOS Import
Changed to dynamically import AOS only on the client side:

```tsx
// Initialize AOS
useEffect(() => {
    const initAOS = async () => {
        try {
            if (typeof window !== 'undefined') {
                const AOS = (await import('aos')).default;
                AOS.init({ once: true, disable: 'mobile' });
                AOS.refresh();
            }
        } catch (error) {
            console.log('AOS failed to load:', error);
        }
    };

    initAOS();
}, []);
```

### 2. CSS Import
Moved AOS CSS import to `globals.css`:

```css
@import "aos/dist/aos.css";
```

## Benefits

✅ **SSR Safe**: AOS only loads on client side  
✅ **Error Handling**: Graceful fallback if AOS fails to load  
✅ **Build Stability**: Eliminates webpack import issues  
✅ **Performance**: Dynamic import only loads when needed  

## Result

The HomeSection component now:
- Loads without build errors
- Maintains all animation functionality
- Works properly in both development and production
- Handles SSR scenarios gracefully

All `data-aos` attributes in the JSX will still work as expected once AOS loads.
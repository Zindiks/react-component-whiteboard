# Input Field Keyboard Interference Fix

## Issue

When typing in input fields within widgets (like TextNote, CurrencyConverter, URLs in media widgets), the global keyboard shortcuts were interfering with normal text input:

- Pressing Delete/Backspace would delete the entire component instead of just removing text
- Pressing number keys (1, 2, 3) would trigger zoom commands instead of typing numbers
- Pressing letters like 'o' would open the overview instead of typing the letter

## Root Cause

The global keyboard event handler in `useEventHandlers.ts` was listening to all keydown events without checking if the user was currently focused on an input field.

## Solution

Added input field detection to the keyboard event handlers:

### Changes Made:

1. **Added `isUserTyping()` utility function** that checks if the currently focused element is:

   - `<input>` field
   - `<textarea>` field
   - `<select>` field
   - Any element with `contenteditable` attribute
   - Any element with `isContentEditable` property

2. **Modified `handleKeyDown`** to skip all global shortcuts when user is typing, except for the Escape key (which should still work to cancel editing)

3. **Modified `handleKeyUp`** to only handle space key release when not typing

4. **Added documentation** explaining the input field handling behavior

### Code Location:

`src/hooks/useEventHandlers.ts` - lines ~302-320

## Behavior After Fix:

### When User is Typing in Input Fields:

- ✅ Delete/Backspace removes text characters (not component)
- ✅ Number keys (1, 2, 3) type numbers (no zoom commands)
- ✅ Letters type normally (no shortcuts triggered)
- ✅ Space key types spaces (no pan mode activation)
- ✅ Escape still works to cancel editing

### When User is NOT in Input Fields:

- ✅ All keyboard shortcuts work normally
- ✅ Delete/Backspace deletes selected components
- ✅ Number keys trigger zoom commands
- ✅ Space key activates pan mode
- ✅ All other shortcuts work as expected

## Components Affected:

This fix improves the user experience in all components with input fields:

- TextNote (markdown editor)
- TextShape (inline text editing)
- CurrencyConverter (amount input)
- SpotifyWidget (URL input)
- SoundCloudWidget (URL input)
- YouTubeVideo (URL input)
- Watch (time setting inputs)
- And any future components with input fields

## Testing:

- ✅ TypeScript compilation passes
- ✅ No runtime errors
- ✅ Input fields now work without interference
- ✅ Global shortcuts still work when not typing

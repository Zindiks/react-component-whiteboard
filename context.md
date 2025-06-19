Create a Freeform-like whiteboard app using React, D3.js, and Electron. The app should include the following features:

1. A left sidebar containing draggable components like:

   - A timer
   - A weather display (fetch current weather using open-meteo or similar API)

2. A central whiteboard area where components can be dragged and dropped. Once dropped, they should:

   - Render as real React components, not static shapes

3. Use D3.js for managing and rendering drag/drop + grid snapping behavior inside the canvas.

4. Support a modular component system — it should be easy to add new draggable React components to the sidebar.

5. Electron boilerplate should include React and Vite, with live reload enabled.

6. Use Zustand or Jotai for state management (optional, but preferred).

7. All components on the whiteboard should store their position in memory, and allow future enhancements like resizing, editing props, etc.

Create the full scaffold with:

- Electron + React + Vite setup
- A basic drag-and-drop system between sidebar and canvas
- A working Timer component and Weather component as examples
- Modular architecture to allow easy component registration

Also include comments in the code explaining how to:

- Add a new React component to the sidebar
- Enable dragging with grid snapping using D3.js

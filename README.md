# 🧠 Memory Matrix Game (Task #11)

An interactive, responsive 3D card matching game built with vanilla HTML5, modern CSS3 transitions, and ES6+ JavaScript. Designed and engineered for the GUVI Full-Stack Development submission rubric.

---

## 🎮 Live Demo & Repository

- **GitHub Repository:** [https://github.com/amarsinghpatil/Memory_Game](https://github.com/amarsinghpatil/Memory_Game)
- **Live Netlify Deployment:** *(Deploy to Netlify and add link here)*

---

## ✨ Features & Rubric Compliance

1. **Visual 4x4 Grid & 3D Flip Transitions:**
   - 16 cards (8 unique pairs) arranged in a responsive CSS Grid.
   - Smooth 3D card flipping using `perspective: 1000px`, `transform-style: preserve-3d`, and `backface-visibility: hidden`.
   - Distinct front face (hidden emoji symbol) and back face (mystery card cover).

2. **Robust Game Engine & State Management:**
   - **Board Locking (`isBoardLocked`):** Prevents clicking additional cards while two cards are undergoing evaluation.
   - **Double-Click Protection:** Prevents clicking the same card twice or clicking already matched cards.
   - **Fisher-Yates Shuffle Algorithm:** Generates an unbiased $O(n)$ shuffle on page load and restart.

3. **Metrics & Live HUD:**
   - **Move Counter:** Increments on every pair evaluation.
   - **Live Timer:** Starts automatically on the very first card flip.
   - **Personal Best Score:** Persists all-time best record (lowest moves & fastest time) in browser `localStorage`.
   - **Restart Button:** Resets all metrics, stops timer, and re-shuffles the deck.

4. **Victory Modal & High Score Tracking:**
   - Triggers when all 8 pairs (`matchedPairs === 8`) are solved.
   - Displays total moves taken, time elapsed, and your all-time best record.
   - Displays an animated **🏆 New Personal Best!** banner when you beat your previous record.
   - Includes a "Play Again" button.

5. **Accessibility & Cross-Device Support:**
   - Fully responsive design (mobile, tablet, desktop).
   - Keyboard navigable with `Tab`, `Enter`, and `Space`.

---

## 🛠️ Tech Stack

- **HTML5:** Semantic document structure with accessible ARIA roles.
- **CSS3:** Custom properties (CSS variables), Flexbox, CSS Grid, 3D perspective transforms, Glassmorphism.
- **JavaScript (ES6+):** Modular DOM manipulation, asynchronous timer controls, event listeners, and Fisher-Yates array shuffling.

---

## 🚀 Local Development Setup

To run this project locally on your machine:

1. Clone the repository:
   ```bash
   git clone https://github.com/amarsinghpatil/Memory_Game.git
   ```

2. Navigate into the project folder:
   ```bash
   cd "Memory game Task"
   ```

3. Open `index.html` in your favorite web browser, or run a local dev server (e.g., Live Server in VS Code, `npx serve`, or Python's `python -m http.server 8000`).

---

## 🎯 Game Rules

1. Click on any card to reveal its hidden symbol. The timer will start automatically.
2. Click a second card to find its matching pair.
3. If the symbols match, both cards lock into place and highlight green.
4. If they do not match, the cards stay visible for 1 second before automatically flipping back.
5. Match all 8 pairs in the fewest moves and fastest time possible!


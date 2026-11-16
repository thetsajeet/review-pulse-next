# Review Pulse: Animations Spec

Every animation in the designs so far, written so an AI coding assistant can rebuild it exactly. All values below come from the current design files.

- Where a value says **implemented**, it exists as CSS or SVG in the design files.
- Where it says **specified, not yet designed**, it comes from the product requirements and has no visual implementation yet.
- All animations are decorative. Nothing in the UI depends on them to work.

## 1. Summary table

| Section | Name | Where | Type | Duration | Loop |
|---|------|-------|------|----------|------|
| 4 | `bounce` | Landing: workflow strip cubes (01 to 04) | CSS keyframes on SVG group | 8s | infinite, staggered 2s |
| 5 | `dl` (marching dashes) | Landing: connectors between cubes | CSS, stroke-dashoffset | 1.2s | infinite |
| 6 | Travelling dot | Landing: along each connector | SVG SMIL `animateMotion` | 8s | infinite, staggered 2s |
| 7 | `hop` | Landing hero side cubes, dark band cubes, Login/Signup/Signed-out cubes, 404 center cube | CSS keyframes on SVG group | 3.2s | infinite |
| 8 | `roll` | Landing closing-section cubes, mini cubes on 404 | CSS keyframes on SVG group | 6s | infinite |
| 9 | `shad` | 404: shadow under the center cube | CSS keyframes | 3.2s | infinite, in sync with `hop` |
| 10 | `wob` | 404: "Oops!" bubble | CSS keyframes | 2.4s | infinite |
| 10 | `run` / `run2` | 404: cubes rolling across the bottom edge | CSS keyframes | 14s / 22s | infinite |
| 11 | Button hover | All primary and secondary buttons | CSS transition | 0.15s | on hover |
| 12 | Framer Motion springs | Workspace: refactor box, new draft, terminal badge, toast | Framer Motion | spring | on state change (specified, not yet designed) |

## 2. Global rules

- **Reduced motion:** every CSS animation is disabled with `@media (prefers-reduced-motion: reduce)`. Exception: the travelling dot (section 6) uses SVG SMIL and is not disabled by that media query. Pause it with JavaScript or remove it when reduced motion is on.
- **Hover micro-interaction:** actionable buttons scale to `0.98` (see section 11).
- **Spring physics (app UI):** `stiffness: 260, damping: 20` for state transitions in the workspace (see section 12).
- **No shadows or gradients:** depth comes from flat shaded faces, a flat grey floor ellipse (`#E4E4E7`) and 1px borders.
- **Performance:** only `transform` and `opacity` are animated, except the dash offset in section 5.

## 3. The cube (shared object)

Every cube is an isometric SVG drawing made of three flat faces and a floor shadow. Animations in sections 4 to 10 target the group that holds the faces, not the floor ellipse (except `shad`, which targets the ellipse).

### Geometry
For a cube centered at `(cx, cy)` with size `s`, and `k = 0.866 * s`:
- **Top face:** `(cx, cy-s) (cx+k, cy-s/2) (cx, cy) (cx-k, cy-s/2)`
- **Left face:** `(cx-k, cy-s/2) (cx, cy) (cx, cy+s) (cx-k, cy+s/2)`
- **Right face:** `(cx+k, cy-s/2) (cx, cy) (cx, cy+s) (cx+k, cy+s/2)`
- **Outline:** 1.5px stroke, `#18181B` (white `#FAFAFA` on the dark band), round joins.
- **Floor ellipse:** center `(cx, cy + 0.92s)`, `rx = 1.2k`, `ry = 0.38s`, fill `#E4E4E7` (`#27272A` on the dark band).

### Palettes (top, left, right)
| Key | Top | Left | Right | Used for |
|-----|-----|------|-------|----------|
| A (amber) | `#FDE68A` | `#FBBF24` | `#F59E0B` | star cube |
| K (ink) | `#52525B` | `#3F3F46` | `#27272A` | spark and lock cubes |
| E (emerald) | `#6EE7B7` | `#34D399` | `#10B981` | check cube |
| W (white) | `#FFFFFF` | `#F4F4F5` | `#E4E4E7` | pin cube, star cube on dark band |
| R (rose) | `#FDA4AF` | `#FB7185` | `#F43F5E` | available, not used yet |

### Top-face glyph
Glyphs (`star`, `spark`, `check`, `pin`, `lock`) are drawn in a 0 to 1 unit square and placed on the top face with:
`transform="translate(cx, cy-s) matrix(.866,.5,-.866,.5,0,0) scale(s)"`.

### Transform origins (important for the animations)
SVG `transform-origin` is in the SVG's own coordinate units (px in the viewBox):
- **Bounce and hop origin:** bottom vertex of the cube, `(cx, cy + s)`.
- **Roll origin (pivot):** bottom-right vertex, `(cx + k, cy + s/2)`.

### Exported files
`review-pulse-3d-cubes/` holds `svg/` and `png/` versions of the five cubes. `cubes.css` has classes `.cube-hop` (origin `50% 82%`) and `.cube-roll` (origin `87% 63%`) for use on an `<img>`, where only the whole image can move.

## 4. `bounce`: workflow strip (Landing)

**Where:** four cubes in the hero workflow strip, labelled 01 Review arrives, 02 Pulse drafts, 03 You approve, 04 Updated on Google.

**Effect:** each cube squashes, jumps, lands with a squash and settles, one after another, so the motion reads as the flow moving from 01 to 04.

- **Duration / easing:** 8s, `cubic-bezier(.3, .6, .4, 1)`, infinite.
- **Stagger:** `animation-delay` of `0s, 2s, 4s, 6s` for cubes 01 to 04.
- **Cube sizes and positions (viewBox 1000 x 350):** `s = 66`, x = `130, 380, 630, 880`, cy = `150, 196, 150, 196`.
- **Keyframes:**
```css
@keyframes bounce {
  0%, 30%, 100% { transform: translateY(0) scale(1, 1); }
  3%  { transform: translateY(0)     scale(1.07, .9); }   /* anticipation squash */
  10% { transform: translateY(-30px) scale(.95, 1.07); }  /* peak, stretched */
  18% { transform: translateY(0)     scale(1.08, .9); }   /* impact squash */
  22% { transform: translateY(-8px)  scale(.98, 1.03); }  /* small rebound */
  26% { transform: translateY(0)     scale(1.02, .97); }  /* settle */
}
```
- **Note:** the cube is active for about the first 30% of the 8s cycle (roughly 2.4s), then rests, so the next cube's turn starts as this one finishes.

## 5. `dl`: marching dashes (Landing)

**Where:** the three dashed curves linking the strip cubes.

- **Style:** `stroke: #18181B`, `stroke-width: 1.5`, `stroke-dasharray: 3 6`, round caps.
- **Animation:** `stroke-dashoffset` goes from `0` to `-18` in `1.2s`, `linear`, infinite. 18 equals one dash period times 2 (3 + 6, repeated), so it loops without a jump.
```css
.dl { animation: mv 1.2s linear infinite; }
@keyframes mv { to { stroke-dashoffset: -18; } }
```
- **End markers:** a small circle at each end of every curve: hollow (`#FFFFFF` fill) at the start, solid `#18181B` at the end, radius 4, stroke 1.5. They don't animate.

## 6. Travelling dot (Landing)

**Where:** one green dot per connector, moving from the left cube to the right cube while the left cube has just finished bouncing.

- **Style:** circle `r = 7`, fill `#10B981`, stroke `#18181B` 1.5.
- **Mechanism:** SVG SMIL, not CSS.
- **Path:** the same cubic Bezier as its connector: `M x1 y1 C mid y1, mid y2, x2 y2`, where `x1 = cubeX + 57`, `x2 = nextCubeX - 57`, `mid = (x1 + x2) / 2`.
- **Timing:** `dur="8s"`, `repeatCount="indefinite"`, `begin = "1s", "3s", "5s"` for connectors 1 to 3.
- **Movement:** `keyPoints="0;1;1"`, `keyTimes="0;.22;1"`, `calcMode="linear"`. The dot travels the whole path in the first 22% of the cycle (about 1.76s), then stays at the end.
- **Visibility:** opacity `values="0;1;1;0;0"`, `keyTimes="0;.02;.22;.25;1"`, so it fades in, stays visible while moving and fades out right after arriving.
- **Sequence:** cube 01 bounces at 0s, dot 1 travels at 1s, cube 02 bounces at 2s, dot 2 at 3s, cube 03 at 4s, dot 3 at 5s, cube 04 at 6s, then the loop restarts at 8s.

## 7. `hop`: continuous bounce

**Where:**
- Landing hero: star cube left (delay `0s`), check cube right (delay `1.4s`); hidden below 1100px wide.
- Landing dark band: three cubes with delays `0s`, `0.9s`, `1.8s`.
- Login, Signup and Signed-out screens: three cubes with delays `0s`, `0.8s`, `1.6s`.
- 404 page: the large center cube (delay `0s`).

- **Duration / easing:** 3.2s, `ease-in-out`, infinite.
- **Keyframes:**
```css
@keyframes hop {
  0%, 100% { transform: translateY(0)     scale(1, 1); }
  10% { transform: translateY(0)     scale(1.07, .9); }   /* squash before jump */
  35% { transform: translateY(-26px) scale(.96, 1.06); }  /* peak */
  60% { transform: translateY(0)     scale(1.08, .9); }   /* land */
  72% { transform: translateY(-6px)  scale(.99, 1.02); }  /* rebound */
  85% { transform: translateY(0)     scale(1, 1); }
}
```
- **Origin:** bottom vertex of each cube. The 404 center cube is `s = 92` at `(130, 120)` in a 260 x 300 viewBox.

## 8. `roll`: tipping over a corner

**Where:**
- Landing closing section: star, spark and check cubes in a row above the headline, delays `0s`, `1s`, `2s`, gap 56px, each in a 96px-wide box (`s = 56`, viewBox 130 x 150, `overflow: visible`).
- 404 page: the two small cubes at the bottom edge (see section 10 for how they combine with `run`).

- **Duration / easing:** 6s, `cubic-bezier(.5, 0, .3, 1)`, infinite.
- **Keyframes:**
```css
@keyframes roll {
  0%, 8%    { transform: rotate(0); }
  38%, 52%  { transform: rotate(60deg); }   /* tipped over the bottom-right corner */
  82%, 100% { transform: rotate(0); }       /* rolls back */
}
```
- **Origin:** the bottom-right vertex, `(cx + k, cy + s/2)`. For `s = 56` and `cx = 65, cy = 66` that is `(113.5, 94)`.
- **Why 60 degrees:** an isometric cube's outline is a hexagon, which looks the same after a 60 degree turn, so the end pose reads as the cube having rolled one face to the right. The faces keep their colors, so it is an illusion, not a true 3D roll.
- **Floor ellipse:** stays still. Use `overflow: visible` on the SVG so the rotated cube isn't clipped.

## 9. `shad`: shadow under the 404 cube

- **Target:** the floor ellipse: `cx = 130, cy = 250, rx = 100, ry = 26`, fill `#E4E4E7`, `transform-origin: 130px 250px`.
- **Duration / easing:** 3.2s, `ease-in-out`, infinite, in sync with the center cube's `hop`.
```css
@keyframes shad {
  0%, 100% { transform: scale(1);    opacity: 1; }
  35% { transform: scale(.7);  opacity: .55; }   /* cube at peak, shadow shrinks */
  60% { transform: scale(1.05); opacity: 1; }    /* cube lands */
}
```

## 10. 404 page extras

### `wob`: "Oops!" bubble
- White chip, 1px `#E4E4E7` border, radius 12, text `Oops!` (600, 13px), positioned top right of the center cube.
- 2.4s `ease-in-out` infinite, `transform-origin: 50% 100%`:
```css
@keyframes wob { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
```

### `run` and `run2`: cubes rolling across the bottom
- A 64px-high strip at the bottom of the page with a 1px top border. Two small cubes (70px wide, `s = 56`, star amber and pin white) sit on it.
- Each cube wrapper moves from off-screen left to off-screen right while spinning like a wheel:
```css
@keyframes run {
  from { transform: translateX(-160px)  rotate(0); }
  to   { transform: translateX(1600px)  rotate(1080deg); }   /* 3 full turns */
}
.run  { animation: run 14s linear infinite; }
.run2 { animation: run 22s linear infinite; animation-delay: -9s; }   /* different speed, already mid-way at load */
```
- Each small cube also has the `roll` animation applied inside its SVG (6s), so the motion combines a wheel spin with a small tip. If this looks too busy, remove the inner `roll` and keep only `run`.

## 11. Button hover (all screens)

- **Targets:** primary and secondary buttons, the Google sign-in button, and the Approve, Reject and Refactor buttons in the workspace.
- **Effect:** `transform: scale(0.98)`.
- **Transition:** `transform .15s`.
```css
.btn { transition: transform .15s; }
.btn:hover { transform: scale(.98); }
```
- **Links:** nav and footer links only change color on hover (`#52525B` to `#18181B`).

## 12. Workspace animations: specified, not yet designed

The workspace screens (Pending, Refactor open, Approved) are static mockups today. The requirements call for the motion below, using Framer Motion with spring physics `stiffness: 260, damping: 20` for everything:

```js
const spring = { type: "spring", stiffness: 260, damping: 20 };
```

| Interaction | Behavior |
|-------------|----------|
| **Refactor box expands** | Clicking Refactor makes the textarea block expand inline under the action bar (animate `height` from 0 to auto and `opacity` from 0 to 1). It starts hidden. |
| **New draft arrives** | After "Send to agent", the new draft node slides into the timeline from below (`y` from 16 to 0, `opacity` from 0 to 1) and the previous draft is marked "Superseded". |
| **Terminal badge** | On Approve or Reject, the action buttons disappear and the badge ("Successfully Approved and Sent" in green or "Draft Withdrawn" in red) slides in (`y` from 8 to 0, `scale` from .95 to 1, `opacity` from 0 to 1). |
| **Button hover** | `whileHover={{ scale: 0.98 }}` on Approve, Reject and Refactor. |
| **Toast** | A global toast fires on completion ("Response successfully published to Google Maps"). Entry animation isn't specified; suggested: slide down from the top right with the same spring and auto-dismiss after about 4 seconds. |
| **Inbox update** | After Approve or Reject the review stays in the All list and only its status badge changes; the Pending, Approved and Rejected counts update. Suggested: a short cross-fade on the badge and count. |

### Framer Motion sketches
```jsx
// Refactor textarea
<AnimatePresence initial={false}>
  {open && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={spring}
      style={{ overflow: "hidden" }}
    >
      <textarea />
    </motion.div>
  )}
</AnimatePresence>

// Terminal badge
<motion.div
  initial={{ y: 8, scale: 0.95, opacity: 0 }}
  animate={{ y: 0, scale: 1, opacity: 1 }}
  transition={spring}
/>
```

## 13. Porting the CSS cube animations to Framer Motion (React)

If the app is built in React, the same effects can be expressed with `motion.g` or `motion.div` and keyframe arrays. Example for `hop` (matches section 7):

```jsx
<motion.g
  style={{ transformOrigin: `${cx}px ${cy + s}px` }}
  animate={{
    y:      [0, 0, -26, 0, -6, 0, 0],
    scaleX: [1, 1.07, 0.96, 1.08, 0.99, 1, 1],
    scaleY: [1, 0.9, 1.06, 0.9, 1.02, 1, 1],
  }}
  transition={{
    duration: 3.2,
    times: [0, 0.1, 0.35, 0.6, 0.72, 0.85, 1],
    ease: "easeInOut",
    repeat: Infinity,
    delay: 0,
  }}
>
  {/* cube faces */}
</motion.g>
```

For `bounce` use `times: [0, 0.03, 0.1, 0.18, 0.22, 0.26, 0.3, 1]` with the matching values from section 4, and set `repeatDelay` to 0 (the rest period is already inside the keyframes). For `roll`, animate `rotate: [0, 0, 60, 60, 0, 0]` with `times: [0, 0.08, 0.38, 0.52, 0.82, 1]` and set the transform origin to the pivot. In Framer Motion on SVG elements, set `style={{ transformBox: "view-box" }}` or pixel origins so the pivot is interpreted in SVG units. Respect `useReducedMotion()` by skipping the animations when it returns true.

## 14. Screens with no animation yet

- **Dashboard:** static. Only the button hover applies. Suggested, not designed: count-up on the stat numbers, bars growing from the baseline on load (staggered), sparkline drawing in.
- **Login, Signup and Signed-out:** only the three hopping cubes (section 7) and the Google button hover. The tilted review and draft cards are static (rotated -3deg and +2deg).
- **Landing sections other than those above:** feature tiles, nav and the product window mock are static.

## 15. Source files

- `Landing.dc.html`: sections 4 to 8 and 11 (search for `.bounce`, `.hop`, `.roll`, `.dl`, `animateMotion`).
- `4-Login.dc.html`, `5-Signup.dc.html`, `6-SignedOut.dc.html`: section 7.
- `7-NotFound.dc.html`: sections 7 to 10 (search for `.shad`, `.wob`, `.run`).
- `review-pulse-3d-cubes/cubes.css`: standalone `cube-hop` and `cube-roll` classes for image-based cubes.

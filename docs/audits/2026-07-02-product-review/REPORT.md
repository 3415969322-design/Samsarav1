# Samsara Product UX Audit

Date: 2026-07-02  
Target: `http://localhost:3001`  
Coverage: authenticated desktop and mobile experience, login, navigation, Dashboard, Todo, Documents, Diary, Files, Exam, and Settings.

## Evidence

- `01-login-desktop.png`, `02-login-mobile.png`
- `03-dashboard-mobile.png` through `09-settings-mobile.png`
- `10-mobile-more-menu.png`
- `11-dashboard-desktop.png` through `17-settings-desktop.png`
- `mobile-contact-sheet.png`, `desktop-contact-sheet.png`

The screenshots were captured at 390x844 and 1440x900. No tested page produced horizontal overflow. The screenshots represent the pre-fix baseline used to identify the issues below.

## Journey Results

1. Desktop login: Pass. Form hierarchy is clear, but the decorative mark dominates the page and repeats the Samsara brand used in the form.
2. Mobile login: Pass. Form remains usable and the mark scales down without horizontal overflow.
3. Mobile Dashboard: Pass with friction. Main action is visible, but the page was 2571px tall because navigation modules were repeated below the bottom navigation.
4. Mobile Todo: Pass with accessibility issue. Completion control was visually 24px and difficult to tap reliably.
5. Mobile Documents: Pass. Creation is clear; the large empty editing area needs stronger contextual guidance when no document exists.
6. Mobile Diary: Pass with friction. At 2552px, creation, filters, entry content, metadata, and preview create a long undifferentiated stack.
7. Mobile Files: Pass. Upload and search are understandable; the empty preview region has low information value.
8. Mobile Exam: Pass. Source history and upload are usable, but English release labels conflicted with the Chinese interface.
9. Mobile Settings: Pass with friction. The 1766px stack exposes technical provider terminology to ordinary users.
10. Mobile More navigation: Pass. All secondary destinations are reachable, active state is clear, and safe-area spacing is present.
11. Desktop Dashboard: Pass. Density is appropriate, though repeated cards and universal hover lift make hierarchy feel generated rather than intentional.
12. Desktop Todo: Pass. Form and list are readable; metadata pills and native controls are visually inconsistent.
13. Desktop Documents: Pass. Two-pane behavior is useful, but the empty state does not explain the next meaningful action.
14. Desktop Diary: Pass. Information density is high; preview and metadata compete with the editor.
15. Desktop Files: Pass. Layout is stable, with an underused preview area when no file is selected.
16. Desktop Exam: Pass. Functional, but release-stage copy and generic card repetition reduce product cohesion.
17. Desktop Settings: Pass. Two-column layout works, but technical deployment values are overexposed and the page leaves unused space on large screens.

## Product Health Score

| Area | Score | Notes |
| --- | ---: | --- |
| Accessibility | 2/4 | Semantic forms are present; small touch targets and inconsistent focus visibility required fixes. |
| Performance | 3/4 | No heavy animation framework; CSS effects are reduced on mobile. A 480KB decorative image was bypassing Next image optimization. |
| Responsive behavior | 3/4 | No horizontal overflow and mobile navigation is functional; several mobile pages remain overly long. |
| Theme consistency | 3/4 | Light/dark tokens are shared; decorative background occasionally competes with dense content. |
| Product coherence | 2/4 | Version labels, repeated cards, technical copy, and identical hover effects exposed the implementation process. |
| **Total** | **13/20** | **Acceptable, with targeted product-quality fixes required.** |

## Main Pain Points And AI-generated UI Smells

### P1 - Fixed

1. Version labels (`v1.0`, `v1.1`, `Exam Review`) appeared in headers and every desktop sidebar row. They describe the build, not the user's task. Removed from authenticated product UI.
2. The Todo completion target was below the 44px mobile minimum. The hit area is now 44px while retaining the 24px visual checkbox.
3. Logout was a persistent icon beside mobile search, making a destructive account action too prominent. It now lives in the More sheet with a text label; theme remains in the top bar.
4. Mobile language switching disappeared from primary chrome. It is now available in the More sheet without adding a sixth cramped navigation item.
5. The More sheet allowed the page behind it to continue scrolling. Background scrolling is now locked while it is open, Escape closes it, and initial focus moves to Close.

### P2 - Fixed

1. Dashboard repeated six module links already available in mobile bottom navigation. Those duplicate module grids are now desktop-only; mobile retains Quick Add, today, quick actions, and recent activity.
2. Universal card lift and `transition-all` made every surface demand equal attention. Shared cards now use restrained border/color/shadow feedback and controls use targeted transitions.
3. Sidebar icons were undersized and active matching failed on nested Exam routes. Icons are now 18px and route matching is shared with mobile navigation.
4. Tiny 10px metadata labels in Diary and Files were increased to 12px.
5. Settings displayed old phase/release wording. Copy now explains secure environment-managed configuration without exposing development-stage language.
6. Keyboard focus treatment varied by component. A shared `focus-visible` outline now covers links, controls, and summaries.
7. The lace image explicitly disabled Next.js optimization. It now uses the built-in image pipeline.

### Remaining P2 / P3 Work

1. Diary still combines too many workflows in one long page. A later UI-only iteration should use an editor/list split on desktop and progressive disclosure on mobile.
2. Documents and Files need contextual empty states that explain what appears after the first item is created or selected.
3. Settings should eventually separate user preferences from administrator/provider diagnostics. This requires a product decision, not a cosmetic change.
4. Native date/select/color controls are functional but visually inconsistent across browsers. Standardizing them should preserve native accessibility and mobile pickers.
5. The top-bar lace mark and sidebar wordmark intentionally repeat branding because the 270x55 anchor was a prior product requirement. If faster scanning is preferred later, one of these should be reduced.

## Validation

- `pnpm typecheck`: passed
- `pnpm lint`: passed
- `pnpm build`: passed
- Next.js production build generated all application routes successfully.
- No Prisma schema, authentication, session, server action, or data query logic was changed.

## Accessibility Limits

This audit verifies visible hierarchy, responsive behavior, DOM semantics, focus styles, and touch-target code. It is not a WCAG conformance certification. Screen-reader announcements, full keyboard focus trapping, color contrast ratios, and testing on physical iOS/Android devices remain separate validation work.

## Verification Limitation

The authenticated browser connection was interrupted during the final post-fix screenshot reload. The fixes were therefore re-verified through source inspection, TypeScript, ESLint, and the production build rather than a second screenshot set. The original screenshot set remains the evidence baseline.

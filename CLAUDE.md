@AGENTS.md

# Finance OS — Project Guidelines

## Architecture

- **Next.js App Router** with hybrid Server/Client component architecture.
- **Server Components** handle data fetching; interactive elements (menus, dialogs, forms) must reside in **Client Components** (`'use client'`).
- Server actions live in `actions/` and use `'use server'`.
- Database queries live in `lib/queries/`.

## UI Component Library

This project uses **coss** (built on `@base-ui/react`) — NOT shadcn/Radix.

### Critical API Differences from shadcn/Radix

- **MenuItem**: Use `onClick`, NOT `onSelect`. Base UI's `MenuItem` does not have `onSelect`.
- **DialogTrigger / MenuTrigger**: Use `render={<Component />}` prop, NOT `asChild`.
- **Dialog without trigger**: Always wrap `<DialogPopup>` inside a `<Dialog>` root — never render `<DialogPopup>` standalone or the context will be undefined.
- **SelectValue**: Use Base UI's pattern — check the coss skill references before implementing.

### Menu → Dialog Pattern

When opening a Dialog from a Menu item, follow the official `p-dialog-2` particle pattern:

1. Use `onClick` on `MenuItem` to set dialog state to `true`.
2. Render the `<Dialog>` **outside** the `<Menu>` component tree, controlled via `open`/`onOpenChange`.
3. Do NOT nest `<Dialog>` inside `<MenuPopup>` — the menu closes and destroys the dialog before it opens.

```tsx
// ✅ Correct — coss/Base UI pattern
<>
  <Menu>
    <MenuTrigger render={<Button />}>Actions</MenuTrigger>
    <MenuPopup>
      <MenuItem onClick={() => setDialogOpen(true)}>Edit</MenuItem>
    </MenuPopup>
  </Menu>
  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    <DialogPopup>...</DialogPopup>
  </Dialog>
</>

// ❌ Wrong — shadcn/Radix pattern (will not work)
<Menu>
  <MenuPopup>
    <Dialog>
      <DialogTrigger>
        <MenuItem onSelect={(e) => e.preventDefault()}>Edit</MenuItem>
      </DialogTrigger>
      <DialogPopup>...</DialogPopup>
    </Dialog>
  </MenuPopup>
</Menu>
```

## Page Standards

### Layout & Padding

- The dashboard layout (`app/(dashboard)/layout.tsx`) already provides `px-4 md:px-8 md:pt-2` padding.
- Page components should NOT add their own horizontal/vertical padding — use the layout's padding.

### Page Structure

Every dashboard page should follow this pattern:

```tsx
export default async function XxxPage() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center justify-between">
        <SectionHeading heading="Page Title" subHeading="Brief description." />
        {/* Action buttons */}
      </div>

      <Suspense fallback={<ContentSkeleton />}>
        <ContentList />
      </Suspense>
    </div>
  );
}
```

### Required Conventions

- Use `SectionHeading` component (`@/components/common/SectionHeading`) for page headings.
- Wrap async data-fetching sub-components in `<Suspense>` with skeleton fallbacks.
- Use `Skeleton` component (`@/components/ui/skeleton`) for loading states.
- Export `metadata` for SEO (`export const metadata = { title: '... | Finance OS' }`).

## Charts — Evil Charts

- Use `@evil-charts` (recharts-based) for all data visualizations.
- Always use the **native `isLoading` prop** for loading states — do NOT use custom spinners/skeletons for chart loading.

## Dialog Pattern

Dialogs support two modes:

1. **With trigger** (`withTrigger` + optional `trigger` prop): The dialog manages its own trigger button.
2. **Controlled** (`open` + `onOpenChange` props): Parent controls visibility (used when opening from menus or other components).

Both modes must always wrap `<DialogPopup>` inside a `<Dialog>` root.

## Lint & Code Quality

- Remove unused variables from `catch` blocks: use `catch {` not `catch (error) {`.
- Escape quotes in JSX: use `&quot;` not `"` inside JSX text content.
- Suppress React Compiler warnings for `form.watch()` with `// eslint-disable-next-line react-hooks/incompatible-library`.

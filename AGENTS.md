<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Finance OS — Agent Guidelines

## UI Component Library: coss (Base UI)

This project uses **coss** built on `@base-ui/react`. It is NOT shadcn/Radix.

### Critical Differences from shadcn/Radix

| shadcn/Radix                       | coss/Base UI                                          |
| ---------------------------------- | ----------------------------------------------------- |
| `onSelect` on MenuItem             | `onClick` on MenuItem                                 |
| `asChild` on Trigger               | `render={<Component />}` on Trigger                   |
| Dialog can render standalone popup | `<DialogPopup>` must always be inside `<Dialog>` root |

### Menu → Dialog Pattern

Use `onClick` on `MenuItem` to set state, render `<Dialog>` **outside** the `<Menu>` tree:

```tsx
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
```

## Spinners & Loading States

### Button Loading

- **Always** use the Button's built-in `loading` prop: `<Button loading={isPending}>Save</Button>`
- The `loading` prop automatically shows the `UnicodeSpinner` ("diagswipe" animation) and disables the button.
- **Never** use `disabled={isPending}` + inline text swap like `{isPending ? 'Saving...' : 'Save'}`.

### Chart Loading

- Use `@evil-charts` native `isLoading` prop: `<EvilPieChart isLoading={isLoading} />`
- **Never** use custom spinners or skeletons for chart loading states.

### Page Loading (Suspense)

- Use `<Skeleton>` component (`@/components/ui/skeleton`) inside Suspense fallbacks.

## Page Standards

### Layout

- The dashboard layout provides `px-4 md:px-8 md:pt-2` padding — pages must NOT add their own.

### Structure

```tsx
export default async function XxxPage() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center justify-between">
        <SectionHeading heading="Title" subHeading="Description" />
        {/* Actions */}
      </div>
      <Suspense fallback={<Skeleton />}>
        <AsyncContent />
      </Suspense>
    </div>
  );
}
```

### Requirements

- Use `SectionHeading` (`@/components/common/SectionHeading`) for all page headings.
- Wrap async data-fetching components in `<Suspense>` with skeleton fallbacks.
- Export `metadata` for SEO: `export const metadata = { title: '... | Finance OS' }`.

## Dialog Pattern

Dialogs support two modes:

1. **With trigger**: `withTrigger` + optional `trigger` prop — dialog manages its own trigger.
2. **Controlled**: `open` + `onOpenChange` props — parent controls visibility.

Both modes MUST wrap `<DialogPopup>` inside `<Dialog>` root.

## Lint Rules

- Use `catch {` not `catch (error) {` when error is unused.
- Escape quotes in JSX: `&quot;` not `"`.
- Suppress React Compiler `form.watch()` warning with `// eslint-disable-next-line react-hooks/incompatible-library`.

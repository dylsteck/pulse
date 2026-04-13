---
name: no-use-effect
description: Avoid useEffect — use the 5 replacement patterns instead
---

# Avoid useEffect

Prefer avoiding `useEffect` whenever possible. Before writing one, check if one of the 5 alternatives below fits. This doctrine is from the React docs page ["You Might Not Need an Effect"](https://react.dev/learn/you-might-not-need-an-effect).

---

## The 5 rules

### 1. Derived state → inline compute

Don't `useState` + `useEffect` to mirror props or other state. Just compute the value during render. Wrap in `useMemo` if expensive.

Bad:

```tsx
const [full, setFull] = useState("");
useEffect(() => {
  setFull(`${first} ${last}`);
}, [first, last]);
```

Good:

```tsx
const full = `${first} ${last}`;
```

### 2. Data fetching → TanStack Query

Don't `useEffect(fetch → setState)`. Use `useQuery` / `useMutation`. It handles caching, race conditions, retries, and refocus.

Bad:

```tsx
const [items, setItems] = useState<Item[] | null>(null);
useEffect(() => {
  fetch("/api/items").then(r => r.json()).then(setItems);
}, []);
```

Good:

```tsx
const { data: items, isPending } = useQuery({
  queryKey: ["items"],
  queryFn: () => makeRequest<Item[]>("/api/items"),
});
```

### 3. User actions → event handlers

If a side effect is caused by a click, submit, or keystroke, put it in the handler — not in an effect that watches some state the handler updated.

### 4. One-shot external sync on mount → single `useEffect(fn, [])`

For DOM integration, third-party widget lifecycles (e.g. Liveline chart mounting), and browser API subscriptions that must run exactly once per mount — a `useEffect` with empty deps is fine. Return a cleanup function for anything that needs tearing down.

### 5. Reset state when a prop changes → `key` prop on the parent

If state needs to reset when a prop changes, don't watch the prop in an effect. Remount the component by keying it.

Bad:

```tsx
useEffect(() => {
  setDraft("");
}, [userId]);
```

Good:

```tsx
<Profile key={userId} userId={userId} />
```

---

## Quick decision tree

1. Am I computing a value from existing state/props? → **Rule 1** (inline compute / `useMemo`).
2. Am I loading data from somewhere? → **Rule 2** (TanStack Query).
3. Is this happening because the user did something? → **Rule 3** (event handler).
4. Am I wiring up a DOM lib / browser API once per mount? → **Rule 4** (`useEffect(fn, [])`).
5. Do I need to reset local state when a prop changes? → **Rule 5** (`key` prop).

If none of these fit, a `useEffect` may be genuinely needed — but think twice first.

---

## See also

- React docs: https://react.dev/learn/you-might-not-need-an-effect

// Auth is enforced server-side in each route group's layout via currentUser().
// This component is kept for compatibility with pages that were written against
// the old client-side auth pattern; it simply renders its children.
export default function AuthCheck({ children }) {
  return children;
}

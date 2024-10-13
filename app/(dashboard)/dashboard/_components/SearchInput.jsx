export function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      className="border rounded-md p-2 w-full"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  )
}

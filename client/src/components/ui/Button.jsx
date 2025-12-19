export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-500 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
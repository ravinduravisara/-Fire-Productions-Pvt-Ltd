export default function Button({ children, className = '', size = 'md', ...props }) {
  const sizeClass = size === 'sm'
    ? 'px-3 py-1.5 text-sm'
    : size === 'lg'
    ? 'px-5 py-3 text-base'
    : 'px-4 py-2 text-sm'

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-brand-600 text-white hover:bg-brand-500 transition-colors ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
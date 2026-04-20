import { motion } from 'framer-motion'

export default function SectionTitle({ title, subtitle }) {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text">{title}</h2>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
    </motion.div>
  )
}
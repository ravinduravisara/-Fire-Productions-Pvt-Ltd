import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Lenis from 'lenis'

import './ScrollStack.css'

export const ScrollStackItem = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
)

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}) => {
  const scrollerRef = useRef(null)
  const [isCompactLayout, setIsCompactLayout] = useState(false)
  const stackCompletedRef = useRef(false)
  const animationFrameRef = useRef(null)
  const smoothFrameRef = useRef(null)
  const currentTransformsRef = useRef(new Map())
  const targetTransformsRef = useRef(new Map())
  const lenisRef = useRef(null)
  const cardsRef = useRef([])
  const lastTransformsRef = useRef(new Map())
  const isUpdatingRef = useRef(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')

    const updateLayoutMode = () => {
      setIsCompactLayout(mediaQuery.matches)
    }

    updateLayoutMode()

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateLayoutMode)
      return () => mediaQuery.removeEventListener('change', updateLayoutMode)
    }

    mediaQuery.addListener(updateLayoutMode)
    return () => mediaQuery.removeListener(updateLayoutMode)
  }, [])

  const calculateProgress = useCallback((scrollTop, start, end) => {
    if (scrollTop < start) return 0
    if (scrollTop > end) return 1
    return (scrollTop - start) / (end - start)
  }, [])

  const parsePercentage = useCallback((value, containerHeight) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight
    }
    return parseFloat(value)
  }, [])

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
        scrollContainer: document.documentElement,
      }
    }

    const scroller = scrollerRef.current
    return {
      scrollTop: scroller.scrollTop,
      containerHeight: scroller.clientHeight,
      scrollContainer: scroller,
    }
  }, [useWindowScroll])

  const getElementOffset = useCallback(
    (element) => {
      if (useWindowScroll) {
        const rect = element.getBoundingClientRect()
        return rect.top + window.scrollY
      }

      return element.offsetTop
    },
    [useWindowScroll]
  )

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return

    isUpdatingRef.current = true

    const { scrollTop, containerHeight } = getScrollData()
    const stackPositionPx = parsePercentage(stackPosition, containerHeight)
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight)

    const endElement = useWindowScroll
      ? document.querySelector('.scroll-stack-end')
      : scrollerRef.current?.querySelector('.scroll-stack-end')

    const endElementTop = endElement ? getElementOffset(endElement) : 0

    cardsRef.current.forEach((card, i) => {
      if (!card) return

      const cardTop = getElementOffset(card)
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i
      const triggerEnd = cardTop - scaleEndPositionPx
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i
      const pinEnd = endElementTop - containerHeight / 2

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd)
      const targetScale = baseScale + i * itemScale
      const scale = 1 - scaleProgress * (1 - targetScale)
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0

      let blur = 0
      if (blurAmount) {
        let topCardIndex = 0
        for (let j = 0; j < cardsRef.current.length; j += 1) {
          const jCardTop = getElementOffset(cardsRef.current[j])
          const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j
          }
        }

        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i
          blur = Math.max(0, depthInStack * blurAmount)
        }
      }

      let translateY = 0
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i
      }

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      }

      targetTransformsRef.current.set(i, newTransform)
      if (!currentTransformsRef.current.has(i)) {
        currentTransformsRef.current.set(i, { ...newTransform })
      }

      lastTransformsRef.current.set(i, newTransform)

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true
          onStackComplete?.()
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false
        }
      }
    })

    isUpdatingRef.current = false
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    scaleDuration,
    useWindowScroll,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollData,
    getElementOffset,
  ])

  const runSmoothTransforms = useCallback(() => {
    if (!cardsRef.current.length) {
      smoothFrameRef.current = null
      return
    }

    let needsAnotherFrame = false

    cardsRef.current.forEach((card, i) => {
      if (!card) return

      const target = targetTransformsRef.current.get(i)
      if (!target) return

      const current = currentTransformsRef.current.get(i) || { ...target }
      const ease = isCompactLayout ? 0.18 : 0.12

      const next = {
        translateY: current.translateY + (target.translateY - current.translateY) * ease,
        scale: current.scale + (target.scale - current.scale) * ease,
        rotation: current.rotation + (target.rotation - current.rotation) * ease,
        blur: current.blur + (target.blur - current.blur) * ease,
      }

      const isSettled =
        Math.abs(next.translateY - target.translateY) < 0.05 &&
        Math.abs(next.scale - target.scale) < 0.001 &&
        Math.abs(next.rotation - target.rotation) < 0.05 &&
        Math.abs(next.blur - target.blur) < 0.05

      currentTransformsRef.current.set(i, isSettled ? { ...target } : next)

      const finalValue = isSettled ? target : next
      card.style.transform = `translate3d(0, ${finalValue.translateY}px, 0) scale(${finalValue.scale}) rotate(${finalValue.rotation}deg)`
      card.style.filter = finalValue.blur > 0 ? `blur(${finalValue.blur}px)` : 'none'
      card.style.willChange = 'transform, filter'

      if (!isSettled) {
        needsAnotherFrame = true
      }
    })

    if (needsAnotherFrame) {
      smoothFrameRef.current = requestAnimationFrame(runSmoothTransforms)
    } else {
      smoothFrameRef.current = null
    }
  }, [isCompactLayout])

  const handleScroll = useCallback(() => {
    updateCardTransforms()
    if (smoothFrameRef.current === null) {
      smoothFrameRef.current = requestAnimationFrame(runSmoothTransforms)
    }
  }, [updateCardTransforms, runSmoothTransforms])

  const setupLenis = useCallback(() => {
    if (useWindowScroll) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075,
      })

      lenis.on('scroll', handleScroll)

      const raf = (time) => {
        lenis.raf(time)
        animationFrameRef.current = requestAnimationFrame(raf)
      }

      animationFrameRef.current = requestAnimationFrame(raf)
      lenisRef.current = lenis
      return lenis
    }

    const scroller = scrollerRef.current
    if (!scroller) return undefined

    const lenis = new Lenis({
      wrapper: scroller,
      content: scroller.querySelector('.scroll-stack-inner'),
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      gestureOrientationHandler: true,
      normalizeWheel: true,
      wheelMultiplier: 1,
      touchInertiaMultiplier: 35,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075,
      touchInertia: 0.6,
    })

    lenis.on('scroll', handleScroll)

    const raf = (time) => {
      lenis.raf(time)
      animationFrameRef.current = requestAnimationFrame(raf)
    }

    animationFrameRef.current = requestAnimationFrame(raf)
    lenisRef.current = lenis
    return lenis
  }, [handleScroll, useWindowScroll])

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || isCompactLayout) return undefined

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : scroller.querySelectorAll('.scroll-stack-card')
    )

    cardsRef.current = cards
    const transformsCache = lastTransformsRef.current
    currentTransformsRef.current = new Map()
    targetTransformsRef.current = new Map()

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`
      }

      card.style.willChange = 'transform, filter'
      card.style.transformOrigin = 'top center'
      card.style.backfaceVisibility = 'hidden'
      card.style.transform = 'translateZ(0)'
      card.style.webkitTransform = 'translateZ(0)'
      card.style.perspective = '1000px'
      card.style.webkitPerspective = '1000px'
      card.style.transitionProperty = 'none'
    })

    setupLenis()
    updateCardTransforms()
    smoothFrameRef.current = requestAnimationFrame(runSmoothTransforms)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (smoothFrameRef.current) {
        cancelAnimationFrame(smoothFrameRef.current)
      }

      if (lenisRef.current) {
        lenisRef.current.destroy()
      }

      stackCompletedRef.current = false
      cardsRef.current = []
      transformsCache.clear()
      isUpdatingRef.current = false
    }
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    setupLenis,
    updateCardTransforms,
    runSmoothTransforms,
    isCompactLayout,
  ])

  if (isCompactLayout) {
    return (
      <div className={`scroll-stack-static ${className}`.trim()} ref={scrollerRef}>
        <div className="scroll-stack-static-inner">{children}</div>
      </div>
    )
  }

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  )
}

export default ScrollStack
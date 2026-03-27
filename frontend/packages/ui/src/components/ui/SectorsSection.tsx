import React from "react"
import { motion } from "framer-motion"
import { AnimatedGradient } from "@workspace/ui/components/ui/animated-gradient-with-svg"

interface BentoCardProps {
  title: string
  value: string | number
  subtitle?: string
  colors: string[]
  delay: number
  imageSrc?: string
}

const BentoCard: React.FC<BentoCardProps> = ({
  title,
  value,
  subtitle,
  colors,
  delay,
  imageSrc,
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay + 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <motion.div
      className="relative overflow-hidden h-full bg-background dark:bg-background/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {imageSrc && (
        <>
          <img
            src={imageSrc}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#061E29]/45" />
        </>
      )}
      {!imageSrc && <AnimatedGradient colors={colors} speed={0.05} blur="medium" />}
      {!imageSrc && <div className="absolute inset-0 bg-[#061E29]/35" />}
      <motion.div
        className="relative z-10 p-3 sm:p-5 md:p-8 text-foreground backdrop-blur-sm"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h3
          className="text-sm sm:text-base md:text-lg text-foreground"
          variants={item}
        >
          {title}
        </motion.h3>
        <motion.p
          className="text-2xl sm:text-4xl md:text-5xl font-medium mb-4 text-foreground"
          variants={item}
        >
          {value}
        </motion.p>
        {subtitle && (
          <motion.p
            className="text-sm text-foreground/80"
            variants={item}
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  )
}

const SectorsSection: React.FC = () => {
  return (
<section id="sectors" className="w-full py-12 lg:py-20">      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl tracking-tighter font-regular text-left">
            Who{" "}
            <em className="not-italic font-semibold" style={{ color: "#1D546D" }}>
              VaktarAI
            </em>{" "}
            serves
          </h2>
        </div>

        {/* Bento Grid — forced dark so AnimatedGradient colors render correctly */}
        <div className="dark w-full bg-[#061E29] h-full rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 grow h-full">

            {/* Education — wide */}
            <div className="md:col-span-2 min-h-[180px]">
              <BentoCard
                title="Education"
                value="10x Engagement"
                subtitle="Teachers create AI-powered video lessons from a single photo — no studio, no camera, no crew needed."
                colors={["#1D546D", "#5F9598", "#234C6A"]}
                delay={0.2}
                imageSrc="/sectors/education.avif"
              />
            </div>

            {/* Marketing */}
            <div className="min-h-[180px]">
              <BentoCard
                title="Marketing"
                value="3× faster"
                subtitle="Launch personalised ad campaigns with AI avatars speaking directly to your audience."
                colors={["#5F9598", "#1D546D", "#1B3C53"]}
                delay={0.4}
                imageSrc="/sectors/marketing.avif"
              />
            </div>

            {/* Content Creation */}
            <div className="min-h-[180px]">
              <BentoCard
                title="Content Creation"
                value="∞ Content"
                subtitle="Turn a single photo into unlimited multilingual videos for social, YouTube, and beyond."
                colors={["#234C6A", "#5F9598", "#1D546D"]}
                delay={0.6}
              />
            </div>

            {/* Corporate Training — wide */}
            <div className="md:col-span-2 min-h-[180px]">
              <BentoCard
                title="Corporate Training"
                value="60% saved"
                subtitle="Replace costly in-person sessions with scalable AI presenter videos your teams can watch anytime."
                colors={["#1D546D", "#234C6A", "#5F9598"]}
                delay={0.8}
                imageSrc="/sectors/corporate-training.jpg"
              />
            </div>

            {/* Customer Support — wide */}
            <div className="md:col-span-2 min-h-[180px]">
              <BentoCard
                title="Customer Support"
                value="24 / 7"
                subtitle="Deploy AI avatar agents that explain products, handle FAQs, and guide users — in any language, at any hour."
                colors={["#5F9598", "#234C6A", "#1D546D"]}
                delay={1.0}
                imageSrc="/sectors/customer-support.avif"
              />
            </div>

            {/* Healthcare */}
            <div className="min-h-[180px]">
              <BentoCard
                title="Healthcare"
                value="Clear comms"
                subtitle="Clinicians deliver consistent patient education videos without repeating themselves in every appointment."
                colors={["#1B3C53", "#5F9598", "#234C6A"]}
                delay={1.2}
                imageSrc="/sectors/healthcare.jpeg"
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

export default SectorsSection

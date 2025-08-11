"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  steps: { title: string }[]
}

export default function ProgressBar({ currentStep, totalSteps, steps }: ProgressBarProps) {
  return (
    <div className="bg-black border-b-4 border-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  className={`w-8 h-8 md:w-10 md:h-10 border-2 border-white flex items-center justify-center text-sm font-black transition-colors ${
                    index < currentStep
                      ? "bg-yellow-400 text-black"
                      : index === currentStep
                        ? "bg-red-500 text-white"
                        : "bg-white text-black"
                  }`}
                  initial={false}
                  animate={{
                    scale: index === currentStep ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {index < currentStep ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : index + 1}
                </motion.div>
                <span className="text-xs md:text-sm font-bold text-white mt-2 hidden md:block uppercase">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 md:w-16 h-1 bg-white mx-2 md:mx-4 border border-white">
                  <motion.div
                    className="h-full bg-yellow-400 border-r border-black"
                    initial={{ width: "0%" }}
                    animate={{
                      width: index < currentStep ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile step indicator */}
        <div className="md:hidden mt-4 text-center">
          <span className="text-sm font-bold text-white uppercase">{steps[currentStep].title}</span>
        </div>
      </div>
    </div>
  )
}

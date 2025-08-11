import OnboardingContainer from "../components/OnboardingContainer"
import { ThemeProvider } from "../components/ThemeProvider"

export default function Home() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <OnboardingContainer />
      </div>
    </ThemeProvider>
  )
}

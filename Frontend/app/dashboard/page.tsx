import MainDashboard from "../../components/MainDashboard"
import { ThemeProvider } from "../../components/ThemeProvider"

export default function Dashboard() {
  return (
    <ThemeProvider>
      <MainDashboard />
    </ThemeProvider>
  )
}

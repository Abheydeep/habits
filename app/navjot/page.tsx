import type { Metadata } from "next";
import { HabitTracker } from "../../components/HabitTracker";
import { profileConfigs } from "../../lib/habitData";

export const metadata: Metadata = {
  title: profileConfigs.navjot.title,
  description: profileConfigs.navjot.metaDescription
};

export default function NavjotHabitTrackerPage() {
  return <HabitTracker profile={profileConfigs.navjot} />;
}

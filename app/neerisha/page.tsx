import type { Metadata } from "next";
import { HabitTracker } from "../../components/HabitTracker";
import { profileConfigs } from "../../lib/habitData";

export const metadata: Metadata = {
  title: profileConfigs.neerisha.title,
  description: profileConfigs.neerisha.metaDescription
};

export default function NeerishaHabitTrackerPage() {
  return <HabitTracker profile={profileConfigs.neerisha} />;
}

import type { Metadata } from "next";
import { HabitTracker } from "../components/HabitTracker";
import { profileConfigs } from "../lib/habitData";

export const metadata: Metadata = {
  title: profileConfigs.shivani.title,
  description: profileConfigs.shivani.metaDescription
};

export default function HabitTrackerPage() {
  return <HabitTracker profile={profileConfigs.shivani} />;
}

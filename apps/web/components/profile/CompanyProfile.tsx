'use client';
import IdentityCard from "./IdentityCard";
import MissionCard from "./MissionCard";
import VisionCard from "./VisionCard";
import CultureCard from "./CultureCard";
import CoreValues from "./CoreValuesCard";

export default function CompanyProfile() {

  return (
    <div className="space-y-6">
      <IdentityCard />
      <MissionCard />
      <VisionCard />
      <CultureCard />
      <CoreValues />
    </div>
  );
}

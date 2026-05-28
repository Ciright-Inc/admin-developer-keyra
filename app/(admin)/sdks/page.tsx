"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { TabPanel, Tabs } from "@/components/ui/tabs";
import { SdksCatalogue } from "@/components/sdks/sdks-catalogue";
import { SdksAdoption } from "@/components/sdks/sdks-catalog";

const TABS = [
  { value: "catalogue", label: "Catalogue", icon: "inventory_2" },
  { value: "adoption", label: "Adoption", icon: "layers" },
];

export default function SdkPage() {
  const [tab, setTab] = React.useState("catalogue");

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span>SECTION // SDK MANAGEMENT</span>
            <Badge tone="info" dot>
              LIVE
            </Badge>
          </>
        }
        title="SDK catalogue & adoption"
        subtitle="Manage official SDK packages for the developer portal. Adoption tracks project client frameworks separately."
      />
      <Tabs items={TABS} value={tab} onValueChange={setTab}>
        <TabPanel value="catalogue" className="ds-tabs__content">
          <SdksCatalogue />
        </TabPanel>
        <TabPanel value="adoption" className="ds-tabs__content">
          <SdksAdoption />
        </TabPanel>
      </Tabs>
    </>
  );
}

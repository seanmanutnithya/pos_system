import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { PageActionsContext } from "@/components/layout/page-actions-context";
import Tabs, { TabPanel } from "@/components/ui/Tabs";
import Attribute from "@/features/product/attribute/pages/Attribute";
import Brand from "@/features/product/brand/pages/Brand";
import Category from "@/features/product/category/pages/Category";
import ProductMaster from "@/features/product/prd_master/pages/ProductMaster";

const TABS = [
  {
    id: "products",
    label: "Product Catalog",
    icon: "box",
    content: <ProductMaster />,
  },
  {
    id: "categories",
    label: "Categories",
    icon: "folder",
    content: <Category />,
  },
  {
    id: "brands",
    label: "Brands",
    icon: "tag",
    content: <Brand />,
  },
  {
    id: "attributes",
    label: "Attributes",
    icon: "layers",
    content: <Attribute />,
  },
];

const ProductMenuPage = () => {
  // The open tab lives in the URL (?tab=brands) so it can be linked and
  // survives a page refresh
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab =
    TABS.find((tab) => tab.id === searchParams.get("tab")) ?? TABS[0];
  // The element in the header where the open tab puts its buttons
  const [actionsTarget, setActionsTarget] = useState(null);
  // 1 or -1 for the way the last switch went, so the new panel slides in
  // from that side; 0 until the first switch
  const [direction, setDirection] = useState(0);

  const selectTab = (id) => {
    const nextIndex = TABS.findIndex((tab) => tab.id === id);
    setDirection(Math.sign(nextIndex - TABS.indexOf(activeTab)));
    setSearchParams({ tab: id }, { replace: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Product Menu"
        description="Manage your products, and the categories, brands and attributes that organize them."
        actions={
          <div
            ref={setActionsTarget}
            className="flex flex-wrap items-center gap-2"
          />
        }
      />

      <Tabs
        label="Product menu sections"
        tabs={TABS}
        value={activeTab.id}
        onChange={selectTab}
      />

      <PageActionsContext value={actionsTarget}>
        {/* The key gives each tab a fresh panel instead of reusing the last one's state */}
        <TabPanel key={activeTab.id} id={activeTab.id} direction={direction}>
          {activeTab.content}
        </TabPanel>
      </PageActionsContext>
    </div>
  );
};

export default ProductMenuPage;

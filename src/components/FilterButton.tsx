import { Button } from "@heroui/react";
import { BiFilterAlt } from "react-icons/bi";

export default function FilterButton({
  showFilters,
  setShowFilters,
}: {
  showFilters: boolean;
  setShowFilters: (showFilters: boolean) => void;
}) {
  return (
    <div className="mb-6">
      <Button
        color="default"
        className="flex items-center gap-2"
        onClick={() => setShowFilters(!showFilters)}
      >
        <BiFilterAlt />
        {showFilters ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}
      </Button>
    </div>
  );
}

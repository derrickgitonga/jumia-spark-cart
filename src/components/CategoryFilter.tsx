import { Button } from "@/components/ui/button";
import { Smartphone, Laptop, Headphones, Camera, Watch, Gamepad2 } from "lucide-react";

const categories = [
  { id: "all", name: "All Products", icon: null },
  { id: "smartphones", name: "Smartphones", icon: Smartphone },
  { id: "laptops", name: "Laptops", icon: Laptop },
  { id: "headphones", name: "Headphones", icon: Headphones },
  { id: "cameras", name: "Cameras", icon: Camera },
  { id: "smartwatches", name: "Smart Watches", icon: Watch },
  { id: "gaming", name: "Gaming", icon: Gamepad2 },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-card">
      <h3 className="font-semibold text-lg mb-4">Categories</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              className={`flex flex-col items-center gap-2 h-auto py-4 px-3 ${
                isSelected 
                  ? "button-primary" 
                  : "hover:border-primary/50 hover:text-primary"
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              {IconComponent && <IconComponent className="w-6 h-6" />}
              <span className="text-xs font-medium text-center leading-tight">
                {category.name}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
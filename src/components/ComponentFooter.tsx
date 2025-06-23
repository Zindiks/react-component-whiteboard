import React from "react";
import { type Category } from "../constants/componentCategories";

interface FooterProps {
  categories: Category[];
  onCategoryClick: (categoryName: string) => void;
  activeCategory?: string;
}

export const ComponentFooter: React.FC<FooterProps> = ({
  categories,
  onCategoryClick,
  activeCategory,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white border border-gray-200 shadow-xl rounded-full px-4 py-3">
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => onCategoryClick(category.name)}
              className={`
                flex flex-col items-center justify-center px-3 py-2 rounded-full
                transition-all duration-200 min-w-[60px] h-[50px]
                ${
                  activeCategory === category.name
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent hover:shadow-md"
                }
              `}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="text-xs font-medium truncate mt-1">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

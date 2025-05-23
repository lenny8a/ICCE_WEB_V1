"use client"

import type React from "react"
import { Clipboard, ClipboardCheck, Search } from "lucide-react"

interface MaterialTabsProps {
  activeTab: "pending" | "processed"
  onTabChange: (tab: "pending" | "processed") => void
  searchTerm: string
  onSearchTermChange: (term: string) => void
  pendingCount: number
  processedCount: number
  isHandheld: boolean
}

const MaterialTabs: React.FC<MaterialTabsProps> = ({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchTermChange,
  pendingCount,
  processedCount,
  isHandheld,
}) => {
  const commonTabStyles = `text-sm rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${isHandheld ? "py-1.5 px-3 handheld-py-1 handheld-px-2 handheld-text-xs" : "py-2 px-4"}`;
  const activeTabStyles = "bg-white dark:bg-boxdark border-primary text-primary font-semibold";
  const inactiveTabStyles = "border-transparent text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:border-primary/30";


  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 ${isHandheld ? "mb-2 gap-2" : ""}`}
    >
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onTabChange("pending")}
          className={`${commonTabStyles} ${activeTab === "pending" ? activeTabStyles : inactiveTabStyles}`}
        >
          <Clipboard size={isHandheld ? 14 : 16} />
          Por Procesar
          <span
            className={`inline-flex items-center justify-center ${isHandheld ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs"} font-medium rounded-full ${activeTab === 'pending' ? 'bg-primary/10 text-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            {pendingCount}
          </span>
        </button>
        <button
          onClick={() => onTabChange("processed")}
          className={`${commonTabStyles} ${activeTab === "processed" ? activeTabStyles : inactiveTabStyles}`}
        >
          <ClipboardCheck size={isHandheld ? 14 : 16} />
          Procesados
          <span
            className={`inline-flex items-center justify-center ${isHandheld ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs"} font-medium rounded-full ${activeTab === 'processed' ? 'bg-primary/10 text-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            {processedCount}
          </span>
        </button>
      </div>

      <div className={`relative ${isHandheld ? "w-full" : "w-full sm:w-64"}`}>
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={isHandheld ? 14 : 16} className="text-gray-500 dark:text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar material..."
          className={`w-full rounded-md border border-gray-200 bg-transparent ${isHandheld ? "py-1.5 handheld-py-1 handheld-text-xs" : "py-2"} pl-10 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white text-sm`}
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default MaterialTabs;

"use client";

import type { SortOption } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpAZ, ThumbsUp } from "lucide-react";

interface SortControlsProps {
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
}

export default function SortControls({ sortBy, setSortBy }: SortControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest" className="hover:cursor-pointer">
              <div className="flex items-center gap-2">
                <ArrowDownAZ className="h-4 w-4" />
                <span>Newest first</span>
              </div>
            </SelectItem>
            <SelectItem value="oldest" className="hover:cursor-pointer">
              <div className="flex items-center gap-2">
                <ArrowUpAZ className="h-4 w-4" />
                <span>Oldest first</span>
              </div>
            </SelectItem>
            <SelectItem value="most-likes" className="hover:cursor-pointer">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                <span>Most likes</span>
              </div>
            </SelectItem>
            <SelectItem value="least-likes" className="hover:cursor-pointer">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                <span>Least likes</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button
          variant={
            sortBy === "newest" || sortBy === "oldest" ? "default" : "outline"
          }
          size="sm"
          onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
          className="hover:cursor-pointer"
        >
          Date
          {sortBy === "newest" && <ArrowDownAZ className="ml-2 h-4 w-4" />}
          {sortBy === "oldest" && <ArrowUpAZ className="ml-2 h-4 w-4" />}
        </Button>
        <Button
          variant={
            sortBy === "most-likes" || sortBy === "least-likes"
              ? "default"
              : "outline"
          }
          size="sm"
          onClick={() =>
            setSortBy(sortBy === "most-likes" ? "least-likes" : "most-likes")
          }
          className="hover:cursor-pointer"
        >
          Likes
          {sortBy === "most-likes" && <ArrowDownAZ className="ml-2 h-4 w-4" />}
          {sortBy === "least-likes" && <ArrowUpAZ className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

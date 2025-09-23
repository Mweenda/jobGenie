import React from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filterOptions?: string[]
  selectedFilter?: string
  onFilterChange?: (filter: string) => void
  filterLabel?: string
  showSearch?: boolean
  showFilter?: boolean
  className?: string
  children?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filterOptions = [],
  selectedFilter = "All",
  onFilterChange,
  filterLabel = "Filter",
  showSearch = true,
  showFilter = true,
  className,
  children
}) => {
  return (
    <div className={cn("bg-gradient-to-r from-primary/5 to-primary/10 border-b", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {(showSearch || showFilter || children) && (
          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            {showSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            )}
            
            {showFilter && filterOptions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-6 whitespace-nowrap">
                    <Filter className="w-4 h-4 mr-2" />
                    {selectedFilter}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>{filterLabel}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {filterOptions.map((option) => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => onFilterChange?.(option)}
                      className={selectedFilter === option ? 'bg-primary/10' : ''}
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

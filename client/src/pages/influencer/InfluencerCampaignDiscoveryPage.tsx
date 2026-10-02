import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { campaignService } from '@/services/campaignService';
import { Campaign, CampaignFilters } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import {
  Calendar,
  DollarSign,
  Users,
  Globe,
  ChevronRight,
  TrendingUp,
  Sliders,
  X as XIcon,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Fashion & Lifestyle', value: 'Fashion & Lifestyle' },
  { label: 'Beauty & Skincare', value: 'Beauty & Skincare' },
  { label: 'Food & Beverage', value: 'Food & Beverage' },
  { label: 'Health & Wellness', value: 'Health & Wellness' },
  { label: 'Travel & Hospitality', value: 'Travel & Hospitality' },
  { label: 'Technology & Gadgets', value: 'Technology & Gadgets' },
  { label: 'Finance & Fintech', value: 'Finance & Fintech' },
  { label: 'Home & Interior Design', value: 'Home & Interior Design' },
  { label: 'Sports & Fitness', value: 'Sports & Fitness' },
  { label: 'Entertainment & Gaming', value: 'Entertainment & Gaming' },
  { label: 'Education & Career', value: 'Education & Career' },
  { label: 'Sustainability & Eco', value: 'Sustainability & Eco' },
  { label: 'Luxury & Premium', value: 'Luxury & Premium' },
  { label: 'Parenting & Family', value: 'Parenting & Family' },
];

const PLATFORMS = [
  { label: 'All Platforms', value: '' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'YouTube', value: 'YouTube' },
  { label: 'TikTok', value: 'TikTok' },
  { label: 'Twitter / X', value: 'Twitter' },
  { label: 'LinkedIn', value: 'LinkedIn' },
  { label: 'Pinterest', value: 'Pinterest' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt-desc' },
  { label: 'Oldest First', value: 'createdAt-asc' },
  { label: 'Budget: High → Low', value: 'budget-desc' },
  { label: 'Budget: Low → High', value: 'budget-asc' },
  { label: 'Deadline: Soonest', value: 'applicationDeadline-asc' },
  { label: 'Title: A → Z', value: 'title-asc' },
];

// ─── Campaign card ────────────────────────────────────────────────────────────
const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign: c }) => (
  <Card className="bg-[#FAF9F6] border-[#DDD8CE] rounded-[12px] shadow-sm hover:shadow-md hover:border-[#B8955A]/40 transition-all group">
    <CardContent className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="text-[10px]">{c.category}</Badge>
            {c.requiredPlatform && (
              <span className="text-[10px] text-[#6B6B6B] bg-[#F5F2EB] border border-[#DDD8CE] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider">
                {c.requiredPlatform}
              </span>
            )}
            {c.contentType && (
              <span className="text-[10px] text-[#6B6B6B] bg-[#F5F2EB] border border-[#DDD8CE] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider">
                {c.contentType}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/influencer/campaigns/${c._id}`}
            className="block font-headline text-lg font-bold text-[#222222] group-hover:text-[#B8955A] transition-colors leading-snug"
          >
            {c.title}
          </Link>

          {/* Description preview */}
          <p className="text-sm text-[#6B6B6B] line-clamp-2 leading-relaxed">{c.description}</p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B6B6B] pt-1">
            <span className="flex items-center gap-1.5 font-semibold text-[#222222]">
              <DollarSign className="w-3.5 h-3.5 text-[#B8955A]" />
              {c.currency || 'USD'} {Number(c.budget).toLocaleString()}
            </span>
            {c.applicationDeadline && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B8955A]" />
                Apply by {new Date(c.applicationDeadline).toLocaleDateString()}
              </span>
            )}
            {c.location && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#B8955A]" />
                {c.location}
              </span>
            )}
            {c.followerRange?.min != null && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#B8955A]" />
                {Number(c.followerRange.min).toLocaleString()}
                {c.followerRange.max ? `–${Number(c.followerRange.max).toLocaleString()}` : '+'} followers
              </span>
            )}
            {c.engagementRequirement != null && c.engagementRequirement > 0 && (
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#B8955A]" />
                ≥{c.engagementRequirement}% engagement
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <Link to={`/influencer/campaigns/${c._id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap">
              View Brief
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const InfluencerCampaignDiscoveryPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [platform, setPlatform] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [location, setLocation] = useState('');
  const [sortValue, setSortValue] = useState('createdAt-desc');

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const fetchCampaigns = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const sortParts = sortValue.split('-');
      const sortBy = sortParts[0] as CampaignFilters['sortBy'];
      const sortOrder = (sortParts[1] as 'asc' | 'desc') || 'desc';
      const filters: CampaignFilters = {
        page,
        limit: 15,
        sortBy,
        sortOrder,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(category && { category }),
        ...(platform && { platform }),
        ...(location && { location }),
        ...(minBudget && { minBudget: parseInt(minBudget, 10) }),
        ...(maxBudget && { maxBudget: parseInt(maxBudget, 10) }),
      };
      const result = await campaignService.getCampaigns(filters);
      setCampaigns(result.data);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, platform, location, minBudget, maxBudget, sortValue]);

  useEffect(() => {
    fetchCampaigns(currentPage);
  }, [fetchCampaigns, currentPage]);

  const handleFilterChange = () => setCurrentPage(1);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setPlatform('');
    setMinBudget('');
    setMaxBudget('');
    setLocation('');
    setSortValue('createdAt-desc');
    setCurrentPage(1);
  };

  const hasActiveFilters = category || platform || minBudget || maxBudget || location || debouncedSearch;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#B8955A] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#B8955A]" />
            Opportunity Discovery
          </div>
          <h1 className="font-headline text-3xl font-bold text-[#222222] tracking-tight">
            Discover Campaigns
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Browse active brand briefs and find the perfect collaboration.
          </p>
        </div>
        <p className="text-xs font-medium text-[#6B6B6B] shrink-0">
          <span className="text-[#222222] font-bold">{total}</span> active campaigns
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              id="campaign-search"
              value={search}
              onChange={v => { setSearch(v); handleFilterChange(); }}
              onClear={() => { setSearch(''); handleFilterChange(); }}
              placeholder="Search campaigns by title, category, or description..."
            />
          </div>
          <Select
            id="sort-campaigns"
            value={sortValue}
            onChange={e => { setSortValue(e.target.value); handleFilterChange(); }}
            options={SORT_OPTIONS}
            className="w-52"
          />
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowFilters(v => !v)}
            className="gap-2 shrink-0"
          >
            <Sliders className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#B8955A]" />
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="p-4 bg-[#FAF9F6] border border-[#DDD8CE] rounded-[10px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Select
              id="filter-category"
              label="Category"
              value={category}
              onChange={e => { setCategory(e.target.value); handleFilterChange(); }}
              options={CATEGORIES}
            />
            <Select
              id="filter-platform"
              label="Platform"
              value={platform}
              onChange={e => { setPlatform(e.target.value); handleFilterChange(); }}
              options={PLATFORMS}
            />
            <Input
              id="filter-location"
              label="Location"
              value={location}
              onChange={e => { setLocation(e.target.value); handleFilterChange(); }}
              placeholder="e.g., Mumbai"
            />
            <Input
              id="filter-min-budget"
              label="Min Budget"
              type="number"
              value={minBudget}
              onChange={e => { setMinBudget(e.target.value); handleFilterChange(); }}
              placeholder="e.g., 1000"
            />
            <Input
              id="filter-max-budget"
              label="Max Budget"
              type="number"
              value={maxBudget}
              onChange={e => { setMaxBudget(e.target.value); handleFilterChange(); }}
              placeholder="e.g., 50000"
            />
            {hasActiveFilters && (
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-[#6B6B6B] w-full">
                  <XIcon className="w-3.5 h-3.5" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <LoadingState message="Finding campaigns..." />
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="No Campaigns Found"
          description={hasActiveFilters
            ? "No campaigns match your current filters. Try adjusting or clearing your search criteria."
            : "No campaigns are currently published. Check back soon!"}
          actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      ) : (
        <div className="space-y-4">
          {campaigns.map(c => (
            <CampaignCard key={c._id} campaign={c} />
          ))}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

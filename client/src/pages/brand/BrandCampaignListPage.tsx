import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { campaignService } from '@/services/campaignService';
import { Campaign, CampaignStatus, CampaignFilters } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import {
  Plus,
  Eye,
  Edit3,
  Trash2,
  Send,
  X as XIcon,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react';

// ─── Status badge helper ──────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'accent' | 'primary' }
> = {
  DRAFT: { label: 'Draft', variant: 'default' },
  PUBLISHED: { label: 'Live', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'warning' },
  IN_PROGRESS: { label: 'In Progress', variant: 'accent' },
  COMPLETED: { label: 'Completed', variant: 'primary' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

const CampaignStatusBadge: React.FC<{ status: CampaignStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, variant: 'default' as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

// ─── Component ────────────────────────────────────────────────────────────────
export const BrandCampaignListPage: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const filters: CampaignFilters = { page, limit: 10 };
      if (statusFilter) filters.status = statusFilter as CampaignStatus;
      const result = await campaignService.getCampaigns(filters);
      setCampaigns(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCampaigns(currentPage);
  }, [fetchCampaigns, currentPage]);

  const handlePublish = async (id: string) => {
    try {
      setActionLoading(id);
      setActionError(null);
      await campaignService.publishCampaign(id);
      await fetchCampaigns(currentPage);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async (id: string) => {
    try {
      setActionLoading(id);
      setActionError(null);
      await campaignService.closeCampaign(id);
      await fetchCampaigns(currentPage);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(id);
      setActionError(null);
      await campaignService.deleteCampaign(id);
      setDeleteConfirm(null);
      await fetchCampaigns(currentPage);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#B8955A] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#B8955A]" />
            Campaign Management
          </div>
          <h1 className="font-headline text-3xl font-bold text-[#222222] tracking-tight">
            My Campaigns
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Manage all your brand campaign briefs — draft, live, and completed.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/brand/campaigns/new')}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-48">
          <Select
            id="status-filter"
            value={statusFilter}
            onChange={e => handleStatusFilterChange(e.target.value)}
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Published (Live)', value: 'PUBLISHED' },
              { label: 'Closed', value: 'CLOSED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ]}
          />
        </div>
        <p className="text-xs text-[#6B6B6B]">
          {total} campaign{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {actionError && <Alert variant="error">{actionError}</Alert>}

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading your campaigns..." />
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="No Campaigns Found"
          description="You haven't created any campaigns yet. Create your first campaign brief to attract top creators."
          actionLabel="Create First Campaign"
          onAction={() => navigate('/brand/campaigns/new')}
        />
      ) : (
        <div className="space-y-4">
          {campaigns.map(c => (
            <Card key={c._id} className="bg-[#FAF9F6] border-[#DDD8CE] rounded-[12px] shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Campaign info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CampaignStatusBadge status={c.status} />
                      <span className="text-xs text-[#6B6B6B] bg-[#F5F2EB] border border-[#DDD8CE] px-2 py-0.5 rounded-sm">
                        {c.category}
                      </span>
                      {c.requiredPlatform && (
                        <span className="text-xs text-[#6B6B6B] bg-[#F5F2EB] border border-[#DDD8CE] px-2 py-0.5 rounded-sm">
                          {c.requiredPlatform}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/brand/campaigns/${c._id}`}
                      className="block font-headline text-lg font-bold text-[#222222] hover:text-[#B8955A] transition-colors truncate"
                    >
                      {c.title}
                    </Link>

                    <p className="text-sm text-[#6B6B6B] line-clamp-2">{c.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B6B6B]">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-[#B8955A]" />
                        {c.currency || 'USD'} {Number(c.budget).toLocaleString()}
                      </span>
                      {c.applicationDeadline && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#B8955A]" />
                          Apply by {new Date(c.applicationDeadline).toLocaleDateString()}
                        </span>
                      )}
                      {c.followerRange?.min != null && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#B8955A]" />
                          {Number(c.followerRange.min).toLocaleString()}
                          {c.followerRange.max ? `–${Number(c.followerRange.max).toLocaleString()}` : '+'} followers
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                    <Link to={`/brand/campaigns/${c._id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 w-full justify-center">
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </Link>

                    {(c.status === 'DRAFT' || c.status === 'PUBLISHED' || c.status === 'CLOSED') && (
                      <Link to={`/brand/campaigns/${c._id}/edit`}>
                        <Button variant="outline" size="sm" className="gap-1.5 w-full justify-center">
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                      </Link>
                    )}

                    {c.status === 'DRAFT' && (
                      <Button
                        variant="accent"
                        size="sm"
                        isLoading={actionLoading === c._id}
                        onClick={() => handlePublish(c._id!)}
                        className="gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Publish
                      </Button>
                    )}

                    {c.status === 'PUBLISHED' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={actionLoading === c._id}
                        onClick={() => handleClose(c._id!)}
                        className="gap-1.5"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                        Close
                      </Button>
                    )}

                    {(c.status === 'DRAFT' || c.status === 'CANCELLED') && (
                      deleteConfirm === c._id ? (
                        <div className="flex gap-1.5">
                          <Button
                            variant="destructive"
                            size="sm"
                            isLoading={actionLoading === c._id}
                            onClick={() => handleDelete(c._id!)}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm(c._id!)}
                          className="gap-1.5 text-[#C0392B] border-[#C0392B]/30 hover:bg-[#C0392B]/5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
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

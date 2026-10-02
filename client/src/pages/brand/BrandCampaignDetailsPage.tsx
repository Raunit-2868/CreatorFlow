import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { campaignService } from '@/services/campaignService';
import { Campaign, CampaignStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { Card, CardContent } from '@/components/ui/Card';
import {
  ChevronLeft,
  Edit3,
  Send,
  X as XIcon,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Target,
  Package,
  Globe,
  TrendingUp,
} from 'lucide-react';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<CampaignStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'accent' | 'primary' }> = {
  DRAFT: { label: 'Draft', variant: 'default' },
  PUBLISHED: { label: 'Live', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'warning' },
  IN_PROGRESS: { label: 'In Progress', variant: 'accent' },
  COMPLETED: { label: 'Completed', variant: 'primary' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

// ─── Detail row helper ────────────────────────────────────────────────────────
const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-[#F5F2EB] rounded-[8px] border border-[#DDD8CE]">
    <div className="w-8 h-8 rounded-[6px] bg-[#B8955A]/15 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider">{label}</p>
      <p className="text-sm font-medium text-[#222222]">{value}</p>
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
interface BrandCampaignDetailsPageProps {
  showBrandActions?: boolean;
}

export const BrandCampaignDetailsPage: React.FC<BrandCampaignDetailsPageProps> = ({
  showBrandActions = true,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    campaignService
      .getCampaignById(id)
      .then(setCampaign)
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePublish = async () => {
    if (!campaign?._id) return;
    try {
      setActionLoading(true);
      setActionError(null);
      const updated = await campaignService.publishCampaign(campaign._id);
      setCampaign(updated);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!campaign?._id) return;
    try {
      setActionLoading(true);
      setActionError(null);
      const updated = await campaignService.closeCampaign(campaign._id);
      setCampaign(updated);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!campaign?._id) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await campaignService.deleteCampaign(campaign._id);
      navigate('/brand/campaigns');
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading campaign details..." />;
  if (error) return <Alert variant="error">{error}</Alert>;
  if (!campaign) return <Alert variant="error">Campaign not found.</Alert>;

  const cfg = STATUS_CONFIG[campaign.status] || { label: campaign.status, variant: 'default' as const };

  return (
    <div className="space-y-6">
      {/* Back nav + header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#222222] transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Campaigns
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
              <span className="text-xs text-[#6B6B6B] bg-[#F5F2EB] border border-[#DDD8CE] px-2 py-0.5 rounded-sm">
                {campaign.category}
              </span>
              {campaign.requiredPlatform && (
                <span className="text-xs text-[#6B6B6B] bg-[#F5F2EB] border border-[#DDD8CE] px-2 py-0.5 rounded-sm">
                  {campaign.requiredPlatform}
                </span>
              )}
            </div>
            <h1 className="font-headline text-3xl font-bold text-[#222222] tracking-tight leading-tight">
              {campaign.title}
            </h1>
            <p className="text-sm text-[#6B6B6B] mt-1">
              Created {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>

          {showBrandActions && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {(campaign.status === 'DRAFT' || campaign.status === 'PUBLISHED' || campaign.status === 'CLOSED') && (
                <Link to={`/brand/campaigns/${campaign._id}/edit`}>
                  <Button variant="outline" size="md" className="gap-1.5">
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </Button>
                </Link>
              )}
              {campaign.status === 'DRAFT' && (
                <Button variant="accent" size="md" isLoading={actionLoading} onClick={handlePublish} className="gap-1.5">
                  <Send className="w-4 h-4" />
                  Publish
                </Button>
              )}
              {campaign.status === 'PUBLISHED' && (
                <Button variant="secondary" size="md" isLoading={actionLoading} onClick={handleClose} className="gap-1.5">
                  <XIcon className="w-4 h-4" />
                  Close Campaign
                </Button>
              )}
              {(campaign.status === 'DRAFT' || campaign.status === 'CANCELLED') && (
                deleteConfirm ? (
                  <div className="flex gap-2">
                    <Button variant="destructive" size="md" isLoading={actionLoading} onClick={handleDelete}>
                      Confirm Delete
                    </Button>
                    <Button variant="outline" size="md" onClick={() => setDeleteConfirm(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setDeleteConfirm(true)}
                    className="gap-1.5 text-[#C0392B] border-[#C0392B]/30 hover:bg-[#C0392B]/5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {actionError && <Alert variant="error">{actionError}</Alert>}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: description + deliverables */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="bg-[#FAF9F6] border-[#DDD8CE] rounded-[12px] shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-headline text-base font-bold text-[#222222] pb-2 border-b border-[#DDD8CE]">
                Campaign Brief
              </h2>
              <p className="text-sm text-[#222222] leading-relaxed whitespace-pre-line">
                {campaign.description}
              </p>

              {campaign.targetAudience && (
                <div>
                  <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1.5">
                    Target Audience
                  </p>
                  <p className="text-sm text-[#222222] leading-relaxed">{campaign.targetAudience}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {campaign.deliverables && campaign.deliverables.length > 0 && (
            <Card className="bg-[#FAF9F6] border-[#DDD8CE] rounded-[12px] shadow-sm">
              <CardContent className="p-6 space-y-3">
                <h2 className="font-headline text-base font-bold text-[#222222] pb-2 border-b border-[#DDD8CE]">
                  Required Deliverables
                </h2>
                <div className="space-y-2">
                  {campaign.deliverables.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-[#F5F2EB] rounded-[8px] border border-[#DDD8CE]"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#B8955A]/20 text-[#B8955A] text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-[#222222]">{d}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: sidebar details */}
        <div className="space-y-4">
          <Card className="bg-[#FAF9F6] border-[#DDD8CE] rounded-[12px] shadow-sm">
            <CardContent className="p-5 space-y-3">
              <h2 className="font-headline text-sm font-bold text-[#222222] pb-2 border-b border-[#DDD8CE]">
                Campaign Details
              </h2>

              <DetailRow
                icon={<DollarSign className="w-4 h-4 text-[#B8955A]" />}
                label="Budget"
                value={`${campaign.currency || 'USD'} ${Number(campaign.budget).toLocaleString()}`}
              />

              {campaign.requiredPlatform && (
                <DetailRow
                  icon={<Globe className="w-4 h-4 text-[#B8955A]" />}
                  label="Platform"
                  value={campaign.requiredPlatform}
                />
              )}

              {campaign.contentType && (
                <DetailRow
                  icon={<Package className="w-4 h-4 text-[#B8955A]" />}
                  label="Content Type"
                  value={campaign.contentType}
                />
              )}

              {(campaign.followerRange?.min != null || campaign.followerRange?.max != null) && (
                <DetailRow
                  icon={<Users className="w-4 h-4 text-[#B8955A]" />}
                  label="Follower Range"
                  value={`${campaign.followerRange?.min ? Number(campaign.followerRange.min).toLocaleString() : '0'} – ${campaign.followerRange?.max ? Number(campaign.followerRange.max).toLocaleString() : 'No limit'}`}
                />
              )}

              {campaign.engagementRequirement != null && campaign.engagementRequirement > 0 && (
                <DetailRow
                  icon={<TrendingUp className="w-4 h-4 text-[#B8955A]" />}
                  label="Min. Engagement"
                  value={`≥ ${campaign.engagementRequirement}%`}
                />
              )}

              {campaign.location && (
                <DetailRow
                  icon={<Target className="w-4 h-4 text-[#B8955A]" />}
                  label="Target Location"
                  value={campaign.location}
                />
              )}

              {campaign.applicationDeadline && (
                <DetailRow
                  icon={<Calendar className="w-4 h-4 text-[#B8955A]" />}
                  label="Apply By"
                  value={new Date(campaign.applicationDeadline).toLocaleDateString()}
                />
              )}

              {campaign.campaignDeadline && (
                <DetailRow
                  icon={<Calendar className="w-4 h-4 text-[#B8955A]" />}
                  label="Campaign End"
                  value={new Date(campaign.campaignDeadline).toLocaleDateString()}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

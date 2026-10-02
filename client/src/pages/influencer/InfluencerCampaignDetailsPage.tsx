import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignService } from '@/services/campaignService';
import { applicationService } from '@/services/applicationService';
import { Campaign, Application } from '@/types';
import { ApplyModal } from '@/components/application/ApplyModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { Card, CardContent } from '@/components/ui/Card';
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  Users,
  Globe,
  Package,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
} from 'lucide-react';

// ─── Detail row ───────────────────────────────────────────────────────────────
const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-[#F5F2EB] rounded-[8px] border border-[#DDD8CE]">
    <div className="w-8 h-8 rounded-[6px] bg-[#B8955A]/15 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider">{label}</p>
      <p className="text-sm font-medium text-[#222222]">{value}</p>
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
export const InfluencerCampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      campaignService.getCampaignById(id),
      applicationService.getApplications({ campaignId: id }).catch(() => ({ data: [] })),
    ])
      .then(([camp, apps]) => {
        setCampaign(camp);
        if (apps.data && apps.data.length > 0) {
          setExistingApplication(apps.data[0]);
        }
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState message="Loading campaign brief..." />;
  if (error) return <Alert variant="error">{error}</Alert>;
  if (!campaign) return <Alert variant="error">Campaign not found.</Alert>;

  const isOpen = campaign.status === 'PUBLISHED';
  const daysLeft = campaign.applicationDeadline
    ? Math.max(0, Math.ceil((new Date(campaign.applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#222222] transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Discover
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={isOpen ? 'success' : 'default'}>
                {isOpen ? 'Applications Open' : campaign.status.charAt(0) + campaign.status.slice(1).toLowerCase()}
              </Badge>
              <span className="text-xs text-[#6B6B6B] bg-[#F5F2EB] border border-[#DDD8CE] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider">
                {campaign.category}
              </span>
              {campaign.requiredPlatform && (
                <span className="text-xs text-[#6B6B6B] bg-[#F5F2EB] border border-[#DDD8CE] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider">
                  {campaign.requiredPlatform}
                </span>
              )}
            </div>
            <h1 className="font-headline text-3xl font-bold text-[#222222] tracking-tight leading-tight">
              {campaign.title}
            </h1>
            <p className="text-sm text-[#6B6B6B] mt-1">
              Published {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>

          {/* Apply / deadline CTA */}
          <div className="shrink-0 space-y-2">
            {existingApplication ? (
              <div className="p-3 bg-[#4F765E]/10 border border-[#4F765E]/30 rounded-[10px] text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#4F765E] uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4" /> Application Submitted
                </div>
                <p className="text-xs text-[#222222]">
                  Status: <span className="font-semibold">{existingApplication.status}</span>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/influencer/applications')}
                  className="w-full text-xs bg-[#FFFFFF] border-[#DDD8CE]"
                >
                  View in My Applications
                </Button>
              </div>
            ) : isOpen ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => setIsApplyModalOpen(true)}
                >
                  Apply Now
                </Button>
                {daysLeft !== null && (
                  <p className="text-xs text-center text-[#6B6B6B] flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#B8955A]" />
                    {daysLeft === 0 ? 'Deadline today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left to apply`}
                  </p>
                )}
              </>
            ) : (
              <div className="text-center px-4 py-3 bg-[#F5F2EB] border border-[#DDD8CE] rounded-[10px]">
                <p className="text-sm font-semibold text-[#6B6B6B]">Applications Closed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Brief + deliverables */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="bg-[#FAF9F6] border-[#DDD8CE] rounded-[12px] shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-headline text-base font-bold text-[#222222] pb-2 border-b border-[#DDD8CE]">
                About This Campaign
              </h2>
              <p className="text-sm text-[#222222] leading-relaxed whitespace-pre-line">
                {campaign.description}
              </p>

              {campaign.targetAudience && (
                <div className="mt-3">
                  <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1.5">
                    They're Looking For
                  </p>
                  <p className="text-sm text-[#222222] leading-relaxed bg-[#F5F2EB] p-3 rounded-[8px] border border-[#DDD8CE]">
                    {campaign.targetAudience}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {campaign.deliverables && campaign.deliverables.length > 0 && (
            <Card className="bg-[#FAF9F6] border-[#DDD8CE] rounded-[12px] shadow-sm">
              <CardContent className="p-6 space-y-3">
                <h2 className="font-headline text-base font-bold text-[#222222] pb-2 border-b border-[#DDD8CE]">
                  What You'll Create
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

        {/* Right: Campaign snapshot */}
        <div className="space-y-4">
          <Card className="bg-[#FAF9F6] border-[#DDD8CE] rounded-[12px] shadow-sm">
            <CardContent className="p-5 space-y-3">
              <h2 className="font-headline text-sm font-bold text-[#222222] pb-2 border-b border-[#DDD8CE]">
                Campaign Snapshot
              </h2>

              <DetailRow
                icon={<DollarSign className="w-4 h-4 text-[#B8955A]" />}
                label="Campaign Budget"
                value={`${campaign.currency || 'USD'} ${Number(campaign.budget).toLocaleString()}`}
              />

              {campaign.requiredPlatform && (
                <DetailRow
                  icon={<Globe className="w-4 h-4 text-[#B8955A]" />}
                  label="Required Platform"
                  value={campaign.requiredPlatform}
                />
              )}

              {campaign.contentType && (
                <DetailRow
                  icon={<Package className="w-4 h-4 text-[#B8955A]" />}
                  label="Content Format"
                  value={campaign.contentType}
                />
              )}

              {(campaign.followerRange?.min != null) && (
                <DetailRow
                  icon={<Users className="w-4 h-4 text-[#B8955A]" />}
                  label="Creator Follower Range"
                  value={`${Number(campaign.followerRange!.min).toLocaleString()} – ${campaign.followerRange!.max ? Number(campaign.followerRange!.max).toLocaleString() : 'No limit'}`}
                />
              )}

              {campaign.engagementRequirement != null && campaign.engagementRequirement > 0 && (
                <DetailRow
                  icon={<TrendingUp className="w-4 h-4 text-[#B8955A]" />}
                  label="Min. Engagement Rate"
                  value={`≥ ${campaign.engagementRequirement}%`}
                />
              )}

              {campaign.location && (
                <DetailRow
                  icon={<Target className="w-4 h-4 text-[#B8955A]" />}
                  label="Target Geography"
                  value={campaign.location}
                />
              )}

              {campaign.applicationDeadline && (
                <DetailRow
                  icon={<Calendar className="w-4 h-4 text-[#B8955A]" />}
                  label="Application Deadline"
                  value={new Date(campaign.applicationDeadline).toLocaleDateString()}
                />
              )}

              {campaign.campaignDeadline && (
                <DetailRow
                  icon={<Calendar className="w-4 h-4 text-[#B8955A]" />}
                  label="Campaign End Date"
                  value={new Date(campaign.campaignDeadline).toLocaleDateString()}
                />
              )}
            </CardContent>
          </Card>

          {/* Eligibility check */}
          {campaign.status === 'PUBLISHED' && (
            <Card className="bg-[#FFF8EE] border-[#B8955A]/30 rounded-[12px] shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs uppercase font-semibold text-[#B8955A] tracking-wider mb-2">Are You a Fit?</p>
                <ul className="space-y-1.5 text-xs text-[#5A4A2A]">
                  {campaign.requiredPlatform && (
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B8955A] shrink-0" />
                      Active on {campaign.requiredPlatform}
                    </li>
                  )}
                  {campaign.followerRange?.min != null && (
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B8955A] shrink-0" />
                      At least {Number(campaign.followerRange.min).toLocaleString()} followers
                    </li>
                  )}
                  {campaign.engagementRequirement != null && campaign.engagementRequirement > 0 && (
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B8955A] shrink-0" />
                      ≥ {campaign.engagementRequirement}% avg. engagement rate
                    </li>
                  )}
                  {campaign.location && (
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B8955A] shrink-0" />
                      Audience in {campaign.location}
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {campaign && (
        <ApplyModal
          campaign={campaign}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onSuccess={(newApp) => {
            setExistingApplication(newApp);
            setIsApplyModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

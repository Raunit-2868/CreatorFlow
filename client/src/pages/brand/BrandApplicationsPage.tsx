import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { applicationService } from '@/services/applicationService';
import { campaignService } from '@/services/campaignService';
import { Application, ApplicationStatus, Campaign } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Star,
  Check,
  X,
  Users,
  Eye,
} from 'lucide-react';

const STATUS_TABS: { label: string; value: ApplicationStatus | 'ALL' }[] = [
  { label: 'All Applicants', value: 'ALL' },
  { label: 'Pending Review', value: 'PENDING' },
  { label: 'Shortlisted', value: 'SHORTLISTED' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
];

const getStatusBadge = (status: ApplicationStatus) => {
  switch (status) {
    case 'ACCEPTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#4F765E]/15 text-[#4F765E] border border-[#4F765E]/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
        </span>
      );
    case 'SHORTLISTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#B8955A]/15 text-[#B8955A] border border-[#B8955A]/30">
          <Sparkles className="w-3.5 h-3.5" /> Shortlisted
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#A4773A]/15 text-[#A4773A] border border-[#A4773A]/20">
          <Clock className="w-3.5 h-3.5" /> Pending Review
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#A95C5C]/15 text-[#A95C5C] border border-[#A95C5C]/20">
          <XCircle className="w-3.5 h-3.5" /> Rejected
        </span>
      );
    case 'WITHDRAWN':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#F5F2EB] text-[#6B6B6B] border border-[#DDD8CE]">
          Withdrawn
        </span>
      );
    default:
      return null;
  }
};

export const BrandApplicationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const campaignIdFromQuery = searchParams.get('campaignId') || '';

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaignIdFromQuery);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTab, setSelectedTab] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active applicant modal for deep review
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Fetch brand's campaigns for the campaign filter
  useEffect(() => {
    campaignService
      .getCampaigns({ limit: 50 })
      .then((res) => setCampaigns(res.data))
      .catch(() => {});
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { campaignId?: string } = {};
      if (selectedCampaignId) params.campaignId = selectedCampaignId;
      const res = await applicationService.getApplications(params);
      setApplications(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [selectedCampaignId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleCampaignFilterChange = (campId: string) => {
    setSelectedCampaignId(campId);
    if (campId) {
      setSearchParams({ campaignId: campId });
    } else {
      setSearchParams({});
    }
  };

  const handleStatusAction = async (
    applicationId: string,
    action: 'shortlist' | 'accept' | 'reject'
  ) => {
    try {
      setActionLoading(applicationId + action);
      setActionMessage(null);
      let updatedApp: Application;

      if (action === 'shortlist') {
        updatedApp = await applicationService.shortlistApplication(applicationId);
      } else if (action === 'accept') {
        updatedApp = await applicationService.acceptApplication(applicationId);
      } else {
        updatedApp = await applicationService.rejectApplication(applicationId);
      }

      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status: updatedApp.status } : app))
      );

      if (activeApp && activeApp._id === applicationId) {
        setActiveApp({ ...activeApp, status: updatedApp.status });
      }

      setActionMessage(`Application ${action}ed successfully.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || `Failed to ${action} application.`);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    if (selectedTab !== 'ALL' && app.status !== selectedTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const creatorName =
        app.influencerProfile?.name?.toLowerCase() ||
        (typeof app.influencerId === 'object' ? app.influencerId.name?.toLowerCase() : '');
      const nicheMatch = app.influencerProfile?.niche?.some((n) => n.toLowerCase().includes(q));
      const proposalMatch = app.proposal?.toLowerCase().includes(q);
      const campaign = typeof app.campaignId === 'object' ? (app.campaignId as Partial<Campaign>) : null;
      const campaignMatch = campaign?.title?.toLowerCase().includes(q);

      return creatorName?.includes(q) || nicheMatch || proposalMatch || campaignMatch;
    }
    return true;
  });

  const counts = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'PENDING').length,
    shortlisted: applications.filter((a) => a.status === 'SHORTLISTED').length,
    accepted: applications.filter((a) => a.status === 'ACCEPTED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-[#222222]">Campaign Applications</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Review incoming creator pitches, evaluate influencer profiles, and shortlist top talent.
          </p>
        </div>
        <Button
          onClick={() => navigate('/brand/campaigns/new')}
          className="bg-[#2B2B2B] text-white hover:bg-[#3D3D3D] rounded-[8px] h-10 px-4 text-sm font-medium shadow-sm shrink-0"
        >
          Create New Campaign
        </Button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-[#4F765E]/10 border border-[#4F765E]/20 text-[#4F765E] rounded-[8px] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">Total Applicants</div>
          <div className="text-2xl font-bold font-headline text-[#222222] mt-1">{counts.total}</div>
        </Card>
        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#A4773A]">Pending Review</div>
          <div className="text-2xl font-bold font-headline text-[#A4773A] mt-1">{counts.pending}</div>
        </Card>
        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#B8955A]">Shortlisted</div>
          <div className="text-2xl font-bold font-headline text-[#B8955A] mt-1">{counts.shortlisted}</div>
        </Card>
        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#4F765E]">Accepted</div>
          <div className="text-2xl font-bold font-headline text-[#4F765E] mt-1">{counts.accepted}</div>
        </Card>
      </div>

      {/* Controls: Campaign Select, Tabs & Search */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Campaign Filter Dropdown */}
          <div className="w-full sm:w-80">
            <Select
              value={selectedCampaignId}
              onChange={(e) => handleCampaignFilterChange(e.target.value)}
              options={[
                { value: '', label: 'All Active Campaigns' },
                ...campaigns.map((c) => ({
                  value: c._id || '',
                  label: `${c.title} (${c.status})`,
                })),
              ]}
              className="bg-[#FFFFFF] border-[#DDD8CE] rounded-[8px] h-10 text-xs"
            />
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creator, niche, proposal..."
              className="pl-9 bg-[#FFFFFF] border-[#DDD8CE] rounded-[8px] h-10 text-xs"
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#DDD8CE]/60">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedTab(tab.value)}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors whitespace-nowrap ${
                selectedTab === tab.value
                  ? 'bg-[#2B2B2B] text-white shadow-xs'
                  : 'text-[#6B6B6B] hover:text-[#222222] hover:bg-[#F5F2EB]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[#F5F2EB] animate-pulse rounded-[12px] border border-[#DDD8CE]" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-[#A95C5C]/10 border border-[#A95C5C]/20 rounded-[12px] text-center space-y-2">
          <p className="text-sm font-semibold text-[#A95C5C]">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchApplications}>
            Retry
          </Button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="p-12 text-center bg-[#FAF9F6] border border-[#DDD8CE] rounded-[16px] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F5F2EB] flex items-center justify-center mx-auto text-[#B8955A]">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold font-headline text-[#222222]">No Applications Found</h3>
          <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
            {selectedTab !== 'ALL' || searchQuery || selectedCampaignId
              ? 'No applicants match your current filters. Try selecting a different status or campaign.'
              : 'You have not received any applications yet. Publish campaigns to start receiving creator pitches!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((app) => {
            const campaign = typeof app.campaignId === 'object' ? (app.campaignId as Partial<Campaign>) : null;
            const campaignTitle = campaign?.title || 'Campaign';
            const creatorName =
              app.influencerProfile?.name ||
              (typeof app.influencerId === 'object' ? app.influencerId.name : 'Creator');
            const creatorBio = app.influencerProfile?.bio || 'Content Creator';
            const followers = app.influencerProfile?.totalFollowers || 0;
            const engagement = app.influencerProfile?.avgEngagementRate || 0;
            const niches = app.influencerProfile?.niche || [];
            const isPending = app.status === 'PENDING';
            const isTerminal = app.status === 'ACCEPTED' || app.status === 'REJECTED' || app.status === 'WITHDRAWN';

            return (
              <Card
                key={app._id}
                className="bg-[#FAF9F6] border-[#DDD8CE] rounded-[12px] p-5 shadow-sm hover:border-[#B8955A]/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left: Creator Profile + Pitch Snippet */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#B8955A]/15 border border-[#B8955A]/30 flex items-center justify-center text-[#B8955A] font-bold text-base shrink-0 overflow-hidden">
                      {app.influencerProfile?.avatar ? (
                        <img
                          src={app.influencerProfile.avatar}
                          alt={creatorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        creatorName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold font-headline text-[#222222] truncate">
                          {creatorName}
                        </h3>
                        {getStatusBadge(app.status)}
                      </div>

                      <p className="text-xs text-[#6B6B6B] truncate">{creatorBio}</p>

                      {/* Creator Stats */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B6B6B] pt-0.5">
                        <span className="font-semibold text-[#222222]">
                          {followers > 0 ? followers.toLocaleString() : '—'} followers
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-[#4F765E]">
                          {engagement > 0 ? `${engagement}%` : '—'} engagement
                        </span>
                        {niches.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-[#B8955A]">{niches.slice(0, 2).join(', ')}</span>
                          </>
                        )}
                      </div>

                      {/* Pitch Snippet */}
                      <div className="pt-1.5">
                        <p className="text-xs text-[#222222] bg-[#FFFFFF] border border-[#DDD8CE] p-2.5 rounded-[8px] line-clamp-2">
                          <span className="font-semibold text-[#6B6B6B] uppercase tracking-wider text-[10px] block mb-0.5">
                            Proposal:
                          </span>
                          {app.proposal}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Campaign info, fee & action buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-4 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#DDD8CE]/60">
                    <div className="space-y-1 text-left sm:text-right">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-[#6B6B6B]">
                        Applied To
                      </div>
                      <div className="text-xs font-bold text-[#222222] max-w-[180px] truncate">
                        {campaignTitle}
                      </div>
                      <div className="text-sm font-bold font-headline text-[#222222] pt-1">
                        ${app.expectedCompensation.toLocaleString()} USD
                      </div>
                      {campaign?.budget && (
                        <div className="text-[10px] text-[#6B6B6B]">
                          Budget: ${campaign.budget.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveApp(app)}
                        className="bg-[#FFFFFF] border-[#DDD8CE] text-[#222222] hover:bg-[#F5F2EB] rounded-[8px] text-xs h-9 px-3 gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#6B6B6B]" /> Review
                      </Button>

                      {isPending && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === app._id + 'shortlist'}
                          onClick={() => handleStatusAction(app._id, 'shortlist')}
                          className="bg-[#FFFFFF] border-[#DDD8CE] text-[#B8955A] hover:bg-[#B8955A]/10 rounded-[8px] text-xs h-9 px-2.5"
                          title="Shortlist applicant"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {!isTerminal && (
                        <>
                          <Button
                            size="sm"
                            disabled={actionLoading === app._id + 'accept'}
                            onClick={() => handleStatusAction(app._id, 'accept')}
                            className="bg-[#4F765E] text-white hover:bg-[#3E5F4A] rounded-[8px] text-xs h-9 px-3 gap-1 shadow-xs"
                            title="Accept application"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionLoading === app._id + 'reject'}
                            onClick={() => handleStatusAction(app._id, 'reject')}
                            className="border-[#DDD8CE] text-[#A95C5C] hover:bg-[#A95C5C]/10 rounded-[8px] text-xs h-9 px-2.5"
                            title="Reject application"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Applicant Details Modal */}
      {activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#FAF9F6] border border-[#DDD8CE] rounded-[16px] p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDD8CE]/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#B8955A]/15 border border-[#B8955A]/30 flex items-center justify-center text-[#B8955A] font-bold text-base shrink-0 overflow-hidden">
                  {activeApp.influencerProfile?.avatar ? (
                    <img
                      src={activeApp.influencerProfile.avatar}
                      alt="Creator"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (activeApp.influencerProfile?.name || 'C').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-headline text-[#222222]">
                      {activeApp.influencerProfile?.name ||
                        (typeof activeApp.influencerId === 'object'
                          ? activeApp.influencerId.name
                          : 'Creator Application')}
                    </h2>
                    {getStatusBadge(activeApp.status)}
                  </div>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Applied on {new Date(activeApp.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveApp(null)}
                className="p-1.5 text-[#6B6B6B] hover:text-[#222222] hover:bg-[#F5F2EB] rounded-full transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Creator Metrics Summary */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 bg-[#FFFFFF] border border-[#DDD8CE] rounded-[8px] text-center">
                <div className="text-[11px] uppercase font-semibold text-[#6B6B6B]">Audience</div>
                <div className="text-sm font-bold text-[#222222] mt-0.5">
                  {(activeApp.influencerProfile?.totalFollowers || 0).toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-[#FFFFFF] border border-[#DDD8CE] rounded-[8px] text-center">
                <div className="text-[11px] uppercase font-semibold text-[#6B6B6B]">Engagement</div>
                <div className="text-sm font-bold text-[#4F765E] mt-0.5">
                  {activeApp.influencerProfile?.avgEngagementRate || 0}%
                </div>
              </div>
              <div className="p-3 bg-[#FFFFFF] border border-[#DDD8CE] rounded-[8px] text-center">
                <div className="text-[11px] uppercase font-semibold text-[#6B6B6B]">Proposed Fee</div>
                <div className="text-sm font-bold text-[#B8955A] mt-0.5">
                  ${activeApp.expectedCompensation.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                  Proposal & Pitch
                </h4>
                <div className="p-3.5 bg-[#FFFFFF] border border-[#DDD8CE] rounded-[8px] text-xs text-[#222222] leading-relaxed whitespace-pre-line">
                  {activeApp.proposal}
                </div>
              </div>

              {activeApp.contentApproach && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                    Creative Content Approach
                  </h4>
                  <div className="p-3.5 bg-[#FFFFFF] border border-[#DDD8CE] rounded-[8px] text-xs text-[#222222] leading-relaxed whitespace-pre-line">
                    {activeApp.contentApproach}
                  </div>
                </div>
              )}

              {activeApp.portfolioLinks && activeApp.portfolioLinks.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                    Portfolio & Sample Work Links
                  </h4>
                  <div className="space-y-1.5">
                    {activeApp.portfolioLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs text-[#B8955A] hover:underline p-2 bg-[#FFFFFF] border border-[#DDD8CE] rounded-[6px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{link}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {activeApp.relevantPreviousWork && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                    Previous Brand Collaborations
                  </h4>
                  <div className="p-3.5 bg-[#FFFFFF] border border-[#DDD8CE] rounded-[8px] text-xs text-[#222222] leading-relaxed whitespace-pre-line">
                    {activeApp.relevantPreviousWork}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#DDD8CE]/60">
              <div className="flex items-center gap-2">
                {activeApp.status === 'PENDING' && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading === activeApp._id + 'shortlist'}
                    onClick={() => handleStatusAction(activeApp._id, 'shortlist')}
                    className="border-[#DDD8CE] text-[#B8955A] hover:bg-[#B8955A]/10 text-xs gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5" /> Shortlist
                  </Button>
                )}

                {activeApp.status !== 'ACCEPTED' && activeApp.status !== 'REJECTED' && activeApp.status !== 'WITHDRAWN' && (
                  <>
                    <Button
                      size="sm"
                      disabled={actionLoading === activeApp._id + 'accept'}
                      onClick={() => handleStatusAction(activeApp._id, 'accept')}
                      className="bg-[#4F765E] text-white hover:bg-[#3E5F4A] text-xs gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept Proposal
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionLoading === activeApp._id + 'reject'}
                      onClick={() => handleStatusAction(activeApp._id, 'reject')}
                      className="border-[#DDD8CE] text-[#A95C5C] hover:bg-[#A95C5C]/10 text-xs gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveApp(null)}
                className="bg-[#FFFFFF] border-[#DDD8CE] text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

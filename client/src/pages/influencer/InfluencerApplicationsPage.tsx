import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { applicationService } from '@/services/applicationService';
import { Application, ApplicationStatus, Campaign } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Search,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Calendar,
  Building,
  Eye,
  X,
} from 'lucide-react';

const STATUS_TABS: { label: string; value: ApplicationStatus | 'ALL' }[] = [
  { label: 'All Applications', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Shortlisted', value: 'SHORTLISTED' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Withdrawn', value: 'WITHDRAWN' },
];

const getStatusBadge = (status: ApplicationStatus) => {
  switch (status) {
    case 'ACCEPTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#4F765E]/15 text-[#4F765E] border border-[#4F765E]/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
        </span>
      );
    case 'SHORTLISTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#B8955A]/15 text-[#B8955A] border border-[#B8955A]/30">
          <Sparkles className="w-3.5 h-3.5" /> Shortlisted
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#A4773A]/15 text-[#A4773A] border border-[#A4773A]/20">
          <Clock className="w-3.5 h-3.5" /> Pending Review
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#A95C5C]/15 text-[#A95C5C] border border-[#A95C5C]/20">
          <XCircle className="w-3.5 h-3.5" /> Rejected
        </span>
      );
    case 'WITHDRAWN':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#F5F2EB] text-[#6B6B6B] border border-[#DDD8CE]">
          <RotateCcw className="w-3.5 h-3.5" /> Withdrawn
        </span>
      );
    default:
      return null;
  }
};

export const InfluencerApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected application for detail view modal
  const [activeApp, setActiveApp] = useState<Application | null>(null);

  // Application pending withdrawal confirmation
  const [appToWithdraw, setAppToWithdraw] = useState<Application | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await applicationService.getApplications();
      setApplications(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async () => {
    if (!appToWithdraw) return;
    try {
      setIsWithdrawing(true);
      await applicationService.withdrawApplication(appToWithdraw._id);
      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appToWithdraw._id ? { ...app, status: 'WITHDRAWN' as ApplicationStatus } : app
        )
      );
      if (activeApp && activeApp._id === appToWithdraw._id) {
        setActiveApp({ ...activeApp, status: 'WITHDRAWN' });
      }
      setAppToWithdraw(null);
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw application.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Filtered applications
  const filteredApplications = applications.filter((app) => {
    if (selectedTab !== 'ALL' && app.status !== selectedTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const campaign = typeof app.campaignId === 'object' ? (app.campaignId as Partial<Campaign>) : null;
      const titleMatch = campaign?.title?.toLowerCase().includes(q);
      const brandMatch = app.brandProfile?.companyName?.toLowerCase().includes(q);
      const categoryMatch = campaign?.category?.toLowerCase().includes(q);
      return titleMatch || brandMatch || categoryMatch;
    }
    return true;
  });

  // Metric counts
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
          <h1 className="text-2xl font-bold font-headline text-[#222222]">My Applications</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Track and manage your submitted campaign proposals, compensation terms, and status.
          </p>
        </div>
        <Button
          onClick={() => navigate('/influencer/campaigns')}
          className="bg-[#2B2B2B] text-white hover:bg-[#3D3D3D] rounded-[8px] h-10 px-4 text-sm font-medium shadow-sm shrink-0"
        >
          Explore More Campaigns
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">Total Applied</div>
          <div className="text-2xl font-bold font-headline text-[#222222] mt-1">{counts.total}</div>
        </Card>
        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#A4773A]">Under Review</div>
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

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#DDD8CE]/60 md:border-none">
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

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns or brands..."
            className="pl-9 bg-[#FFFFFF] border-[#DDD8CE] rounded-[8px] h-9 text-xs"
          />
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-[#F5F2EB] animate-pulse rounded-[12px] border border-[#DDD8CE]" />
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
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold font-headline text-[#222222]">No Applications Found</h3>
          <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
            {selectedTab !== 'ALL' || searchQuery
              ? 'No applications match your selected filter or search keyword.'
              : "You haven't submitted any campaign applications yet. Discover open briefs and pitch top brands today!"}
          </p>
          <Button
            onClick={() => navigate('/influencer/campaigns')}
            className="bg-[#2B2B2B] text-white hover:bg-[#3D3D3D] rounded-[8px] text-xs h-9 px-4 mt-2"
          >
            Discover Open Campaigns
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((app) => {
            const campaign = typeof app.campaignId === 'object' ? (app.campaignId as Partial<Campaign>) : null;
            const campaignTitle = campaign?.title || 'Untitled Campaign';
            const campaignCategory = campaign?.category || 'General';
            const brandName = app.brandProfile?.companyName || 'Verified Brand';
            const canWithdraw = app.status === 'PENDING' || app.status === 'SHORTLISTED';

            return (
              <Card
                key={app._id}
                className="bg-[#FAF9F6] border-[#DDD8CE] rounded-[12px] p-5 shadow-sm hover:border-[#B8955A]/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Info Column */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(app.status)}
                      <span className="text-xs font-semibold text-[#6B6B6B] bg-[#F5F2EB] border border-[#DDD8CE] px-2 py-0.5 rounded-[4px]">
                        {campaignCategory}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold font-headline text-[#222222] truncate hover:text-[#B8955A] transition-colors">
                        {campaign?._id ? (
                          <Link to={`/influencer/campaigns/${campaign._id}`}>{campaignTitle}</Link>
                        ) : (
                          campaignTitle
                        )}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-[#6B6B6B] mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-[#B8955A]" /> {brandName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Applied{' '}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#6B6B6B] line-clamp-1 italic">
                      "{app.proposal}"
                    </p>
                  </div>

                  {/* Compensation & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#DDD8CE]/60">
                    <div className="text-left md:text-right">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
                        Proposed Rate
                      </div>
                      <div className="text-base font-bold font-headline text-[#222222]">
                        ${app.expectedCompensation.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveApp(app)}
                        className="bg-[#FFFFFF] border-[#DDD8CE] text-[#222222] hover:bg-[#F5F2EB] rounded-[8px] text-xs h-9 px-3 gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#6B6B6B]" /> Details
                      </Button>

                      {canWithdraw && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAppToWithdraw(app)}
                          className="border-[#DDD8CE] text-[#A95C5C] hover:bg-[#A95C5C]/10 rounded-[8px] text-xs h-9 px-3"
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Application Details Modal */}
      {activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#FAF9F6] border border-[#DDD8CE] rounded-[16px] p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDD8CE]/60">
              <div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(activeApp.status)}
                  <span className="text-xs text-[#6B6B6B]">
                    Applied {new Date(activeApp.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-lg font-bold font-headline text-[#222222] mt-1">
                  {typeof activeApp.campaignId === 'object'
                    ? (activeApp.campaignId as Partial<Campaign>).title
                    : 'Campaign Application'}
                </h2>
              </div>
              <button
                onClick={() => setActiveApp(null)}
                className="p-1.5 text-[#6B6B6B] hover:text-[#222222] hover:bg-[#F5F2EB] rounded-full transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3 bg-[#F5F2EB] border border-[#DDD8CE]/60 rounded-[8px] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#6B6B6B] block">Proposed Fee:</span>
                  <span className="text-base font-bold text-[#222222]">
                    ${activeApp.expectedCompensation.toLocaleString()} USD
                  </span>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block">Brand:</span>
                  <span className="font-semibold text-[#222222]">
                    {activeApp.brandProfile?.companyName || 'Verified Brand'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1">
                  Your Pitch & Proposal
                </h4>
                <div className="p-3 bg-[#FFFFFF] border border-[#DDD8CE] rounded-[8px] text-xs text-[#222222] leading-relaxed whitespace-pre-line">
                  {activeApp.proposal}
                </div>
              </div>

              {activeApp.contentApproach && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1">
                    Creative Content Approach
                  </h4>
                  <div className="p-3 bg-[#FFFFFF] border border-[#DDD8CE] rounded-[8px] text-xs text-[#222222] leading-relaxed whitespace-pre-line">
                    {activeApp.contentApproach}
                  </div>
                </div>
              )}

              {activeApp.portfolioLinks && activeApp.portfolioLinks.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1">
                    Submitted Portfolio Links
                  </h4>
                  <div className="space-y-1.5">
                    {activeApp.portfolioLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#B8955A] hover:underline p-2 bg-[#FFFFFF] border border-[#DDD8CE] rounded-[6px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="truncate">{link}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {activeApp.relevantPreviousWork && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1">
                    Previous Collaborations
                  </h4>
                  <div className="p-3 bg-[#FFFFFF] border border-[#DDD8CE] rounded-[8px] text-xs text-[#222222] leading-relaxed whitespace-pre-line">
                    {activeApp.relevantPreviousWork}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#DDD8CE]/60">
                {(activeApp.status === 'PENDING' || activeApp.status === 'SHORTLISTED') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAppToWithdraw(activeApp);
                    }}
                    className="border-[#DDD8CE] text-[#A95C5C] hover:bg-[#A95C5C]/10 text-xs"
                  >
                    Withdraw Application
                  </Button>
                )}
                <Button
                  onClick={() => setActiveApp(null)}
                  className="bg-[#2B2B2B] text-white hover:bg-[#3D3D3D] rounded-[8px] text-xs h-9 px-4 ml-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      {appToWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-md bg-[#FAF9F6] border border-[#DDD8CE] rounded-[16px] p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#A95C5C]/15 text-[#A95C5C] rounded-full shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-headline text-[#222222]">
                  Withdraw Application?
                </h3>
                <p className="text-xs text-[#6B6B6B] mt-1">
                  Are you sure you want to withdraw your application? The brand will no longer be able to accept your proposal.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAppToWithdraw(null)}
                disabled={isWithdrawing}
                className="bg-[#FAF9F6] border-[#DDD8CE] text-xs"
              >
                Keep Application
              </Button>
              <Button
                size="sm"
                disabled={isWithdrawing}
                onClick={handleWithdraw}
                className="bg-[#A95C5C] text-white hover:bg-[#8F4848] text-xs"
              >
                {isWithdrawing ? 'Withdrawing...' : 'Confirm Withdrawal'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
